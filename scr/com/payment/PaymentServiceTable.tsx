"use client";

import {
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { IconEye, IconPencil } from "../icons/outline";
import clsx from "clsx";
import dayjs from "dayjs";
import { SetupServiceHeaders } from "@/data/headers";
import { displayTax } from "@/lib/utils";

interface PaymentServiceTableProps {
  data: any[];
}

const PaymentServiceTable: React.FC<PaymentServiceTableProps> = ({ data }) => {
  return (
    <Table
      aria-label="Detail Service Table"
      shadow="none"
      radius="none"
      maxTableHeight={1000}
      className="min-w-full min-h-96"
      classNames={{
        wrapper: "p-0 rounded-none",
        table: "p-0",
      }}
    >
      <TableHeader>
        {SetupServiceHeaders.map((h: any, idx: any) => (
          <TableColumn
            key={idx}
            className={`${h?.className} text-sm text-slate-500 py-2`}
          >
            {h.display}
          </TableColumn>
        ))}
      </TableHeader>

      <TableBody>
        {data.map((d: any, idx: number) => {
          const tax = Number(d?.TaxPercent || 0);
          const isTax = Number(d?.IsTax) === 1;
          const startDate = dayjs(d?.StartDate, "YYYY-MM-DD");
          const endDate = dayjs(d?.EndDate, "YYYY-MM-DD");
          const today = dayjs();

          const renderEndDate = endDate?.isValid()
            ? endDate.format("DD/MM/YYYY")
            : !startDate?.isValid()
              ? "Chưa xác định"
              : today.isAfter(startDate, "day")
                ? "Hiện tại"
                : "Chưa xác định";

          const state = today.isBefore(startDate, "day")
            ? "upcoming"
            : endDate.isBefore(today, "day")
              ? "expired"
              : "active";

          return (
            <TableRow
              key={d?.ServiceTaxInfoId}
              className={clsx(
                `hover:cursor-pointer hover:bg-slate-100 border-b border-slate-200`,
                {
                  "bg-gray-100": state === "expired",
                  "bg-green-50": state === "active",
                },
              )}
            >
              <TableCell>
                <div className="min-h-10">{idx + 1}</div>
              </TableCell>
              <TableCell>{d?.ServiceName}</TableCell>
              <TableCell>{d?.ServiceTaxName}</TableCell>
              <TableCell>{d?.ServiceCode}</TableCell>
              <TableCell>{d?.Unit}</TableCell>
              <TableCell className="text-right">
                {displayTax(isTax, tax)}
              </TableCell>
              <TableCell className="text-end">
                {startDate?.isValid()
                  ? startDate.format("DD/MM/YYYY")
                  : "Không xác định"}{" "}
                - {renderEndDate}
              </TableCell>
              <TableCell>
                <Link
                  href={`/payment/service/${d.ServiceId}/service-tax-info/${d?.ServiceTaxInfoId}`}
                  className="w-full"
                >
                  <Button
                    variant="bordered"
                    fullWidth
                    className="bg-white"
                    startContent={
                      state === "expired" ? (
                        <IconEye size={18} />
                      ) : (
                        <IconPencil size={16} color="currentColor" />
                      )
                    }
                  >
                    {state === "active" || state === "upcoming"
                      ? "Cập nhật"
                      : "Chi tiết"}
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default PaymentServiceTable;
