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
  IconMinusVertical,
  IconPhoneCall,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";

import { TextAreaCustom, TimeLenghtPicker, TimePicker } from "@/com/shared";
import { today, getLocalTimeZone, parseDate } from "@internationalized/date";
import { Customer } from "@/types/define.d";
import React, { useEffect, useState } from "react";
import {
  Controller,
  type DefaultValues,
  useForm,
  useWatch,
} from "react-hook-form";
import { AppointmentTypeOptions } from "@/data/appointmentType";
import DoctorSelector from "./DoctorSelector";
import BranchSelector from "./BranchSelector";
import ChairSelector from "./ChairSelector";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import rest from "@/lib/rest";
import { prop } from "remeda";
import { useAppContext } from "@/context";
import SuccessToastContent from "./SuccessToastContent";

interface OptionType {
  label: string;
  value: string;
}

interface ChairFormValue {
  label: string;
  value?: string;
  branchId?: string;
  startTime?: string;
  endTime?: string;
}

interface FormType {
  date: Date;
  time: string;
  duration: number;
  branch: OptionType;
  doctor?: OptionType;
  appointmentType: string;
  notes?: string;
  chair?: ChairFormValue;
}

interface AddAppointmentProps {
  customer?: Customer | null;
  appointmentId?: string;
  onSuccess?: () => void;
  isOpen: boolean;
  onOpenChange: () => void;
}

const formSchema: Yup.ObjectSchema<FormType> = Yup.object({
  date: Yup.date()
    .required("Vui lòng chọn ngày")
    .min(
      today(getLocalTimeZone()).toDate(getLocalTimeZone()),
      "Vui lòng chọn ngày từ hôm nay trở đi",
    ),
  time: Yup.string()
    .test("invalid-time", "Thời gian không hợp lệ", function (value) {
      const { date } = this.parent;
      const selectedDate = dayjs(date);
      const currentDate = dayjs();

      if (selectedDate.isSame(currentDate, "day")) {
        const currentTime = currentDate.format("HH:mm");
        if (value && value <= currentTime) {
          return false;
        }
      }
      return true;
    })
    .required("Vui lòng chọn giờ"),
  duration: Yup.number().required("Vui lòng chọn thời lượng"),
  branch: Yup.mixed<OptionType>().required("Vui lòng chọn chi nhánh"),
  doctor: Yup.mixed<OptionType>(),
  appointmentType: Yup.string().required("Vui lòng chọn loại lịch hẹn"),
  notes: Yup.string(),
  chair: Yup.mixed<ChairFormValue>(),
});

interface ChairBookingSnapshot {
  bookedChairId: string;
  chairId: string;
  startTime: string;
  duration: number;
}

const getDefaultFormValues = (): DefaultValues<FormType> => ({
  date: new Date(),
  duration: 30,
  time: dayjs().add(5, "minute").format("HH:mm"),
  appointmentType: "3",
  chair: undefined,
});

