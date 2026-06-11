import ApOnCalendar from "@/com/ap/ApOnCalendar";
import { IconCarretClose, IconCarretOpen } from "@/com/icons/outline";
import { useCookie } from "@/hook/cookie";
import dayjs from "@/lib/dayjs";
import { isOn } from "@/lib/utils";
import { Appointment, Customer, Doctor } from "@/types/define.d";
import { CustomEvent } from "@/types/react-big-calendar";
import { Tooltip } from "@heroui/react";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isToday from "dayjs/plugin/isToday";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  NavigateAction,
  Navigate as NavigateBigCalendar,
} from "react-big-calendar";
import times from "./times";
import { WEEKDAY_VN } from "./type";

dayjs.extend(isBetween);
dayjs.extend(isToday);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrAfter);

const dates = [...Array(7).keys()].map((i) => i);

export interface WeekViewProps {
  date: Date;
  events: CustomEvent[];
  components: any;
  onView?: (view: string) => void;
  onNavigate?: (action: string, date: Date) => void;
  showModalCreatePost?: (calendarView: string, dateTime: string) => void;
  appointments?: Appointment[];
  customers?: Customer[];
  doctors?: Doctor[];
  loading?: boolean;
  loadingAppointments?: boolean;
  error?: string | null;
  appointmentsError?: string | null;
  selectedDoctorIds?: Set<string>;
  onClearFilter?: () => void;
  refetchAppointment?: () => void;
}

