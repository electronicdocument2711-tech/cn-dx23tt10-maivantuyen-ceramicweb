"use client";

import rest from "@/lib/rest";
import {
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Skeleton,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { useAppContext } from "@/context/AppContext";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

const by = [
  { key: "day", text: "Hôm nay" },
  { key: "week", text: "Tuần này" },
  { key: "month", text: "Tháng này" },
  { key: "6month", text: "6 tháng" },
];

const DoctorPerformance: React.FC<{ delay: number }> = ({ delay = 0 }) => {
  const [selected, setSelected] = useState("day");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { doctors } = useAppContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await rest.get("/report/doctor-performance", {
          params: { by: selected },
        });
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch doctor performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    // delay fetching data by `delay` milliseconds
    const timer = setTimeout(() => {
      fetchData();
    }, delay);

    return () => clearTimeout(timer);
  }, [selected, delay]);

  return (
    <div>
      <div className="flex justify-between items-baseline">
        <h2 className="text-lg font-semibold flex-1 leading-5">
          Năng suất Bác sĩ
        </h2>

        <Select
          label=""
          aria-label="chart-by"
          size="sm"
          className="w-32"
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
      {/* bảng năng xuất bác sĩ */}
      <Table
        className="my-2"
        classNames={{
          th: "h-auto p-2",
          td: "px-2",
          wrapper: "p-2 shadow-none border border-default-200",
        }}
      >
        <TableHeader>
          <TableColumn className="w-1/4">Bác sĩ</TableColumn>
          <TableColumn className="text-right">Doanh thu</TableColumn>
          <TableColumn className="text-right">Số khách</TableColumn>
          <TableColumn className="text-right">Lịch hẹn</TableColumn>
          <TableColumn className="text-right">Thu/Khách</TableColumn>
          <TableColumn className="text-right">Thu/Lịch hẹn</TableColumn>
        </TableHeader>
        <TableBody>
          <>
            {/* nếu đang loading thì hiển thị skeleton */}
            {loading ? (
              doctors.map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold w-1/4">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-4" />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-semibold">
                    <span className="truncate">{item?.doctor?.name}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.revenue, false, false)}
                  </TableCell>
                  <TableCell className="text-right">{item.customer}</TableCell>
                  <TableCell className="text-right">
                    {item.appointment}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.revenue / item.customer, false, false)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      item.revenue / item.appointment,
                      false,
                      false,
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </>
        </TableBody>
      </Table>
      <Link
        className="py-1.5 text-sm px-4 w-fit rounded-lg hover:bg-sky-50 text-default-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        href="/report/doctor-performance"
      >
        Xem chi tiết
        <IconChevronRight size={16} />
      </Link>
    </div>
  );
};

export default DoctorPerformance;
