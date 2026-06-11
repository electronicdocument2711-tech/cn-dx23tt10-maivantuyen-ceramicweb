"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";

import {
  IconAlertTriangleFilled,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";

import { SetupServiceHeaders } from "@/data/headers";
import { useRouter } from "next/navigation";
import CustomPagination from "@/com/clinic/components/CustomPagination";
import rest from "@/lib/rest";
import { prop } from "remeda";
import Image from "next/image";
import dayjs from "dayjs";
import { useDebounce } from "@/hook/useDebounce";
import { displayTax } from "@/lib/utils";

const PAGE_SIZE = 12;
const taxOptions = [
  { key: "all", label: "Tất cả" },
  { key: "-1", label: "KCT" },
  { key: "0", label: "0%" },
  { key: "5", label: "5%" },
  { key: "8", label: "8%" },
  { key: "10", label: "10%" },
];
interface IQueryRef {
  tax: string | null;
  search: string;
}
const ServicePage = () => {
  const router = useRouter();
  const queryRef = useRef<IQueryRef>({
    tax: null,
    search: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [selectedTax, setSelectedTax] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const searchDebounce = useDebounce(search, 500);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        let page = currentPage || 1;

        if (
          queryRef?.current?.tax !== selectedTax ||
          queryRef?.current?.search !== searchDebounce
        ) {
          page = 1;
        }

        const res = await rest.get("/service/einvoice-service", {
          params: {
            lmstart: (page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            tax: selectedTax || "all",
            query: searchDebounce || "",
          },
        });
        setData(prop(res, ...["data", "data"]) || []);

        const totalRecord = Number(
          prop(res, ...["data", "pagination", "totalRecord"]) || 0,
        );

        const limit = Number(
          prop(res, ...["data", "pagination", "limit"]) || PAGE_SIZE,
        );

        setTotalPages(Math.ceil(totalRecord / limit));
        queryRef.current = {
          tax: selectedTax,
          search: searchDebounce,
        };
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentPage, trigger, selectedTax, searchDebounce]);

  const renderContent = () => {
    if (isError) {
      return (
        <div className="min-h-96 flex-col flex items-center gap-3 justify-center">
          <p className="text-center text-sm text-danger">
            Đã có lỗi xảy ra, xin vui lòng thử lại
          </p>
          <Button
            size="sm"
            color="danger"
            onPress={() => setTrigger((prev) => prev + 1)}
          >
            Thử lại
          </Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="min-h-96 flex items-center justify-center">
          <Spinner color="primary" size="lg" />
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="min-h-96 flex-col flex items-center gap-4 justify-center">
          <Image
            src="/image/undraw_no-data.svg"
            width={300}
            height={300}
            alt="Blank"
            className="size-30 opacity-60"
          />
          <p className="text-center text-sm text-gray-600">Không có dữ liệu</p>
        </div>
      );
    }

    return (
      <div className="lg:block">
        <Table
          shadow="none"
          radius="none"
          maxTableHeight={1000}
          aria-label="Service Table"
          className="min-w-full min-h-96"
          classNames={{
            th: "bg-slate-100 border-b border-b-gray-400 text-sm font-medium text-default-500 px-2 py-1 h-auto",
            tr: "border-slate-200 border-b hover:bg-gray-50",
            wrapper: "p-0 rounded-none",
            table: "p-0 border-t border-gray-400",
            td: "px-2 text-base",
            tbody: "last-row-no-border",
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
            {data?.map((d: any, idx) => {
              const tax = Number(d?.TaxPercent);
              const isTax = Number(d?.IsTax) === 1;
              const startDate = dayjs(d?.StartDate, "YYYY-MM-DD");
              const endDate = dayjs(d?.EndDate, "YYYY-MM-DD");
              const isExpired = endDate.isBefore(dayjs(), "day");
              const renderEndDate = endDate?.isValid()
                ? endDate.format("DD/MM/YYYY")
                : !startDate?.isValid()
                  ? "Chưa xác định"
                  : dayjs().isAfter(startDate, "day")
                    ? "Hiện tại"
                    : "Chưa xác định";

              return (
                <TableRow
                  key={d?.ServiceId}
                  className={`hover:cursor-pointer hover:bg-slate-100 border-b border-slate-200`}
                >
                  <TableCell>{idx + 1 + (currentPage - 1) * 12}</TableCell>
                  <TableCell>{d?.ServiceName}</TableCell>
                  <TableCell>{d?.ServiceTaxName}</TableCell>
                  <TableCell>{d?.ServiceCode}</TableCell>
                  <TableCell className="text-center">{d?.Unit}</TableCell>
                  <TableCell className="text-center">
                    {displayTax(isTax, tax)}
                  </TableCell>
                  <TableCell className={` ${isExpired ? "text-red-700" : ""}`}>
                    <span className="inline-flex items-center gap-2">
                      {startDate?.isValid()
                        ? startDate.format("DD/MM/YYYY")
                        : "Chưa xác định"}{" "}
                      - {renderEndDate}
                      {isExpired && <IconAlertTriangleFilled size={18} />}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="bordered"
                      endContent={<IconChevronRight size={15} color="gray" />}
                      onPress={() =>
                        router.push(`/payment/service/${d?.ServiceId}`)
                      }
                      className="p-2 pl-3 pr-2 border-1 border-slate-300"
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };
  return (
    <section className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Thiết lập dịch vụ</h1>
      </div>

      <Card className="shadow-none border border-gray-400">
        <CardHeader className="flex flex-col md:flex-row gap-3 justify-between">
          <Input
            startContent={<IconSearch size={16} />}
            placeholder="Tìm dịch vụ"
            className="w-full md:max-w-2/5"
            classNames={{ inputWrapper: "bg-white shadow-none" }}
            onChange={(e) => setSearch(e?.target?.value)}
          />

          <div className="flex gap-3 w-1/7">
            <Select
              variant="bordered"
              aria-label="State Selector"
              placeholder="Mức thuế suất"
              selectedKeys={[...(selectedTax ? [selectedTax] : [])]}
              onSelectionChange={(key) => {
                setSelectedTax(key?.currentKey ?? null);
              }}
            >
              {taxOptions.map((tax) => (
                <SelectItem key={tax?.key}>{tax?.label}</SelectItem>
              ))}
            </Select>
          </div>
        </CardHeader>

        <CardBody className="p-0">{renderContent()}</CardBody>
      </Card>

      {totalPages > 1 && (
        <CustomPagination
          totalPages={totalPages}
          pageNumber={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
};

export default ServicePage;
