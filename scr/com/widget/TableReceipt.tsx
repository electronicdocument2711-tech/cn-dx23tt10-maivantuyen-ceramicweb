"use client";
import { CashReceiptPdfButton } from "@/com/shared";
import { useAppContext } from "@/context/AppContext";
import dayjs from "@/lib/dayjs";
import { formatCurrency } from "@/lib/format";
import rest from "@/lib/rest";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { IconChevronRight, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export type OperateReceipt = {
  ReceiptId?: string | number;
  ReceiptCode?: string;
  CustomerId?: string | number;
  CustomerName?: string;
  BranchId?: string | number;
  AddedBy?: string | number;
  AddedAt?: string | number;
  TotalAmount?: string | number;
  Note?: string;
  PaymentMethodName?: string;
};

interface TableReceiptProps {
  range: string;
  branch: string;
  onSelectReceipt?: (receipt: OperateReceipt) => void;
}

const Spinner = () => (
  <div className="flex items-center gap-2 text-gray-600">
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    Đang tải dữ liệu...
  </div>
);

export const ModalDetailReceipt: React.FC<{
  id?: string | number;
  customerId?: string | number;
  onClose: () => void;
}> = ({ id, customerId, onClose }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { branches } = useAppContext();
  const receiptSummary = receipt?.Receipt?.[0];

  const customerInfo = receipt?.Customer;
  const cashReceipt = receipt?.ReceiptDetail?.find(
    (detail: any) => detail.PaymentMethodName === "Cash",
  );
  const currentBranch: any = branches.find(
    (item) =>
      String(item?.BranchId) ===
      String(receiptSummary?.BranchId || receiptSummary?.BranchCode || ""),
  );

  useEffect(() => {
    const fetchReceipt = async () => {
      setLoading(true);
      try {
        const { status, data } = await rest.get(`/payment/${id}`, {
          params: { customerId },
        });

        if (status === 200) setReceipt(data || null);
        else setReceipt(null);
      } catch {
        setReceipt(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      onOpen();
      fetchReceipt();
    }
  }, [id, customerId, onOpen]);

  if (!id || id === "" || !customerId || customerId === "") return null;

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      placement="top"
      isDismissable={false}
    >
      <ModalContent>
        {(handleClose) => (
          <>
            <ModalHeader className="flex items-center justify-between gap-4 border-b border-default-300 py-2 pr-3">
              <>
                <h3>Chi tiết phiếu thu</h3>

                <div className="flex justify-end">
                  <CashReceiptPdfButton
                    data={{
                      amount: cashReceipt?.Amount,
                      branchAddress: [
                        currentBranch?.Address,
                        currentBranch?.District,
                        currentBranch?.Province,
                      ]
                        .filter(Boolean)
                        .join(", "),
                      branchName:
                        currentBranch?.Name || receiptSummary?.BranchName,
                      customerAddress: [
                        customerInfo?.Address,
                        [customerInfo?.DistrictLabe, customerInfo?.DistrictName]
                          .filter(Boolean)
                          .join(" "),
                        [customerInfo?.ProvinceName].filter(Boolean).join(" "),
                      ]
                        .filter(Boolean)
                        .join(", "),
                      customerCode: customerInfo?.CustomerCode,
                      customerName:
                        customerInfo?.FullName ||
                        customerInfo?.CustomerName ||
                        customerInfo?.Name,
                      note: receiptSummary?.Note,
                      receiptCode: receiptSummary?.ReceiptCode || id,
                      receiptDate: receiptSummary?.AddedAt,
                    }}
                  />
                </div>
              </>
              <Button
                isIconOnly
                variant="light"
                radius="full"
                size="sm"
                onPress={() => {
                  onClose();
                  handleClose();
                }}
                className="rounded-full flex items-center justify-center bg-[#F1F3F6]"
              >
                <IconX size={20} className="text-default-600" />
              </Button>
            </ModalHeader>
            <ModalBody className="py-6">
              <ul className="border border-default-300 rounded-xl divide-y divide-default-300 mb-3 font-medium">
                <li className="p-3 flex justify-between items-center">
                  Tiền mặt
                  {loading ? (
                    <Skeleton className="w-20 h-5 rounded bg-default-200" />
                  ) : (
                    <span className="font-semibold">
                      {
                        //find in ReceiptDetail array the item with PaymentMethodName === 'Cash'
                        formatCurrency(
                          receipt?.ReceiptDetail?.find(
                            (d: any) => d.PaymentMethodName === "Cash",
                          )?.Amount || 0,
                        )
                      }
                    </span>
                  )}
                </li>
                <li className="p-3 flex justify-between items-center">
                  Cà thẻ
                  {loading ? (
                    <Skeleton className="w-30 h-5 rounded bg-default-200" />
                  ) : (
                    <span className="font-semibold">
                      {formatCurrency(
                        receipt?.ReceiptDetail?.find(
                          (d: any) => d.PaymentMethodName === "POS",
                        )?.Amount || 0,
                      )}
                    </span>
                  )}
                </li>
                <li className="p-3 flex justify-between items-center">
                  Chuyển khoản
                  {loading ? (
                    <Skeleton className="w-15 h-5 rounded bg-default-200" />
                  ) : (
                    <span className="font-semibold">
                      {formatCurrency(
                        receipt?.ReceiptDetail?.find(
                          (d: any) => d.PaymentMethodName === "Banking",
                        )?.Amount || 0,
                      )}
                    </span>
                  )}
                </li>
                <li className="p-3 flex justify-between items-center bg-default-200 rounded-b-xl">
                  <span className="text-lg text-blue-700 font-semibold">
                    Tổng tiền
                  </span>
                  {loading ? (
                    <Skeleton className="w-20 h-5 rounded bg-default-200" />
                  ) : (
                    <span className="font-bold text-blue-700 text-lg">
                      {formatCurrency(receipt?.Receipt?.[0]?.FinalAmount || 0)}
                    </span>
                  )}
                </li>
              </ul>
              <div>
                <p className="font-semibold mb-1 ml-1">Nội dung</p>
                <p className="text-gray-700 p-2 border rounded-lg border-default-200 h-12 text-sm bg-default-50">
                  {receipt?.Receipt?.[0]?.Note}
                </p>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const TableReceipt: React.FC<TableReceiptProps> = ({
  range = "day",
  branch = "all",
  // onSelectReceipt,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const { staffs, branches } = useAppContext();
  const [receipt, setReceipt] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // truy vấn danh sách các phiếu thu theo khoảng thời gian và chi nhánh
        const params = { range, branch };
        const res = await rest.get("/report/operate/receipt", { params });

        if (res?.data || res?.status === 200) {
          setData(res.data?.data || []);
          setPageCount(res.data?.data?.meta?.pagination?.pageCount || 1);
        } else {
          setData([]);
        }
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range, branch, page]);

  const staffName = (id: string): string =>
    staffs.find((s) => s?.users?.some((u) => u.id == id))?.name || "_";

  const branchName = (id: string): string =>
    branches.find((b) => b?.BranchId == id)?.Name || "_";

  return (
    <>
      <Table
        className="my-2"
        classNames={{
          th: "h-auto p-2",
          td: "px-2",
          wrapper: "p-2 shadow-none border border-default-200",
          tbody: "last-row-no-border",
        }}
      >
        <TableHeader>
          <TableColumn className="w-8">#</TableColumn>
          <TableColumn>Mã</TableColumn>
          <TableColumn>Khách hàng | Chi nhánh</TableColumn>
          <TableColumn>Tạo bởi</TableColumn>
          <TableColumn className="text-right">Số tiền</TableColumn>
          <TableColumn className="max-w-[180px]">Nội dung</TableColumn>
        </TableHeader>
        <TableBody>
          <>
            {/* nếu đang loading thì hiển thị skeleton */}
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((item: OperateReceipt, index) => (
                <TableRow key={index} className="border-b border-default-200">
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="font-semibold">
                    <Tooltip content="Xem chi tiết" delay={500}>
                      <button
                        type="button"
                        className="hover:text-primary hover:underline"
                        onClick={() => setReceipt(item)}
                      >
                        {item?.ReceiptCode}
                      </button>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/customer/${item?.CustomerId}`}
                      className="hover:text-blue-600 hover:underline block font-semibold"
                    >
                      {item?.CustomerName}
                    </Link>
                    <span className="text-xs text-gray-700">
                      {branchName(String(item?.BranchId ?? ""))}
                    </span>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium">
                      {staffName(String(item?.AddedBy ?? ""))}
                    </p>
                    <span className="text-xs text-gray-700">
                      {dayjs
                        .unix(Number(item?.AddedAt ?? 0))
                        .format("DD/MM/YYYY HH:mm")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(item?.TotalAmount)}
                  </TableCell>
                  <TableCell className="text-gray-700 text-sm max-w-[180px]">
                    <span className="truncate w-full line-clamp-1">
                      {item?.Note}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-left text-gray-700 text-sm"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </>
        </TableBody>
      </Table>
      <div className="flex justify-between items-center">
        <Link
          className="py-1.5 text-sm px-4 w-fit rounded-lg hover:bg-sky-50 text-default-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          href="/report/receipt"
        >
          Xem tất cả
          <IconChevronRight size={16} />
        </Link>
        {pageCount > 1 && (
          <div>
            <Pagination
              size="sm"
              showControls
              disableCursorAnimation
              initialPage={1}
              total={pageCount}
              onChange={(newPage) => setPage(newPage)}
              classNames={{ item: "font-semibold text-sm" }}
            />
          </div>
        )}
      </div>
      <ModalDetailReceipt
        id={receipt?.ReceiptId}
        customerId={receipt?.CustomerId}
        onClose={() => setReceipt(null)}
      />
    </>
  );
};

export default TableReceipt;
