"use client";

import { useCallback, useMemo, useRef, useState, type FC } from "react";
import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { IconDownload } from "@tabler/icons-react";
import cn from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { exportElementToA4Pdf, sanitizePdfFileName } from "@/lib/pdf";

export interface InvoicePreviewField {
  label: string;
  value?: string;
}

export interface InvoicePreviewItem {
  name: string;
  unit?: string;
  quantity?: number | string;
  unitPrice?: number;
  amountBeforeTax?: number;
  taxRate?: number | string;
  taxAmount?: number;
  totalAmount?: number;
}

export interface InvoicePreviewParty {
  fields: InvoicePreviewField[];
}

export interface InvoicePreviewData {
  createdBy?: string;
  createdAt?: string;
  status?: string;
  invoiceTitle?: string;
  symbol?: string;
  number?: string;
  requestCode?: string;
  issuedDate?: string;
  seller: InvoicePreviewParty;
  buyer: InvoicePreviewParty;
  items: InvoicePreviewItem[];
  totalInWords?: string;
  footerNote?: string;
}

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  data: InvoicePreviewData;
  onDownload?: () => void | Promise<void>;
  showMetaHeader?: boolean;
}

const DEFAULT_INVOICE_TITLE = "HÓA ĐƠN GIÁ TRỊ GIA TĂNG";
const DEFAULT_FOOTER_NOTE =
  "(Cần kiểm tra, đối chiếu khi lập, giao, nhận hóa đơn)";

const EMPHASIS_FIELDS = new Set(["Đơn vị bán hàng", "Họ tên người mua hàng"]);

const EMPHASIS_TEXT_CLASS = "font-bold text-[#112C5D]";
const SECTION_CLASS = "border-t border-[#E4E7EC] py-5";

const MODAL_CLASS_NAMES = {
  base: "w-full max-w-[min(285mm,calc(60vw-1rem))] rounded-[28px] overflow-hidden bg-white shadow-2xl",
  wrapper:
    "items-start overflow-y-auto p-2 sm:p-4 [&_[data-slot=base]]:rounded-[28px]",
  closeButton:
    "top-3 mr-5 z-20 rounded-full bg-[#F1F3F6] text-[#4B628B] justify-center opacity-100 hover:bg-[#E4E7EC] data-[hover=true]:bg-[#E4E7EC] focus:bg-[#E4E7EC] data-[focus=true]:bg-[#E4E7EC]",
};

const PARTY_ROW_CLASS =
  "grid grid-cols-1 gap-1.5 text-base leading-6 md:grid-cols-[200px_1fr] md:gap-5";
const TABLE_HEADER_CELL_CLASS =
  "border-b border-default-200 px-2 py-3 font-semibold";
const TABLE_BODY_CELL_CLASS =
  "border-b border-default-200 px-2 py-3 align-top font-medium text-default-800";
const TABLE_COLUMNS = [
  { key: "index", className: "text-left", content: "#" },
  {
    key: "name",
    className: "text-left",
    content: "Tên hàng hóa, dịch vụ",
  },
  { key: "unit", className: "text-center", content: "Đơn vị" },
  { key: "quantity", className: "text-center", content: "Số lượng" },
  { key: "unitPrice", className: "text-right", content: "Đơn giá" },
  {
    key: "amountBeforeTax",
    className: "text-right",
    content: (
      <>
        Thành tiền
        <br />
        (Chưa thuế GTGT)
      </>
    ),
  },
  { key: "taxRate", className: "text-center", content: "TS GTGT" },
  { key: "taxAmount", className: "text-right", content: "Tiền thuế" },
  {
    key: "totalAmount",
    className: "text-right",
    content: (
      <>
        Thành tiền
        <br />
        (Gồm thuế GTGT)
      </>
    ),
  },
] as const;

const toNumber = (value?: number | string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getDisplayValue = (value?: string | number) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return String(value);
};

const normalizeTaxRate = (value?: number | string) => {
  if (typeof value === "string") {
    return value;
  }

  return `${value ?? 0}%`;
};

const normalizeItem = (item: InvoicePreviewItem) => {
  const quantity = toNumber(item?.quantity ?? 0);
  const unitPrice = toNumber(item?.unitPrice ?? 0);
  const amountBeforeTax = item.amountBeforeTax;
  const taxAmount = item.taxAmount;
  const totalAmount = item?.totalAmount || 0;

  return {
    ...item,
    quantity,
    unitPrice,
    amountBeforeTax,
    taxAmount,
    totalAmount,
    taxRate: normalizeTaxRate(item.taxRate),
  };
};

