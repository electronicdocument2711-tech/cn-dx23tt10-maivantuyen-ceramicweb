"use client";

import rest from "@/lib/rest";
import { Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { Skeleton } from "@heroui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

const range = [
  { key: "day", text: "Hôm nay" },
  { key: "week", text: "Tuần này" },
  { key: "month", text: "Tháng này" },
  { key: "half", text: "6 tháng" },
];

// const group = [
//   { key: "revenue", text: "Theo doanh thu" },
//   { key: "appointment", text: "Theo lịch hẹn" },
// ];

const ServiceBreakdown: React.FC<{ delay: number }> = ({ delay = 0 }) => {
  const [timeBy, setTimeBy] = useState("day");
  const [groupBy, _setGroupBy] = useState("revenue");

  const [data, setData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = `report/service-breakdown?range=${timeBy}&group=${groupBy}`;
        const res = await rest.get(url);

        if (res.status !== 200)
          throw new Error(
            `Error fetching service breakdown: ${res.statusText}`,
          );

        setData(
          Array.from({ length: 10 }, (_, i) => {
            const item = res.data[i];
            return {
              id: item?.id || i,
              name: item?.name || "",
              value: item?.value || 0,
            };
          }).reverse(),
        );
      } catch (error) {
        console.error("Error fetching service breakdown:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetcher = setTimeout(fetchData, data?.length ? delay : 0);
    return () => clearTimeout(fetcher);
  }, [timeBy, groupBy, delay]);

  const tooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow text-xs">
          <p className="font-semibold capitalize">{payload[0].payload.name}</p>
          <p>
            Doanh thu:{" "}
            <span className="font-semibold">
              {formatCurrency(payload[0].value, true, false)}
            </span>{" "}
            VND
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex justify-between gap-2 items-baseline">
        <h2 className="text-lg font-semibold flex-1 line-clamp-1 leading-5">
          Năng suất Dịch vụ
        </h2>
        <div className="flex items-center gap-2">
          {/* ẩn tạm đi vì chưa tìm được mối liên hệ giữa dịch vụ và lịch hẹn */}
          {/* <Select
            label=""
            aria-label="chart-group"
            size="sm"
            className="w-40"
            selectedKeys={[groupBy]}
            onSelectionChange={(item: any) => setGroupBy(item.currentKey)}
          >
            {group.map((item) => (
              <SelectItem
                key={item.key}
                textValue={item.text}
                aria-labelledby="chart-group"
              >
                {item.text}
              </SelectItem>
            ))}
          </Select> */}
          <Select
            label=""
            aria-label="chart-by"
            size="sm"
            className="w-32"
            selectedKeys={[timeBy]}
            onSelectionChange={(item: any) => setTimeBy(item.currentKey)}
          >
            {range.map((item) => (
              <SelectItem
                key={item.key}
                textValue={item.text}
                aria-labelledby="chart-by"
              >
                {item.text}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-600">
        Top 10 dịch vụ hiệu suất tốt nhất
      </span>
      <div className="mt-6 border-b border-b-default-200 mb-2 pb-3">
        {loading ? (
          <Skeleton className="w-full h-72 rounded bg-default-50" />
        ) : (
          <BarChart
            width={"100%"}
            height={35 * data.length}
            data={data}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="2 6" />
            <XAxis
              dataKey="value"
              style={{ fontSize: 12 }}
              type="number"
              tickFormatter={(value) => formatCurrency(value, true, false)}
            />
            <YAxis
              type="category"
              style={{ fontSize: 12, lineHeight: "20px" }}
              dataKey="name"
              width={200}
              tick={{ width: 180 }}
            />
            <Tooltip content={tooltipContent} />
            <Bar
              dataKey="value"
              fill="#99c7fb"
              barSize={20}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        )}
      </div>
      <Link
        className="py-1.5 text-sm px-4 w-fit rounded-lg hover:bg-sky-50 text-default-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        href="/report/service-breakdown"
      >
        Xem tất cả
        <IconChevronRight size={16} />
      </Link>
    </div>
  );
};

export default ServiceBreakdown;
