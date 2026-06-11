"use client";

import React from "react";
import {
  addToast,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { prop } from "remeda";
import rest from "@/lib/rest";
import { useInvoicePdfExport } from "./InvoicePdfExport";
import { numberToVietnameseCurrency } from "@/lib/payment_server";
import dayjs from "dayjs";
import { request_status } from "@/data/einvoice";
import { InvoicePreviewData } from "./InvoicePreviewModal";

interface InvoiceActionDropdownPros {
  invoice: any;
  isReady: boolean;
  onReview: () => void;
}

const InvoiceActionDropdown = ({
  invoice,
  isReady,
  onReview,
}: InvoiceActionDropdownPros) => {
  const { exportToPdf, isExporting } = useInvoicePdfExport();

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
            amountBeforeTax: Number(
              item?.export_invoice_amount || item?.amount || 0,
            ),
            taxRate: Number(item?.vat_rate || 0),
            taxAmount:
              Number(item?.amount || 0) -
              Number(item?.export_invoice_amount || item?.amount || 0),
            totalAmount: Number(
              item?.amount || item?.export_invoice_amount || 0,
            ),
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
      requestCode: invoice?.request_code || "-",
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
      totalInWords: invoice?.total_amount
        ? numberToVietnameseCurrency(Number(invoice.total_amount))
        : "-",
    };
  };

  // Nhận base64 từ API proxy của bạn
  const base64ToBlob = (base64: string, type: string) => {
    const bin = atob(base64);
    const len = bin.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type });
  };

  const onDownload = async (einvoiceDocId: string, type: "xml" | "pdf") => {
    try {
      const res = await rest.get(`/einvoice/${einvoiceDocId}/${type}`);

      const data = prop(res, ...["data", "data"]);

      if (!data) {
        throw new Error(`Tải file ${type.toUpperCase()} thất bại`);
      }

      const blob = base64ToBlob(
        data?.base64,
        type === "xml" ? "application/xml" : "application/pdf",
      );

      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");

      downloadLink.href = url;
      downloadLink.download =
        data?.name || (type === "xml" ? "file.xml" : "file.pdf");
      downloadLink.click();

      addToast({
        title: "Thành công",
        description: `Đã tải file ${type.toUpperCase()} thành công`,
        color: "success",
      });
    } catch (error: any) {
      addToast({
        title: `Tải file ${type.toUpperCase()} thất bại`,
        description:
          error?.response?.data?.error ||
          error?.message ||
          `Tải file ${type.toUpperCase()} thất bại, vui lòng thử lại sau.`,
        color: "danger",
      });
    }
  };

  const handleDownload = async (einvoiceDocId: string, type: "xml" | "pdf") => {
    try {
      addToast({
        title: `Đang tải file ${type.toUpperCase()}`,
        description: "Vui lòng chờ trong giây lát...",
        color: "primary",
        promise: onDownload(einvoiceDocId, type),
        timeout: 400,
      });
    } catch {
      addToast({
        title: "Thất bại",
        description: `Tải file ${type.toUpperCase()} thất bại, vui lòng thử lại sau.`,
        color: "danger",
      });
    }
  };

  return (
    <Dropdown placement="bottom-end" radius="sm" shadow="md">
      <DropdownTrigger>
        <button className="border-1 border-slate-300 p-1 rounded-lg cursor-pointer text-gray-600 hover:bg-white hover:text-gray-900">
          <IconDotsVertical size={20} />
        </button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Actions"
        disabledKeys={[...(!invoice?.einvoice_status ? ["xml", "pdf"] : [])]}
        onAction={(key) => {
          const action = String(key);

          if (action === "review") {
            onReview();
            return;
          }

          if (action === "xml") {
            handleDownload(invoice.documentId, "xml");
            return;
          }
          if (action === "pdf") {
            handleDownload(invoice.documentId, "pdf");
            return;
          }

          if (action === "print") {
            // Tải bản in PDF
            const invoiceData = buildPreviewData(invoice);
            exportToPdf(invoiceData);
            return;
          }

          addToast({
            title: "Tính năng đang phát triển",
            description: "Chức năng này sẽ được hỗ trợ ở bước tiếp theo.",
            color: "primary",
          });
        }}
      >
        <DropdownItem key="review">Xem hoá đơn</DropdownItem>
        <DropdownItem
          key="print"
          isDisabled={isExporting}
          className={isExporting ? "text-gray-600 cursor-default" : ""}
          showDivider
        >
          Tải bản in PDF
        </DropdownItem>
        <DropdownItem
          key="send"
          isDisabled={!isReady}
          className={`${isReady ? "" : "text-gray-600 cursor-default"}`}
        >
          Gửi cho khách
        </DropdownItem>
        <DropdownItem key="xml" className="data-disabled:text-gray-600">
          Tải file XML hóa đơn ĐT
        </DropdownItem>
        <DropdownItem
          key="pdf"
          className="data-disabled:text-gray-600"
          showDivider
        >
          Tải file PDF hóa đơn ĐT
        </DropdownItem>
        <DropdownItem
          key="adjust"
          isDisabled={!isReady}
          className={`${isReady ? "" : "text-gray-600 cursor-default"}`}
        >
          Lập hóa đơn điều chỉnh
        </DropdownItem>
        <DropdownItem
          key="replace"
          isDisabled={!isReady}
          className={`${isReady ? "" : "text-gray-600 cursor-default"}`}
        >
          Lập hóa đơn thay thế
        </DropdownItem>
        <DropdownItem
          key="remove"
          isDisabled={!isReady}
          className={`text-red-700`}
        >
          Huỷ hoá đơn
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default InvoiceActionDropdown;
