"use client";

import rest from "@/lib/rest";
import { Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { Skeleton } from "@heroui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const by = [
  { key: "day", text: "Theo ngày" }, // 7 ngày gần nhất
  { key: "week", text: "Theo tuần" }, // 8 tuần gần nhất
  { key: "month", text: "Theo tháng" }, // 6 tháng gần nhất
];

const AppointmentFunnel: React.FC<{ delay: number }> = ({ delay = 0 }) => {
  const [selected, setSelected] = useState("day");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await rest.get(`report/appointment-funnel?by=${selected}`);

        if (res.status !== 200)
          throw new Error(`Error fetching app funnel: ${res.statusText}`);

        setData(res.data?.data || []);
      } catch (error) {
        console.error("Error fetching app funnel:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetcher = setTimeout(fetchData, data?.length ? delay : 0);
    return () => clearTimeout(fetcher);
  }, [selected, delay]);

  const Dot: React.FC<any> = ({
    variant,
  }: {
    variant: "sky" | "green" | "purple";
  }) => {
    return <div className={`w-2 h-2 rounded-full bg-${variant}-400`} />;
  };

  const tooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow text-xs">
          <p className="font-semibold capitalize">
            {payload[0].payload.fullLabel}
          </p>
          <p>
            Lượt hẹn:{" "}
            <span className="font-semibold">
              {payload[0].payload.appointment}
            </span>
          </p>
          <p>
            Checkin:{" "}
            <span className="font-semibold">{payload[0].payload.checkin}</span>
          </p>
          <p>
            Thanh toán:{" "}
            <span className="font-semibold">{payload[0].payload.payment}</span>
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
          <h2 className="text-lg font-semibold flex-1 leading-5 mb-2">
            Hiệu suất lịch hẹn
          </h2>
          <ul className="text-xs font-medium text-gray-600 flex items-center gap-4">
            <li className="flex items-center gap-1">
              <Dot variant="sky" /> Lịch hẹn
            </li>
            <li className="flex items-center gap-1">
              <Dot variant="green" /> Checkin
            </li>
            <li className="flex items-center gap-1">
              <Dot variant="purple" /> Thanh toán
            </li>
          </ul>
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
            <YAxis style={{ fontSize: 10 }} dataKey="appointment" />
            <Tooltip content={tooltipContent} />
            <Bar
              dataKey="appointment"
              fill="#99c7fb"
              className="bg-sky-400"
              barSize={12}
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="checkin"
              fill="#34d399"
              className="bg-green-400"
              barSize={12}
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="payment"
              fill="#a78bfa"
              className="bg-purple-400"
              barSize={12}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        )}
      </div>
    </div>
  );
};

export default AppointmentFunnel;
