"use client";

import cn from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { exportElementToA4Pdf, sanitizePdfFileName } from "@/lib/pdf";
import { addToast } from "@heroui/react";
import { useCallback, useState } from "react";

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

const DEFAULT_INVOICE_TITLE = "HÓA ĐƠN GIÁ TRỊ GIA TĂNG";
const DEFAULT_FOOTER_NOTE =
  "(Cần kiểm tra, đối chiếu khi lập, giao, nhận hóa đơn)";
const EMPHASIS_FIELDS = new Set(["Đơn vị bán hàng", "Họ tên người mua hàng"]);
const EMPHASIS_TEXT_CLASS = "font-bold text-[#112C5D]";
const SECTION_CLASS = "border-t border-[#E4E7EC] py-5";

const TABLE_HEADER_CELL_CLASS =
  "border-b border-default-200 px-2 py-3 font-semibold";
const TABLE_BODY_CELL_CLASS =
  "border-b border-default-200 px-2 py-3 align-top font-medium text-default-800";
const PARTY_ROW_CLASS =
  "grid grid-cols-1 gap-1.5 text-base leading-6 md:grid-cols-[200px_1fr] md:gap-5";

const TABLE_COLUMNS = [
  { key: "index", className: "text-left", content: "#" },
  { key: "name", className: "text-left", content: "Tên hàng hóa, dịch vụ" },
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
    return value.includes("%") ? value : `${value}%`;
  }
  return `${value ?? 0}%`;
};

const normalizeItem = (item: InvoicePreviewItem) => {
  const quantity = toNumber(item.quantity ?? 0);
  const unitPrice = toNumber(item.unitPrice ?? 0);
  const amountBeforeTax = item.amountBeforeTax ?? quantity * unitPrice;
  const taxRateNumber = toNumber(String(item.taxRate ?? 0).replace("%", ""));
  const taxAmount = item.taxAmount ?? (amountBeforeTax * taxRateNumber) / 100;
  const totalAmount = item.totalAmount ?? amountBeforeTax + taxAmount;

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

interface InvoicePrintableProps {
  data: InvoicePreviewData;
  forwardedRef: React.MutableRefObject<HTMLDivElement | null>;
}

const InvoicePrintable: React.FC<InvoicePrintableProps> = ({
  data,
  forwardedRef,
}) => {
  const safeItems = Array.isArray(data.items) ? data.items : [];
  const items = safeItems.map(normalizeItem);
  const grandTotal = items.reduce((sum, item) => sum + item.totalAmount, 0);

  const invoiceTitle = data.invoiceTitle || DEFAULT_INVOICE_TITLE;
  const footerNote = data.footerNote || DEFAULT_FOOTER_NOTE;
  const sellerFields = data.seller?.fields ?? [];
  const buyerFields = data.buyer?.fields ?? [];
  const totalInWords = data.totalInWords || "-";

  return (
    <div
      ref={forwardedRef}
      className="mx-auto w-full max-w-[210mm] bg-white px-12 py-16 text-[#1E3765]"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="flex pb-6 flex-row items-start justify-between gap-6">
        <h2 className="text-2xl font-bold uppercase tracking-[-0.02em] text-default-900">
          {invoiceTitle}
        </h2>

        <div className="grid gap-1 text-[12px] leading-5 text-[#31456A]">
          {renderMetaRow("Ký hiệu", data.symbol, true)}
          {renderMetaRow("Số", data.number)}
          {renderMetaRow("Ngày xuất", data.issuedDate)}
        </div>
      </div>

      <div className={SECTION_CLASS}>{renderPartyBlock(sellerFields)}</div>

      <div className={SECTION_CLASS}>{renderPartyBlock(buyerFields)}</div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#D8DEE8]">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-[#F7F8FB] text-[#6B7C93]">
              {TABLE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={cn(TABLE_HEADER_CELL_CLASS, column.className)}
                >
                  {column.content}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.name}-${index}`}>
                <td className={cn(TABLE_BODY_CELL_CLASS, "text-left")}>
                  {index + 1}
                </td>
                <td className={cn(TABLE_BODY_CELL_CLASS, "text-left")}>
                  {item.name}
                </td>
                <td className={cn(TABLE_BODY_CELL_CLASS, "text-center")}>
                  {item.unit || "-"}
                </td>
                <td className={cn(TABLE_BODY_CELL_CLASS, "text-center")}>
                  {item.quantity}
                </td>
                <td className={cn(TABLE_BODY_CELL_CLASS, "text-right")}>
                  {formatCurrency(item.unitPrice, true)}
                </td>
                <td className={cn(TABLE_BODY_CELL_CLASS, "text-right")}>
                  {formatCurrency(item.amountBeforeTax, true)}
                </td>
                <td className={cn(TABLE_BODY_CELL_CLASS, "text-center")}>
                  {item.taxRate}
                </td>
                <td className={cn(TABLE_BODY_CELL_CLASS, "text-right")}>
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
  );
};

export const useInvoicePdfExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(async (data: InvoicePreviewData) => {
    try {
      setIsExporting(true);

      const requestCode = sanitizePdfFileName(data.requestCode);
      const fileName = requestCode
        ? `hoa-don-ma-yeu-cau-${requestCode}.pdf`
        : `hoa-don-${Date.now()}.pdf`;

      // Create a temporary container to hold our React component
      const tempContainer = document.createElement("div");
      tempContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 210mm;
        min-height: 297mm;
        background: white;
        z-index: -1;
      `;

      document.body.appendChild(tempContainer);

      // Dynamically import React DOM
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(tempContainer);

      // Create a promise that resolves when the component is rendered
      await new Promise<void>((resolve) => {
        const tempRef = { current: null as HTMLDivElement | null };

        root.render(<InvoicePrintable data={data} forwardedRef={tempRef} />);

        // Wait for rendering
        setTimeout(() => {
          if (tempRef.current) {
            exportElementToA4Pdf({
              element: tempRef.current,
              fileName,
              avoidPageBreakSelectors: [
                "thead",
                "tr",
                ".invoice-signature-block",
              ],
            })
              .then(() => {
                resolve();
              })
              .catch((error) => {
                console.error("Export error:", error);
                resolve();
              });
          } else {
            console.error("Ref not found");
            resolve();
          }
        }, 1000);
      });

      // Clean up
      root.unmount();
      document.body.removeChild(tempContainer);

      addToast({
        title: "Thành công",
        description: "Đã tải file PDF chuẩn A4.",
        color: "success",
      });
    } catch (error) {
      console.error("PDF Export Error:", error);
      addToast({
        title: "Tải PDF thất bại",
        description: "Không thể tạo file PDF. Vui lòng thử lại.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportToPdf, isExporting };
};
