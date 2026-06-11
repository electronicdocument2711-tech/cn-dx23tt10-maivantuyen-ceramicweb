"use client";

import dayjs from "@/lib/dayjs";
import { formatCurrency, numberToWordsVi } from "@/lib/format";
import { sanitizePdfFileName } from "@/lib/pdf";
import { addToast, Button } from "@heroui/react";
import { IconDownload } from "@tabler/icons-react";
import { useState } from "react";

export interface CashReceiptPdfData {
  amount?: number | string;
  branchAddress?: string;
  branchName?: string;
  customerAddress?: string;
  customerCode?: string;
  customerName?: string;
  note?: string;
  receiptCode?: number | string;
  receiptDate?: Date | string;
}

interface CashReceiptPdfButtonProps {
  className?: string;
  data: CashReceiptPdfData;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const escapeHtml = (value?: string) => {
  if (!value) return "";

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const toAmount = (value?: number | string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const CashReceiptPdfButton = ({
  className,
  data,
  label = "Tải phiếu thu tiền mặt PDF",
  size = "sm",
}: CashReceiptPdfButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    const receiptDate = dayjs.unix(Number(data.receiptDate));
    const amount = toAmount(data.amount);
    const amountFormatted = formatCurrency(amount, false, false);
    const amountInWords = numberToWordsVi(amount);

    const day = receiptDate.format("DD");

    const month = receiptDate.format("MM");
    const year = receiptDate.format("YYYY");

    const fileNameBase =
      sanitizePdfFileName(
        `phieu-thu-${data.customerCode || data.customerName || "khach-hang"}-${receiptDate.format("DDMMYYYY")}`,
      ) || `phieu-thu-${receiptDate.format("DDMMYYYY")}`;

    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;left:-9999px;top:0;z-index:-1;background:white;";

    el.innerHTML = `
      <div style="
        width:210mm;
        height:140mm;
        overflow:hidden;
        padding:10mm;
        box-sizing:border-box;
        position:relative;
        background:white;
        font-family:Georgia,'Times New Roman',Times,serif;
        font-size:13px;
        color:#000;
      ">
        <div style="position:absolute;top:10mm;left:10mm;max-width:70mm;">
          <div style="font-weight:bold;font-size:14px;text-transform:uppercase;margin-bottom:4px;">
            ${escapeHtml(data.branchName)}
          </div>
          <div style="font-size:11px;font-style:italic;">
            ${escapeHtml(data.branchAddress)}
          </div>
        </div>

        <div style="position:absolute;top:10mm;right:10mm;text-align:center;max-width:80mm;">
          <div style="font-size:13px;font-weight:bold;">Mẫu số 01 - TT</div>
          <div style="font-size:10px;font-style:italic;margin-top:3px;">
            (Kèm theo Thông tư số 99/2025/TT-BTC ngày 27 tháng 10 năm 2025 của Bộ trưởng Bộ Tài chính)
          </div>
        </div>

        <div style="position:absolute;top:33mm;right:10mm;font-size:16px;font-weight:700;text-align:left;max-width:80mm;min-width:50mm;border-bottom:1px solid #9ca3af;padding-bottom:1mm;">
          Số: ${escapeHtml(String(data.receiptCode || ""))}
        </div>

        <div style="text-align:center;margin-top:18mm;">
          <div style="font-size:22px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
            Phiếu Thu
          </div>
          <div style="font-size:12px;font-style:italic;margin-top:4px;">
            Ngày <strong>${day}</strong> tháng <strong>${month}</strong> năm <strong>${year}</strong>
          </div>
        </div>

        <div style="margin-top:8mm;display:flex;flex-direction:column;gap:6px;">
          <div style="display:flex;border-bottom:1px dotted #9ca3af;padding-bottom:4px;">
            <span style="white-space:nowrap;">Họ và tên người nộp tiền:</span>
            <span style="padding-left:6px;font-weight:600;">${escapeHtml(data.customerName)}</span>
          </div>
          <div style="display:flex;border-bottom:1px dotted #9ca3af;padding-bottom:4px;">
            <span style="white-space:nowrap;">Địa chỉ:</span>
            <span style="padding-left:6px;font-weight:700;">${escapeHtml(data.customerAddress)}</span>
          </div>
          <div style="display:flex;border-bottom:1px dotted #9ca3af;padding-bottom:4px;">
            <span style="white-space:nowrap;">Lý do nộp:</span>
            <span style="padding-left:6px;font-weight:700;">${escapeHtml(data.note)}</span>
          </div>
          <div style="display:flex;border-bottom:1px dotted #9ca3af;padding-bottom:4px;">
            <span style="white-space:nowrap;">Số tiền:</span>
            <span style="padding-left:6px;font-weight:700;min-width:40mm;">${amountFormatted} VNĐ</span>
            <span style="margin-left:12px;">(Viết bằng chữ):</span>
            <span style="padding-left:6px;font-weight:700;">${escapeHtml(amountInWords)}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 2fr;border-bottom:1px dotted #9ca3af;padding-bottom:4px;">
            <div><span style="white-space:nowrap;">Kèm theo:</span></div>
            <div><span style="margin-left:12px;">Chứng từ gốc:</span></div>
          </div>
        </div>

        <div style="margin-top:10mm;display:grid;grid-template-columns:1fr 1fr;text-align:center;font-size:13px;font-weight:bold;">
          <div>
            <div>Người nộp tiền</div>
            <div style="font-size:10px;font-weight:normal;font-style:italic;margin-top:3px;">(Ký, họ tên)</div>
          </div>
          <div>
            <div>Người thu tiền</div>
            <div style="font-size:10px;font-weight:normal;font-style:italic;margin-top:3px;">(Ký, họ tên)</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(el);

    try {
      setIsExporting(true);
      const html2PdfModule = await import("html2pdf.js");
      const html2pdf = html2PdfModule.default || html2PdfModule;

      await html2pdf()
        .set({
          margin: 0,
          image: { type: "jpeg", quality: 1 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0,
          },
          jsPDF: { unit: "mm", format: "a5", orientation: "landscape" },
        })
        .from(el.firstElementChild as HTMLElement)
        .save(`${fileNameBase}.pdf`);
    } catch {
      addToast({
        title: "Thất bại",
        description: "Không thể tải phiếu thu PDF, vui lòng thử lại",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
      document.body.removeChild(el);
    }
  };

  return (
    <Button
      color="default"
      size={size}
      startContent={<IconDownload size={16} />}
      variant="bordered"
      className={className || "bg-default-100"}
      onPress={handleDownload}
      isLoading={isExporting}
      isDisabled={isExporting || toAmount(data.amount) <= 0}
    >
      {label}
    </Button>
  );
};

export default CashReceiptPdfButton;
