"use client";

import React, { useEffect, useState } from "react";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  DateRangePicker,
  Form,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { IconChevronLeft, IconDownload, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ExportServiceBillTable } from "@/data/headers";
import { formatCurrency } from "@/lib/format";
import { ExportServiceBillData } from "@/data/SetupServiceMockData";
import CustomPagination from "@/com/clinic/components/CustomPagination";

const ExportServiceBillPage = () => {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 12;

  useEffect(() => {
    const totalItems = ExportServiceBillData.length;
    const pages = Math.ceil(totalItems / PAGE_SIZE);
    setTotalPages(pages);
  }, []);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  const currentData = ExportServiceBillData.slice(startIndex, endIndex);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleToggleRow = (rowCode: string) => {
    setSelectedRows((prev) =>
      prev.includes(rowCode)
        ? prev.filter((item) => item !== rowCode)
        : [...prev, rowCode],
    );
  };

  const allCurrentSelected =
    currentData.length > 0 &&
    currentData.every((item: any) => selectedRows.includes(item.code));

  const handleToggleSelectAll = () => {
    const currentCodes = currentData.map((item) => item.code);

    if (allCurrentSelected) {
      setSelectedRows((prev) =>
        prev.filter((code) => !currentCodes.includes(code)),
      );
    } else {
      setSelectedRows((prev) => [...new Set([...prev, ...currentCodes])]);
    }
  };

  return (
    <section className="flex flex-col gap-7">
      <Breadcrumbs
        className="font-medium text-base"
        itemClasses={{
          item: "text-blue-700",
          separator: "text-blue-700",
        }}
      >
        <BreadcrumbItem
          onPress={() => {
            router.push(`/payment/list`);
          }}
        >
          Danh sách hoá đơn
        </BreadcrumbItem>
        <BreadcrumbItem> </BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="bordered"
            className="border-slate-300 bg-white shadow-sm"
            onPress={() => router.push(`/payment/list`)}
          >
            <IconChevronLeft />
          </Button>

          <h1>Xuất nhiều hoá đơn dịch vụ</h1>
        </div>

        <Button
          variant="bordered"
          startContent={<IconDownload size={22} />}
          className="border-slate-300 text-base font-bold bg-white shadow-sm"
        >
          Xuất dữ liệu
        </Button>
      </div>

      <Card shadow="none" className="flex flex-col gap-4 mx-auto mt-4 w-full">
        <div className="w-4/5 mx-auto py-12 flex flex-col gap-10">
          <h3>Danh sách khách hàng xuất hoá đơn</h3>

          <Form className="shadow-none border border-gray-400 rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center w-full pt-2 px-2">
              <Input
                startContent={<IconSearch size={16} />}
                placeholder="Tìm theo mã khách hàng hoặc tên khách hàng..."
                className="w-full md:max-w-2/5"
                classNames={{ inputWrapper: "bg-white shadow-none" }}
              />

              <DateRangePicker
                variant="bordered"
                className="w-1/3"
                classNames={{ input: "text-black text   -base" }}
              />
            </div>
            <Table
              aria-label="Services table"
              shadow="none"
              radius="none"
              className="min-w-full"
              classNames={{
                wrapper: "p-0 rounded-none",
                table: "p-0",
              }}
            >
              <TableHeader>
                {ExportServiceBillTable.map((h: any, idx: any) => (
                  <TableColumn
                    key={idx}
                    className={`${h?.className} whitespace-pre-line text-sm text-slate-500 border-b border-slate-300`}
                  >
                    {h.key === "check" ? (
                      <Checkbox
                        size="md"
                        isSelected={allCurrentSelected}
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

              <TableBody>
                {currentData.map((d: any, idx: number) => (
                  <TableRow
                    key={idx}
                    onClick={() => handleToggleRow(d?.code)}
                    className={`hover:cursor-pointer hover:bg-slate-100 border-b border-slate-200 h-12 ${
                      selectedRows.includes(d?.code) ? "bg-slate-100" : ""
                    }`}
                  >
                    <TableCell className="p-1">
                      <Checkbox
                        isSelected={selectedRows.includes(d?.code)}
                        onChange={() => handleToggleRow(d?.code)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>{(currentPage - 1) * 12 + idx + 1}</TableCell>
                    <TableCell>{d?.code}</TableCell>
                    <TableCell className="font-bold">{d?.name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(d?.price, true)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Form>

          {totalPages > 1 && (
            <CustomPagination
              totalPages={totalPages}
              pageNumber={currentPage}
              onPageChange={setCurrentPage}
            />
          )}

          <div className="border-t border-slate-300 pt-4 flex justify-end gap-3">
            <Button
              variant="bordered"
              onPress={() => router.push(`/payment/list`)}
              className="px-13 font-semibold text-base"
            >
              Huỷ
            </Button>
            <Button
              color="primary"
              isDisabled={selectedRows.length === 0}
              className="font-semibold text-base"
            >
              Tạo hoá đơn
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default ExportServiceBillPage;
