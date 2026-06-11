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
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Skeleton } from "@heroui/skeleton";
import { IconChevronRight } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/format";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";

const by = [
  { key: "day", text: "Hôm nay" },
  { key: "week", text: "Tuần này" },
  { key: "month", text: "Tháng này" },
  { key: "6month", text: "6 tháng" },
];

const ClinicPerformance: React.FC<{ delay: number }> = ({ delay = 0 }) => {
  const [selected, setSelected] = useState("day");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<any>();

  const { branches } = useAppContext();

  const branchName = (id: string): string =>
    branches.find((b) => b?.BranchId == id)?.Name || "_";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await rest.get("/report/clinic-performance", {
          params: { by: selected },
        });

        if (res?.data || res?.status === 200) {
          const items = res.data?.data || [];
          setData(items);

          // tính tổng doanh thu, số khách, số lịch hẹn
          const TotalAmount = items.reduce(
            (sum: number, item: any) =>
              sum + (parseInt(item?.TotalAmount, 10) || 0),
            0,
          );
          const CountCustomer = items.reduce(
            (sum: number, item: any) =>
              sum + (parseInt(item?.CountCustomer, 10) || 0),
            0,
          );
          const CountApp = items.reduce(
            (sum: number, item: any) =>
              sum + (parseInt(item?.CountApp, 10) || 0),
            0,
          );

          setTotal({ TotalAmount, CountCustomer, CountApp });
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    // delay fetching data by `delay` milliseconds
    const fetcher = setTimeout(fetchData, data.length === 0 ? delay : 0);

    return () => clearTimeout(fetcher);
  }, [selected, delay]);

  return (
    <div>
      <div className="flex justify-between items-baseline">
        <h2 className="text-lg font-semibold flex-1 leading-5">
          Năng suất Chi nhánh
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
      {/* bảng năng xuất chi nhánh */}
      <Table
        className="my-2"
        classNames={{
          th: "h-auto p-2",
          td: "px-2",
          wrapper: "p-2 shadow-none border border-default-200",
        }}
      >
        <TableHeader>
          <TableColumn className="w-8 text-center">#</TableColumn>
          <TableColumn className="w-1/4">Chi nhánh</TableColumn>
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
              <>
                <TableRow>
                  <TableCell colSpan={2}>&nbsp;</TableCell>
                  <TableCell className="font-semibold w-1/4">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-4" />
                  </TableCell>
                </TableRow>
                {branches.map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-semibold w-1/4">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-4" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : data.length > 0 ? (
              <>
                <TableRow className="border-b border-default-200">
                  <TableCell colSpan={2} className="font-semibold">
                    &nbsp;
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(total.TotalAmount, false)}
                  </TableCell>
                  <TableCell className="text-center">
                    {total.CountCustomer}
                  </TableCell>
                  <TableCell className="text-center">
                    {total.CountApp}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      total.TotalAmount / total.CountCustomer,
                      false,
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(total.TotalAmount / total.CountApp, false)}
                  </TableCell>
                </TableRow>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-8 text-center">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="truncate">
                        {branchName(item?.BranchId)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.TotalAmount, false)}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.CountCustomer}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.CountApp}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        item.TotalAmount / item.CountCustomer,
                        false,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.TotalAmount / item.CountApp, false)}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </>
        </TableBody>
      </Table>
      <Link
        className="py-1.5 text-sm px-4 w-fit rounded-lg hover:bg-sky-50 text-default-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        href="/report/clinic-performance"
      >
        Xem chi tiết
        <IconChevronRight size={16} />
      </Link>
    </div>
  );
};

export default ClinicPerformance;
