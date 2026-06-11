import { saas } from "@/lib/saas";
import { validToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";
import { cms } from "@/lib/cms";

export async function GET(request: NextRequest) {
  try {
    if (!(await validToken(request)))
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

    const searchParams = request.nextUrl.searchParams;

    const company_name = searchParams?.get("search");
    const statusParams = searchParams?.get("status");
    const page = searchParams?.get("page") || "1";
    const pageSize = searchParams?.get("limit") || "12";

    const info = await saas.get("/api/clinic-invoice-configs", {
      params: {
        filters: {
          business: {
            $eq: clientGroupId,
          },
          // state: false,
          ...(statusParams && {
            state: parseInt(statusParams, 10),
          }),
          ...(company_name && {
            company_name: {
              $contains: company_name,
            },
          }),
        },
        sort: ["id:desc"],
        pagination: {
          page: parseInt(page, 10),
          pageSize: parseInt(pageSize, 10),
          withCount: true,
        },
      },
    });

    return NextResponse.json(info?.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await validToken(request))) {
      throw new Error("Chưa xác thực", { cause: 401 });
    }

    const authorize = await cms.get("/authen/authorize");

    if (!prop(authorize, ...["data", "module", "code"])) {
      throw new Error("Chưa đăng nhập", { cause: 401 });
    }

    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId)
      throw new Error("Phòng khám không hợp lệ", {
        cause: 400,
      });

    const body = await request.json();

    const updatedBody = {
      data: { ...body.data, state: 1, business: clientGroupId },
    };

    const response = await saas.post(
      "/api/clinic-invoice-configs",
      updatedBody,
    );

    return NextResponse.json(response?.data, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
