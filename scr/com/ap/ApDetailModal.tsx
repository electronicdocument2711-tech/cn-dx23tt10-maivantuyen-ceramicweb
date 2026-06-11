"use client";

import {
  addToast,
  Avatar,
  DatePicker,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  Button,
  Divider,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@heroui/react";
import {
  IconChevronLeft,
  IconExternalLink,
  IconMinusVertical,
  IconPhoneCall,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";

import { TextAreaCustom, TimeLenghtPicker, TimePicker } from "@/com/shared";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { AppointmentTypeOptions } from "@/data/appointmentType";
import BranchSelector from "./BranchSelector";
import ChairSelector from "./ChairSelector";
import ApStatusSelect from "./ApStatusSelect";
import ApActions from "./ApActions";
import { useConfirm } from "@/com/ConfirmProvider";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import rest from "@/lib/rest";
import { prop } from "remeda";
import SuccessToastContent from "./SuccessToastContent";
import DoctorSelector from "./DoctorSelector";

interface OptionType {
  label: string;
  value: string;
}

interface ApDetailModalProps {
  appointmentId: string;
  isOpen: boolean;
  onOpenChange: () => void;
  onEditAppointment?: () => void;
  preventRedirectToast?: boolean;
  closeOnSuccess?: boolean;
}

const formSchema = Yup.object().shape({
  date: Yup.date().required(),
  time: Yup.string().required(),
  duration: Yup.number().required(),
  branch: Yup.mixed<OptionType>().required(),
  doctor: Yup.mixed<OptionType>(),
  appointmentType: Yup.string().required(),
  notes: Yup.string(),
  // Chair carries extra metadata needed for the API and ChairSelector
  chair: Yup.mixed<{
    label: string;
    value?: string;
    branchId?: string;
    startTime?: string;
    endTime?: string;
  }>(),
});

/** Tracks the three mutable fields so we can detect dirty state */
interface MutableSnapshot {
  statusId: number;
  doctorId: string;
  chairId: string;
}

const toDateTime = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") return null;
  const numeric = Number(value);
  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    const date =
      String(Math.trunc(numeric)).length <= 10
        ? dayjs(numeric * 1000)
        : dayjs(numeric);
    return date.isValid() ? date : null;
  }
  const date = dayjs(value);
  return date.isValid() ? date : null;
};

