"use client";

import React, { useCallback, useEffect, useState } from "react";

import { Card, CardBody, Select, SelectItem } from "@heroui/react";
import { useLocal } from "@/hook";
import rest from "@/lib/rest";
import dayjs from "dayjs";
import clsx from "clsx";
import { LOCAL_KEY } from "@/const/global";
import { formatRevenueCompact } from "@/lib/format";

interface MetricItem {
  current: number;
  previous: number;
  changePercent: number | null;
}

interface CoreMetricsData {
  checkedIn: MetricItem;
  cancelled: MetricItem;
  revenue: MetricItem;
  newCustomers: MetricItem;
  satisfaction: MetricItem;
}

const keyMapLabel = {
  checkedIn: "Checked-in",
  cancelled: "Cancelled",
  revenue: "Doanh thu",
  newCustomers: "Khách hàng mới",
  satisfaction: "Hài lòng",
};

const ChangePercent = ({ value }: { value: number | null | undefined }) => {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 text-sm">—</span>;
  }
  const isPositive = value >= 0;
  return (
    <span
      className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}
    >
      {isPositive ? "+" : ""}
      {value.toFixed(1)}%{isPositive ? " ↑" : " ↓"}
    </span>
  );
};

export default function CoreMetrics() {
  const [metrics, setMetrics] = useState<CoreMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilterKey, setSelectedFilterKey] = useLocal(
    LOCAL_KEY.DASHBOARD_FILTER_KEY,
    "7",
  );

  const fetchMetrics = useCallback(async (period: string) => {
    setIsLoading(true);
    try {
      const now = dayjs();
      let toDate = null;
      let fromDate = null;

      if (period === "1") {
        toDate = now.format("YYYY-MM-DD");
        fromDate = now.format("YYYY-MM-DD");
      } else {
        toDate = now.format("YYYY-MM-DD");
        fromDate = now.subtract(Number(period), "days").format("YYYY-MM-DD");
      }

      const res = await rest.get(`/core-metrics`, {
        params: {
          fromDate,
          toDate,
        },
      });

      if (res?.status !== 200) {
        throw new Error("Lỗi khi tải dữ liệu");
      }

      setMetrics(res?.data?.data);
    } catch {
      // silently fail – metrics are non-critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics(selectedFilterKey);
  }, [selectedFilterKey, fetchMetrics]);

  /**
   * render view
   * ====================================================================
   */

  const renderContent = () => {
    if (isLoading || !metrics) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 w-full xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              shadow="none"
              className="bg-slate-100 rounded-3xl animate-pulse aspect-[5/3]"
            >
              <CardBody className="p-0 aspect-[5/3]" />
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 w-full xl:grid-cols-5 gap-4">
        {Object.keys(metrics || {}).map((key: any) => {
          const current =
            key === "revenue"
              ? formatRevenueCompact(
                  metrics?.[key as keyof CoreMetricsData]?.current ?? 0,
                )
              : (metrics?.[key as keyof CoreMetricsData]?.current ?? 0);

          return (
            <Card
              key={key}
              shadow="none"
              className="bg-slate-100 rounded-3xl shadow-none"
            >
              <CardBody className="p-0 h-full flex flex-col justify-between overflow-hidden">
                <div className="pt-3 px-4">
                  <p className="font-medium text-blue-900">
                    {keyMapLabel[key as keyof typeof keyMapLabel] || key}
                  </p>
                </div>
                <div>
                  <div className="px-3 flex items-end gap-2">
                    <h1
                      className={clsx(
                        "pt-2 font-semibold",
                        String(current).length <= 4
                          ? "text-6xl"
                          : String(current).length <= 6
                            ? "text-5xl"
                            : "text-4xl",
                      )}
                    >
                      {current}
                    </h1>
                  </div>
                  <div className="mt-1 px-4 pb-3">
                    <ChangePercent
                      value={
                        metrics?.[key as keyof CoreMetricsData]?.changePercent
                      }
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-end mt-6 p-4 gap-4 bg-white rounded-4xl border border-default-200">
      <Select
        size="lg"
        className="w-60"
        variant="bordered"
        items={[
          { key: "1", label: "Hôm nay" },
          { key: "7", label: "7 ngày" },
          { key: "30", label: "30 ngày" },
          { key: "90", label: "90 ngày" },
        ]}
        onSelectionChange={(e) => {
          setSelectedFilterKey(e?.currentKey as string);
        }}
        selectedKeys={[selectedFilterKey]}
      >
        {(item) => <SelectItem key={item?.key}>{item?.label}</SelectItem>}
      </Select>
      {renderContent()}
    </div>
  );
}