const AddApModal: React.FC<AddAppointmentProps> = ({
  isOpen,
  onOpenChange,
  customer,
  appointmentId,
  onSuccess,
}) => {
  const [insideCustomer, setInsideCustomer] = useState(customer);
  const { branches, branch } = useAppContext();

  const [isFetchingAppointment, setIsFetchingAppointment] = useState(false);
  const [errorFetchingAppointment, setErrorFetchingAppointment] = useState<
    string | null
  >(null);
  const [trigger, setTrigger] = useState(1);
  const initialChairBookingRef = React.useRef<ChairBookingSnapshot | null>(
    null,
  );
  const previousEditBookingRef = React.useRef<{
    branchId: string;
    startTime: string;
    duration: number;
  } | null>(null);
  const { register, handleSubmit, control, reset, setValue } =
    useForm<FormType>({
      resolver: yupResolver(formSchema),
      defaultValues: getDefaultFormValues(),
    });

  const selectedDate = useWatch({
    control,
    name: "date",
  });

  const watchedTime = useWatch({ control, name: "time" });
  const watchedDuration = useWatch({ control, name: "duration" });
  const watchedBranch = useWatch({ control, name: "branch" });
  const watchedChair = useWatch({ control, name: "chair" });

  const currentBookingStartTime = React.useMemo(() => {
    if (!selectedDate || !watchedTime) return "";

    return `${dayjs(selectedDate).format("YYYY-MM-DD")} ${watchedTime}`;
  }, [selectedDate, watchedTime]);

  useEffect(() => {
    if (
      watchedChair?.branchId &&
      watchedBranch?.value &&
      watchedChair.branchId !== watchedBranch.value
    ) {
      setValue("chair", {
        label: "",
        value: undefined,
        branchId: watchedBranch.value,
        startTime: watchedChair.startTime,
        endTime: watchedChair.endTime,
      });
    }
  }, [
    setValue,
    watchedBranch?.value,
    watchedChair?.branchId,
    watchedChair?.endTime,
    watchedChair?.startTime,
  ]);

  useEffect(() => {
    if (!appointmentId || !isOpen || !currentBookingStartTime) return;

    const currentBooking = {
      branchId: watchedBranch?.value ?? "",
      startTime: currentBookingStartTime,
      duration: Number(watchedDuration ?? 0),
    };

    if (!previousEditBookingRef.current) {
      previousEditBookingRef.current = currentBooking;
      return;
    }

    const previousBooking = previousEditBookingRef.current;
    previousEditBookingRef.current = currentBooking;

    const hasBookingChanged =
      previousBooking.branchId !== currentBooking.branchId ||
      previousBooking.startTime !== currentBooking.startTime ||
      previousBooking.duration !== currentBooking.duration;

    if (hasBookingChanged && watchedChair?.value) {
      setValue("chair", undefined);
    }
  }, [
    appointmentId,
    currentBookingStartTime,
    isOpen,
    setValue,
    watchedBranch?.value,
    watchedChair?.value,
    watchedDuration,
  ]);

  // Computed chair value for ChairSelector (includes metadata for API calls)
  const chairSelectorValue = React.useMemo(() => {
    if (!selectedDate || !watchedTime || !watchedDuration) return watchedChair;

    const startDate = dayjs(selectedDate).format("YYYY-MM-DD");
    const startTime = `${startDate} ${watchedTime}`;
    const endTime = dayjs(`${startDate} ${watchedTime}`)
      .add(watchedDuration, "minute")
      .format("YYYY-MM-DD HH:mm");

    return {
      ...watchedChair,
      branchId: watchedBranch?.value ?? "",
      startTime,
      endTime,
    };
  }, [selectedDate, watchedTime, watchedDuration, watchedBranch, watchedChair]);

  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async (data: FormType) => {
    try {
      setIsLoading(true);

      const originalChairBooking = initialChairBookingRef.current;
      const shouldMarkDeletedBookedChair =
        !!originalChairBooking?.bookedChairId &&
        (originalChairBooking.chairId !== (data?.chair?.value ?? "") ||
          originalChairBooking.startTime !==
            `${dayjs(data?.date).format("YYYY-MM-DD")} ${data?.time}` ||
          originalChairBooking.duration !== Number(data?.duration ?? 0));

      const response = await rest
        .post("/appointment/add", {
          ...(appointmentId ? { appointmentId } : {}),
          branch_id: data?.branch?.value,
          customer_id: insideCustomer?.CustomerId,
          date: dayjs(data?.date).format("YYYY-MM-DD"),
          start_time: data?.time,
          duration: data?.duration,
          doctor_id: data?.doctor?.value,
          appointment_label_id: data?.appointmentType,
          notes: data?.notes || "",
          chair_id: data?.chair?.value || undefined,
          mark_deleted_booked_chair_id: shouldMarkDeletedBookedChair
            ? originalChairBooking?.bookedChairId
            : undefined,
        })
        .catch((err) => {
          throw new Error(
            err?.response?.data?.message ||
              err?.message ||
              "Đã có lỗi xảy ra, vui lòng thử lại",
            {
              cause: err?.response?.status || 500,
            },
          );
        });

      const chairBookingError = prop(
        response,
        ...["data", "chairBookingError"],
      );

      if (chairBookingError) {
        addToast({
          title: "Thành công một phần",
          description: (
            <SuccessToastContent
              customerId={insideCustomer?.CustomerId}
              description={
                appointmentId
                  ? "Lịch hẹn đã được cập nhật thành công, nhưng chưa cập nhật được ghế nha. Vui lòng kiểm tra lại hoặc book ghế sau trong chi tiết lịch hẹn."
                  : "Lịch hẹn đã được tạo thành công, nhưng chưa book được ghế nha. Vui lòng kiểm tra lại hoặc book ghế sau trong chi tiết lịch hẹn."
              }
            />
          ),
          color: "warning",
          timeout: 7000,
        });
        onSuccess?.();
        onOpenChange();
        reset(getDefaultFormValues());
      } else {
        addToast({
          title: "Thành công",
          description: (
            <SuccessToastContent
              customerId={insideCustomer?.CustomerId}
              description={
                appointmentId
                  ? "Cập nhật lịch hẹn thành công"
                  : "Tạo lịch hẹn thành công"
              }
            />
          ),
          color: "default",
          timeout: 7000,
          hideIcon: true,
        });
        onSuccess?.();
        onOpenChange();
        reset(getDefaultFormValues());
      }
    } catch (error: any) {
      addToast({
        title: "Thất bại",
        description: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * useEffect
   * ====================================================================
   */

  // init appointment data when customer or appointmentId changes
  useEffect(() => {
    if (!appointmentId || !isOpen) return;

    const fetchAppointment = async () => {
      try {
        setIsFetchingAppointment(true);
        setErrorFetchingAppointment(null);

        const response = await rest.get(
          `/appointment/${appointmentId}/preview`,
        );

        setInsideCustomer({
          CustomerId: prop(response, ...["data", "data", "Customer", "Id"]),
          FullName: prop(response, ...["data", "data", "Customer", "Name"]),
          CustomerCode: prop(response, ...["data", "data", "Customer", "Code"]),
          PhoneNumbers: prop(
            response,
            ...["data", "data", "Customer", "PhoneNumbers"],
          ),
          EmotionalState: "0",
        });

        const startAt = dayjs(prop(response, ...["data", "data", "StartAt"]));
        const endAt = dayjs(prop(response, ...["data", "data", "EndAt"]));
        const dentalChairBooking =
          prop(response, ...["data", "data", "DentalChairBooking"]) || null;
        const branchId =
          prop(response, ...["data", "data", "Branch", "Id"]) || "";
        const normalizedBookingStart = dayjs(
          dentalChairBooking?.EstimatedStartDate,
        );
        const normalizedBookingEnd = dayjs(
          dentalChairBooking?.EstimatedEndDate,
        );
        const bookingStartAt = normalizedBookingStart.isValid()
          ? normalizedBookingStart.format("YYYY-MM-DD HH:mm")
          : startAt.format("YYYY-MM-DD HH:mm");
        const bookingEndAt = normalizedBookingEnd.isValid()
          ? normalizedBookingEnd.format("YYYY-MM-DD HH:mm")
          : endAt.format("YYYY-MM-DD HH:mm");
        const bookingDuration = dayjs(bookingEndAt).diff(
          dayjs(bookingStartAt),
          "minute",
        );

        initialChairBookingRef.current =
          dentalChairBooking?.DentalChairBookingId
            ? {
                bookedChairId: String(dentalChairBooking.DentalChairBookingId),
                chairId: String(dentalChairBooking.DentalChairId || ""),
                startTime: bookingStartAt,
                duration:
                  bookingDuration > 0
                    ? bookingDuration
                    : endAt.diff(startAt, "minute"),
              }
            : null;

        previousEditBookingRef.current = {
          branchId: String(branchId),
          startTime: startAt.format("YYYY-MM-DD HH:mm"),
          duration: endAt.diff(startAt, "minute"),
        };

        reset({
          date: startAt.toDate(),
          duration: endAt.diff(startAt, "minute"),
          time: startAt.format("HH:mm"),
          appointmentType: prop(
            response,
            ...["data", "data", "AppointmentType", "0", "AppointmentLabelId"],
          ),
          doctor: {
            label: prop(response, ...["data", "data", "Staff", "name"]),
            value: prop(response, ...["data", "data", "Staff", "id"]),
          },
          branch: {
            label: prop(response, ...["data", "data", "Branch", "Name"]),
            value: branchId,
          },
          notes: prop(response, ...["data", "data", "Note"]) || "",
          chair: dentalChairBooking?.DentalChairId
            ? {
                label: dentalChairBooking.DentalChairCode || "",
                value: String(dentalChairBooking.DentalChairId),
                branchId: String(branchId),
                startTime: bookingStartAt,
                endTime: bookingEndAt,
              }
            : undefined,
        });
      } catch (error: any) {
        setErrorFetchingAppointment(
          error?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
        );
      } finally {
        setIsFetchingAppointment(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, isOpen, reset, trigger]);

  // sync customer when prop changes
  useEffect(() => {
    setInsideCustomer(customer);
  }, [customer]);

  // reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      initialChairBookingRef.current = null;
      previousEditBookingRef.current = null;
      reset(getDefaultFormValues());
    }
  }, [isOpen, reset]);

  // init selected branch from local when modal opens
  useEffect(() => {
    if (isOpen && !appointmentId) {
      reset((prev) => ({
        ...prev,
        branch: { label: branch?.Name || "", value: branch?.BranchId || "" },
      }));
    }
  }, [isOpen, appointmentId, reset, branches, branch]);

  /**
   * render view
   * ====================================================================
   */

  const renderModalBody = () => {
    if (errorFetchingAppointment)
      return (
        <div className="w-full min-h-[400px] flex-col gap-4 flex items-center justify-center">
          <span className="text-center text-danger">
            Đã có lỗi xảy ra, vui lòng thử lại. <br />{" "}
            {errorFetchingAppointment}
          </span>
          <Button
            color="danger"
            size="sm"
            onPress={() => setTrigger((prev) => prev + 1)}
          >
            Thử lại
          </Button>
        </div>
      );

    if (isFetchingAppointment)
      return (
        <div className="w-full min-h-[400px] flex items-center justify-center">
          <Spinner />
        </div>
      );

    return (
      <form
        id="create-appointment-form"
        onSubmit={handleSubmit(handleConfirm)}
        className="relative w-full h-full flex flex-col gap-4"
      >
        <div className="flex flex-col border-b-1 border-b-gray-500 pb-6">
          <div className="flex items-start justify-between mb-5">
            <Avatar
              isBordered
              radius="full"
              className="text-3xl font-black w-16 h-16"
              size="lg"
              fallback={
                insideCustomer?.FullName?.charAt(0).toUpperCase() || "U"
              }
              name={insideCustomer?.FullName}
            />
          </div>
          <h1 className=" font-bold text-[28px] mb-3 p-0">
            {insideCustomer?.FullName}
          </h1>
          <div className="flex items-center flex-wrap gap-2 font-semibold text-sm text-[#42586D]">
            <div className="flex gap-2">
              <IconUserCircle size={20} />
              {insideCustomer?.CustomerCode}
            </div>
            <IconMinusVertical strokeWidth={1} />
            <div className="flex gap-2">
              <IconPhoneCall size={20} />
              {insideCustomer?.PhoneNumbers?.[0]}
            </div>
          </div>
        </div>

        <div className="grid grid-cols gap-6">
          {/* Thời gian */}
          <div className="flex flex-col sm:flex-row gap-7 sm:gap-3">
            <div className={`w-full flex flex-col gap-2`}>
              <span className="text-base font-bold min-h-6">Ngày</span>
              <Controller
                control={control}
                name="date"
                render={({ field, fieldState }) => (
                  <DatePicker
                    aria-label="date-picker"
                    showMonthAndYearPickers
                    calendarWidth={280}
                    value={
                      parseDate(dayjs(field?.value).format("YYYY-MM-DD")) as any
                    }
                    onChange={(date) =>
                      field.onChange(date?.toDate(getLocalTimeZone()))
                    }
                    variant="bordered"
                    radius="lg"
                    isInvalid={fieldState?.invalid}
                    errorMessage={fieldState?.error?.message}
                    classNames={{
                      base: "",
                      inputWrapper: "h-12 hover:border-default-500 ",
                      input: " text-base font-medium ml-1",
                    }}
                    minValue={today(getLocalTimeZone())}
                  />
                )}
              />
            </div>

            <div className="w-full flex gap-3">
              <div className="w-full flex flex-col gap-2 ">
                <span className="text-base font-bold min-h-6">Vào lúc</span>

                <Controller
                  control={control}
                  name="time"
                  render={({ field, fieldState }) => (
                    <TimePicker
                      value={field?.value}
                      onChange={field?.onChange}
                      isInvalid={fieldState?.invalid}
                      errorMessage={fieldState?.error?.message}
                      selectedDate={selectedDate}
                    />
                  )}
                />
              </div>

              <div className=" flex flex-col gap-2 w-full">
                <span className="text-base font-bold min-h-6">Thời lượng</span>

                <Controller
                  control={control}
                  name="duration"
                  render={({ field, fieldState }) => (
                    <TimeLenghtPicker
                      readonly
                      value={field?.value}
                      onChange={field?.onChange}
                      isInvalid={fieldState?.invalid}
                      errorMessage={fieldState?.error?.message}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-3">
            <div className="w-full flex flex-col gap-2">
              <Controller
                control={control}
                name="branch"
                render={({ field, fieldState }) => (
                  <BranchSelector
                    value={field?.value}
                    onChange={field?.onChange}
                    isInvalid={fieldState?.invalid}
                    errorMessage={fieldState?.error?.message}
                  />
                )}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <ChairSelector
                value={chairSelectorValue as any}
                onChange={(val) =>
                  setValue("chair", { label: val.label, value: val.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-3">
            <Controller
              control={control}
              name="doctor"
              render={({ field, fieldState }) => (
                <DoctorSelector
                  value={field?.value as any}
                  onChange={field?.onChange}
                  isInvalid={fieldState?.invalid}
                  // errorMessage={fieldState?.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="appointmentType"
              render={({ field, fieldState }) => (
                <AppointmentTypeSelector
                  value={field?.value}
                  onChange={field?.onChange}
                  isInvalid={fieldState?.invalid}
                  errorMessage={fieldState?.error?.message}
                />
              )}
            />
          </div>

          <TextAreaCustom
            label="Nội dung"
            placeholder="Viết ghi chú"
            {...register("notes")}
          />
        </div>
      </form>
    );
  };

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      placement="top"
    >
      <ModalContent>
        <ModalHeader className={`flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenChange}
              className="w-7 h-7 rounded-[10px] bg-white border border-[#DEE1E6] hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <IconChevronLeft className="w-5 h-5 text-[#112C5D]" />
            </button>
            <div className="text-base font-bold">
              {appointmentId ? "Chỉnh sửa lịch hẹn" : "Tạo lịch hẹn"}
            </div>
          </div>

          <Button
            isIconOnly
            variant="light"
            radius="full"
            size="sm"
            onPress={onOpenChange}
            className="rounded-full flex items-center justify-center bg-[#F1F3F6]"
          >
            <IconX size={20} className="text-default-600" />
          </Button>
        </ModalHeader>
        <Divider />
        <ModalBody className={`px-7 pt-4 pb-7`}>{renderModalBody()}</ModalBody>
        <Divider />
        <ModalFooter
          className={` px-7 py-4 min-h-11 flex flex-col @sm:flex-row w-full items-center justify-center gap-3`}
        >
          <Button
            disabled={
              isLoading || isFetchingAppointment || !!errorFetchingAppointment
            }
            isLoading={isLoading}
            form="create-appointment-form"
            type="submit"
            color="primary"
            className={`font-bold text-base data-[disabled=true]:opacity-100 h-11 rounded-xl w-full`}
          >
            Xong
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddApModal;

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
      label={
        <span className="text-base">
          Loại lịch hẹn <span className="text-danger">*</span>
        </span>
      }
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
