"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  DropdownItem,
  DropdownTrigger,
  DropdownMenu,
  addToast,
} from "@heroui/react";
import {
  IconChevronDown,
  IconSearch,
  IconSettingsBolt,
} from "@tabler/icons-react";
import CreateSetupButton from "@/com/payment/CreateSetupButton";
import { useDebounce } from "@/hook/useDebounce";
import rest from "@/lib/rest";
import { useRouter } from "next/navigation";
import CustomPagination from "@/com/clinic/components/CustomPagination";
import { useConfirm } from "@/com/ConfirmProvider";
import { useAppContext } from "@/context";

export const Headers = [
  { key: "id", display: "#" },
  { key: "comp", display: "Chủ thể | Địa chỉ" },
  { key: "tax", display: "Mã số thuế" },
  { key: "email", display: "Email | Fax" },
  { key: "mobile", display: "Số phone" },
  { key: "bank", display: "Ngân hàng" },
  { key: "state", display: "Trạng thái" },
];

const BillPage = () => {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const { confirm } = useConfirm();
  const { business, me } = useAppContext();

  const PAGE_SIZE = 12;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // -----------------------------------------------
  const [isMounted, setIsMounted] = useState(false);

  const isOwner = useMemo(() => {
    return business?.owner?.documentId === me?.user_info?.documentId;
  }, [business, me]);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  // -----------------------------------------------

  const fetchInvoices = useCallback(
    async (page = currentPage || 1, search = debouncedSearchTerm) => {
      try {
        setLoading(true);

        const res = await rest.get(`/clinic-invoice-config`, {
          params: {
            page: page.toString(),
            limit: PAGE_SIZE.toString(),
            status,
            search,
          },
        });

        if (res.status !== 200)
          throw new Error("Tải thông tin thiết lập hóa đơn thất bại");

        setData(res.data.data || []);
        setTotalPages(res.data.meta.pagination.pageCount);

        return res;
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, debouncedSearchTerm],
  );

  useEffect(() => {
    if (isMounted) {
      fetchInvoices(currentPage, debouncedSearchTerm);
    }
  }, [currentPage, debouncedSearchTerm, isMounted]);

  const handleRefresh = useCallback(() => {
    fetchInvoices(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  const handleDelete = async (documentId: string) => {
    if (!documentId) return;
    try {
      const isConfirmed = await confirm({
        title: "Xác nhận xóa",
        message:
          "Bạn muốn xóa chủ thể xuất hóa đơn này? Việc này không ảnh hưởng tới các hóa đơn đã xuất.",
      });

      if (isConfirmed) {
        const res = await rest.delete(`/clinic-invoice-config/${documentId}`);
        if (res.status === 200) {
          fetchInvoices(currentPage, debouncedSearchTerm);
          addToast({
            title: "Xong",
            description: "Đã xóa chủ thể xuất hóa đơn.",
            color: "success",
          });
        }
      }
    } catch {}
  };

  const handleStateChange = async (documentId: string, newState: string) => {
    if (!documentId) return;
    try {
      const newStateName = newState === "1" ? "Bật" : "Tắt";

      const isConfirmed = await confirm({
        title: "Đổi trạng thái",
        message: `Bạn muốn **${newStateName}** chủ thể xuất hóa đơn này? Việc này không ảnh hưởng tới các hóa đơn đã xuất.`,
        hideCancel: true,
      });

      if (isConfirmed) {
        const res = await rest.patch(`/clinic-invoice-config/${documentId}`, {
          state: newState,
        });
        if (res.status === 200) {
          fetchInvoices(currentPage, debouncedSearchTerm);
          addToast({
            title: "Xong",
            description: `Trạng thái chủ thể xuất hóa đơn đã được đổi thành ${newStateName}.`,
            color: "success",
          });
        }
      }
    } catch {}
  };

  return (
    <section className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Chủ thể xuất hóa đơn</h1>
        <div className="flex gap-2">
          <Button
            variant="bordered"
            className="bg-white border-slate-300 font-semibold pl-2 pr-4"
            onPress={() => router.push("/payment/bill/autosetting")}
          >
            <IconSettingsBolt size={18} className="shrink-0" /> Thiết lập chạy
            tự động
          </Button>

          <div className="w-2/5">
            <CreateSetupButton onRefresh={handleRefresh} />
          </div>
        </div>
      </div>

      <Card className="shadow-none border border-gray-400">
        <CardHeader className="flex flex-col md:flex-row gap-3 justify-between">
          <Input
            startContent={<IconSearch size={20} />}
            placeholder="Tìm theo tên chủ thể"
            className="w-full md:max-w-2/5"
            classNames={{ inputWrapper: "bg-white shadow-none" }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className="flex gap-3 w-2/6"></div>
        </CardHeader>

        <CardBody className="p-0">
          <div className="lg:block">
            <Table
              aria-label="Services table"
              shadow="none"
              radius="none"
              className="min-w-full"
              classNames={{ wrapper: "p-0 rounded-none", table: "p-0" }}
            >
              <TableHeader>
                {Headers.map((h: any, idx: any) => (
                  <TableColumn
                    key={idx}
                    className={`${h?.className} text-sm text-slate-500 py-2`}
                  >
                    {h.display}
                  </TableColumn>
                ))}
              </TableHeader>

              <TableBody
                emptyContent={loading ? "Đang tải..." : "Không có dữ liệu"}
                isLoading={loading}
              >
                {data.map((a: any, idx: number) => (
                  <TableRow
                    key={idx}
                    className={`hover:cursor-pointer hover:bg-slate-100 ${idx < 11 ? "border-b border-slate-200" : ""}`}
                  >
                    <TableCell>{(currentPage - 1) * 12 + idx + 1}</TableCell>
                    <TableCell>
                      <a className="font-semibold block text-base" href="">
                        {a?.company_name}
                      </a>
                      <span className="text-sm text-gray-700">
                        {a?.company_address}
                      </span>
                    </TableCell>

                    <TableCell className="font-semibold text-base">
                      {a?.tax_number}
                    </TableCell>
                    <TableCell>
                      {a?.email_address}
                      <br />
                      {a?.fax}
                    </TableCell>
                    <TableCell>{a?.phone}</TableCell>
                    <TableCell>
                      <p className="font-semibold block text-base">
                        {a?.bank_number}
                      </p>
                      <span className="text-sm text-gray-700">
                        {a?.bank_name}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <ButtonGroup>
                        {a?.state !== null && (
                          <button
                            className={`px-2 py-0.5 border border-slate-200 text-sm font-medium ${isOwner ? "rounded-l-md" : "rounded-md"} ${a?.state ? "bg-green-100 text-green-700" : "bg-gray-50 text-gray-700"}`}
                          >
                            {a.state === 1 ? "Bật" : "Tắt"}
                          </button>
                        )}
                        {isOwner && (
                          <Dropdown>
                            <DropdownTrigger>
                              <button className="bg-white border border-slate-200 border-l-0 rounded-r-md p-1 cursor-pointer">
                                <IconChevronDown size={16} />
                              </button>
                            </DropdownTrigger>
                            <DropdownMenu
                              onAction={async (key) => {
                                if (key === "delete")
                                  await handleDelete(a?.documentId);
                                else if (key === "state")
                                  await handleStateChange(
                                    a?.documentId,
                                    a?.state === 1 ? "0" : "1",
                                  );
                              }}
                            >
                              <DropdownItem key="state">
                                {a?.state ? "Tắt" : "Bật"}
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-red-500 hover:!text-red-600 hover:!bg-red-50"
                              >
                                Xóa
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
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

export default BillPage;
