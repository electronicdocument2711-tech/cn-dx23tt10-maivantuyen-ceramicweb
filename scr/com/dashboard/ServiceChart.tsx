"use client";
import React, { useEffect, useState } from "react";

import { Card, Select, SelectItem } from "@heroui/react";
import { IconCalendar, IconCoinFilled } from "../icons/filled";

// Custom LineChart Component
function LineChart({
  data = [] as { date: string; revenue: number; service: number }[],
  height = 300,
  showLegend = true,
  padding = { top: 20, right: 50, bottom: 40, left: 50 },
  lineColor = {
    revenue: "#0084d1",
    service: "#6d28d9",
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
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Safe computations to avoid -Infinity/NaN when data is empty
  const revenues = Array.isArray(data)
    ? data.map((d: any) => Number(d.revenue) || 0)
    : [];
  const services = Array.isArray(data)
    ? data.map((d: any) => Number(d.service) || 0)
    : [];

  const maxRevenue = revenues.length ? Math.max(...revenues) : 0;
  const maxService = services.length ? Math.max(...services) : 0;

  const revenueAxisMax = Math.max(1, Math.ceil(maxRevenue / 5) * 5);
  const serviceAxisMax = Math.max(1, Math.ceil(maxService / 10) * 10);

  const revenueStep = 5;
  const serviceStep = 10;

  // Tính toán x position
  const dayCount = Math.max(1, Array.isArray(data) ? data.length - 1 : 0);
  const daySpacing = innerWidth / dayCount;

  // Y scale functions - riêng biệt cho revenue và service
  const getYRevenue = (value: any) =>
    padding.top + innerHeight - (value / revenueAxisMax) * innerHeight;

  const getYService = (value: any) =>
    padding.top + innerHeight - (value / serviceAxisMax) * innerHeight;

  // X position function
  const getXPosition = (index: number) => padding.left + index * daySpacing;

  // Render Y axis labels
  const revenueLabels = [];
  for (let i = 0; i <= revenueAxisMax; i += revenueStep) {
    revenueLabels.push(i);
  }

  const serviceLabels = [];
  for (let i = 0; i <= serviceAxisMax; i += serviceStep) {
    serviceLabels.push(i);
  }

  // Tạo path string cho line
  const getLinePath = (key: any, getYFunction: any) => {
    if (!Array.isArray(data) || data.length === 0) return "";
    return data
      .map((item, index) => {
        const x = getXPosition(index);
        const y = getYFunction((item as Record<string, any>)[key]);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div className="w-full overflow-x-auto" data-chart-container>
      <svg width={chartWidth} height={chartHeight} className="w-full">
        {/* Vertical grid lines */}
        {data.map((_item, index) => (
          <line
            key={`grid-v-${index}`}
            x1={getXPosition(index)}
            y1={padding.top}
            x2={getXPosition(index)}
            y2={chartHeight - padding.bottom}
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity="1.5"
            strokeDasharray="4 4"
          />
        ))}

        {/* Y Axis - Left (Revenue) */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={chartHeight - padding.bottom}
          stroke="#d1d5db"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Y Axis - Right (Service) */}
        <line
          x1={chartWidth - padding.right}
          y1={padding.top}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          stroke="#d1d5db"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* X Axis */}
        <line
          x1={padding.left}
          y1={chartHeight - padding.bottom}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          stroke="#d1d5db"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Top Border to form rectangle */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={chartWidth - padding.right}
          y2={padding.top}
          stroke="#d1d5db"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Y Axis Labels - Left (Revenue) */}
        {revenueLabels.map((label, i) => (
          <g key={`y-label-left-${i}`}>
            <text
              x={padding.left - 10}
              y={getYRevenue(label) + 4}
              textAnchor="end"
              fontSize="12"
              fill="#9ca3af"
              fontWeight="500"
            >
              {label}tr
            </text>
          </g>
        ))}

        {/* Y Axis Labels - Right (Service) */}
        {serviceLabels.map((label, i) => (
          <g key={`y-label-right-${i}`}>
            <text
              x={chartWidth - padding.right + 10}
              y={getYService(label) + 4}
              textAnchor="start"
              fontSize="12"
              fill="#9ca3af"
              fontWeight="500"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Revenue Line */}
        <path
          d={getLinePath("revenue", getYRevenue)}
          fill="none"
          stroke={lineColor.revenue}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Service Line */}
        <path
          d={getLinePath("service", getYService)}
          fill="none"
          stroke={lineColor.service}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {data.map((item, index) => {
          const revenueX = getXPosition(index);
          const revenueY = getYRevenue(item.revenue);
          const serviceX = getXPosition(index);
          const serviceY = getYService(item.service);

          return (
            <g key={`points-${index}`}>
              {/* Revenue Point */}
              <circle
                cx={revenueX}
                cy={revenueY}
                // r="4"
                fill={lineColor.revenue}
                className="hover:r-6 transition-all cursor-pointer"
                style={{ transition: "all 0.2s" }}
              >
                <title>{`${item.date} - Doanh thu: ${item.revenue}tr`}</title>
              </circle>

              {/* Service Point */}
              <circle
                cx={serviceX}
                cy={serviceY}
                // r="4"
                fill={lineColor.service}
                className="hover:r-6 transition-all cursor-pointer"
                style={{ transition: "all 0.2s" }}
              >
                <title>{`${item.date} - Service: ${item.service}`}</title>
              </circle>

              {/* X Axis Label */}
              <text
                x={revenueX}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#9ca3af"
                fontWeight="500"
              >
                {item.date}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-sky-600 rounded-sm"></div>
            <span className="text-sm text-gray-700 font-medium">
              Doanh thu (trái)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500 rounded-sm"></div>
            <span className="text-sm text-gray-700 font-medium">
              Lợi nhuận (phải)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServiceChart() {
  const timePeriods = [
    { key: "1", label: "7 ngày gần nhất" },
    { key: "2", label: "30 ngày gần nhất" },
    { key: "3", label: "3 tháng" },
    { key: "4", label: "6 tháng" },
    { key: "5", label: "1 năm" },
  ];

  const data = [
    { date: "8/9", revenue: 7, service: 10 },
    { date: "9/9", revenue: 8, service: 11 },
    { date: "10/9", revenue: 9, service: 12 },
    { date: "11/9", revenue: 11, service: 14 },
    { date: "12/9", revenue: 13, service: 16 },
    { date: "13/9", revenue: 15, service: 20 },
    { date: "14/9", revenue: 12, service: 16 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="mt-9 bg-white rounded-4xl shadow-sm">
      <div className="p-5 flex justify-between items-center">
        <div className="flex gap-4">
          <IconCoinFilled size={32} className="text-violet-700" />

          <p className="text-2xl font-bold">Dịch vụ tư vấn/doanh thu</p>
        </div>

        <Select
          aria-label="Service Chart"
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
        <LineChart data={data} height={320} showLegend={false} />
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
            <p>Doanh thu (triệu VNĐ)</p>
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
            <div className="h-3 w-3 rounded-full bg-violet-700" />
          </div>

          <div className="ml-3">
            <p>Dịch vụ tư vấn (số lượng)</p>
            <p className="pt-3 text-xl sm:text-2xl font-bold">27</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