const ApDetailModal: React.FC<ApDetailModalProps> = ({
  appointmentId,
  isOpen,
  onOpenChange,
  onEditAppointment,
  preventRedirectToast,
  closeOnSuccess = false,
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // true = first open (show spinner), false = background reload after save (silent)
  const isInitialFetch = useRef(true);

  // Appointment meta needed for the update API
  const appointmentMetaRef = useRef<{
    customerId: string;
    startAt: number;
    estimateTime: string;
    appointmentData: any;
  } | null>(null);

  // Snapshot of initial mutable values (set once after fetch)
  const [initialMutable, setInitialMutable] = useState<MutableSnapshot | null>(
    null,
  );

  // Live values of the three mutable fields
  const [selectedStatusId, setSelectedStatusId] = useState<number>(0);

  const { confirm } = useConfirm();

  const { register, control, reset, watch, setValue } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      date: new Date(),
      duration: 30,
      time: dayjs().format("HH:mm"),
      appointmentType: "3",
    },
  });

  const selectedDate = useWatch({ control, name: "date" });

  const watchedDoctor = watch("doctor");
  const watchedChair = watch("chair");

  // ─── Dirty detection ────────────────────────────────────────────────────────
  const isDirty = useMemo(() => {
    if (!initialMutable) return false;
    const doctorChanged =
      (watchedDoctor?.value ?? "") !== initialMutable.doctorId;
    const chairChanged = (watchedChair?.value ?? "") !== initialMutable.chairId;
    const statusChanged = selectedStatusId !== initialMutable.statusId;
    return doctorChanged || chairChanged || statusChanged;
  }, [initialMutable, watchedDoctor, watchedChair, selectedStatusId]);

  // ─── Fetch appointment preview ───────────────────────────────────────────────
  useEffect(() => {
    if (!appointmentId || !isOpen) return;

    const fetchAppointment = async () => {
      try {
        setIsFetching(true);
        setFetchError(null);

        const response = await rest.get(
          `/appointment/${appointmentId}/preview`,
        );
        const data = prop(response, ...["data", "data"]);

        const startDate = toDateTime(data?.StartAt);
        const endDate = toDateTime(data?.EndAt);

        const startTime =
          data?.StartTime || startDate?.format("HH:mm") || "00:00";
        const endTime = data?.EndTime || endDate?.format("HH:mm") || "00:00";

        const startDateFormatted = startDate?.format("YYYY-MM-DD HH:mm") ?? "";
        const endDateFormatted = endDate?.format("YYYY-MM-DD HH:mm") ?? "";

        const calcEstimate = () => {
          const [sh, sm] = startTime.split(":").map(Number);
          const [eh, em] = endTime.split(":").map(Number);
          const diff = eh * 60 + em - (sh * 60 + sm);
          return diff > 0 ? String(diff) : "";
        };

        const doctorId = String(data?.Staff?.id ?? data?.AppointedTo ?? "");
        const chairId = String(data?.DentalChairBooking?.DentalChairId ?? "");
        const statusId = Number(data?.AppointmentStatus?.Id ?? 0);
        const branchId = String(data?.Branch?.Id ?? "");

        appointmentMetaRef.current = {
          customerId: String(data?.Customer?.Id ?? ""),
          startAt: startDate?.unix() ?? 0,
          estimateTime: calcEstimate(),
          appointmentData: data,
        };

        setSelectedStatusId(statusId);
        setInitialMutable({ statusId, doctorId, chairId });

        reset({
          date: startDate?.toDate() ?? new Date(),
          duration: endDate?.diff(startDate, "minute") ?? 30,
          time: startTime,
          appointmentType: String(
            data?.AppointmentType?.[0]?.AppointmentLabelId ?? "3",
          ),
          doctor: doctorId
            ? { label: data?.Staff?.name ?? "", value: doctorId }
            : undefined,
          branch: branchId
            ? { label: data?.Branch?.Name ?? "", value: branchId }
            : undefined,
          notes: data?.Note ?? "",
          chair: {
            label: data?.DentalChairBooking?.DentalChairCode ?? "",
            value: chairId || undefined,
            branchId,
            startTime: startDateFormatted,
            endTime: endDateFormatted,
          },
        });
      } catch (err: any) {
        setFetchError(err?.message || "Đã có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        setIsFetching(false);
        isInitialFetch.current = false;
      }
    };

    fetchAppointment();
  }, [appointmentId, isOpen, trigger, reset]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setInitialMutable(null);
      setSelectedStatusId(0);
      appointmentMetaRef.current = null;
      isInitialFetch.current = true;
      reset({
        date: new Date(),
        duration: 30,
        time: dayjs().format("HH:mm"),
        appointmentType: "3",
      });
    }
  }, [isOpen, reset]);

  // ─── Close handler (guard unsaved changes) ──────────────────────────────────
  const handleClose = async () => {
    if (isDirty) {
      const ok = await confirm({
        title: "Bạn có thay đổi chưa lưu",
        message: "Bạn có chắc muốn đóng không? Dữ liệu chưa lưu sẽ bị mất.",
        type: "warning",
        confirmText: "Tôi hiểu",
        hideCancel: true,
      });
      if (!ok) return;
    }
    onOpenChange();
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!isDirty || !initialMutable || !appointmentMetaRef.current) return;

    try {
      setIsSubmitting(true);

      const payload: Record<string, any> = {
        customerId: appointmentMetaRef.current.customerId,
        startAt: appointmentMetaRef.current.startAt,
        estimateTime: appointmentMetaRef.current.estimateTime,
      };

      if (selectedStatusId !== initialMutable.statusId) {
        payload.statusId = selectedStatusId;
        payload.currentStatusId = initialMutable.statusId;
      }

      const currentDoctorId = watchedDoctor?.value ?? "";
      if (currentDoctorId !== initialMutable.doctorId) {
        payload.doctorId = currentDoctorId;
      }

      const currentChairId = watchedChair?.value ?? "";
      if (currentChairId !== initialMutable.chairId) {
        payload.chairId = currentChairId;
      }

      await rest
        .patch(`/appointment/${appointmentId}/update`, payload)
        .catch((err) => {
          throw new Error(
            err?.response?.data?.message ||
              err?.message ||
              "Đã có lỗi xảy ra, vui lòng thử lại",
            { cause: err?.response?.status || 500 },
          );
        });

      if (!preventRedirectToast) {
        addToast({
          title: "Thành công",
          description: (
            <SuccessToastContent
              customerId={
                appointmentMetaRef.current?.appointmentData?.Customer?.Id
              }
            />
          ),
          color: "default",
          timeout: 7000,
          hideIcon: true,
        });
      } else {
        addToast({
          title: "Thành công",
          description: "Cập nhật lịch hẹn thành công",
          color: "success",
        });
      }

      // Reload appointment data to keep modal fresh
      setTrigger((p) => p + 1);

      if (closeOnSuccess) {
        setTimeout(() => {
          onOpenChange();
        }, 300);
      }
    } catch (error: any) {
      addToast({
        title: "Thất bại",
        description: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  const renderBody = () => {
    if (fetchError)
      return (
        <div className="w-full min-h-[400px] flex-col gap-4 flex items-center justify-center">
          <span className="text-center text-danger">
            Đã có lỗi xảy ra, vui lòng thử lại. <br /> {fetchError}
          </span>
          <Button
            color="danger"
            size="sm"
            onPress={() => setTrigger((p) => p + 1)}
          >
            Thử lại
          </Button>
        </div>
      );

    if (isFetching && isInitialFetch.current)
      return (
        <div className="w-full min-h-[400px] flex items-center justify-center">
          <Spinner />
        </div>
      );

    const customer = appointmentMetaRef.current?.appointmentData?.Customer;
    const customerId = customer?.Id ?? "";
    const customerName = customer?.Name ?? "";
    const customerCode = customer?.Code ?? customer?.Id ?? "";
    const customerPhone = customer?.PhoneNumbers?.[0] ?? "";

    const chairValue = watchedChair ?? {
      label: "",
      value: undefined,
      branchId: undefined,
      startTime: undefined,
      endTime: undefined,
    };

    return (
      <form
        id="ap-detail-form"
        onSubmit={(e) => {
          e.preventDefault();
          void handleConfirm();
        }}
        className="relative w-full h-full flex flex-col gap-4"
      >
        {/* Customer info + actions */}
        <div className="flex flex-col border-b-1 border-b-gray-500 pb-6">
          <div className="flex items-start justify-between mb-5">
            <Avatar
              isBordered
              radius="full"
              className="text-3xl font-black w-16 h-16"
              size="lg"
              fallback={customerName?.charAt(0).toUpperCase() || "U"}
              name={customerName}
            />

            <div className="flex items-center gap-2">
              {appointmentMetaRef.current?.appointmentData?.AppointmentId ? (
                <>
                  <ApStatusSelect
                    currentStatusId={initialMutable?.statusId || 0}
                    value={selectedStatusId}
                    onChange={setSelectedStatusId}
                  />
                  <ApActions
                    data={appointmentMetaRef.current.appointmentData as any}
                    onUpdated={() => setTrigger((p) => p + 1)}
                    onEditAppointment={onEditAppointment}
                    hideKeys={["edit-history"]}
                  />
                </>
              ) : null}
            </div>
          </div>

          {customerId ? (
            <a
              href={`/customer/${customerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[28px] mb-3 p-0 flex items-center gap-2 hover:underline cursor-pointer w-fit"
            >
              {customerName}
              <IconExternalLink size={20} className="text-default-400" />
            </a>
          ) : (
            <h1 className="font-bold text-[28px] mb-3 p-0">{customerName}</h1>
          )}

          <div className="flex items-center flex-wrap gap-2 font-semibold text-sm text-[#42586D]">
            {customerCode && (
              <div className="flex gap-2">
                <IconUserCircle size={20} />
                {customerCode}
              </div>
            )}
            {customerCode && customerPhone && (
              <IconMinusVertical strokeWidth={1} />
            )}
            {customerPhone && (
              <div className="flex gap-2">
                <IconPhoneCall size={20} />
                {customerPhone}
              </div>
            )}
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols gap-6">
          {/* Date / Time / Duration — read-only */}
          <div className="pointer-events-none opacity-80 flex flex-col sm:flex-row gap-7 sm:gap-3">
            <div className="w-full flex flex-col gap-2">
              <span className="text-base font-bold min-h-6">Ngày</span>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    aria-label="date-picker"
                    showMonthAndYearPickers
                    calendarWidth={280}
                    value={
                      parseDate(dayjs(field.value).format("YYYY-MM-DD")) as any
                    }
                    onChange={(date) =>
                      field.onChange(date?.toDate(getLocalTimeZone()))
                    }
                    variant="bordered"
                    radius="lg"
                    classNames={{
                      inputWrapper: "h-12 hover:border-default-500",
                      input: "text-base font-medium ml-1",
                    }}
                  />
                )}
              />
            </div>

            <div className="w-full flex gap-3">
              <div className="w-full flex flex-col gap-2">
                <span className="text-base font-bold min-h-6">Vào lúc</span>
                <Controller
                  control={control}
                  name="time"
                  render={({ field }) => (
                    <TimePicker
                      value={field.value}
                      onChange={field.onChange}
                      selectedDate={selectedDate}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <span className="text-base font-bold min-h-6">Thời lượng</span>
                <Controller
                  control={control}
                  name="duration"
                  render={({ field }) => (
                    <TimeLenghtPicker
                      readonly
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Branch (1 col, read-only) + Chair (1 col, editable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-3">
            <div className="pointer-events-none opacity-80">
              <Controller
                control={control}
                name="branch"
                render={({ field }) => (
                  <BranchSelector
                    value={field.value as any}
                    onChange={field.onChange}
                    isDisabled={true}
                  />
                )}
              />
            </div>

            <div
              className={`w-full flex flex-col gap-2 ${!!initialMutable?.chairId ? "pointer-events-none opacity-80" : ""}`}
            >
              <ChairSelector
                isDisabled={!!initialMutable?.chairId}
                value={chairValue as any}
                onChange={(val) =>
                  setValue("chair", {
                    ...chairValue,
                    label: val.label,
                    value: val.value,
                  })
                }
              />
            </div>
          </div>

          {/* Doctor (editable) + Appointment type (disabled) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-3">
            <Controller
              control={control}
              name="doctor"
              render={({ field }) => (
                <DoctorSelector
                  value={field.value as any}
                  onChange={field.onChange}
                />
              )}
            />

            <div className="pointer-events-none opacity-80">
              <Controller
                control={control}
                name="appointmentType"
                render={({ field }) => (
                  <AppointmentTypeSelector
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className="pointer-events-none opacity-80">
            <TextAreaCustom
              label="Nội dung"
              placeholder="Viết ghi chú"
              {...register("notes")}
            />
          </div>
        </div>
      </form>
    );
  };

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onOpenChange={handleClose}
      hideCloseButton
      placement="top"
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-[10px] bg-white border border-[#DEE1E6] hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <IconChevronLeft className="w-5 h-5 text-[#112C5D]" />
            </button>
            <div className="text-base font-bold">Chi tiết lịch hẹn</div>
          </div>

          <Button
            isIconOnly
            variant="light"
            radius="full"
            size="sm"
            onPress={handleClose}
            className="rounded-full flex items-center justify-center bg-[#F1F3F6]"
          >
            <IconX size={20} className="text-default-600" />
          </Button>
        </ModalHeader>
        <Divider />
        <ModalBody className="px-7 pt-4 pb-7">{renderBody()}</ModalBody>
        <Divider />
        <ModalFooter className="px-7 py-4 min-h-11 flex flex-col @sm:flex-row w-full items-center justify-center gap-3">
          <Button
            isDisabled={!isDirty || isSubmitting || isFetching || !!fetchError}
            isLoading={isSubmitting}
            form="ap-detail-form"
            type="submit"
            color="primary"
            className="font-bold text-base data-[disabled=true]:opacity-50 h-11 rounded-xl w-full"
          >
            Xong
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApDetailModal;

// ─── AppointmentTypeSelector (local, disabled variant) ──────────────────────

interface AppointmentTypeSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
}

const AppointmentTypeSelector: React.FC<AppointmentTypeSelectorProps> = ({
  value,
  onChange,
  isInvalid,
  errorMessage,
}) => {
  return (
    <Select
      className="w-full"
      classNames={{
        label: "text-base font-bold min-h-6 px-1",
        trigger:
          "h-12 rounded-2xl bg-white border-gray-400 hover:border-default-500 data-[hover=true]:border-default-500",
        value: "!font-normal !text-base",
        innerWrapper: "gap-2",
        selectorIcon: "w-4 h-4",
      }}
      listboxProps={{
        itemClasses: {
          base: ["data-[selected=true]:bg-blue-200"],
        },
        hideSelectedIcon: true,
      }}
      size="lg"
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      labelPlacement="outside-top"
      selectedKeys={value ? [value] : []}
      label={<span className="text-base">Loại lịch hẹn</span>}
      variant="bordered"
      placeholder="Chọn loại lịch"
      onChange={(e) => onChange?.(e?.target?.value)}
    >
      {AppointmentTypeOptions?.map((item) => (
        <SelectItem key={String(item?.AppointmentLabelId)}>
          {item?.Name}
        </SelectItem>
      )) || []}
    </Select>
  );
};
