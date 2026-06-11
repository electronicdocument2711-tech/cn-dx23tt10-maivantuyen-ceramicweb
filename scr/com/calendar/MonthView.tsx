import { groupBy, isOn } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import { Navigate, NavigateAction } from "react-big-calendar";

import ApOnCalendar from "@/com/ap/ApOnCalendar";
import dayjs from "@/lib/dayjs";
import { Appointment, Customer, Doctor } from "@/types/define.d";
import { CustomEvent } from "@/types/react-big-calendar";
import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import clsx from "clsx";
import "dayjs/locale/vi";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isToday from "dayjs/plugin/isToday";

dayjs.extend(isBetween);
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);
dayjs.locale("vi");

export interface MonthGroupEvent extends CustomEvent {
  date: string;
}

export interface MonthViewProps {
  date: Date;
  events: CustomEvent[];
  components: any;
  onNavigate?: (action: string, date: Date) => void;
  onView?: (view: string) => void;
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

const MonthView: React.ComponentType<MonthViewProps> = ({
  date,
  components,
  onNavigate,
  onView,
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

  // Filter appointments theo tháng
  const monthAppointments = useMemo(() => {
    const monthStart = dayjs(date).startOf("month");
    const monthEnd = dayjs(date).endOf("month");

    const inMonth = (appointments ?? []).filter((appointment) => {
      const appointmentDate = dayjs(Number(appointment.StartAt) * 1000);
      return appointmentDate.isBetween(monthStart, monthEnd, "day", "[]");
    });

    return inMonth;
  }, [appointments, date, selectedDoctorIds]);

  // Convert appointments thành events và group theo ngày
  const groupEvents = useMemo<Record<string, MonthGroupEvent[]>>(() => {
    if (monthAppointments.length === 0) return {};

    const eventsFromAppointments = monthAppointments.map((appointment) => {
      const customer = customers?.find(
        (c) => c.CustomerId === appointment.CustomerId,
      );
      const doctor = doctors?.find(
        (d) => d.DoctorId === appointment.AppointedTo,
      );

      const event = appointmentToEvent(appointment, customer, doctor);

      return {
        ...event,
        date: dayjs(event.start).format("L"),
      };
    });

    const sortedEvents = eventsFromAppointments.sort(
      (a: any, b: any) =>
        new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    const grouped = groupBy(sortedEvents, "date");

    Object.keys(grouped).forEach((date) => {
      grouped[date] = grouped[date].sort(
        (a: any, b: any) =>
          new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
    });

    return grouped;
  }, [monthAppointments, customers, doctors]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDateEvents, setSelectedDateEvents] = useState<
    MonthGroupEvent[]
  >([]);

  const handleViewMore = (eventsForDate: MonthGroupEvent[]) => {
    setSelectedDateEvents(eventsForDate);

    onOpen();
  };

  const [showAllEvents, setShowAllEvents] = useState(false);

  const handleEventClick = (event: CustomEvent) => {
    onNavigate?.(Navigate.DATE, event.start);
    onView?.("day");
    onClose();
  };

  const { dates, firstDateOfMonth, lastDateOfMonth } = useMemo(() => {
    const day = dayjs(date);
    const firstDateOfMonth = day.startOf("month");
    const lastDateOfMonth = day.endOf("month");
    const dates: dayjs.Dayjs[] = [];

    const last = day.endOf("month").endOf("week");
    let current = day.startOf("month").startOf("week");
    while (!current.isAfter(last)) {
      dates.push(current);
      current = current.add(1, "day");
    }

    return { dates, firstDateOfMonth, lastDateOfMonth };
  }, [date]);

  const goToDate = (d: dayjs.Dayjs) => {
    onNavigate?.(Navigate.DATE, d.toDate());
    onView?.("day");
  };

  if (loading || loadingAppointments) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
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
      <div className="flex flex-1 flex-col overflow-hidden">
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
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="grid grid-cols-7 h-11 bg-slate-100">
        {isOn(dates) &&
          ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "Chủ nhật"].map(
            (label, i) => (
              <div
                className="col-span-1 shrink-0 flex items-center justify-center text-center font-medium text-gray-600 border-b border-t border-gray-500 bg-gray-000"
                key={i}
              >
                {label}
              </div>
            ),
          )}
      </div>

      <div className="flex-1 overflow-y-auto border-gray-500">
        {isOn(dates) &&
          [...Array(dates.length / 7).keys()].map((i) => {
            const key = `week-${i}-${dates[i * 7].format("YYYY-MM-DD")}`;

            return (
              <div
                className={clsx(
                  "grid min-h-35 grid-cols-7 border-t border-gray-500",
                  i === 0 && "border-t-0",
                )}
                key={key}
              >
                {[...dates.slice(i * 7, i * 7 + 7)].map((d, idx) => {
                  const label = d.format("D");
                  const inMonth = d.isBetween(
                    firstDateOfMonth,
                    lastDateOfMonth,
                    "day",
                    "[]",
                  );

                  const key = d.format("L");

                  const cellKey = `${key}-${idx}-${d.format("L")}`;

                  return (
                    <div
                      className={`group col-span-1 shrink-0 pb-0 text-sm text-gray-600  min-h-50 ${
                        inMonth ? "" : "bg-slate-50 text-gray-400"
                      } ${idx < 6 ? "border-r border-gray-500" : ""}`}
                      key={cellKey}
                    >
                      <div
                        className={`flex w-full items-start justify-end ${
                          d.isToday() ? "px-1 py-0.5" : "p-1"
                        }`}
                      >
                        <button
                          className="flex justify-end gap-1 px-1 leading-5"
                          onClick={() => goToDate(d)}
                          type="button"
                        >
                          <span
                            className={
                              d.isToday()
                                ? "flex h-6 w-6 justify-center rounded-lg bg-red-400 leading-6 text-white"
                                : ""
                            }
                          >
                            {label}
                          </span>
                          {label === "1" ? d.format("MMM") : ""}
                        </button>
                      </div>

                      <div className="px-2 mt-2">
                        {isOn(groupEvents[key]) &&
                          groupEvents[key].slice(0, 2).map((e, jdx) => {
                            const eventKey = `${key}-${jdx}-${e.id}`;

                            return (
                              <div key={eventKey} className="mb-2">
                                {components.event ? (
                                  components.event({ event: e })
                                ) : (
                                  <ApOnCalendar
                                    event={e}
                                    view="month"
                                    onRefreshAppointments={() => {
                                      refetchAppointment?.();
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })}

                        {isOn(groupEvents[key]) &&
                          groupEvents[key].length > 2 && (
                            <Button
                              variant="bordered"
                              onPress={() => handleViewMore(groupEvents[key])}
                              className="w-full mb-2 font-semibold"
                            >
                              Xem thêm{" "}
                              <span className="text-gray-600">
                                {groupEvents[key].length - 2}
                              </span>
                            </Button>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>

      <Modal
        backdrop="transparent"
        shadow="none"
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        className="shadow max-w-xs"
        classNames={{
          base: "bg-white",
          header: "p-0",
          closeButton:
            "w-8 h-8 text-6xl rounded-full bg-gray-300 flex items-center mt-1 mr-2",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="px-3">
                <ul className="space-y-2">
                  {(showAllEvents
                    ? selectedDateEvents.slice(2)
                    : selectedDateEvents.slice(2, 9)
                  ).map((event) => (
                    <li key={event.id} onClick={() => handleEventClick(event)}>
                      {components.event ? (
                        components.event({ event })
                      ) : (
                        <ApOnCalendar
                          event={event}
                          view="month"
                          onRefreshAppointments={() => {
                            refetchAppointment?.();
                          }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </ModalBody>

              <ModalFooter className="flex-col p-0">
                {!showAllEvents && selectedDateEvents.length > 9 && (
                  <Link
                    href="#"
                    underline="always"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAllEvents(true);
                    }}
                    className="decoration-dotted ml-4"
                  >
                    Còn {selectedDateEvents.length - 9} lịch hẹn khác
                  </Link>
                )}

                <Button
                  color="primary"
                  onPress={() => {
                    if (selectedDateEvents.length > 0) {
                      onNavigate?.(Navigate.DATE, selectedDateEvents[0].start);
                    }
                    onView?.("day");
                    onClose();
                  }}
                  className="m-3 font-semibold"
                >
                  Xem tất cả lịch trong ngày
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

const title = (date: Date) => dayjs(date).locale("vi").format("MMMM YYYY");

const navigate = (date: Date, action: NavigateAction) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return dayjs(date).add(-1, "month").toDate();
    case Navigate.NEXT:
      return dayjs(date).add(1, "month").toDate();
    default:
      return date;
  }
};

export default Object.assign(MonthView, { title, navigate });
