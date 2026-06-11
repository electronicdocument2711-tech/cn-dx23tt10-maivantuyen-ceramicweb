import { NextRequest, NextResponse } from "next/server";
import { validToken } from "@/lib/auth";
import { handleError, throwError, ValidateTokenAndAuth } from "@/lib/response";
import { saas } from "@/lib/saas";
import { prop } from "remeda";
import { cms } from "@/lib/cms";

export async function GET(req: NextRequest) {
  try {
    await ValidateTokenAndAuth(req);

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const customerId = searchParams.get("customerId");

    const filters: Record<string, any> = {};

    if (code && code.trim() !== "") {
      filters.customer_code = { $eq: code };
    } else if (customerId && customerId.trim() !== "") {
      filters.customer_id = { $eq: customerId };
    } else {
      throwError("Mã khách hàng không hợp lệ", 400);
    }

    const payload = await validToken(req);
    if (!payload) throwError("Xác thực không hợp lệ, vui lòng đăng nhập", 401);

    const authRes = await cms.get("/authen/authorize");
    if (
      authRes?.status !== 200 ||
      !prop(authRes, ...["data", "module", "code"])
    )
      throwError("Chưa đăng nhập", 401);

    const res = await saas.get("/api/einvoice-recipients", {
      params: {
        filters,
      },
    });
    if (res.status !== 200) {
      throwError(
        "Đã có lỗi xảy ra khi lấy thông tin hóa đơn, vui lòng thử lại",
        502,
      );
    }
    const data = (res.data?.data as any[]) || [];

    if (data.length > 0 && data[0].customer_id) {
      const checkCustomerRes = await cms.get(
        `/pos/customer?_lay=checkAccessCustomer&CustomerId=${data[0].customer_id}`,
      );
      if (!checkCustomerRes.data.module.views[0].data)
        return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const tokenData = await validToken(req);
    if (!tokenData) throwError("Invalid token", 401);

    const body = await req.json();

    const {
      fullName,
      companyName,
      address,
      taxCode,
      citizenId,
      email,
      customerId,
      customerCode,
    } = body;

    const res = await saas.post("/api/einvoice-recipients", {
      data: {
        customer_name: fullName,
        company_name: companyName,
        address,
        tax_number: taxCode,
        citizen_id: citizenId,
        email,
        customer_id: customerId,
        customer_code: customerCode,
      },
    });

    if (res.status !== 200 && res.status !== 201) {
      throw new Error("Tạo recipient config bị lỗi", {
        cause: 403,
      });
    }

    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}
