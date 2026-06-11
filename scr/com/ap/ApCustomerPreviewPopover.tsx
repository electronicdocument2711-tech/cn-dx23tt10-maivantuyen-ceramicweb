import dayjs from "@/lib/dayjs";
import rest from "@/lib/rest";
import { AppointmentPreview } from "@/types/define.d";
import ApStatusSelect from "./ApStatusSelect";
import {
  addToast,
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { IconCalendarEvent, IconClock } from "@tabler/icons-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/utils";
import ApActions from "./ApActions";
import { useConfirm } from "../ConfirmProvider";
// import StaffSelector from "./StaffSelector";
import ChairSelector from "./ChairSelector";
import DoctorSelector from "./DoctorSelector";

interface ApCustomerPreviewPopoverProps {
  isOpen: boolean;
  appointmentId: string;
  doctorName?: string;
  onOpen: () => void;
  onClose: () => void;
  onRefreshAppointments: () => void;
  children: ReactNode;
}

const CUSTOMER_DETAIL_CACHE_TTL_MS = 5 * 60 * 1000;
const HOVER_OPEN_DELAY_MS = 250;
const DEFAULT_TEXT = {
  loading: "Đang tải...",
  noDoctor: "--",
  noDate: "--/--/----",
  noTime: "--:--",
  noNote: "",
  error: "Không tải được dữ liệu chi tiết",
};

const STATUS_ID_BY_NAME: Record<string, number> = {
  "chưa đến": 11,
  "đã đến": 21,
  "đã checkin": 21,
  checkin: 21,
  "hủy hẹn": 1,
  "huỷ hẹn": 1,
  "đã hủy hẹn": 1,
  "đã huỷ hẹn": 1,
};

const STATUS_NAME_BY_ID: Record<number, string> = {
  11: "Chưa đến",
  21: "Đã đến",
  1: "Đã huỷ hẹn",
};

const normalizeStatusId = (previewDetail: AppointmentPreview | null) => {
  const rawStatusId =
    previewDetail?.AppointmentStatus?.Id ??
    (
      previewDetail as AppointmentPreview & {
        AppointmentStatusId?: string | number;
      }
    )?.AppointmentStatusId;

  const parsedStatusId = Number(rawStatusId);
  if (Number.isFinite(parsedStatusId)) {
    if (
      parsedStatusId === 41 ||
      parsedStatusId === 44 ||
      parsedStatusId === 45 ||
      parsedStatusId === 46 ||
      parsedStatusId === 31 ||
      parsedStatusId === 11 ||
      parsedStatusId === 51 ||
      parsedStatusId === 61 ||
      parsedStatusId === 71 ||
      parsedStatusId === 21 ||
      parsedStatusId === 1
    ) {
      return parsedStatusId;
    }
  }

  const normalizedName =
    previewDetail?.AppointmentStatus?.Name?.trim().toLowerCase() || "";
  return STATUS_ID_BY_NAME[normalizedName] ?? 0;
};

const customerDetailCache = new Map<string, any>();
const customerDetailRequestCache = new Map<
  string,
  Promise<AppointmentPreview>
>();
const appointmentDetailOpenState = new Map<string, boolean>();

const getValidCachedAppointmentPreview = (appointmentId: string) => {
  const cached = customerDetailCache.get(appointmentId);
  if (!cached) return null;

  if (cached.expiredAt <= Date.now()) {
    customerDetailCache.delete(appointmentId);
    return null;
  }

  return cached.data;
};

const setCachedAppointmentPreview = (
  appointmentId: string,
  data: AppointmentPreview,
) => {
  customerDetailCache.set(appointmentId, {
    data,
    expiredAt: Date.now() + CUSTOMER_DETAIL_CACHE_TTL_MS,
  });
};

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

const getAppointmentPreview = async (
  appointmentId: string,
): Promise<AppointmentPreview> => {
  const cached = getValidCachedAppointmentPreview(appointmentId);
  if (cached) return cached;

  const pendingRequest = customerDetailRequestCache.get(appointmentId);
  if (pendingRequest) return pendingRequest;

  const request = rest
    .get(`/appointment/${appointmentId}/preview`)
    .then((res) => {
      const detail = (res?.data?.data ||
        res?.data ||
        res) as AppointmentPreview;
      setCachedAppointmentPreview(appointmentId, detail);
      return detail;
    })
    .finally(() => {
      customerDetailRequestCache.delete(appointmentId);
    });

  customerDetailRequestCache.set(appointmentId, request);
  return request;
};
const ApCustomerPreviewPopover = ({
  isOpen,
  appointmentId,
  doctorName,
  onOpen,
  onClose,
  onRefreshAppointments,
  children,
}: ApCustomerPreviewPopoverProps) => {
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(
    () => appointmentDetailOpenState.get(appointmentId) ?? false,
  );
  const [previewDetail, setPreviewDetail] = useState<AppointmentPreview | null>(
    null,
  );
  const [selectedStatusId, setSelectedStatusId] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [field, setField] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { confirm } = useConfirm();

  const reloadAppointmentPreview = async () => {
    if (!appointmentId) return;

    customerDetailCache.delete(appointmentId);
    customerDetailRequestCache.delete(appointmentId);

    setError(null);
    setIsLoading(true);
    try {
      const detail = await getAppointmentPreview(appointmentId);
      setPreviewDetail(detail);
      setSelectedStatusId(normalizeStatusId(detail));
    } catch {
      setError(DEFAULT_TEXT.error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearOpenTimeout = () => {
    if (!openTimeoutRef.current) return;
    clearTimeout(openTimeoutRef.current);
    openTimeoutRef.current = null;
  };

  const handleMouseEnter = () => {
    // khi mà user hover vào thì sẽ set timeout để mở popover sau 250ms,
    // nếu user rời đi trước 250ms thì sẽ clear timeout và không mở popover
    clearOpenTimeout();
    openTimeoutRef.current = setTimeout(() => {
      onOpen();
    }, HOVER_OPEN_DELAY_MS);
  };

  const handleMouseLeave = () => {
    clearOpenTimeout();
    onClose();
  };

  const handleClickOpenDetail = () => {
    clearOpenTimeout();
    onClose();
    appointmentDetailOpenState.set(appointmentId, true);
    setIsDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    if (open) {
      appointmentDetailOpenState.set(appointmentId, true);
    } else {
      appointmentDetailOpenState.delete(appointmentId);
      onClose();
    }

    setIsDetailOpen(open);
  };

  useEffect(() => {
    return () => {
      clearOpenTimeout();
    };
  }, []);

  useEffect(() => {
    setIsDetailOpen(appointmentDetailOpenState.get(appointmentId) ?? false);
  }, [appointmentId]);

  useEffect(() => {
    let isMounted = true;

    const shouldFetch = isOpen || isDetailOpen;

    if (!shouldFetch || !appointmentId) {
      setIsLoading(false);
      return;
    }

    const cached = getValidCachedAppointmentPreview(appointmentId);
    if (cached) {
      setPreviewDetail(cached);
      setError(null);
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    getAppointmentPreview(appointmentId)
      .then((detail) => {
        if (!isMounted) return;
        setPreviewDetail(detail);
      })
      .catch(() => {
        if (!isMounted) return;
        setError(DEFAULT_TEXT.error);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, isDetailOpen, appointmentId]);

  const displayData = useMemo(() => {
    const startDate = toDateTime(previewDetail?.StartAt);
    const endDate = toDateTime(previewDetail?.EndAt);

    const customer = previewDetail?.Customer;

    const branch =
      "Branch" in (previewDetail || {}) ? (previewDetail as any).Branch : null;

    const branchId = branch?.Id;

    const branchName = branch?.Name;

    const appointmentTypeName = previewDetail?.AppointmentType?.[0]?.Name;

    const customerName =
      customer?.Name ||
      previewDetail?.CustomerName ||
      (isLoading ? DEFAULT_TEXT.loading : appointmentId);
    const customerCode =
      customer?.Code ||
      customer?.Id ||
      previewDetail?.CustomerCode ||
      previewDetail?.CustomerId ||
      appointmentId;
    const customerAvatar = customer?.Photo || "";
    const customerPhone = customer?.PhoneNumbers?.[0] || "";
    const displayDoctorName =
      doctorName ||
      previewDetail?.AppointedToName ||
      previewDetail?.DoctorName ||
      previewDetail?.AppointedTo ||
      DEFAULT_TEXT.noDoctor;
    const statusName = previewDetail?.AppointmentStatus?.Name || "";
    const statusId = normalizeStatusId(previewDetail);
    const appointmentDate =
      startDate?.format("DD/MM/YYYY") || DEFAULT_TEXT.noDate;

    const startTime =
      previewDetail?.StartTime ||
      startDate?.format("HH:mm") ||
      DEFAULT_TEXT.noTime;

    const endTime =
      previewDetail?.EndTime || endDate?.format("HH:mm") || DEFAULT_TEXT.noTime;

    // const DentalChairBooking = previewDetail?.DentalChairBooking;
    const DentalChairBooking =
      "DentalChairBooking" in (previewDetail || {})
        ? (previewDetail as any).DentalChairBooking
        : null;

    const note = previewDetail?.Note || DEFAULT_TEXT.noNote;

    const startDateFormatted = startDate?.format("YYYY-MM-DD HH:mm");
    const endDateFormatted = endDate?.format("YYYY-MM-DD HH:mm");

    const calculateDuration = (startTime?: string, endTime?: string) => {
      if (!startTime || !endTime) return DEFAULT_TEXT.noTime;

      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;

      const diff = endTotal - startTotal;

      if (diff <= 0) return DEFAULT_TEXT.noTime;

      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;

      if (hours >= 1) {
        return `${hours}h${minutes.toString().padStart(2, "0")}m`;
      } else {
        return `${minutes.toString().padStart(2, "0")}m`;
      }
    };

    const duration = calculateDuration(startTime, endTime);

    const calculateDurationMinutes = (startTime?: string, endTime?: string) => {
      if (!startTime || !endTime) return "";

      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;

      const diff = endTotal - startTotal;

      if (diff <= 0) return "";

      return `${diff}`;
    };

    const estimate = calculateDurationMinutes(startTime, endTime);

    return {
      customerName,
      customerCode,
      customerAvatar,
      customerPhone,
      branchId,
      branchName,
      doctorName: displayDoctorName,
      statusId,
      statusName,
      appointmentTypeName,
      appointmentDate,
      startTime,
      endTime,
      DentalChairBooking,
      startDateFormatted,
      endDateFormatted,
      duration,
      estimate,
      note,
    };
  }, [previewDetail, isLoading, appointmentId, doctorName]);

  useEffect(() => {
    if (displayData.statusId > 0) {
      setSelectedStatusId(displayData.statusId);
    }
  }, [displayData.statusId]);

  const handleApStatusChange = async (value: number) => {
    //using default confirm, change to modal in future
    const isConfirm = await confirm({
      message: "Xác nhận đổi trạng thái lịch hẹn?",
      type: "info",
      hideCancel: true,
    });

    if (!isConfirm) {
      return;
    }

    if (value < 0) return;
    if (value === selectedStatusId) return;
    if (!previewDetail?.AppointmentId) return;

    const previousStatusId = selectedStatusId;
    const currentStatusId = normalizeStatusId(previewDetail);
    setSelectedStatusId(value);

    try {
      const res = await rest.patch(
        `/appointment/${previewDetail?.AppointmentId}/status`,
        { currentId: currentStatusId, targetId: value.toString() },
      );

      if (res.status !== 200)
        throw new Error("Lỗi khi đổi trạng thái lịch hẹn");

      setPreviewDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          AppointmentStatus: {
            ...prev.AppointmentStatus,
            Id: value,
            Name: STATUS_NAME_BY_ID[value] || prev.AppointmentStatus?.Name,
          },
        };
      });

      void reloadAppointmentPreview();

      addToast({
        title: "Thành công",
        description: "Đổi trạng thái lịch hẹn thành công",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Thất bại",
        description: getErrorMessage(error, "Lỗi khi đổi trạng thái lịch hẹn"),
        color: "danger",
      });
      setSelectedStatusId(previousStatusId);
    }
  };

  const onModalDetailClose = () => {
    onRefreshAppointments?.();
  };

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    value?: any;
  }>({
    isOpen: false,
  });

  const handleConfirm = async () => {
    if (!confirmState.value) return;

    try {
      if (field === "Doctor") {
        await rest.post(`/appointment/${appointmentId}/assign-doctor`, {
          doctor_id: confirmState.value?.value,
        });
      } else {
        await rest.post(`/chair`, {
          AppointmentId: previewDetail?.AppointmentId,
          CustomerId: previewDetail?.Customer?.Id,
          StartAt: dayjs(previewDetail?.StartAt).unix(),
          EstimateTime: displayData.estimate,
          DentalChairId: confirmState.value?.value,
        });
      }

      addToast({
        title: "Thành công",
        description: "Tạo lịch hẹn thành công",
        color: "success",
      });

      await reloadAppointmentPreview();
    } catch (err: any) {
      addToast({
        title: "Thất bại",
        description: err?.message || "Có lỗi xảy ra",
        color: "danger",
      });
    } finally {
      setConfirmState({ isOpen: false });
      setField("");
    }
  };

  const handleCancel = () => {
    setConfirmState({ isOpen: false });
    setField("");
  };

  return (
    <>
      {/* Popover dùng cho hover */}
      <Popover
        isOpen={isOpen}
        placement="right-start"
        shouldCloseOnBlur={false}
        classNames={{ content: "p-0" }}
      >
        <PopoverTrigger>
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClickOpenDetail}
          >
            {children}
          </div>
        </PopoverTrigger>

        <PopoverContent>
          <div
            className="w-125 rounded-2xl border border-default-200 bg-white p-5"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClickOpenDetail}
          >
            <div className="flex items-start justify-between gap-4">
              <Avatar
                src={displayData.customerAvatar}
                name={displayData.customerName}
                className="w-20 h-20"
              />

              <div className="flex items-center gap-2 rounded-full bg-default-100 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                <span className="font-medium whitespace-nowrap">
                  {displayData.doctorName}
                </span>
              </div>
            </div>

            <p className="text-xl font-bold mt-4">{displayData.customerName}</p>
            {displayData.customerCode ? (
              <p className="text-sm text-default-600 mt-1">
                {displayData.customerCode}
              </p>
            ) : null}

            {displayData.statusName ? (
              <p className="mt-2 text-sm text-default-600">
                {displayData.statusName}
              </p>
            ) : null}

            <div className="mt-4 border-t border-default-200 pt-4">
              <p className="text-base font-semibold ">
                {displayData.appointmentTypeName || "Điều trị"}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-default-100 p-3">
                  <div className="flex items-center gap-2 text-default-600">
                    <IconCalendarEvent className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Ngày</span>
                  </div>
                  <p className="mt-1 font-bold ">
                    {displayData.appointmentDate}
                  </p>
                </div>
                <div className="rounded-xl bg-default-100 p-3">
                  <div className="flex items-center gap-2 text-default-600">
                    <IconClock className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Thời gian</span>
                  </div>
                  <p className="mt-1 font-bold ">
                    {displayData.startTime} - {displayData.endTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-base font-semibold ">Ghi chú</p>
              <div className="mt-2 rounded-xl bg-default-100 p-3 ">
                {/* {displayData.note} */}
              </div>
            </div>
            {error ? <p className="mt-3 text-xs text-danger">{error}</p> : null}
          </div>
        </PopoverContent>
      </Popover>

      {/* Modal dùng cho onClick */}
      <Modal
        isOpen={isDetailOpen}
        onOpenChange={(isOpenState) => {
          handleDetailOpenChange(isOpenState);
          setIsDetailOpen(isOpenState);
          if (!isOpenState) {
            onModalDetailClose?.();
          }
        }}
        size="xl"
        placement="center"
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b border-default-200">
              Lịch hẹn
            </ModalHeader>

            <ModalBody className="p-6">
              <div className="flex items-start justify-between gap-4">
                <Avatar
                  src={displayData.customerAvatar}
                  name={displayData.customerName}
                  className="size-24"
                />

                <div className="flex items-center gap-3">
                  {previewDetail?.AppointmentId ? (
                    <>
                      <ApStatusSelect
                        value={selectedStatusId}
                        onChange={handleApStatusChange}
                      />

                      <ApActions
                        data={previewDetail as any}
                        onUpdated={() => {
                          void reloadAppointmentPreview();
                        }}
                        disableHistoryModal={true}
                      />
                    </>
                  ) : (
                    <span className="text-sm text-default-500">
                      Đang tải thao tác...
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-2xl font-bold mt-4">
                {displayData.customerName}
              </h3>

              <div className="flex items-center gap-4 text-default-600">
                <span>{displayData.customerCode}</span>
                {displayData.customerPhone ? (
                  <>
                    <span className="text-default-400">|</span>
                    <span>{displayData.customerPhone}</span>
                  </>
                ) : null}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-default-200 pt-6">
                <div className="rounded-2xl bg-default-100 p-4">
                  <p className="text-default-600">Hẹn gặp</p>
                  <div className=" font-bold mt-1">
                    <DoctorSelector
                      hideLabel
                      value={{ label: displayData.doctorName }}
                      onChange={async (val) => {
                        setConfirmState({
                          isOpen: true,
                          value: val,
                        });
                        setField("Doctor");
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-default-100 p-4">
                  <p className="text-default-600">Loại lịch hẹn</p>
                  <p className=" font-bold mt-1 h-11 flex items-center pl-2">
                    {displayData.appointmentTypeName || "Điều trị"}
                  </p>
                </div>

                <div className="rounded-2xl bg-default-100 p-4 h-26">
                  <p className="text-default-600">Thời gian lịch hẹn</p>
                  <p className=" font-bold mt-1 h-11 flex items-center pl-2">
                    {displayData.appointmentDate} <br /> {displayData.startTime}{" "}
                    - {displayData.duration}
                  </p>
                </div>

                <div className="rounded-2xl bg-default-100 p-4">
                  <p className="text-default-600">Phòng/Ghế nha</p>
                  <div className=" font-bold mt-1 pl-2 h-11 flex items-center">
                    <ChairSelector
                      value={{
                        label: displayData?.DentalChairBooking?.DentalChairId,
                        value: displayData?.DentalChairBooking?.DentalChairCode,
                        branchId: displayData.branchId,
                        startTime: displayData.startDateFormatted,
                        endTime: displayData.endDateFormatted,
                      }}
                      onChange={(val) => {
                        setConfirmState({
                          isOpen: true,
                          value: val,
                        });
                        setField("Chair");
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xl font-semibold ">Ghi chú</p>
                <div className="mt-2 rounded-2xl bg-default-100 p-4 ">
                  {displayData.note}
                </div>
              </div>

              {error ? (
                <p className="mt-2 text-sm text-danger">{error}</p>
              ) : null}
            </ModalBody>
          </>
        </ModalContent>
      </Modal>

      {/* Modal change data staff confirm */}
      <Modal isOpen={confirmState.isOpen} onOpenChange={handleCancel}>
        <ModalContent>
          <ModalHeader>Xác nhận</ModalHeader>
          <ModalBody>
            {field === "Doctor" && (
              <span className="flex gap-1">
                Bạn có chắc muốn chọn bác sĩ <b>{confirmState.value?.label}</b>
                không?
              </span>
            )}
            {field === "Chair" && (
              <span className="flex gap-1">
                Bạn có chắc muốn chọn ghế <b>{confirmState.value?.label}</b>
                không?
              </span>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleCancel}>
              Hủy
            </Button>
            <Button color="primary" onPress={handleConfirm}>
              Xác nhận
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ApCustomerPreviewPopover;