const WeekView: React.ComponentType<WeekViewProps> = ({
  date,
  components,
  onView,
  onNavigate,
  appointments = [],
  customers = [],
  doctors = [],
  loading = false,
  loadingAppointments = false,
  error = null,
  appointmentsError = null,
  selectedDoctorIds = new Set(),
  refetchAppointment,
}) => {
  const [showEarly, setShowEarly] = useCookie<boolean>("show-early", false);

  if (loading || loadingAppointments) {
    return (
      <div className="group flex flex-col overflow-hidden border-gray-500 bg-white dark:border-gray-500 dark:bg-boxdark rounded-b-2xl">
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
      <div className="group flex flex-col overflow-hidden border-gray-500 bg-white dark:border-gray-500 dark:bg-boxdark rounded-b-2xl">
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
    <div className="group flex flex-col overflow-hidden border-gray-500 bg-white dark:border-gray-500 dark:bg-boxdark rounded-b-2xl">
      <div className="flex border-y border-gray-500 dark:border-gray-500 items-center bg-gray-000">
        <div className="w-16 shrink-0" />
        <div className="grid grow grid-cols-7">
          {dates.map((el) => {
            const dObj = dayjs(date).weekday(el);
            const isTodayCol = dObj.isToday();
            return (
              <div
                className={`col-span-1 border-l border-gray-400 text-center bg-slate-100 font-medium dark:border-gray-500`}
                key={el}
              >
                <button
                  type="button"
                  className={`w-full p-1 ${
                    isTodayCol ? "text-header-foreground" : "text-gray-700"
                  }`}
                  onClick={() => {
                    onNavigate?.(NavigateBigCalendar.DATE, dObj.toDate());
                    onView?.("day");
                  }}
                >
                  <span>{WEEKDAY_VN[dObj.day()]}</span>{" "}
                  <span
                    className={
                      isTodayCol
                        ? "inline-flex items-center justify-center text-sm px-1.5 rounded-full bg-red-500 text-white font-bold"
                        : ""
                    }
                  >
                    {dObj.format("D")}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex">
        <Tooltip content={showEarly ? "Ẩn giờ sớm" : "Hiện giờ sớm"}>
          <button
            onClick={() => setShowEarly(!showEarly)}
            className="bg-gray-50 cursor-pointer transition-all hover:bg-blue-50 text-center w-16 shrink-0"
          >
            {showEarly ? (
              <IconCarretClose size={20} className="inline-block" />
            ) : (
              <IconCarretOpen size={20} className="inline-block" />
            )}
          </button>
        </Tooltip>
        <div className="border-l border-gray-500"></div>
      </div>
      {(showEarly ? times : times.slice(8)).map((label, idx) => (
        <TimeRow
          key={`time-row-${idx}`}
          label={label}
          idx={idx}
          date={date}
          showEarly={showEarly}
          selectedDoctorIds={selectedDoctorIds}
          appointments={appointments}
          doctors={doctors}
          customers={customers}
          refetchAppointment={refetchAppointment}
          components={components}
        />
      ))}
    </div>
  );
};

const title = (date: Date) => {
  const day = dayjs(date);
  return (
    <div>
      Tuần {day.week()} , {day.weekday(0).format("YYYY")}
    </div>
  );
};

const navigate = (date: Date, action: NavigateAction) => {
  switch (action) {
    case NavigateBigCalendar.PREVIOUS:
      return dayjs(date).add(-1, "week").toDate();
    case NavigateBigCalendar.NEXT:
      return dayjs(date).add(1, "week").toDate();
    default:
      return date;
  }
};

export default Object.assign(WeekView, { title, navigate });

interface TimeRowProps {
  label: string;
  idx: number;
  showEarly?: boolean;
  date: Date;
  selectedDoctorIds: Set<string>;
  appointments: Appointment[];
  doctors: Doctor[];
  customers: Customer[];
  refetchAppointment?: () => void;
  components: any;
}

const TimeRow: React.FC<TimeRowProps> = ({
  label,
  idx,
  showEarly,
  date,
  selectedDoctorIds,
  appointments,
  doctors,
  customers,
  refetchAppointment,
  components,
}) => {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const baseHour = idx === 0 ? 0 : showEarly ? idx : idx + 8;
  const isThisWeek = useMemo(
    () => dayjs(date).isSame(currentTime, "week"),
    [date, currentTime],
  );
  const isCurrentSlotRow = isThisWeek && currentTime.hour() === baseHour;

  const position = useMemo(() => {
    const currentHour = currentTime.hour();
    if (currentHour != baseHour) return 0;
    const minutesIntoSlot =
      (currentHour - baseHour) * 60 + currentTime.minute();
    return Math.abs((minutesIntoSlot / 60) * 100);
  }, [currentTime, baseHour]);

  const timeLabel =
    !isOn(label) || isNaN(Number(label))
      ? label
      : `${label} ${Number(label) < 13 ? "am" : "pm"}`;

  // Filter appointments theo tuần
  const weekAppointments = useMemo(() => {
    const weekStart = dayjs(date).startOf("week");
    const weekEnd = dayjs(date).endOf("week");

    const appointmentsInWeek = (appointments ?? []).filter((appointment) => {
      const appointmentDate = dayjs(Number(appointment.StartAt) * 1000);
      return appointmentDate.isBetween(weekStart, weekEnd, "day", "[]");
    });

    if (selectedDoctorIds.size === 0) {
      // Không chọn doctor nào → hiển thị tất cả
      return appointmentsInWeek;
    }
    return appointmentsInWeek;
  }, [appointments, date, selectedDoctorIds]);

  /**
   * function
   * ====================================================================
   */

  // Filter appointments cho day slot
  const filterAppointmentsForDaySlot = useCallback(
    (dayIndex: number, baseHour: number) => {
      const dayStart = dayjs(date)
        .weekday(dayIndex)
        .hour(baseHour)
        .minute(0)
        .second(0);
      const dayEnd = dayStart.add(1, "hour");

      return weekAppointments.filter((appointment: Appointment) => {
        const appointmentStart = dayjs(Number(appointment.StartAt) * 1000);
        return appointmentStart.isBetween(dayStart, dayEnd, "second", "[)");
      });
    },
    [date, weekAppointments],
  );

  // Function chuyển đổi Appointment sang CustomEvent
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
        ...appointment,
        CustomerName: customer?.FullName || "Unknown Customer",
        CustomerCode: customer?.CustomerCode || "",
        CustomerPhone: customer?.PhoneNumbers?.[0] || "",
        CustomerGender: customer?.Gender || "",
        CustomerAge: customer?.Age || "",
        CustomerPhoto: customer?.Photo || null,
        CustomerAddress: customer?.Address || "",
        AppointedToName: doctor?.FullName || appointment.AppointedToName || "",
        DoctorPhone: doctor?.phone || "",
        DoctorEmail: doctor?.email || "",
        DoctorCode: doctor?.StaffCode || "",
        AppointmentStatus: appointment.AppointmentStatus || "Pending",
        AppointmentId: appointment.AppointmentId,
        Note: appointment.Note || "",
        StartAt: appointment.StartAt,
        EndAt: appointment.EndAt,
        StartTime: dayjs(Number(appointment.StartAt) * 1000).format("HH:mm"),
        EndTime: dayjs(Number(appointment.EndAt) * 1000).format("HH:mm"),
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
    <div className="flex" key={`time-${idx}-${label}`}>
      <div className="relative min-h-12 w-16 shrink-0 px-2 text-right font-medium leading-5 opacity-60">
        <span
          className={`absolute left-0 right-0 pr-1 ${
            idx == 0 ? "border-t border-t-gray-500" : "-top-2.5"
          }`}
        >
          {timeLabel}
        </span>
      </div>
      <div
        className="relative grid grow grid-cols-7 border-t border-gray-500 dark:border-gray-500"
        style={{ gridTemplateColumns: `repeat(7, minmax(120px, 1fr))` }}
      >
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
        {dates.map((d) => {
          const appointmentsForDay = filterAppointmentsForDaySlot(d, baseHour);

          return (
            <div
              key={`col-${idx}-${d}`}
              className={`min-h-16 p-1 border-l border-gray-500 dark:border-gray-500`}
            >
              {appointmentsForDay.map((appointment: Appointment) => {
                const customer = customers?.find(
                  (c) => c.CustomerId === appointment.CustomerId,
                );
                const doctor = doctors?.find(
                  (d) => d.DoctorId === appointment.AppointedTo,
                );

                const event = appointmentToEvent(appointment, customer, doctor);

                return (
                  <div key={appointment.AppointmentId}>
                    {components.event ? (
                      components.event({ event })
                    ) : (
                      <ApOnCalendar
                        event={event}
                        view="week"
                        onRefreshAppointments={() => {
                          refetchAppointment?.();
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
