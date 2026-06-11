"use client";
import { AppointmentRecord } from "@/types/define.d";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import rest from "../lib/rest";

type AppointmentView = "date" | "week" | "month";
const BATCH_SIZE = 3; // số trang sẽ fetch đồng thời khi cần fetch nhiều trang

interface UseAppointmentParams {
  page?: number;
  pageSize?: number;
  fromTime?: string;
  toTime?: string;
  statuses?: Array<string | number>;
  doctors?: Array<string | number>;
  branches?: Array<string | number>;
  enabled?: boolean;
  view?: AppointmentView;
  date?: string;
}

type AppointmentSummary = Record<string, any> | null;

const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm";

const toDateTime = (value: dayjs.ConfigType, endOfDay = false) => {
  const base = dayjs(value);
  return base
    .hour(endOfDay ? 23 : 0)
    .minute(endOfDay ? 59 : 0)
    .second(0)
    .format(DATE_TIME_FORMAT);
};

const resolveTimeRange = (
  view: AppointmentView,
  date: string,
): { fromTime: string; toTime: string } => {
  const baseDate = dayjs(date);

  if (view === "month") {
    return {
      fromTime: toDateTime(baseDate.startOf("month")),
      toTime: toDateTime(baseDate.endOf("month"), true),
    };
  }

  if (view === "week") {
    return {
      fromTime: toDateTime(baseDate.startOf("week")),
      toTime: toDateTime(baseDate.endOf("week"), true),
    };
  }

  return {
    fromTime: toDateTime(baseDate),
    toTime: toDateTime(baseDate, true),
  };
};

export function useAppointment({
  page = 1,
  pageSize = 50,
  fromTime,
  toTime,
  statuses,
  doctors,
  branches,
  enabled = true,
  view = "date",
  date = dayjs().format("YYYY-MM-DD"),
}: UseAppointmentParams = {}) {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);

  const convert = useMemo(() => {
    if (!doctors || doctors.length === 0) return appointments;

    return appointments.filter((appt: any) => {
      if (!appt?.doctor) return true;

      return doctors.map(String).includes(String(appt.doctor.id));
    });
  }, [appointments, doctors]);

  const [summary, setSummary] = useState<AppointmentSummary>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);
  const lastSummaryQueryKeyRef = useRef<string>("");

  const statusesKey = useMemo(
    () => (Array.isArray(statuses) ? statuses.map(String).join("|") : ""),
    [statuses],
  );
  // const doctorsKey = useMemo(
  //   () => (Array.isArray(doctors) ? doctors.map(String).join("|") : ""),
  //   [doctors],
  // );
  const branchesKey = useMemo(
    () => (Array.isArray(branches) ? branches.map(String).join("|") : ""),
    [branches],
  );

  const query = useMemo(() => {
    const fallbackRange = resolveTimeRange(view, date);

    return {
      page,
      pageSize,
      from_time: fromTime || fallbackRange.fromTime,
      to_time: toTime || fallbackRange.toTime,
      statuses: statusesKey ? statusesKey.split("|") : [],
      // doctors: doctorsKey ? doctorsKey.split("|") : [],
      branches: branchesKey ? branchesKey.split("|") : [],
    };
  }, [branchesKey, date, fromTime, page, pageSize, statusesKey, toTime, view]);

  const fetchAppointment = useCallback(async () => {
    if (!enabled) return;

    const requestId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const baseParams: Record<string, any> = {
        from_time: query.from_time,
        to_time: query.to_time,
        statuses: query.statuses,
        // doctors: query.doctors,
        branches: query.branches,
      };

      // Summary params exclude statuses so counts always reflect all statuses
      const summaryParams: Record<string, any> = {
        from_time: query.from_time,
        to_time: query.to_time,
        branches: query.branches,
      };

      const firstRequestParams: Record<string, any> = { ...baseParams };

      const summaryQueryKey = JSON.stringify(summaryParams);
      const shouldFetchSummary =
        lastSummaryQueryKeyRef.current !== summaryQueryKey;

      if (view !== "date") {
        firstRequestParams.page = query.page;
        firstRequestParams.page_size = query.pageSize;
      }

      const [listResult, summaryResult] = await Promise.allSettled([
        rest.get("/v2/appointment", {
          params: firstRequestParams,
        }),
        shouldFetchSummary
          ? rest.get("/appointment/summary", {
              params: summaryParams,
            })
          : Promise.resolve(null),
      ]);

      if (shouldFetchSummary) {
        if (summaryResult.status === "fulfilled") {
          const summaryData = summaryResult?.value?.data?.data ?? null;
          if (requestId !== requestIdRef.current) return;
          setSummary(summaryData);
          lastSummaryQueryKeyRef.current = summaryQueryKey;
        } else {
          if (requestId !== requestIdRef.current) return;
          setSummary(null);
        }
      }

      if (listResult.status === "rejected") {
        throw listResult.reason;
      }

      const response = listResult.value;

      const firstData = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      const pagination = response?.data?.pagination || {};
      const totalRecord = Number(
        pagination?.totalRecord ?? pagination?.total ?? firstData.length,
      );
      const limit = Number(pagination?.limit ?? query.pageSize);
      const currentPage = Number(pagination?.currentPage ?? query.page);

      if (
        view === "date" ||
        !Number.isFinite(totalRecord) ||
        !Number.isFinite(limit) ||
        totalRecord <= firstData.length ||
        limit <= 0
      ) {
        if (requestId !== requestIdRef.current) return;
        setAppointments(firstData);
        return;
      }

      const totalPages = Math.ceil(totalRecord / limit);
      const allData = [...firstData];

      for (
        let startPage = currentPage + 1;
        startPage <= totalPages;
        startPage += BATCH_SIZE
      ) {
        const pages = Array.from(
          { length: BATCH_SIZE },
          (_, idx) => startPage + idx,
        ).filter((page) => page <= totalPages);

        const responses = await Promise.all(
          pages.map((page) =>
            rest.get("/v2/appointment", {
              params: {
                ...baseParams,
                page,
                page_size: query.pageSize,
              },
            }),
          ),
        );

        for (const responseItem of responses) {
          const nextData = Array.isArray(responseItem?.data?.data)
            ? responseItem.data.data
            : [];

          if (!nextData.length) continue;

          allData.push(...nextData);

          if (allData.length >= totalRecord) break;
        }

        if (allData.length >= totalRecord) break;
      }

      if (requestId !== requestIdRef.current) return;
      setAppointments(allData);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setAppointments([]);
      setSummary(null);
      setError(err instanceof Error ? err : new Error("Tải lịch hẹn thất bại"));
    } finally {
      if (requestId !== requestIdRef.current) return;
      setIsLoading(false);
    }
  }, [enabled, query, view]);

  useEffect(() => {
    void fetchAppointment();
  }, [fetchAppointment]);

  return {
    appointments: convert,
    summary,
    isLoading,
    error,
    refresh: fetchAppointment,
  };
}
