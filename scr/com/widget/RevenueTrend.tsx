"use client";

import rest from "@/lib/rest";
import { Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { Skeleton } from "@heroui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";

const by = [
  { key: "day", text: "Theo ngày" }, // 7 ngày gần nhất
  { key: "week", text: "Theo tuần" }, // 8 tuần gần nhất
  { key: "month", text: "Theo tháng" }, // 6 tháng gần nhất
];

const RevenueTrend: React.FC<{ delay: number }> = ({ delay = 0 }) => {
  const [selected, setSelected] = useState("day");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await rest.get(`report/revenue-trend?by=${selected}`);

        if (res.status !== 200)
          throw new Error(`Error fetching revenue trend: ${res.statusText}`);

        setData(res.data?.data);
      } catch (error) {
        console.error("Error fetching revenue trend:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetcher = setTimeout(fetchData, data?.length ? delay : 0);
    return () => clearTimeout(fetcher);
  }, [selected, delay]);

  const tooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow text-xs">
          <p className="font-semibold capitalize">
            {payload[0].payload.fullLabel}
          </p>
          <p>
            Doanh thu:{" "}
            <span className="font-semibold">
              {formatCurrency(parseInt(payload[0].value, 10), true, false)}
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
      <div className="flex justify-between items-baseline">
        <div>
          <h2 className="text-lg font-semibold flex-1 leading-5">
            Biến động doanh thu
          </h2>
          <span className="text-xs font-medium text-gray-600">
            Đơn vị: ngàn VND
          </span>
        </div>
        <Select
          label=""
          aria-label="chart-by"
          size="sm"
          className="w-36"
          selectedKeys={[selected]}
          onSelectionChange={(item: any) => setSelected(item.currentKey)}
        >
          {by.map((item) => (
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
      <div className="mt-6">
        {loading ? (
          <Skeleton className="w-full h-72 rounded bg-default-50" />
        ) : (
          <BarChart width={"100%"} height={300} data={data}>
            <CartesianGrid strokeDasharray="2 6" />
            <XAxis dataKey="label" style={{ fontSize: 12 }} />
            <YAxis
              style={{ fontSize: 10 }}
              tickFormatter={(value) =>
                formatCurrency(value / 1000, true, false)
              }
            />
            <Tooltip content={tooltipContent} />
            <Bar
              dataKey="value"
              fill="#99c7fb"
              barSize={25}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )}
      </div>
    </div>
  );
};

export default RevenueTrend;
