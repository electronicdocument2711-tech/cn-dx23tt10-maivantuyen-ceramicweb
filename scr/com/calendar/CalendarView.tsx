"use client";

import ApOnCalendar from "@/com/ap/ApOnCalendar";
import FindCustomerApModal from "@/com/ap/FindCustomerApModal";
import CalendarToolbar from "@/com/calendar/CalendarToolbar";
import DayView from "@/com/calendar/DayView";
import MonthView from "@/com/calendar/MonthView";
import WeekView from "@/com/calendar/WeekView";
import BranchSelector from "@/com/calendar/BranchSelector";
import DoctorSelector from "@/com/calendar/DoctorSelector";
import { DoctorsProvider } from "@/context/DoctorContext";
import { useAppContext } from "@/context/AppContext";
import {
  CalendarStatusIdsByKey,
  CalendarStatusKey,
} from "@/data/appointmentType";
import { useAppointment } from "@/hook/useAppointments";
import { useCookie } from "@/hook/cookie";
import useLocal from "@/hook/useLocal";
import * as dates from "@/lib/dates";
import dayjs from "@/lib/dayjs";
import { Appointment, AppointmentRecord, Doctor } from "@/types/define.d";
import { CustomEvent, CustomViewStatic } from "@/types/react-big-calendar";
import { Button } from "@heroui/react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  dayjsLocalizer,
  EventProps,
  NavigateAction,
  Navigate as NavigateBigCalendar,
  View,
  Views,
} from "react-big-calendar";
import { LOCAL_KEY } from "@/const/global";

