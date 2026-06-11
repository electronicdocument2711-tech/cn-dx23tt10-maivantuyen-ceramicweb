"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/react";
import { useState } from "react";

import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

const TableRefund: React.FC<{ range: string; branch: string }> = () => {
  const [data] = useState<any[]>([]);
  const [loading] = useState(false);

  return (
    <>
      <Table
        className="my-2"
        classNames={{
          th: "h-auto p-2",
          td: "px-2",
          wrapper: "p-2 shadow-none border border-default-200",
        }}
      >
        <TableHeader>
          <TableColumn className="w-8">#</TableColumn>
          <TableColumn>Số | Ký hiệu</TableColumn>
          <TableColumn>Mã yêu cầu</TableColumn>
          <TableColumn>Khách hàng</TableColumn>
          <TableColumn className="text-right">Tổng tiền</TableColumn>
          <TableColumn className="text-right">Trạng thái</TableColumn>
        </TableHeader>
        <TableBody>
          <>
            {/* nếu đang loading thì hiển thị skeleton */}
            {loading ? (
              data.map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>Đang tải dữ liệu...</TableCell>
                </TableRow>
              ))
            ) : data.length > 0 ? (
              data.map((_, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-semibold">a</TableCell>
                  <TableCell className="text-right">a</TableCell>
                  <TableCell className="text-right">a</TableCell>
                  <TableCell className="text-right">a</TableCell>
                  <TableCell className="text-right">a=</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-left text-sm text-gray-700"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </>
        </TableBody>
      </Table>
      <Link
        className="py-1.5 text-sm px-4 w-fit rounded-lg hover:bg-sky-50 text-default-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        href="/report/refund"
      >
        Xem tất cả
        <IconChevronRight size={16} />
      </Link>
    </>
  );
};

export default TableRefund;
