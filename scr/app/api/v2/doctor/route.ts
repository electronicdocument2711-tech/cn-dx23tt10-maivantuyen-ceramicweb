import { validToken } from "@/lib/auth";
import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";

import { NextRequest, NextResponse } from "next/server";
import { isArray, isEmpty, prop } from "remeda";

export async function GET(request: NextRequest) {
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

    if (!clientGroupId) {
      throw new Error("Phòng khám không hợp lệ", {
        cause: 400,
      });
    }

    const searchParams = request.nextUrl.searchParams;

    const roles = searchParams?.getAll("roles[]");
    const query = searchParams?.get("q") || "";
    const active = parseInt(searchParams?.get("active") || "0", 10) || 0;
    const page = searchParams?.get("page") || "1";
    const pageSize = searchParams?.get("pageSize") || "12";

    const response = await saas.get("/api/user-infos", {
      params: {
        filters: {
          business: {
            $eq: clientGroupId,
          },
          ...(active
            ? {
                users: {
                  confirmed: { $eq: true },
                },
              }
            : {}),
          ...(!isEmpty(query)
            ? {
                name: {
                  $contains: query,
                },
              }
            : {}),
          ...(isArray(roles) && roles.length > 0
            ? {
                business_role: {
                  $in: roles,
                },
              }
            : {}),
        },
        fields: ["name"],
        populate: ["business_role", "users"],
        pagination: {
          page: parseInt(page, 10),
          pageSize: parseInt(pageSize, 10),
          withCount: true,
        },
      },
    });
    return NextResponse.json(response?.data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