const localizer = dayjsLocalizer(dayjs);
const EMPTY_STATUS_COUNTS: Record<CalendarStatusKey, number> = {
  all: 0,
  arrived: 0,
  pending: 0,
  cancelled: 0,
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStatusItems = (summary: any): any[] => {
  if (Array.isArray(summary)) return summary;
  if (Array.isArray(summary?.data)) return summary.data;
  if (Array.isArray(summary?.items)) return summary.items;
  if (Array.isArray(summary?.views?.[0]?.data)) return summary.views[0].data;
  return [];
};

const createCalendarView = (
  Component: any,
  showModalCreatePost: (calendarView: string, dateTime: string) => void,
  doctors: Doctor[],
  customers: any[],
  appointments: Appointment[],
  selectedDoctorIds: Set<string>,
  selectedDoctors: Doctor[],
  onClearFilter: () => void,
  refetchAppointment: () => void,
): React.ComponentType<any> & CustomViewStatic =>
  Object.assign(
    (props: any) => (
      <Component
        {...props}
        showModalCreatePost={showModalCreatePost}
        doctors={doctors}
        customers={customers}
        appointments={appointments}
        loading={false}
        loadingAppointments={false}
        error={null}
        appointmentsError={null}
        selectedDoctorIds={selectedDoctorIds}
        selectedDoctors={selectedDoctors}
        onClearFilter={onClearFilter}
        refetchAppointment={refetchAppointment}
      />
    ),
    {
      title: Component.title,
      navigate: Component.navigate,
    },
  );

const getViews = (
  showModalCreatePost: (calendarView: string, dateTime: string) => void,
  doctors: Doctor[],
  customers: any[],
  appointments: Appointment[],
  selectedDoctorIds: Set<string>,
  selectedDoctors: Doctor[],
  onClearFilter: () => void,
  refetchAppointment: () => void,
): Record<string, React.ComponentType<any> & CustomViewStatic> => ({
  month: createCalendarView(
    MonthView,
    showModalCreatePost,
    doctors,
    customers,
    appointments,
    selectedDoctorIds,
    selectedDoctors,
    onClearFilter,
    refetchAppointment,
  ),
  week: createCalendarView(
    WeekView,
    showModalCreatePost,
    doctors,
    customers,
    appointments,
    selectedDoctorIds,
    selectedDoctors,
    onClearFilter,
    refetchAppointment,
  ),
  day: createCalendarView(
    DayView,
    showModalCreatePost,
    doctors,
    customers,
    appointments,
    selectedDoctorIds,
    selectedDoctors,
    onClearFilter,
    refetchAppointment,
  ),
});

const PagePublishCalendar = React.memo(() => {
  // ** STATE **
  const [view, setView, isViewLoaded] = useCookie<View>(
    "schedule-calendar-view",
    "day",
  );
  const [date, setDate] = useState<Date>(new Date());

  const { branches } = useAppContext();

  const [selectedBranchIds, setSelectedBranchIds] = useLocal<string[]>(
    LOCAL_KEY.SELECTED_BRANCHES,
    [],
  );
  const [isBranchSelectorOpen, setBranchSelectorOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<CalendarStatusKey>("all");
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<Set<string>>(
    new Set(),
  );

  const { staffs: st } = useAppContext();

  const selectedDoctors = useMemo(() => {
    return st.filter((staff) => selectedDoctorIds.has(String(staff?.id)));
  }, [st, selectedDoctorIds]);

  const activeView = view ?? Views.DAY;
  const isMonthView = activeView === Views.MONTH;

  const apiView =
    activeView === Views.DAY
      ? "date"
      : activeView === Views.WEEK
        ? "week"
        : "month";
  const apiDate = useMemo(() => dayjs(date).format("YYYY-MM-DD"), [date]);

  // For month view: branch is required. For day/week: optional (empty = all).
  const isMonthBranchRequired =
    isMonthView && branches.length > 1 && selectedBranchIds.length === 0;

  useEffect(() => {
    if (!isMonthView) return;

    // Auto-select the only branch if there's just one
    if (branches.length === 1 && selectedBranchIds.length === 0) {
      setSelectedBranchIds([String(branches[0].BranchId)]);
      return;
    }

    // Auto-open selector when month view needs a branch but none is selected
    if (isMonthBranchRequired) {
      setBranchSelectorOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMonthView, branches.length, isMonthBranchRequired]);

  const selectedStatusIds = useMemo(
    () => CalendarStatusIdsByKey[selectedStatus],
    [selectedStatus],
  );

  // Determine which branch IDs to pass to the API
  const apiBranchIds = useMemo(() => {
    if (isMonthView) return selectedBranchIds.slice(0, 1);
    return selectedBranchIds;
  }, [isMonthView, selectedBranchIds]);

  // Day/week: always fetch (empty branches = all). Month: only when a branch is selected.
  const isEnabled = isViewLoaded && (!isMonthView || apiBranchIds.length > 0);

  // ** HOOK **
  const {
    appointments,
    summary,
    isLoading: loadingApointment,
    refresh: refetchAppointment,
  } = useAppointment({
    view: apiView,
    date: apiDate,
    statuses: selectedStatusIds,
    doctors: Array.from(selectedDoctorIds),
    branches: apiBranchIds,
    enabled: isEnabled,
  });

  const summaryCounts = useMemo<Record<CalendarStatusKey, number>>(() => {
   
    if (!summary) return EMPTY_STATUS_COUNTS;

    const directSummary = summary as Record<string, unknown>;
    const hasDirectSummaryKeys =
      typeof directSummary === "object" &&
      directSummary !== null &&
      !Array.isArray(directSummary) &&
      ("ALL" in directSummary ||
        "Arrived" in directSummary ||
        "Waiting" in directSummary ||
        "Cancelled" in directSummary);

    if (hasDirectSummaryKeys) {
      const all = toNumber(directSummary.all ?? directSummary.ALL);
      const arrived = toNumber(directSummary.arrived ?? directSummary.Arrived);
      const pending = toNumber(directSummary.pending ?? directSummary.Waiting);
      const cancelled = toNumber(
        directSummary.cancelled ?? directSummary.Cancelled,
      );

      return {
        all: all || arrived + pending + cancelled,
        arrived,
        pending,
        cancelled,
      };
    }

    const pendingIds = new Set(CalendarStatusIdsByKey.pending.map(Number));
    const cancelledIds = new Set(CalendarStatusIdsByKey.cancelled.map(Number));
    const items = toStatusItems(summary);

    if (!items.length) return EMPTY_STATUS_COUNTS;

    const counts = { ...EMPTY_STATUS_COUNTS };

    items.forEach((item) => {
      const count = toNumber(
        item?.Total ??
          item?.total ??
          item?.Count ??
          item?.count ??
          item?.Amount ??
          item?.amount ??
          item?.Value ??
          item?.value,
      );

      if (count <= 0) return;

      const statusId = toNumber(
        item?.AppointmentStatusId ??
          item?.StatusId ??
          item?.statusId ??
          item?.Id ??
          item?.id,
      );

      if (statusId > 0) {
        if (pendingIds.has(statusId)) {
          counts.pending += count;
        } else if (cancelledIds.has(statusId)) {
          counts.cancelled += count;
        } else {
          counts.arrived += count;
        }
        counts.all += count;
        return;
      }

      const statusName = String(
        item?.Label ??
          item?.Name ??
          item?.AppointmentStatusName ??
          item?.status ??
          "",
      )
        .trim()
        .toLowerCase();

      if (!statusName) return;

      if (statusName.includes("chưa đến")) {
        counts.pending += count;
      } else if (
        statusName.includes("hủy") ||
        statusName.includes("huỷ") ||
        statusName.includes("cancel")
      ) {
        counts.cancelled += count;
      } else {
        counts.arrived += count;
      }

      counts.all += count;
    });

    return counts;
  }, [summary]);

  // ** FUNCTION **

  const toggleDoctor = (id: string) => {
    setSelectedDoctorIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectStatus = useCallback((statusKey: CalendarStatusKey) => {
    setSelectedStatus(statusKey);
  }, []);

  const { defaultDate, max } = useMemo(
    () => ({
      defaultDate: new Date(),
      max: dates.add(dates.endOf(new Date(2024, 12, 18), "day"), -1, "hours"),
    }),
    [],
  );

  const appointmentItems = useMemo<Appointment[]>(() => {
    if (!Array.isArray(appointments) || appointments.length === 0) return [];

    const toUnixSeconds = (value: any) => {
      if (value === null || value === undefined || value === "") return "";

      const numeric = Number(value);
      if (Number.isFinite(numeric) && numeric > 0) {
        if (numeric > 1_000_000_000_000)
          return String(Math.floor(numeric / 1000));
        if (numeric > 1_000_000_000) return String(Math.floor(numeric));
      }

      const parsed = dayjs(value);
      if (parsed.isValid()) return String(parsed.unix());

      return "";
    };

    const normalizedItems = appointments.flatMap((slot) => {
      const slotRecord = slot as AppointmentRecord;
      if (Array.isArray(slotRecord?.Data)) {
        return (slotRecord.Data as any[]).map((item) => ({
          ...item,
          CustomerId: String(item?.CustomerId || item?.Customer?.Id || ""),
          AppointedTo: String(item?.AppointedTo || item?.doctor?.id || ""),
          AtBranchId: String(item?.AtBranchId || item?.BranchId || ""),
          AppointedToName: item?.AppointedToName || item?.doctor?.name || "--",
          StartAt: toUnixSeconds(item?.StartAt),
          EndAt: toUnixSeconds(item?.EndAt),
        })) as Appointment[];
      }

      const item = slot as any;
      return [
        {
          ...item,
          CustomerId: String(item?.CustomerId || item?.Customer?.Id || ""),
          AppointedTo: String(item?.AppointedTo || item?.doctor?.id || ""),
          AtBranchId: String(item?.AtBranchId || item?.BranchId || ""),
          AppointedToName: item?.AppointedToName || item?.doctor?.name || "--",
          StartAt: toUnixSeconds(item?.StartAt),
          EndAt: toUnixSeconds(item?.EndAt),
        } as Appointment,
      ];
    });

    return normalizedItems;
  }, [appointments]);

  const events = useMemo<CustomEvent[]>(() => {
    if (appointmentItems.length === 0) return [];

    const baseEvents = appointmentItems.map(
      (item: Appointment, index: number) => {
        const startUnix = Number(item.StartAt || 0);
        const endUnix = Number(item.EndAt || 0);

        const start =
          Number.isFinite(startUnix) && startUnix > 0
            ? dayjs.unix(startUnix)
            : dayjs(apiDate);
        const end =
          Number.isFinite(endUnix) && endUnix > 0
            ? dayjs.unix(endUnix)
            : start.add(45, "minute");

        return {
          id:
            Number(item.AppointmentId) ||
            `${item.AppointmentId || "ap"}-${index}`,
          title: item.AppointedToName || "Lịch hẹn",
          start: start.toDate(),
          end: end.toDate(),
          resourceId: item.AppointedTo || item.StaffId || "",
          raw: item,
        } as CustomEvent;
      },
    );

    if (selectedDoctorIds.size === 0) {
      return baseEvents;
    }

    return baseEvents;
  }, [apiDate, appointmentItems, selectedDoctorIds]);
  const doctorsFromAppointments = useMemo<Doctor[]>(() => {
    const doctorMap = new Map<string, Doctor>();

    appointmentItems.forEach((item: any) => {
      const doctorId = String(
        item?.doctor?.id || item?.AppointedTo || item?.DoctorId || "",
      );

      if (!doctorId || doctorMap.has(doctorId)) return;

      doctorMap.set(doctorId, {
        DoctorId: doctorId,
        StaffId: String(item?.StaffId || item?.doctor?.id || ""),
        FullName:
          item?.doctor?.name || item?.AppointedToName || `Bác sĩ ${doctorId}`,
      });
    });

    return Array.from(doctorMap.values());
  }, [appointmentItems]);

  const customersFromAppointments = useMemo(() => {
    const customerMap = new Map<string, any>();

    appointmentItems.forEach((item: any) => {
      const customerId = String(item?.CustomerId || item?.Customer?.Id || "");
      if (!customerId || customerMap.has(customerId)) return;

      customerMap.set(customerId, {
        CustomerId: customerId,
        FullName: item?.Customer?.Name || item?.CustomerName || "",
        CustomerCode: customerId,
        PhoneNumbers: item?.Customer?.Phone ? [item.Customer.Phone] : [],
      });
    });

    return Array.from(customerMap.values());
  }, [appointmentItems]);

  const clearDoctorFilter = useCallback(() => {
    setSelectedDoctorIds(new Set());
  }, []);

  const views = useMemo(
    () =>
      getViews(
        () => {},
        doctorsFromAppointments,
        customersFromAppointments,
        appointmentItems,
        selectedDoctorIds,
        selectedDoctors as any,
        clearDoctorFilter,
        refetchAppointment,
      ),
    [
      appointmentItems,
      clearDoctorFilter,
      customersFromAppointments,
      doctorsFromAppointments,
      selectedDoctorIds,
      selectedDoctors,
      refetchAppointment,
    ],
  );

  const onViewChange = useCallback(
    (nextView: View) => {
      setView(nextView);
    },
    [setView],
  );

  const onDateChange = useCallback((nextDate: Date) => {
    setDate(nextDate);
  }, []);

  const titleFor = useCallback(
    (calendarView: View, currentDate: Date) =>
      views?.[calendarView as any]?.title(currentDate, {
        length: 10,
        localizer,
      }) || "",
    [views],
  );

  const navigateDate = useCallback(
    (calendarView: View, currentDate: Date, action: NavigateAction) =>
      views?.[calendarView as any]?.navigate(currentDate, action, {
        length: 31,
        localizer,
      }) || currentDate,
    [views],
  );

  const handleToolbarNavigate = useCallback(
    (navigate: NavigateAction, newDate?: Date) => {
      if (navigate === "TODAY") {
        onDateChange(new Date());
        return;
      }

      if (navigate === "DATE") {
        onDateChange(newDate as Date);
        return;
      }

      const nextDate = views?.[view as any]?.navigate(date, navigate, {
        length: 31,
        localizer,
      });

      onDateChange(nextDate || date);
    },
    [date, onDateChange, view, views],
  );

  const handleSelectPreviousDate = useCallback(() => {
    onDateChange(navigateDate(activeView, date, NavigateBigCalendar.PREVIOUS));
  }, [activeView, date, navigateDate, onDateChange]);

  const handleSelectNextDate = useCallback(() => {
    onDateChange(navigateDate(activeView, date, NavigateBigCalendar.NEXT));
  }, [activeView, date, navigateDate, onDateChange]);

  const handleSelectToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  const calendarLabel = useMemo(
    () => titleFor(activeView, date),
    [activeView, date, titleFor],
  );

  const handleSuccess = () => {};

  return (
    <div className="flex overflow-hidden mx-auto">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold">Lịch hẹn</h1>
          <FindCustomerApModal
            onSuccess={handleSuccess}
            onRefreshAppointments={() => {
              refetchAppointment();
            }}
          />
        </div>

        <CalendarToolbar
          loading={loadingApointment}
          onNavigate={handleToolbarNavigate}
          onView={onViewChange}
          view={activeView}
          label={calendarLabel}
          selectedStatus={selectedStatus}
          onSelectStatus={selectStatus}
          summaryCounts={summaryCounts}
        />

        <div className="bg-white rounded-2xl mt-5 border border-gray-500">
          <div className="flex items-center justify-between gap-3 p-3">
            {/* SORT TIME */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                isIconOnly
                onPress={handleSelectPreviousDate}
                className="rounded-xl"
                variant="bordered"
              >
                <IconChevronLeft />
              </Button>

              <div className="text-center shrink-0">
                <span className="block truncate text-xl font-bold">
                  {calendarLabel}
                </span>
              </div>

              <Button
                size="sm"
                isIconOnly
                onPress={handleSelectNextDate}
                className="rounded-xl"
                variant="bordered"
              >
                <IconChevronRight />
              </Button>

              <Button
                variant="bordered"
                onPress={handleSelectToday}
                size="sm"
                className="rounded-xl font-medium text-base"
              >
                Hôm nay
              </Button>
            </div>
            {/* SORT BRANCH AND DOCTOR */}
            <div className="flex items-center gap-3">
              <BranchSelector
                branches={branches}
                selectedBranchIds={
                  isMonthView
                    ? selectedBranchIds.slice(0, 1)
                    : selectedBranchIds
                }
                onChange={(ids) => {
                  if (isMonthView) {
                    setSelectedBranchIds(ids.slice(0, 1));
                  } else {
                    setSelectedBranchIds(ids);
                  }
                }}
                mode={isMonthView ? "single" : "multi"}
                isOpen={isBranchSelectorOpen}
                onOpenChange={setBranchSelectorOpen}
              />
              <DoctorSelector
                selectedDoctorIds={selectedDoctorIds}
                toggleDoctor={toggleDoctor}
              />
            </div>
          </div>
          {isMonthBranchRequired ? (
            <div className="p-10 text-center text-default-600 border-t border-gray-500">
              Vui lòng chọn chi nhánh trong mục &quot;Xem theo chi nhánh&quot;
              để xem lịch hẹn theo tháng.
            </div>
          ) : null}
          {/* APPOINTMENTS */}
          {!isMonthBranchRequired ? (
            <DoctorsProvider doctors={doctorsFromAppointments}>
              <Calendar
                className="flex w-full min-w-240 flex-1 flex-col overflow-hidden"
                defaultDate={defaultDate}
                components={{
                  event: (props: EventProps<CustomEvent>) => {
                    return (
                      <ApOnCalendar
                        event={props.event}
                        view={activeView}
                        onRefreshAppointments={() => {
                          refetchAppointment();
                        }}
                      />
                    );
                  },
                }}
                localizer={localizer}
                events={events as any}
                view={view}
                date={date}
                defaultView={Views.MONTH}
                labels={[]}
                timetables={[]}
                onDeleteNote={() => {}}
                max={max}
                length={31}
                views={views}
                onView={onViewChange}
                onNavigate={onDateChange}
                onStoryClick={() => {}}
                toolbar={false}
              />
            </DoctorsProvider>
          ) : null}
        </div>
      </div>
    </div>
  );
});

PagePublishCalendar.displayName = "PagePublishCalendar";

export default PagePublishCalendar;
