import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { isValidEmail, isValidPhone } from "@/lib";
import { saas } from "@/lib/saas";
import { cms } from "@/lib/cms";
import { prop } from "remeda";
import { validToken } from "@/lib/auth";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.locale("vi");

dayjs.extend(utc);
dayjs.extend(timezone);

const generateRequestCode = async (): Promise<string> => {
  const datePrefix = `YC${dayjs().format("YYMM")}`;
  const getCurrentReqestRes = await saas.get("api/einvoices", {
    params: {
      filters: { request_code: { $startsWith: datePrefix } },
      sort: { request_code: "desc" },
      pagination: { limit: 1 },
    },
  });

  let code = 1;
  if (getCurrentReqestRes.data.data.length > 0) {
    const lastCode = getCurrentReqestRes.data.data[0].request_code;
    const lastNum = parseInt(lastCode.replace(datePrefix, ""), 10);
    code = lastNum + 1;
  }

  return datePrefix + code.toString().padStart(3, "0");
};

export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;

    const page = searchParams?.get("page") || "1";
    const pageSize = searchParams?.get("limit") || "12";
    const search = searchParams?.get("search") || "";
    const status = searchParams?.get("status") || "";
    const dateFrom = searchParams?.get("dateFrom") || "";
    const dateTo = searchParams?.get("dateTo") || "";
    const invoice = searchParams?.get("invoice") || "";

    const res = await saas.get("/api/einvoices", {
      params: {
        filters: {
          business: clientGroupId,
          ...(status && {
            $or: [
              { einvoice_status: { id: { $eq: status } } },
              { einvoice_tax_status: { id: { $eq: status } } },
              { request_status: { $eq: status } },
            ],
          }),
          ...(invoice && {
            $or: [
              {
                issuer: { id: { $eq: invoice } },
              },
            ],
          }),
          ...(search && {
            $or: [
              { e_invoice_number: { $containsi: search } },
              { customer_code: { $containsi: search } },
              { issuer_symbol: { $containsi: search } },
            ],
          }),
          ...(dateFrom &&
            dateTo && {
              createdAt: {
                $gte: dateFrom,
                $lte: dateTo,
              },
            }),
        },
        populate: {
          einvoice_status: { fields: ["id", "name", "provider_status_id"] },
          einvoice_provider: { fields: ["id", "name"] },
          user_created: {
            fields: ["id", "username"],
            populate: { user_info: { fields: ["email", "name"] } },
          },
          einvoice_items: true,
        },
        sort: ["createdAt:desc"],
        pagination: {
          page: parseInt(page, 10),
          pageSize: parseInt(pageSize, 10),
          withCount: true,
        },
      },
    });

    if (res.status !== 200)
      throw new Error("lấy thông tin hoá đơn thất bại", { cause: 502 });
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      invoiceType,
      issuer,
      issuer_name,
      issuer_address,
      issuer_tax_number,
      customer_id,
      customer_name,
      payment_method,
      total_amount,
      total_amount_after_tax,
      total_tax_amount,
      customer_code,
      issuer_symbol,
      invoice_form,
      invoice_serial,
      is_insurance,
      customer_company_name,
      customer_tax_number,
      customer_citizen_id,
      customer_address,
      customer_bank_number,
      customer_bank_name,
      customer_phone_number,
      customer_email,
      business,
      services,
      branch_id,
    } = await req.json();

    if (!issuer || issuer.trim() === "")
      throwError("Mã chủ thể xuất hóa đơn không hợp lệ", 400);
    if (
      !invoiceType ||
      !(invoiceType === "personal" || invoiceType === "company")
    )
      throwError("Loại hóa đơn không hợp lệ", 400);
    if (!customer_id || customer_id.trim() === "")
      throwError("Id khách hàng không hợp lệ", 400);
    if (!customer_code || customer_code.trim() === "")
      throwError("Mã khách hàng không hợp lệ", 400);
    if (!customer_name || customer_name.trim() === "")
      throwError("Tên khách hàng không hợp lệ", 400);
    if (!payment_method || payment_method.trim() === "")
      throwError("Phương thức thanh toán không hợp lệ", 400);
    if (
      !total_amount ||
      typeof total_amount !== "number" ||
      isNaN(total_amount) ||
      total_amount <= 0
    )
      throwError("Tổng tiền không hợp lệ", 400);
    if (!issuer_tax_number || issuer_tax_number.trim() === "")
      throwError("Mã số thuế chủ thể xuất hóa đơn không hợp lệ", 400);
    if (!issuer_name || issuer_name.trim() === "")
      throwError("Tên chủ thể xuất hóa đơn không hợp lệ", 400);

    if (
      invoiceType === "company" &&
      (!customer_company_name || customer_company_name.trim() === "")
    )
      throwError("Tên công ty khách hàng không hợp lệ", 400);
    if (
      !customer_tax_number ||
      customer_tax_number.trim() === "" ||
      customer_tax_number.length !== 12
    )
      throwError("Mã số thuế khách hàng phải là 12 ký tự", 400);

    if (typeof is_insurance !== "boolean")
      throwError("Trạng thái bảo hiểm không hợp lệ", 400);
    if (customer_citizen_id && customer_citizen_id.length !== 12)
      throwError("CMND khách hàng phải là 12 ký tự", 400);

    if (customer_phone_number && !isValidPhone(customer_phone_number))
      throwError("Số điện thoại khách hàng không hợp lệ", 400);
    if (
      !customer_email ||
      customer_email.trim() === "" ||
      !isValidEmail(customer_email)
    )
      throwError("Email khách hàng không hợp lệ", 400);

    if (!branch_id) {
      throwError("Vui lòng chọn chi nhánh xuất hóa đơn", 400);
    }

    if (!Array.isArray(services) || services.length === 0)
      throwError(
        "Thông tin dịch vụ không hợp lệ hoặc không có dịch vụ nào được chọn",
        400,
      );

    const payload = await validToken(req);
    if (!payload) throwError("Xác thực không hợp lệ, vui lòng đăng nhập", 401);

    const authRes = await cms.get("/authen/authorize");
    if (
      authRes?.status !== 200 ||
      !prop(authRes, ...["data", "module", "code"])
    )
      throwError("Chưa đăng nhập", 401);

    const requestCode = await generateRequestCode();

    const eInvoiceConfigRes = await saas
      .get(`/api/clinic-invoice-configs/${issuer}`, {
        params: {
          populate: {
            e_invoice_provider: {
              fields: ["id", "documentId"],
              populate: {
                einvoice_provider: {
                  fields: ["id", "documentId"],
                },
              },
            },
          },
        },
      })
      .then((res) => {
        if (res.status !== 200)
          throw new Error("Lấy cấu hình hóa đơn thất bại");

        return prop(res, ...["data", "data", "e_invoice_provider"]);
      })
      .catch(() => {
        return null;
      });

    if (!eInvoiceConfigRes) throwError("Cấu hình hóa đơn không tồn tại", 400);

    const creatEinvoiceRes = await saas.post("/api/einvoices", {
      data: {
        type: invoiceType,
        issuer,
        issuer_name,
        issuer_address,
        issuer_tax_number,
        customer_id,
        customer_name,
        payment_method,
        total_amount,
        total_amount_after_tax,
        total_tax_amount,
        customer_code,
        issuer_symbol,
        is_insurance,
        customer_company_name,
        customer_tax_number,
        customer_citizen_id,
        customer_address,
        customer_bank_number,
        customer_bank_name,
        customer_phone_number,
        customer_email,
        business,
        request_status: "dang_cho_duyet", // Mặc định khi tạo yêu cầu sẽ là đang chờ duyệt
        request_code: requestCode,
        user_created: payload.Id,
        invoice_date: dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD"),
        einvoice_config: eInvoiceConfigRes?.documentId,
        einvoice_provider: eInvoiceConfigRes?.einvoice_provider?.documentId,
        invoice_form: invoice_form,
        invoice_serial: invoice_serial,
        branch_id,
      },
    });

    if (!(creatEinvoiceRes.status === 200 || creatEinvoiceRes.status === 201))
      throwError("Đã có lỗi xảy ra trong quá trình tạo yêu cầu", 500);

    const data = creatEinvoiceRes.data.data;
    if (!data) throwError("Đã có lỗi xảy ra trong quá trình tạo yêu cầu", 500);

    let issue = 0;
    services.forEach(async (service) => {
      const serviceRes = await saas.post("api/einvoice-items", {
        data: {
          einvoice: data.documentId,
          service_id: service.ServiceId,
          service_name: service.ServiceName,
          service_tax_name: service.ServiceTaxName,
          anatomy_body_part_name: service.AnatomyBodyPartItemName,
          unit: service?.Unit,
          price: service.ServicePrice,
          quantity: service.Quantity,
          discount_amount: service.DiscountAmount,
          amount: service.AmountAfterTax,
          paid_amount: service.PaidAmount,
          order_detail_id: service.OrderDetailId,
          vat_rate: service.TaxPercent,
          vat_amount: service.TaxAmount,
          export_invoice_amount: service.AmountBeforeTax,
          payment_detail_id: service.PaymentDetailId,
          is_tax: service.IsTax,
        },
      });
      if (!(serviceRes.status === 200 || serviceRes.status === 201)) issue++;
    });

    if (issue > 0)
      throwError(
        "Đã có lỗi xảy ra trong quá trình tạo yêu cầu xuất hóa đơn",
        500,
      );

    // Tự dộng cập nhật thông tin xuất hóa đơn của khách hàng theo thông tin vừa nhập
    saas
      .get("/api/einvoice-recipients", {
        params: {
          filters: {
            customer_id: {
              $eq: customer_id,
            },
          },
        },
      })
      .then(async (res) => {
        const customerTaxInfo = prop(res, ...["data", "data", "0"]);

        if (!customerTaxInfo) {
          await saas
            .post("/api/einvoice-recipients", {
              data: {
                ...(invoiceType === "company"
                  ? { company_name: customer_company_name }
                  : { customer_name: customer_name }),
                address: customer_address,
                tax_number: customer_tax_number,
                ...(customer_citizen_id
                  ? {
                      citizen_id: customer_citizen_id,
                    }
                  : {}),
                email: customer_email,
                customer_id: customer_id,
                customer_code: customer_code,
                bank_number: customer_bank_number,
                bank_name: customer_bank_name,
                phone_number: customer_phone_number,
              },
            })
            .catch(() => {
              // DO NOTHING
            });
        } else {
          await saas
            .put(`/api/einvoice-recipients/${customerTaxInfo?.documentId}`, {
              data: {
                ...(invoiceType === "company"
                  ? { company_name: customer_company_name }
                  : { customer_name: customer_name }),
                address: customer_address,
                tax_number: customer_tax_number,
                ...(customer_citizen_id
                  ? {
                      citizen_id: customer_citizen_id,
                    }
                  : {}),
                email: customer_email,
                customer_id: customer_id,
                customer_code: customer_code,
                bank_number: customer_bank_number,
                bank_name: customer_bank_name,
                phone_number: customer_phone_number,
              },
            })
            .catch(() => {
              // DO NOTHING
            });
        }
      })
      .catch(() => {
        // DO NOTHING
      });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
