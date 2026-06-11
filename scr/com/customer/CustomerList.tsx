"use client";
import { unauthorized, useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Table,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  Pagination,
  Spinner,
} from "@heroui/react";
import { IconSearch } from "../icons/regular";
import { useCallback, useEffect, useState } from "react";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // load on demand
import "dayjs/locale/vi"; // load locale
import { formatCurrency } from "@/lib/format";
dayjs.locale("vi"); // use locale globally
dayjs.extend(relativeTime); // use plugin

export default function CustomerList({ trigger }: { trigger: number }) {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || 1;
  const search = searchParams.get("search") || "";

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      await rest
        .get("/customer", {
          params: {
            page,
            search,
          },
        })
        .then((value: any) => {
          setData(value.data);
        })
        .catch((error) => {
          if (error.response.status === 401) {
            unauthorized();
          }
          setData({
            customers: [],
            pagination: {
              currentPage: 1,
              limit: 20,
              totalPages: 1,
              totalItems: 0,
            },
          });
          setError(getErrorMessage(error, "Đã có lỗi xảy ra"));
        })
        .finally(() => {
          setLoading(false);
        });
    };
    fetchCustomers();
  }, [searchParams, trigger]);

  const [data, setData] = useState<{
    customers: any[];
    pagination: {
      currentPage: number;
      limit: number;
      totalPages: number;
      totalItems: number;
    };
  }>({
    customers: [],
    pagination: {
      currentPage: 1,
      limit: 20,
      totalPages: 1,
      totalItems: 0,
    },
  });

  const router = useRouter();
  const [value, setValue] = useState(search);

  const handleParams = useCallback((searchVal: string, pageVal: number) => {
    router.push(
      `/customer?page=${pageVal}${searchVal ? `&search=${searchVal}` : ""}`,
    );
  }, []);

  const handleCustomerClick = (customerId: string) => {
    router.push(`/customer/${customerId}`);
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "—";

    const timestampNumber = Number(timestamp);

    if (isNaN(timestampNumber)) {
      return "—";
    }

    const date = dayjs.unix(timestampNumber);

    if (!date.isValid()) {
      return "—";
    }

    return date.fromNow();
  };

  useEffect(() => {
    if (!value) return;
    const t = setTimeout(() => {
      handleParams(value.trim(), 1);
    }, 500);
    return () => clearTimeout(t);
  }, [value, handleParams]);

  return (
    <>
      <Card className="shadow-none border border-gray-400">
        <CardHeader className="py-2">
          <Input
            startContent={<IconSearch size={20} />}
            placeholder="Tìm theo tên, mã, số phone"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full md:max-w-2/5"
            classNames={{ inputWrapper: "bg-white shadow-none" }}
          />
        </CardHeader>

        <CardBody className="p-0">
          <Table
            layout="fixed"
            aria-label="Customers table"
            shadow="none"
            radius="none"
            className="w-full"
            classNames={{
              th: "bg-slate-100 border-b border-b-gray-400 text-sm font-medium text-default-500 px-2 py-1 h-auto",
              tr: "border-slate-200 border-b hover:bg-gray-50",
              wrapper: "p-0 rounded-none",
              table: "p-0 border-t border-gray-400 min-w-4xl",
              td: "px-2 text-base",
              tbody: "last-row-no-border",
            }}
          >
            <TableHeader>
              <TableColumn className="w-12" align="center">
                #
              </TableColumn>
              <TableColumn align="start">Họ Tên</TableColumn>
              <TableColumn align="start" className="w-40">
                Mã
              </TableColumn>
              <TableColumn align="center" className="w-16">
                Giới tính
              </TableColumn>
              <TableColumn align="center" className="w-16">
                Tuổi
              </TableColumn>
              <TableColumn align="end">Thanh toán</TableColumn>
              <TableColumn align="start">Lịch hẹn cuối</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                error ? (
                  <span className="text-default-500">{error}</span>
                ) : (
                  "Không có dữ liệu khách hàng"
                )
              }
              isLoading={loading}
              loadingContent={
                <div className="w-full min-h-96 flex justify-center items-center">
                  <Spinner size="sm" color="default" />
                </div>
              }
            >
              {data.customers.map((customer: any, idx: number) => (
                <TableRow
                  key={customer.CustomerId}
                  onClick={() => handleCustomerClick(customer.CustomerId)}
                  className="hover:cursor-pointer"
                >
                  <TableCell>
                    {idx +
                      1 +
                      (data.pagination.currentPage - 1) * data.pagination.limit}
                  </TableCell>
                  <TableCell
                    className="font-semibold cursor-pointer hover:text-blue-600 hover:underline"
                    onClick={() => handleCustomerClick(customer.CustomerId)}
                  >
                    <span className="truncate">{customer.FullName}</span>
                  </TableCell>
                  <TableCell>{customer.CustomerCode}</TableCell>
                  <TableCell>
                    {customer.Gender === "1" ? "Nam" : "Nữ"}
                  </TableCell>
                  <TableCell>
                    {dayjs().diff(dayjs(customer.Birthday), "year")}
                  </TableCell>
                  <TableCell>
                    {isNaN(parseInt(customer?.PaidAmount))
                      ? "—"
                      : formatCurrency(customer?.PaidAmount)}
                  </TableCell>
                  <TableCell>
                    <span className="text-default-500 text-sm">
                      {formatTimestamp(customer?.LatestStartAt)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* hide pagination if only one page */}
          {data.pagination.totalPages > 1 && (
            <div className="shrink-0  p-10 flex justify-center">
              <Pagination
                variant="light"
                radius="full"
                color="default"
                page={data.pagination.currentPage}
                boundaries={1}
                dotsJump={5}
                siblings={1}
                total={data.pagination.totalPages}
                onChange={(currentPage) => handleParams(value, currentPage)}
                showControls
              />
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
