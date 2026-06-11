import React, { useEffect, useMemo, useState } from "react";
// import { Navigate, NavigateAction, TitleOptions } from "react-big-calendar";
import { Navigate, NavigateAction } from "react-big-calendar";
import times from "./times";
import dayjs from "@/lib/dayjs";
import { CustomEvent } from "@/types/react-big-calendar";
import isBetween from "dayjs/plugin/isBetween";
import isToday from "dayjs/plugin/isToday";
import ResourceHeader from "./ResourceHeader";
import { isOn } from "@/lib/utils";
import { IconCarretClose, IconCarretOpen } from "@/com/icons/outline";
import { Tooltip } from "@heroui/react";
import { useCookie } from "@/hook/cookie";
import { Appointment, Customer, Doctor } from "@/types/define.d";
import ApOnCalendar from "@/com/ap/ApOnCalendar";

interface DayViewProps {
  date: Date;
  events: CustomEvent[];
  components: {
    event: React.ComponentType<{ event: CustomEvent }>;
    appointment?: React.ComponentType<{
      appointment?: Appointment;
      customer?: Customer;
      doctor?: Doctor;
    }>;
  };
  appointments?: Appointment[];
  customers?: Customer[];
  doctors?: Doctor[];
  loading?: boolean;
  loadingAppointments?: boolean;
  error?: string | null;
  appointmentsError?: string | null;
  selectedDoctorIds?: Set<string>;
  selectedDoctors?: Doctor[];
  onClearFilter?: () => void;
  refetchAppointment?: () => void;
}
dayjs.extend(isBetween);
dayjs.extend(isToday);
const DayView: React.ComponentType<DayViewProps> = ({
  date,
  appointments = [],
  customers = [],
  doctors = [],
  loading = false,
  loadingAppointments = false,
  error = null,
  appointmentsError = null,
  selectedDoctorIds = new Set(),
  selectedDoctors = [],
  refetchAppointment,
}) => {
  const [showEarly, setShowEarly] = useCookie<boolean>("show-early", false);
  // Function chuyển đổi Appointment sang CustomEvent để sử dụng với ApOnCalendar

  const todayAppointments = useMemo(() => {
    const today = dayjs(date).format("YYYY-MM-DD");

    const appointmentsToday = (appointments ?? []).filter((appointment) => {
      const appointmentDate = dayjs(Number(appointment.StartAt) * 1000).format(
        "YYYY-MM-DD",
      );
      return appointmentDate === today;
    });

    if (selectedDoctorIds.size === 0) {
      return appointmentsToday;
    }

    return appointmentsToday.filter((appointment) => {
      // selectedDoctorIds.has(String(appointment.AppointedTo || ""));
      const appointedTo = String(appointment.AppointedTo || "");

      if (selectedDoctorIds.size === 0) return true;

      return (
        selectedDoctorIds.has(appointedTo) ||
        appointedTo === "" ||
        appointedTo === "unassigned"
      );
    });
  }, [appointments, date, selectedDoctorIds]);

  const resources = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();

    map.set("unassigned", { id: "unassigned", name: "Chưa phân công" });

    // Nếu có chọn bác sĩ -> chỉ hiển thị đúng danh sách selectedDoctors
    if (selectedDoctorIds.size > 0 && selectedDoctors.length > 0) {
      selectedDoctors.forEach((doc: any) => {
        const id = String(doc.DoctorId || doc.id);
        if (!id) return;

        map.set(id, {
          id,
          name: doc.FullName || doc.name || `Bác sĩ ${id}`,
        });
      });

      return Array.from(map.values());
    }

    // Nếu chưa chọn bác sĩ -> hiển thị toàn bộ doctor từ appointments
    doctors?.forEach((doc: any) => {
      const id = String(doc.DoctorId || doc.id);
      if (!id || map.has(id)) return;

      map.set(id, {
        id,
        name: doc.FullName || doc.name || `Bác sĩ ${id}`,
      });
    });

    return Array.from(map.values());
  }, [doctors, selectedDoctorIds, selectedDoctors]);

  const minColWidthPx = 120;
  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${resources.length}, minmax(${minColWidthPx}px, 1fr))`,
    }),
    [resources.length],
  );
  if (loading || loadingAppointments) {
    return (
      <div className="overflow-y-auto border-t border-stroke bg-white border-gray-500 dark:border-form-strokedark dark:bg-boxdark rounded-b-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-semibold">Đang tải...</div>
            <div className="text-sm text-gray-500">
              {loading && "Đang tải danh sách khách hàng..."}
              {loadingAppointments && "Đang tải lịch hẹn..."}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error || appointmentsError) {
    return (
      <div className="overflow-y-auto border-t border-stroke bg-white border-gray-500 dark:border-form-strokedark dark:bg-boxdark rounded-b-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              Có lỗi xảy ra
            </div>
            <div className="text-sm text-gray-500">
              {error || appointmentsError}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto border-t border-stroke bg-white border-gray-500 dark:border-form-strokedark dark:bg-boxdark rounded-b-2xl">
      <div className="flex border-b border-gray-500 bg-white dark:border-gray-500">
        <div className="w-16 shrink-0 border-r border-gray-500" />
        <div className="grow overflow-x-auto">
          <div className="grid" style={gridStyle}>
            {resources.map((resource: any, idx: number) => (
              <div
                key={resource.id}
                className={`${
                  idx > 0 ? "border-l border-gray-500 dark:border-gray-500" : ""
                }`}
              >
                {idx === 0 ? (
                  <div className="flex h-full items-center justify-center py-3 px-2 bg-slate-100" />
                ) : (
                  <ResourceHeader
                    label={resource.name || ""}
                    resource={resource}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex">
        <Tooltip content={showEarly ? "Ẩn giờ sớm" : "Hiện giờ sớm"}>
          <button
            onClick={() => setShowEarly(!showEarly)}
            className="bg-gray-50 cursor-pointer transition-all hover:bg-blue-50 text-center w-16 shrink-0 border-r border-b border-gray-500"
          >
            {showEarly ? (
              <IconCarretClose size={20} className="inline-block" />
            ) : (
              <IconCarretOpen size={20} className="inline-block" />
            )}
          </button>
        </Tooltip>
      </div>
      {(showEarly ? times : times.slice(8)).map((el, idx) => (
        <TimeRow
          key={el}
          label={el}
          idx={idx}
          todayAppointments={todayAppointments}
          date={date}
          gridStyle={gridStyle}
          showEarly={showEarly}
          resources={resources}
          customers={customers}
          doctors={doctors}
          refetchAppointment={refetchAppointment}
        />
      ))}
    </div>
  );
};
// const title = (date: Date, options: TitleOptions) => (
const title = (date: Date) => (
  <div className={dayjs(date).isToday() ? "rbc-today pl-3" : ""}>
    <span>{dayjs(date).format("D [tháng] M, YYYY")}</span>
  </div>
);
const navigate = (date: Date, action: NavigateAction) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return dayjs(date).add(-1, "day").toDate();
    case Navigate.NEXT:
      return dayjs(date).add(1, "day").toDate();
    default:
      return date;
  }
};
export default Object.assign(DayView, { title, navigate });

const TimeRow: React.FC<{
  label: string;
  idx: number;
  todayAppointments: Appointment[];
  date: Date;
  gridStyle: React.CSSProperties;
  showEarly?: boolean;
  resources: { id: string; name: string }[];
  customers: Customer[];
  doctors: Doctor[];
  refetchAppointment?: () => void;
}> = ({
  label,
  idx,
  todayAppointments,
  date,
  gridStyle,
  showEarly,
  resources,
  customers,
  doctors,
  refetchAppointment,
}) => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  const baseHour = idx === 0 ? 0 : showEarly ? idx : idx + 8;
  const from = dayjs(date).hour(baseHour).minute(0).second(0);
  const to = from.add(1, "hour");
  const isToday = dayjs(date).isSame(currentTime, "day");

  const appointmentsInSlot =
    todayAppointments?.filter((appointment: Appointment) => {
      const appointmentStart = dayjs(Number(appointment.StartAt) * 1000);
      return appointmentStart.isBetween(from, to, "second", "[)");
    }) || [];

  const position = useMemo(() => {
    if (!isToday) return 0;
    const currentHour = currentTime.hour();
    if (currentHour != baseHour) return 0;
    const minutesIntoSlot =
      (currentHour - baseHour) * 60 + currentTime.minute();
    return Math.abs((minutesIntoSlot / 60) * 100);
  }, [currentTime, baseHour]);

  const isCurrentSlotRow = isToday && currentTime.hour() === baseHour;
  const timeLabel =
    !isOn(label) || isNaN(Number(label))
      ? label
      : `${label} ${Number(label) < 13 ? "am" : "pm"}`;

  const appointmentToEvent = (
    appointment: Appointment,
    customer?: Customer,
    doctor?: Doctor,
  ): CustomEvent => {
    return {
      id: Number(appointment.AppointmentId),
      title:
        doctor?.FullName || appointment.AppointedToName || "Unknown Doctor",
      start: new Date(Number(appointment.StartAt) * 1000),
      end: new Date(Number(appointment.EndAt) * 1000),
      resourceId: appointment.AppointedTo || "unassigned",
      raw: {
        // Thông tin appointment gốc
        ...appointment,
        // Thêm thông tin customer
        CustomerName: customer?.FullName || "Unknown Customer",
        CustomerCode: customer?.CustomerCode || "",
        CustomerPhone: customer?.PhoneNumbers?.[0] || "",
        CustomerGender: customer?.Gender || "",
        CustomerAge: customer?.Age || "",
        CustomerPhoto: customer?.Photo || null,
        CustomerAddress: customer?.Address || "",
        // Thêm thông tin doctor
        AppointedToName: doctor?.FullName || appointment.AppointedToName || "",
        DoctorPhone: doctor?.phone || "",
        DoctorEmail: doctor?.email || "",
        DoctorCode: doctor?.StaffCode || "",
        // Thông tin appointment
        AppointmentStatus: appointment.AppointmentStatus || "Pending",
        AppointmentId: appointment.AppointmentId,
        Note: appointment.Note || "",
        // Thời gian
        StartAt: appointment.StartAt,
        EndAt: appointment.EndAt,
        StartTime: dayjs(Number(appointment.StartAt) * 1000).format("HH:mm"),
        EndTime: dayjs(Number(appointment.EndAt) * 1000).format("HH:mm"),
        // Thông tin chi nhánh
        AtBranchName: appointment.AtBranchName || "",
        AtBranchCode: appointment.AtBranchCode || "",
      },
    };
  };

  /**
   * useEffect
   * ====================================================================
   */

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  /**
   * render view
   * ====================================================================
   */

  return (
    <div className="flex">
      <div className="relative min-h-12 w-16 shrink-0 border-r border-gray-500 px-2 text-right font-medium leading-5 opacity-60">
        <span className={`absolute right-0 pr-1 ${idx == 0 ? "" : "-top-2.5"}`}>
          {timeLabel}
        </span>
      </div>
      <div className="relative grow border-t border-gray-500">
        <div className="grid h-full" style={gridStyle}>
          {resources.map((resource: any, colIdx: number) => {
            const appointmentsForResource = appointmentsInSlot.filter(
              (appointment: Appointment) => {
                const resId = appointment.AppointedTo || "unassigned";
                return resId === resource.id;
              },
            );

            return (
              <div
                key={`${label}-${resource.id}`}
                className={`content-center ${
                  colIdx > 0 ? "border-l border-gray-500" : ""
                } p-1 ${colIdx === 0 ? "bg-slate-50" : ""}`}
              >
                {appointmentsForResource.map((appointment: Appointment) => {
                  // Tìm customer và doctor tương ứng
                  const customer = customers?.find(
                    (c) => c.CustomerId === appointment.CustomerId,
                  );
                  const doctor = doctors?.find(
                    (d) => d.DoctorId === appointment.AppointedTo,
                  );
                  // Convert appointment sang CustomEvent
                  const event = appointmentToEvent(
                    appointment,
                    customer,
                    doctor,
                  );

                  return (
                    <div
                      key={appointment.AppointmentId}
                      className={`${
                        resource.id === "unassigned" ? "filter grayscale" : ""
                      }`}
                    >
                      {/* Sử dụng ApOnCalendar để hiển thị */}
                      <ApOnCalendar
                        event={event}
                        view="day"
                        onRefreshAppointments={() => {
                          refetchAppointment?.();
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        {isCurrentSlotRow && (
          <div
            className="absolute left-0 w-full z-0"
            style={{ top: `${position}%` }}
          >
            <div className="absolute top-1/2 -translate-x-full -translate-y-1/2 text-sm text-white rounded-full bg-danger px-2">
              {currentTime.format("HH:mm")}
            </div>
            <div className="h-[1.5px] w-full bg-danger" />
          </div>
        )}
      </div>
    </div>
  );
};
