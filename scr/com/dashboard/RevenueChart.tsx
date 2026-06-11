"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, Select, SelectItem } from "@heroui/react";
import { IconCalendar, IconCoinFilled } from "../icons/filled";
import { formatCurrency } from "../../lib/format";
import rest from "@/lib/rest";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
dayjs.locale("vi");
interface statisticsResponse {
  module?: { views?: { data?: any }[] };
}
// Custom BarChart Component
function BarChart({
  data = [] as any[],
  height = 300,
  showLegend = true,
  padding = { top: 20, right: 20, bottom: 40, left: 50 },
  barColor = {
    revenue: "#0084d1",
    service: "#17c964",
  },
}) {
  const [chartWidth, setChartWidth] = useState(600);
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector("[data-chart-container]");
      if (container instanceof HTMLElement) {
        setChartWidth(container.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  const chartHeight = height;
  const innerWidth = Math.max(1, chartWidth - padding.left - padding.right);
  const innerHeight = Math.max(1, chartHeight - padding.top - padding.bottom);
  // Tính toán max value
  // Safe computations to avoid -Infinity/NaN when data is empty
  const revenues = Array.isArray(data)
    ? data.map((d: any) => Number(d.revenue) || 0)
    : [];
  const services = Array.isArray(data)
    ? data.map((d: any) => Number(d.service) || 0)
    : [];
  const maxValue = Math.max(
    revenues.length ? Math.max(...revenues) : 0,
    services.length ? Math.max(...services) : 0
  );
  const yAxisMax = Math.max(1, Math.ceil(maxValue / 5) * 5);
  const yStep = 5;
  // Tính toán x position - mỗi ngày chiếm diện tích bằng nhau
  const dayCountForSpacing = Math.max(1, Array.isArray(data) ? data.length : 0);
  const daySpacing = innerWidth / dayCountForSpacing; // Chia đều theo số ngày
  const barWidth = 10; // Mỗi bar là 10px
  const barGap = 4; // Khoảng cách giữa 2 bar
  // Y scale function
  const getYLabel = (value: any) =>
    padding.top + innerHeight - (value / Math.max(1, yAxisMax)) * innerHeight;
  // Render Y axis labels - Nhãn Label của trục Y
  const yLabels = [];
  for (let i = 0; i <= yAxisMax; i += yStep) {
    yLabels.push(i);
  }
  return (
    <div className="w-full overflow-x-auto" data-chart-container>
      <svg width={chartWidth} height={chartHeight} className="w-full">
        {/* Grid lines */}
        {yLabels.map((label, i) => (
          <line
            key={`grid-${i}`}
            x1={padding.left}
            y1={getYLabel(label)}
            x2={chartWidth - padding.right}
            y2={getYLabel(label)}
            stroke="#e5e7eb"
            strokeDasharray="3,3"
            strokeWidth="1"
          />
        ))}
        {/* Y Axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={chartHeight - padding.bottom}
          stroke="#ffffff"
          strokeWidth="2"
        />
        {/* X Axis */}
        <line
          x1={padding.left}
          y1={chartHeight - padding.bottom}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          stroke="#ffffff"
          strokeWidth="2"
        />
        {/* Y Axis Labels */}
        {yLabels.map((label, i) => (
          <g key={`y-label-${i}`}>
            <text
              x={padding.left - 10}
              y={getYLabel(label) + 4}
              textAnchor="end"
              fontSize="12"
              fill="#9ca3af"
            >
              {label}tr
            </text>
          </g>
        ))}
        {/* Bars */}
        {Array.isArray(data) &&
          data.map((item: any, index: any) => {
            // Tính vị trí x giữa của mỗi ngày
            const dayCenter = padding.left + (index + 0.5) * daySpacing;
            // Đặt bar nằm giữa phần hiển thị của ngày
            const xStart = dayCenter - (barWidth * 2 + barGap) / 2;
            const revenueValue = Number(item.revenue) || 0;
            const serviceValue = Number(item.service) || 0;
            const revenueHeight =
              (revenueValue / Math.max(1, yAxisMax)) * innerHeight;
            const serviceHeight =
              (serviceValue / Math.max(1, yAxisMax)) * innerHeight;
            return (
              <g key={`bar-${index}`}>
                {/* Revenue Bar (Blue) */}
                <rect
                  x={xStart}
                  y={chartHeight - padding.bottom - revenueHeight}
                  width={barWidth}
                  height={revenueHeight}
                  fill={barColor.revenue}
                  rx="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${item.date} Doanh thu: ${item.revenue}tr`}</title>
                </rect>
                {/* Service Bar (Green) */}
                <rect
                  x={xStart + barWidth + barGap}
                  y={chartHeight - padding.bottom - serviceHeight}
                  width={barWidth}
                  height={serviceHeight}
                  fill={barColor.service}
                  rx="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${item.date} - Lợi nhuận: ${item.service}tr`}</title>
                </rect>
                {/* X Axis Label - nằm giữa */}
                <text
                  x={dayCenter}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#000000"
                  fontWeight="500"
                >
                  {dayjs(item.date, "DD/MM/YYYY", true).format("DD/MM")}
                </text>
                {/* Vertical grid line cho từng ngày (tùy chọn) */}
                <line
                  x1={dayCenter}
                  y1={padding.top}
                  x2={dayCenter}
                  y2={chartHeight - padding.bottom}
                  stroke="#ffffff"
                  strokeWidth="1"
                  opacity="1.5"
                />
              </g>
            );
          })}
      </svg>
      {/* Legend */}
      {showLegend && (
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-sky-600 rounded-sm"></div>
            <span className="text-sm text-gray-700 font-medium">Doanh thu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
            <span className="text-sm text-gray-700 font-medium">Lợi nhuận</span>
          </div>
        </div>
      )}
    </div>
  );
}
const RevenueChart = () => {
  const timePeriods = [
    { key: "1", label: "7 ngày gần nhất" },
    { key: "2", label: "30 ngày gần nhất" },
    { key: "3", label: "3 tháng" },
    { key: "4", label: "6 tháng" },
    { key: "5", label: "1 năm" },
  ];
  const [statistics, setStatistics] = useState<statisticsResponse | null>(null);
  const fetchStatistics = async () => {
    try {
      const res = await rest.post("/statistics", {
        FromDate: "2025-12-09 00:00:00",
        ToDate: "2025-12-15 23:59:59",
        BranchId: "0",
        PermissionCode: "AdminDashboard",
        CurrentWorkProfilePositionId: "448",
        CurrentStaffId: "45",
        CurrentBranchId: "0",
      });
      const data = res.data;
      if (!data) throw new Error("customer-list data null");
      setStatistics(data);
    } catch {
      setStatistics(null);
    }
  };
  useEffect(() => {
    fetchStatistics();
  }, []);
  const REVENUEDATA = useMemo(() => {
    const view0 =
      statistics?.module?.views?.[0]?.data?.QuantityServicesConsultedAndAmount;
    if (!view0) return [];
    const entries = Array.isArray(view0)
      ? view0
      : typeof view0 === "object"
      ? Object.values(view0)
      : [];
    const mapped = entries
      .map((item: any, idx: number) => {
        const date = item?.Day || item?.Date || item?.date || `#${idx + 1}`;
        const revenue = Number(
          item?.TotalAmount || item?.Amount || item?.Revenue || 0
        );
        const service = Number(
          item?.TotalService || item?.Quantity || item?.Service || 0
        );
        return { date, revenue, service };
      })
      .filter((d: any) => !isNaN(d.revenue) || !isNaN(d.service));
    return mapped;
  }, [statistics]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <div className="mt-9 bg-white rounded-4xl shadow-sm">
      <div className="p-5 flex justify-between items-center">
        <div className="flex gap-4">
          <IconCoinFilled size={32} className="text-green-500" />
          <p className="text-2xl font-bold">
            Lợi nhuận trên doanh thu đơn hàng
          </p>
        </div>
        <Select
          aria-label="chart"
          variant="bordered"
          size="lg"
          startContent={<IconCalendar size={24} className="text-slate-400" />}
          defaultSelectedKeys={["1"]}
          className="max-w-55"
        >
          {timePeriods.map((p) => (
            <SelectItem key={p.key} className="text-base">
              {p.label}
            </SelectItem>
          ))}
        </Select>
      </div>
      <hr className="border border-slate-200" />
      <div className="mt-6">
        <BarChart data={REVENUEDATA} height={320} showLegend={false} />
      </div>
      <div className="mt-8 px-6 pb-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          shadow="none"
          className="pt-4 px-5 pb-5 flex flex-row items-start bg-slate-100"
        >
          <div className="h-6 flex items-center">
            <div className="h-3 w-3 rounded-full bg-sky-600" />
          </div>
          <div className="ml-3">
            <p>Doanh thu</p>
            <p className="pt-3 text-xl sm:text-2xl font-bold">
              {formatCurrency(17606000)}
            </p>
          </div>
        </Card>
        <Card
          shadow="none"
          className="flex flex-row items-start pt-4 px-5 pb-5 bg-slate-100"
        >
          <div className="h-6 flex items-center ">
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="ml-3">
            <p>Lợi nhuận</p>
            <p className="pt-3 text-xl sm:text-2xl font-bold">
              {formatCurrency(5403327)}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default RevenueChart;
