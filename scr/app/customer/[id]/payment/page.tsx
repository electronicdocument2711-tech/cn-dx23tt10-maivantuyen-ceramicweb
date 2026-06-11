"use client";

import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  DateRangePicker,
  Input,
  Select,
  SelectItem,
  SelectSection,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import React, { useCallback, useEffect, useState } from "react";
import {
  IconCalendarEventFilled,
  IconSearch,
  IconX,
} from "@tabler/icons-react";

import { formatCurrency } from "@/lib/format";
import CustomPagination from "@/com/clinic/components/CustomPagination";
import ExportBillingInfoButton from "@/com/customer/payment/ExportBillingInfoButton";
import { useParams } from "next/navigation";
import rest from "@/lib/rest";
import dayjs from "dayjs";
import { useCustomerContext } from "@/context/CustomerContext";
import { useDebounce } from "@/hook/useDebounce";
import { getErrorMessage } from "@/lib/utils";
import Link from "next/link";
import RequestStatus from "@/com/invoice/RequestStatus";
import { providers, request_status } from "@/data/einvoice";
import { numberToVietnameseCurrency } from "@/lib/payment_server";
import InvoicePreviewModal, {
  InvoicePreviewData,
} from "@/com/shared/InvoicePreviewModal";
import InvoiceActionDropdown from "../../../../com/shared/InvoiceActionDropdown";

const Headers = [
  { key: "id", display: "#" },
  { key: "number", display: "Số/Ký hiệu", className: "w-1/9" },
  { key: "require", display: "Mã yêu cầu" },
  { key: "total", display: "Tổng tiền" },
  { key: "state", display: "Trạng thái HĐ" },
  { key: "create", display: "Tạo bởi", className: "w-1/10" },
  { key: "approve", display: "Phê duyệt nội bộ", className: "text-center" },
  { key: "action", display: "" },
];

