import { request_status } from "@/data/einvoice";
import { validToken } from "@/lib/auth";
import { Bkav } from "@/lib/bkav";
import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";
import dayjs from "dayjs";

import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ docid: string }> },
) {
  try {
    if (!(await validToken(req)))
      throw new Error("Chưa xác thực", { cause: 401 });

    const authorize = await cms.get("/authen/authorize");

    if (!prop(authorize, ...["data", "module", "code"]))
      throw new Error("Chưa đăng nhập", { cause: 401 });

    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId)
      throw new Error("Phòng khám không hợp lệ", { cause: 400 });

    const { docid } = await params;
    if (!docid) throw new Error("Truy vấn không hợp lệ", { cause: 400 });

    const { status } = await req.json();
    // check if new request_status is valid
    const key = request_status.find((item: any) => item.key === status)?.key;
    if (!key) throw new Error("Trạng thái không hợp lệ", { cause: 400 });

    let data: any = { request_status: key };

    if (key === "da_duyet") {
      // : call BKAV trước thành công thì cập nhật request_status và invoice_status

      // : call Strapi to fetch data of provider config
      const eInvoiceRes = await saas.get(`/api/einvoices/${docid}`, {
        params: {
          populate: {
            issuer: {
              populate: {
                e_invoice_provider: {
                  populate: {
                    einvoice_provider: true,
                    einvoice_accounts: true,
                  },
                },
              },
            },
            einvoice_items: true,
          },
        },
      });

      const baseData = prop(eInvoiceRes, ...["data", "data"]);
      if (!baseData) throw new Error("Hóa đơn không tồn tại", { cause: 404 });

      const eInvoiceProvider = prop(
        eInvoiceRes,
        ...[
          "data",
          "data",
          "issuer",
          "e_invoice_provider",
          "einvoice_provider",
        ],
      );

      const eInvoiceAccount = prop(
        eInvoiceRes,
        ...[
          "data",
          "data",
          "issuer",
          "e_invoice_provider",
          "einvoice_accounts",
          0,
        ],
      );

      if (!eInvoiceProvider || !eInvoiceAccount)
        throw new Error("Nhà cung cấp hóa đơn không hợp lệ", { cause: 400 });

      const bkavInstance = new Bkav({
        url: eInvoiceProvider.domain_api,
        partnerGuid: eInvoiceAccount?.guiid,
      });

      const payload = {
        Invoice: {
          InvoiceTypeID: 1,
          InvoiceDate: dayjs(baseData?.invoice_date, "YYYY-MM-DD")
            .add(7, "hour")
            .tz("Asia/Ho_Chi_Minh")
            .format("YYYY-MM-DDTHH:mm:ssZ"),
          BuyerName: baseData?.customer_name,
          BuyerTaxCode: baseData?.customer_tax_number,
          BuyerUnitName: baseData?.customer_company_name || "",
          BuyerAddress: baseData?.customer_address,
          BuyerBankAccount: baseData?.customer_email,
          PayMethodID: 3, // Mặc định TM/CK
          ReceiveTypeID:
            baseData?.customer_email && baseData?.customer_phone_number
              ? 3 // cả email và số điện thoại
              : baseData?.customer_email
                ? 1 // chỉ email
                : baseData?.customer_phone_number
                  ? 2 // chỉ số điện thoại
                  : undefined,
          ReceiverAddress: baseData?.customer_address,
          ...(baseData?.customer_email
            ? { ReceiverEmail: baseData?.customer_email }
            : {}),
          ...(baseData?.customer_phone_number
            ? { ReceiverMobile: baseData?.customer_phone_number }
            : {}),
          ReceiverName: baseData?.customer_name,
          Note: "Test eHoaDon",
          BillCode: "", // : thấy trên demo có thể chuyền lên rỗng
          CurrencyID: "VND",
          ExchangeRate: 1,
          InvoiceForm: baseData?.issuer?.vat_template,
          InvoiceSerial: baseData?.issuer?.vat_serial,
        },
        ListInvoiceDetailsWS: baseData?.einvoice_items?.map((item: any) => ({
          ItemName: item?.service_tax_name,
          Qty: item?.quantity,
          Price: item?.price,
          Amount: item?.export_invoice_amount,
          TaxRate: !item?.is_tax ? -1 : item?.vat_rate,
          TaxRateID: !item?.is_tax ? 4 : Bkav.getTaxRateId(item?.vat_rate),
          TaxAmount: item?.vat_amount,
          ItemTypeID: 0, // Hàng hóa dịch vụ
        })),
        ListInvoiceAttachFileWS: [],
        PartnerInvoiceID: 0,
        PartnerInvoiceStringID: docid,
      };

      const result = await bkavInstance.createInvoiceTR([payload]);

      //  nếu thành công check trạng thái của hóa đơn vừa tạo
      if (result?.Status !== 0) {
        throw new Error(
          `Gọi BKAV không thành công: ${result?.Object || "Lỗi không xác định"}`,
          { cause: 500 },
        );
      }

      const onlyInvoiceData = prop(result as any, ...["Object", 0]);

      if (!onlyInvoiceData || onlyInvoiceData?.Status !== 0) {
        throw new Error(
          onlyInvoiceData?.MessLog || "BKAV trả về kết quả không thành công",
          { cause: 500 },
        );
      }

      const invoiceGUID = onlyInvoiceData?.InvoiceGUID;
      const invoiceNo = onlyInvoiceData?.InvoiceNo;

      const invoiceStatus = await bkavInstance.getInvoiceStatus(invoiceGUID);

      if (invoiceStatus?.Status !== 0) {
        throw new Error(
          `Lấy trạng thái hóa đơn từ BKAV không thành công: ${
            invoiceStatus?.Object || "Lỗi không xác định"
          }`,
          { cause: 500 },
        );
      }

      const currentStatus = invoiceStatus?.Object;

      if (isNaN(currentStatus)) {
        throw new Error(
          `Trạng thái hóa đơn từ BKAV không hợp lệ: ${currentStatus}`,
          { cause: 500 },
        );
      }

      const statusFromStrapi = await saas.get("/api/einvoice-statuses", {
        params: {
          filters: {
            einvoice_provider: eInvoiceProvider?.id,
            provider_status_id: currentStatus,
          },
        },
      });

      const strapiStatus = prop(statusFromStrapi, ...["data", "data", 0]);

      if (!strapiStatus) {
        throw new Error(
          `Không tìm thấy trạng thái hóa đơn tương ứng do nhà cung cấp hóa đơn điện tử trả về: ${currentStatus}`,
          { cause: 500 },
        );
      }

      data = {
        ...data,
        einvoice_status: strapiStatus?.documentId,
        provider_invoice_id: invoiceGUID,
        e_invoice_number: String(invoiceNo),
        request_approved_at: dayjs().tz("Asia/Ho_Chi_Minh").format(),
      };
    } else if (key === "da_tu_choi") {
      data = {
        ...data,
        request_cancelled_at: dayjs().tz("Asia/Ho_Chi_Minh").format(),
      };
    }

    const res = await saas.put(`/api/einvoices/${docid}`, { data });

    if (res.status !== 200)
      throw new Error("Cập nhật không thành công", { cause: res.status });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
