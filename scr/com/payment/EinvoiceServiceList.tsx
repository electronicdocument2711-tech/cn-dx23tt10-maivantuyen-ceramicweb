import {
  Table,
  TableHeader,
  TableColumn,
  Checkbox,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { ServiceBillTable } from "../../data/headers";
import { formatCurrency } from "../../lib/format";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/utils";
import rest from "@/lib/rest";

export function EinvoiceServiceList({
  customerId,
  selectedSercvices,
  setSelecterServices,
  errorMesage,
}: {
  customerId: string;
  selectedSercvices: any[];
  setSelecterServices: React.Dispatch<React.SetStateAction<any[]>>;
  errorMesage: string;
}) {
  const abortRef = useRef<AbortController | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string>("");

  const handleToggleRow = (orderId: string) => {
    const newService = data.find((item) => item.OrderDetailId === orderId);
    if (!newService) return;
    if (selectedSercvices.some((item) => item.OrderDetailId === orderId)) {
      setSelecterServices(
        selectedSercvices.filter((item) => item.OrderDetailId !== orderId),
      );
    } else {
      setSelecterServices([...selectedSercvices, newService]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedSercvices.length === data.length) {
      setSelecterServices([]);
    } else {
      setSelecterServices(data);
    }
  };

  const totalAmount = useMemo(() => {
    if (selectedSercvices.length === 0) return 0;
    return selectedSercvices.reduce((acc, item) => {
      return parseInt(acc || 0) + parseInt(item.AmountBeforeTax || 0);
    }, 0);
  }, [selectedSercvices]);

  const totalTaxAmount = useMemo(() => {
    if (selectedSercvices.length === 0) return 0;
    return selectedSercvices.reduce((acc, item) => {
      return parseInt(acc || 0) + parseInt(item.TaxAmount || 0);
    }, 0);
  }, [selectedSercvices]);

  const totalAmountAfterTax = useMemo(() => {
    if (selectedSercvices.length === 0) return 0;
    return selectedSercvices.reduce((acc, item) => {
      return (
        parseInt(acc || 0) +
        parseInt(item.AmountBeforeTax || 0) +
        parseInt(item.TaxAmount || 0)
      );
    }, 0);
  }, [selectedSercvices]);

  useEffect(() => {
    if (!customerId) return;
    const fetchData = async () => {
      try {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        setError("");
        const res = await rest.get(
          `/einvoice/service-list?customerId=${customerId}`,
          {
            signal: abortRef.current?.signal,
          },
        );
        setData((res.data as any[]) ?? []);
      } catch (error) {
        setData([]);
        setError(getErrorMessage(error, "Đã có lỗi xảy ra"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customerId]);
  return (
    <div className="py-8 w-full flex flex-col border-b border-slate-200">
      <h3 className="pb-12">Chọn dịch vụ cần xuất hoá đơn</h3>
      <div className="rounded-2xl overflow-hidden border border-slate-300">
        <Table
          aria-label="Detail Service Table"
          shadow="none"
          radius="none"
          maxTableHeight={1000}
          className="min-w-full border-b border-slate-300 "
          classNames={{
            wrapper: "p-0 rounded-none",
            table: "p-0",
            td: "h-14",
            tr: "m-2",
          }}
        >
          <TableHeader>
            {ServiceBillTable.map((h: any, idx: any) => (
              <TableColumn
                key={idx}
                className={`${h?.className} whitespace-pre-line text-sm text-slate-500 border-b border-slate-300`}
              >
                {h.key === "check" ? (
                  <Checkbox
                    size="md"
                    isSelected={selectedSercvices.length === data.length}
                    onChange={handleToggleSelectAll}
                    classNames={{
                      wrapper: "bg-white",
                    }}
                  />
                ) : (
                  h.display
                )}
              </TableColumn>
            ))}
          </TableHeader>

          <TableBody
            emptyContent={
              <div className="text-default-500">Không có dịch vụ nào</div>
            }
          >
            {data.map((item, idx) => {
              const isTax = Number(item?.IsTax) >= 1;

              return (
                <TableRow
                  key={item?.OrderDetailId}
                  onClick={() => handleToggleRow(item.OrderDetailId)}
                  className={`hover:cursor-pointer hover:bg-slate-100 ${
                    selectedSercvices.some(
                      (s) => s.OrderDetailId === item.OrderDetailId,
                    )
                      ? "bg-slate-100"
                      : ""
                  }`}
                >
                  <TableCell className="h-14 sticky left-0 bg-white z-10">
                    <Checkbox
                      size="md"
                      isSelected={selectedSercvices.some(
                        (s) => s.OrderDetailId === item.OrderDetailId,
                      )}
                      onChange={() => handleToggleRow(item.OrderDetailId)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell className="min-w-[150px] max-w-[300px]">
                    {item?.ServiceTaxName ?? ""}
                  </TableCell>
                  <TableCell className="text-center min-w-[100px] max-w-[120px] whitespace-wrap">
                    {item?.Unit ?? ""}
                  </TableCell>
                  <TableCell className="text-center max-w-[80px] whitespace-wrap">
                    {formatCurrency(item?.Quantity ?? 0, true, false)}
                  </TableCell>
                  <TableCell className="text-center min-w-[100px] max-w-[120px] whitespace-wrap">
                    {formatCurrency(item?.ServicePrice ?? 0, true, false)}
                  </TableCell>
                  <TableCell className="text-center min-w-[100px] max-w-[120px] whitespace-wrap">
                    {formatCurrency(item?.DiscountAmount ?? 0, true, false)}
                  </TableCell>
                  <TableCell className="text-center min-w-[100px] max-w-[120px] whitespace-wrap">
                    {formatCurrency(item?.AmountBeforeTax, true, false)}
                  </TableCell>
                  <TableCell className="text-center min-w-[80px] max-w-[100px]">
                    {isTax
                      ? formatCurrency(item?.TaxPercent ?? 0, true, false)
                      : "KCT"}
                  </TableCell>
                  <TableCell className="text-center min-w-[100px] max-w-[120px] whitespace-wrap">
                    {formatCurrency(item?.TaxAmount ?? 0, true, false)}
                  </TableCell>
                  <TableCell className="text-right min-w-[100px] max-w-[120px] whitespace-wrap sticky right-0 bg-white z-10">
                    {formatCurrency(item?.AmountAfterTax ?? 0, true, false)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="border-t-4 border-default-100 p-4 flex flex-col items-end">
          <div className="grid grid-cols-2 gap-4 font-bold">
            <div className="text-right">Tổng tiền trước thuế:</div>
            <div className="text-right">
              {formatCurrency(totalAmount, true)}
            </div>
            <div className="text-right">Tổng tiền thuế GTGT:</div>
            <div className="text-right">
              {formatCurrency(totalTaxAmount, true)}
            </div>
            <div className="text-right">Tổng tiền sau thuế:</div>
            <div className="text-right">
              {formatCurrency(totalAmountAfterTax, true)}
            </div>
          </div>
        </div>
      </div>
      {errorMesage && (
        <p className="text-danger text-sm py-2 px-1">{errorMesage}</p>
      )}
    </div>
  );
}