const CustomerPaymentPage = () => {
  const { customer } = useCustomerContext();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [getLoading, setGetLoading] = useState(false);

  const PAGE_SIZE = 12;

  const params = useParams();
  const customerId = params.id as string;
  const [einvoiceDatas, setEinvoiceDatas] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [statusloading, setStatusLoading] = useState(false);

  const [dateRange, setDateRange] = useState<{ start: any; end: any } | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchEinvoice = useCallback(
    async (
      page = currentPage || 1,
      search = debouncedSearch,
      status = selectedStatus,
      date = dateRange,
    ) => {
      try {
        setGetLoading(true);

        const res = await rest.get(`/einvoice/customer/${customerId}`, {
          params: {
            page: page.toString(),
            limit: PAGE_SIZE.toString(),
            search,
            status,
            dateFrom: date?.start ? dayjs(date.start).format("YYYY-MM-DD") : "",
            dateTo: date?.end ? dayjs(date.end).format("YYYY-MM-DD") : "",
          },
        });

        if (res.status !== 200) {
          throw new Error("Bước lấy data bị lỗi.");
        }

        setEinvoiceDatas(res?.data?.data || []);
        setTotalPages(res.data.meta.pagination.pageCount);
      } catch (err) {
        addToast({
          title: "Thất bại",
          description: getErrorMessage(err, "Lấy thông tin hóa đơn bị lỗi"),
          color: "warning",
        });
      } finally {
        setGetLoading(false);
      }
    },
    [currentPage, customerId, dateRange, debouncedSearch, selectedStatus],
  );

  const [triggerRefresh, setTriggerRefresh] = useState(0);

  useEffect(() => {
    fetchEinvoice(currentPage, debouncedSearch, selectedStatus, dateRange);
  }, [currentPage, debouncedSearch, selectedStatus, dateRange, fetchEinvoice]);

  const handleChangeRequestStatus = async (item: any, status: string) => {
    try {
      if (!status || !item?.documentId)
        throw new Error("Bước cập nhật trạng thái bị lỗi.");

      const res = await rest.put(`/einvoice/${item.documentId}`, { status });
      if (res.status !== 200)
        throw new Error("Bước cập nhật trạng thái bị lỗi.");

      setEinvoiceDatas((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, request_status: status } : i,
        ),
      );

      addToast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái hóa đơn",
        color: "success",
      });

      setTriggerRefresh((prev) => prev + 1);
    } catch (err) {
      addToast({
        title: "Thất bại",
        description: getErrorMessage(
          err,
          "Cập nhật trạng thái hóa đơn thất bại",
        ),
        color: "warning",
      });
    }
  };

  const fetchStatuses = async () => {
    try {
      setStatusLoading(true);
      const res = await rest.get(`/einvoice-status`);

      setStatuses(res.data.data);
    } catch (err) {
      setStatuses([]);
      addToast({
        title: "Thất bại",
        description: getErrorMessage(err, "Lấy trạng thái hóa đơn thất bại"),
        color: "warning",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [triggerRefresh]);

  // ---------------------------------------------------------------
  // Group data label Select
  const groupStatuses = statuses.reduce(
    (acc, item) => {
      const statusType = item?.status_type || "Không xác định";
      const label = statusType === "request" ? "Yêu cầu" : "Hóa đơn";

      if (!acc[label]) {
        acc[label] = [];
      }

      acc[label].push(item);
      return acc;
    },
    {} as Record<string, typeof einvoiceDatas>,
  );

  // ---------------------------------------------------------------
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [previewData, setPreviewData] = useState<InvoicePreviewData>({
    seller: { fields: [] },
    buyer: { fields: [] },
    items: [],
  });

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
            amountBeforeTax: item?.export_invoice_amount,
            taxRate: item?.is_tax ? Number(item?.vat_rate || 0) : "KCT",
            taxAmount: item?.vat_amount,
            totalAmount: item?.amount,
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

  const handleReviewInvoice = (invoice: any) => {
    setPreviewData(buildPreviewData(invoice));
    setIsPreviewOpen(true);
  };

  const isReady = (d: any) => {
    const statuses =
      providers.find((p) => p.id === d?.einvoice_provider?.id)
        ?.ready_statuses || [];

    return statuses.includes(d?.einvoice_status?.provider_status_id);
  };

  return (
    <div className="w-full contaier flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-xl font-bold">Hoá đơn</h2>
        <div className="flex gap-3">
          <ExportBillingInfoButton customerId={customerId} />

          <Link
            href={`/payment/list/servicebill/?code=${encodeURIComponent(customer?.CustomerCode || "")}&customer=${encodeURIComponent(customerId)}`}
          >
            <Button color="primary" className="text-base">
              Xuất hoá đơn
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full flex gap-3 justify-end">
        <DateRangePicker
          aria-label="Date Range Picker"
          variant="bordered"
          endContent={
            <div className="flex gap-2">
              {dateRange ? (
                <Button
                  isIconOnly
                  onPress={() => setDateRange(null)}
                  variant="light"
                >
                  <IconX size={20} className="text-slate-400" />
                </Button>
              ) : (
                <IconCalendarEventFilled size={20} className="text-gray-600" />
              )}
            </div>
          }
          value={dateRange}
          onChange={(range) => {
            setDateRange(range);
            setCurrentPage(1);
          }}
          fullWidth={false}
          classNames={{
            base: "min-w-60",
            inputWrapper: "border-default-400 bg-white",
            innerWrapper: "text-blue-800",
            input: "font-bold",
          }}
        />

        <Select
          aria-label="Chọn trạng thái"
          placeholder="Trạng thái"
          variant="bordered"
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setSelectedStatus(selected === "all" ? "" : selected);
            setCurrentPage(1);
          }}
          isLoading={statusloading}
          fullWidth={false}
          classNames={{
            base: "min-w-55",
            trigger: "border-default-400 bg-white",
            innerWrapper: "text-blue-800 font-bold",
            value: "font-bold",
          }}
        >
          <SelectSection aria-label="all">
            <SelectItem key="all">Chọn tất cả</SelectItem>
          </SelectSection>

          <>
            {(Object.entries(groupStatuses) as [string, any[]][])
              .sort(([a]) => (a === "Yêu cầu" ? -1 : 1))
              .map(([type, items]) => (
                <SelectSection
                  key={type}
                  title={type}
                  classNames={{
                    heading: "text-gray-600 ",
                  }}
                >
                  {items.map((i) => (
                    <SelectItem key={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectSection>
              ))}
          </>
        </Select>
      </div>

      <Card className="shadow-none border border-gray-400">
        <CardHeader className="flex flex-col md:flex-row gap-3 justify-between">
          <Input
            aria-label="Search Input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            startContent={<IconSearch size={16} />}
            placeholder="Tìm số hoá đơn hoặc ký hiệu"
            className="w-full md:max-w-2/5"
            classNames={{
              inputWrapper: "bg-white shadow-none",
              input: "ml-3",
            }}
          />
        </CardHeader>

        <CardBody className="p-0">
          <Table
            shadow="none"
            radius="none"
            maxTableHeight={1000}
            aria-label="Service Table"
            className="w-full"
            classNames={{ wrapper: "p-0 rounded-none", table: "p-0" }}
          >
            <TableHeader>
              {Headers.map((h: any, idx: any) => (
                <TableColumn
                  key={idx}
                  className={`${h?.className} ${h?.key === "number" ? "w-1/15" : ""} text-sm text-slate-500 py-2`}
                >
                  {h.display}
                </TableColumn>
              ))}
            </TableHeader>

            <TableBody
              isLoading={getLoading}
              loadingContent={
                <Spinner color="primary" label="Đang tải dữ liệu..." />
              }
              emptyContent={
                getLoading ? " " : "Không tìm thấy dữ liệu hóa đơn nào."
              }
            >
              {einvoiceDatas.map((d, idx) => (
                <TableRow
                  key={idx}
                  className="hover:bg-slate-100 border-b border-slate-200"
                >
                  <TableCell className="w-6">
                    {idx + 1 + (currentPage - 1) * 12}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{d?.e_invoice_number || "_"}</p>
                    <span className="text-gray-600">{d?.issuer_symbol}</span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleReviewInvoice(d)}
                      className="cursor-pointer hover:text-blue-600 font-semibold text-sm"
                    >
                      {d?.request_code}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
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

                  <TableCell className="text-right">
                    <RequestStatus
                      status={d?.request_status}
                      onChange={(status: string) =>
                        handleChangeRequestStatus(d, status)
                      }
                      isLocked={d?.einvoice_status || false}
                    />
                  </TableCell>
                  <TableCell className="w-8">
                    <InvoiceActionDropdown
                      invoice={d}
                      isReady={isReady(d)}
                      onReview={() => handleReviewInvoice(d)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {totalPages > 1 && (
        <CustomPagination
          totalPages={totalPages}
          pageNumber={currentPage}
          onPageChange={setCurrentPage}
        />
      )}

      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        data={previewData}
        onDownload={() => {
          addToast({
            title: "Tính năng đang phát triển",
            description: "Tải file PDF sẽ được hỗ trợ ở bước tiếp theo.",
            color: "primary",
          });
        }}
      />
    </div>
  );
};

export default CustomerPaymentPage;
