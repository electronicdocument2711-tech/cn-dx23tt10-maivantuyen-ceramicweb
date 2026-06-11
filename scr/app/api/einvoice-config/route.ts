import { NextRequest, NextResponse } from "next/server";
import { validToken } from "@/lib/auth";
import { throwError } from "@/lib/response";
import { saas } from "@/lib/saas";
import { cms } from "@/lib/cms";
import { prop } from "remeda";
import { providers } from "@/data/einvoice";
import { Bkav } from "@/lib/bkav";

export async function POST(req: NextRequest) {
  try {
    const tokenData = await validToken(req);
    if (!tokenData) throwError("Invalid token", 401);

    const userInfor = await saas("/api/users", {
      params: {
        populate: {
          user_info: {
            populate: "*",
          },
        },
        filters: { id: { $eq: tokenData?.id } },
      },
    });

    const body = await req.json();
    const { state, envoiceProvider, api_between_retry, account, invoice } =
      body;

    const provider = providers.find((p) => p.documentId === envoiceProvider);

    let payload: any = null;

    if (provider?.alias === "bkav") {
      // check bkav account
      const bkavInstance = new Bkav({
        url: provider?.domain_api,
        partnerGuid: account.guiid,
      });

      const checkAccount = await bkavInstance.getAccountInfoByTaxCode(
        account?.name,
      );

      if (checkAccount?.Status !== 0) {
        throw new Error(
          "Tài khoản BKAV không hợp lệ hoặc có lỗi khi kết nối đến BKAV, vui lòng kiểm tra lại",
          { cause: 400 },
        );
      }

      // create clinic invoice config
      const accountInfo: any = checkAccount?.Object;
      if (!accountInfo) {
        throw new Error(
          "Không lấy được thông tin tài khoản BKAV, vui lòng kiểm tra lại",
          { cause: 400 },
        );
      }

      payload = {
        company_name: accountInfo?.UnitName,
        company_address: accountInfo?.UnitAddress,
        fax: accountInfo?.Fax,
        phone: accountInfo?.UnitPhone,
        bank_number: accountInfo?.BankAccount,
        bank_name: accountInfo?.BankName,
        tax_number: accountInfo?.TaxCode,
        email_address: accountInfo?.UnitEmail,
        business: prop(
          userInfor as any,
          ...["data", 0, "user_info", "business", "documentId"],
        ),
        state: 1,
        vat_template: invoice?.formNo || "",
        vat_serial: invoice?.serial || "",
        effective_date: invoice?.effectiveDate || "",
        e_invoice_provider: provider?.documentId,
      };
    } else {
      throw new Error("Nhà cung cấp hóa đơn điện tử chưa được hỗ trợ", {
        cause: 400,
      });
    }

    const businessId = userInfor.data[0].user_info.business.documentId;

    const config = await saas.post("/api/einvoice-configs", {
      data: {
        business: businessId,
        state,
        einvoice_provider: envoiceProvider,
        api_between_retry,
        FormNo: invoice.formNo,
        Serial: invoice.serial,
        IssuedDate: invoice.effectiveDate,
      },
    });

    if (config.status !== 200 && config.status !== 201) {
      throwError("Tạo einvoice config bị lỗi", 403);
    }

    const configId = config.data.data.documentId;

    const res = await saas.post("/api/einvoice-accounts", {
      data: {
        username: account.name,
        password: account.password,
        einvoice_config: configId,
        guiid: account.guiid,
      },
    });

    if (res.status !== 200 && res.status !== 201)
      throwError("Tạo einvoice account bị lỗi", 403);

    if (payload) {
      saas.post("/api/clinic-invoice-configs", {
        data: {
          ...payload,
          e_invoice_provider: configId,
        },
      });
    }

    return NextResponse.json({
      message: "Tạo einvoice account thành công",
      status: 200,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}

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
      throw new Error("Phòng khám không hợp lệ", {
        cause: 400,
      });

    const res = await saas.get("/api/einvoice-configs", {
      params: {
        filters: {
          business: clientGroupId,
        },
        sort: ["id:desc"],
        populate: { einvoice_provider: { populate: "*" } },
      },
    });

    if ((res.status !== 200 && res.status !== 201) || !res?.data)
      throw new Error("Lấy data einvoice res bị lỗi", {
        cause: 403,
      });

    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}