const renderMetaRow = (label: string, value?: string, isBold = false) => (
  <div className="grid grid-cols-[64px_1fr] gap-4">
    <span className={isBold ? "font-bold" : "font-medium"}>{label}</span>
    <span className={isBold ? "font-bold" : undefined}>
      {getDisplayValue(value)}
    </span>
  </div>
);

const renderPartyBlock = (fields: InvoicePreviewField[]) => (
  <div className="grid gap-1.5">
    {fields.map((field, index) => {
      const isEmphasisField = EMPHASIS_FIELDS.has(field.label);

      return (
        <div
          key={`${field.label}-${field.value ?? index}`}
          className={PARTY_ROW_CLASS}
        >
          <span
            className={cn(
              "font-medium text-default-800",
              isEmphasisField && EMPHASIS_TEXT_CLASS,
            )}
          >
            {field.label}
          </span>
          <span
            className={cn(
              "text-default-800",
              isEmphasisField && EMPHASIS_TEXT_CLASS,
            )}
          >
            {getDisplayValue(field.value)}
          </span>
        </div>
      );
    })}
  </div>
);

const InvoicePreviewModal: FC<InvoicePreviewModalProps> = ({
  isOpen,
  onOpenChange,
  data,
  onDownload,
  showMetaHeader = true,
}) => {
  const printableRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    items,
    grandTotal,
    invoiceTitle,
    footerNote,
    sellerFields,
    buyerFields,
    totalInWords,
  } = useMemo(() => {
    const safeItems = Array.isArray(data.items) ? data.items : [];
    const normalizedItems = safeItems.map(normalizeItem);

    return {
      items: normalizedItems,
      grandTotal: normalizedItems.reduce(
        (sum, item) => sum + item.totalAmount,
        0,
      ),
      invoiceTitle: data.invoiceTitle || DEFAULT_INVOICE_TITLE,
      footerNote: data.footerNote || DEFAULT_FOOTER_NOTE,
      sellerFields: data.seller?.fields ?? [],
      buyerFields: data.buyer?.fields ?? [],
      totalInWords: data.totalInWords || "-",
    };
  }, [data]);

  const handleDownloadPdf = useCallback(async () => {
    if (onDownload) {
      await onDownload();
      return;
    }

    if (!printableRef.current) {
      addToast({
        title: "Tải PDF thất bại",
        description: "Không tìm thấy nội dung hóa đơn để xuất file.",
        color: "danger",
      });
      return;
    }

    const requestCode = sanitizePdfFileName(data.requestCode);
    const fileName = requestCode
      ? `hoa-don-ma-yeu-cau-${requestCode}.pdf`
      : `hoa-don-${Date.now()}.pdf`;

    setIsDownloading(true);
    try {
      await exportElementToA4Pdf({
        element: printableRef.current,
        fileName,
        avoidPageBreakSelectors: ["thead", "tr", ".invoice-signature-block"],
      });

      addToast({
        title: "Thành công",
        description: "Đã tải file PDF chuẩn A4.",
        color: "success",
      });
    } catch {
      addToast({
        title: "Tải PDF thất bại",
        description: "Không thể tạo file PDF. Vui lòng thử lại.",
        color: "danger",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [data.requestCode, onDownload]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      scrollBehavior="outside"
      classNames={MODAL_CLASS_NAMES}
    >
      <ModalContent className="overflow-hidden rounded-2xl">
        {() => (
          <>
            {showMetaHeader ? (
              <ModalHeader className="flex items-center justify-between gap-4 border-b border-default-200 bg-white px-6 py-3 pr-16">
                <div className="flex flex-wrap items-center gap-3 font-semibold text-[#4B628B] text-[15px]">
                  <span className="font-medium text-[#687E93] ">
                    Tạo bởi
                    <strong className="ml-2 font-bold text-[#233E6F]">
                      {getDisplayValue(data.createdBy)}
                    </strong>
                  </span>
                  <span className="font-medium text-[#687E93] ">
                    Vào ngày
                    <strong className="ml-2 font-bold text-[#233E6F]">
                      {getDisplayValue(data.createdAt)}
                    </strong>
                  </span>
                  {data.status ? (
                    <span className="rounded-xl border border-[#CFE3F2] bg-[#E6F2FB] px-3 text-[14px] font-semibold text-[#36557B]">
                      {data.status}
                    </span>
                  ) : null}
                </div>

                <Button
                  size="sm"
                  variant="light"
                  isLoading={isDownloading}
                  className="h-auto min-w-0 gap-2 px-0 pr-2 text-[14px] font-bold text-[#4B628B] hover:bg-transparent data-[hover=true]:bg-transparent"
                  startContent={<IconDownload size={20} stroke={2.2} />}
                  onPress={handleDownloadPdf}
                >
                  Tải bản in PDF
                </Button>
              </ModalHeader>
            ) : null}

            <ModalBody className="bg-[#EDEFF2] p-5">
              <div
                ref={printableRef}
                className="mx-auto w-full max-w-[210mm] bg-white px-12 py-16 text-[#1E3765]"
              >
                <div className="flex  pb-6 flex-row items-start justify-between gap-6">
                  <h2 className="text-2xl font-bold uppercase tracking-[-0.02em] text-default-900">
                    {invoiceTitle}
                  </h2>

                  <div className="grid gap-1 text-[12px] leading-5 text-[#31456A]">
                    {renderMetaRow("Ký hiệu", data.symbol, true)}
                    {renderMetaRow("Số", data.number)}
                    {renderMetaRow("Ngày xuất", data.issuedDate)}
                  </div>
                </div>

                <div className={SECTION_CLASS}>
                  {renderPartyBlock(sellerFields)}
                </div>

                <div className={SECTION_CLASS}>
                  {renderPartyBlock(buyerFields)}
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-[#D8DEE8]">
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr className="bg-[#F7F8FB] text-[#6B7C93]">
                        {TABLE_COLUMNS.map((column) => (
                          <th
                            key={column.key}
                            className={cn(
                              TABLE_HEADER_CELL_CLASS,
                              column.className,
                            )}
                          >
                            {column.content}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={`${item.name}-${index}`}>
                          <td
                            className={cn(TABLE_BODY_CELL_CLASS, "text-left")}
                          >
                            {index + 1}
                          </td>
                          <td
                            className={cn(TABLE_BODY_CELL_CLASS, "text-left")}
                          >
                            {item.name}
                          </td>
                          <td
                            className={cn(TABLE_BODY_CELL_CLASS, "text-center")}
                          >
                            {item.unit || "-"}
                          </td>
                          <td
                            className={cn(TABLE_BODY_CELL_CLASS, "text-center")}
                          >
                            {item.quantity}
                          </td>
                          <td
                            className={cn(TABLE_BODY_CELL_CLASS, "text-right")}
                          >
                            {formatCurrency(item.unitPrice, true)}
                          </td>
                          <td
                            className={cn(TABLE_BODY_CELL_CLASS, "text-right")}
                          >
                            {formatCurrency(item.amountBeforeTax, true)}
                          </td>
                          <td
                            className={cn(TABLE_BODY_CELL_CLASS, "text-center")}
                          >
                            {item.taxRate}
                          </td>
                          <td
                            className={cn(TABLE_BODY_CELL_CLASS, "text-right")}
                          >
                            {formatCurrency(item.taxAmount, true)}
                          </td>
                          <td className="border-b border-default-200 px-2 py-3 text-right align-top font-semibold text-[#1E3765]">
                            {formatCurrency(item.totalAmount, true)}
                          </td>
                        </tr>
                      ))}

                      <tr className="bg-[#FBFCFE]">
                        <td className="px-2 py-3" />
                        <td
                          colSpan={7}
                          className="px-2 py-3 text-left font-bold text-[#1E3765]"
                        >
                          Tổng tiền
                        </td>
                        <td className="px-2 py-3 text-right text-[14px] font-bold text-[#1E3765]">
                          {formatCurrency(grandTotal, true)}
                        </td>
                      </tr>

                      <tr>
                        <td className="px-2 py-3" />
                        <td
                          colSpan={2}
                          className="px-2 py-3 text-left font-semibold text-[#31456A]"
                        >
                          Số tiền viết bằng chữ
                        </td>
                        <td
                          colSpan={6}
                          className="px-2 py-3 text-right text-[14px] text-[#233E6F] font-medium"
                        >
                          {totalInWords}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="invoice-signature-block mt-12 grid grid-cols-1 gap-8 pb-24 text-center text-base text-[#1E3765] sm:grid-cols-2 sm:pb-40 lg:pb-60">
                  <div className="space-y-1">
                    <p className="font-bold">Người mua hàng</p>
                    <p>Chữ ký số (nếu có)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold">Người bán hàng</p>
                    <p className="font-medium">Chữ ký số (nếu có)</p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex justify-center pt-20 text-center text-[11px] text-[#64748B]",
                    !data.footerNote && "opacity-80",
                  )}
                >
                  {footerNote}
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default InvoicePreviewModal;
