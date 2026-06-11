"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/format";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import rest from "@/lib/rest";
import dayjs from "@/lib/dayjs";
import InvoicePreviewModal, {
  type InvoicePreviewData,
} from "@/com/shared/InvoicePreviewModal";
import { numberToVietnameseCurrency } from "@/lib/payment_server";
import { request_status } from "@/data/einvoice";

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

const TableInvoice: React.FC<{ range: string; branch: string }> = ({
  range = "day",
  branch = "all",
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<InvoicePreviewData>({
    seller: { fields: [] },
    buyer: { fields: [] },
    items: [],
  });

  const handleReviewInvoice = (invoice: any) => {
    setPreviewData(buildPreviewData(invoice));
    setIsPreviewOpen(true);
  };

  const buildPreviewData = (invoice: any): InvoicePreviewData => {
    const rawItems = Array.isArray(invoice?.einvoice_items)
      ? invoice.einvoice_items
      : [];

    const items =
      rawItems.length > 0
        ? rawItems.map((item: any) => ({
            name: item?.service_tax_name || "Dịch vụ",
            unit: "dịch vụ",
            quantity: Number(item?.quantity || 0),
            unitPrice: Number(item?.price || 0),
            amountBeforeTax: Number(item?.export_invoice_amount || 0),
            taxRate: item?.is_tax ? item?.vat_rate : "KCT",
            taxAmount: item?.vat_amount || 0,
            totalAmount: Number(item?.amount),
          }))
        : [
            {
              name: invoice?.request_code
                ? `Hoá đơn ${invoice.request_code}`
                : "Hoá đơn dịch vụ",
              unit: "hoá đơn",
              quantity: 1,
              unitPrice: Number(invoice?.total_amount || 0),
              amountBeforeTax: Number(invoice?.total_amount || 0),
              taxRate: 0,
              taxAmount: 0,
              totalAmount: Number(invoice?.total_amount || 0),
            },
          ];
    const objStatus =
      request_status.find((item) => item.key === invoice?.request_status) ||
      null;

    return {
      createdBy: invoice?.user_created?.user_info?.name || "-",
      createdAt: dayjs(invoice?.createdAt).isValid()
        ? dayjs(invoice?.createdAt).format("DD/MM/YYYY")
        : "-",
      status: objStatus?.name || "-",
      invoiceTitle: "HÓA ĐƠN GIÁ TRỊ GIA TĂNG",
      symbol: invoice?.issuer_symbol || "-",
      number: invoice?.e_invoice_number || invoice?.request_code || "-",
      issuedDate: dayjs(invoice?.createdAt).isValid()
        ? `Ngày ${dayjs(invoice.createdAt).format("DD")} tháng ${dayjs(invoice.createdAt).format("MM")} năm ${dayjs(invoice.createdAt).format("YYYY")}`
        : "-",
      seller: {
        fields: [
          { label: "Đơn vị bán hàng", value: invoice?.issuer_name || "-" },
          { label: "Mã số thuế", value: invoice?.issuer_tax_number || "-" },
          { label: "Địa chỉ", value: invoice?.issuer_address || "-" },
        ],
      },
      buyer: {
        fields: [
          {
            label: "Họ tên người mua hàng",
            value: invoice?.customer_name || "-",
          },
          {
            label: "Tên đơn vị",
            value: invoice?.customer_company_name || "Khách lẻ",
          },
          { label: "Mã số thuế", value: invoice?.customer_tax_numner || "-" },
          {
            label: "Căn cước công dân",
            value: invoice?.customer_citizen_id || "-",
          },
          { label: "Địa chỉ", value: invoice?.customer_address || "-" },
          {
            label: "Hình thức thanh toán",
            value: invoice?.payment_method || "-",
          },
          {
            label: "Số tài khoản",
            value:
              invoice?.customer_bank_numner || invoice?.customer_bank_name
                ? `${invoice?.customer_bank_numner || "-"}${invoice?.customer_bank_name ? ` - ${invoice.customer_bank_name}` : ""}`
                : "-",
          },
          { label: "Điện thoại", value: invoice?.customer_phone_number || "-" },
          { label: "Email", value: invoice?.customer_email || "-" },
        ],
      },
      items,
      totalInWords: invoice?.total_amount_after_tax
        ? numberToVietnameseCurrency(Number(invoice?.total_amount_after_tax))
        : "-",
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // truy vấn danh sách các phiếu thu theo khoảng thời gian và chi nhánh
        const params = { range, branch, page };
        const res = await rest.get("/report/operate/invoice", { params });

        if (res?.data || res?.status === 200) {
          setData(res.data?.data || []);
          setPageCount(res.data?.meta?.pagination?.pageCount || 1);
        } else {
          setData([]);
          setPageCount(1);
        }
      } catch {
        setData([]);
        setPageCount(1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range, branch, page]);

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
          <TableColumn>Số • Ký hiệu</TableColumn>
          <TableColumn className="text-center">Mã yêu cầu</TableColumn>
          <TableColumn>Khách hàng</TableColumn>
          <TableColumn className="text-right">Tổng tiền</TableColumn>
          <TableColumn>Trạng thái</TableColumn>
          <TableColumn>Tạo bởi</TableColumn>
        </TableHeader>
        <TableBody>
          <>
            {/* nếu đang loading thì hiển thị skeleton */}
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((d, index) => (
                <TableRow key={index} className="border-b border-default-200">
                  <TableCell>{(page - 1) * 10 + (index + 1)}</TableCell>
                  <TableCell className="font-semibold">
                    <button
                      onClick={() => handleReviewInvoice(d)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="font-semibold text-blue-600">
                        {d?.e_invoice_number || "_"}
                      </span>
                      <span className="text-xs text-default-500">•</span>
                      <span className="text-gray-800">{d?.issuer_symbol}</span>
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleReviewInvoice(d)}
                      className="cursor-pointer hover:text-blue-600 font-semibold text-sm"
                    >
                      {d?.request_code}
                    </button>
                  </TableCell>
                  <TableCell className="text-left">
                    <a
                      href={`/customer/${d?.customer_id}/payment`}
                      className="font-semibold block cursor-pointer hover:text-blue-600 hover:underline"
                    >
                      {d?.customer_name}
                    </a>
                    <span className="text-xs text-gray-600">
                      {d?.customer_code}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(d?.total_amount, true)}
                  </TableCell>
                  <TableCell>
                    {d?.einvoice_status ? (
                      <span className="px-1.5 py-1 border truncate border-blue-200 bg-blue-50 rounded-lg text-blue-500 text-xs font-medium">
                        {d?.einvoice_status?.name || "_"}
                      </span>
                    ) : (
                      <span className="text-gray-600">_</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium truncate">
                      {d.user_created?.user_info?.name}
                    </p>
                    <span className="text-xs text-gray-600 w-full line-clamp-1">
                      {dayjs(d?.createdAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-left text-sm text-gray-700"
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
          href="/payment/list"
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
      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        data={previewData}
      />
    </>
  );
};

export default TableInvoice;
