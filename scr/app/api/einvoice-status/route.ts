import { NextRequest, NextResponse } from "next/server";
import { validToken } from "@/lib/auth";
import { prop } from "remeda";
import { cms } from "@/lib/cms";
import { saas } from "../../../lib/saas";

export async function GET(req: NextRequest) {
  try {
    if (!(await validToken(req))) {
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
      throw new Error("Phòng khám không hợp lệ", { cause: 400 });

    const params = {
      fields: ["id", "name"],
      filter: { state: { $eq: true } },
      sort: ["id:asc"],
    };

    const res = await saas.get("/api/einvoice-statuses", { params });

    if (res.status !== 200) {
      throw new Error("Xoá thông tin điều kiện tự xuất hoá đơn bị lỗi", {
        cause: "403",
      });
    }

    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lạ" },
      { status: err?.cause || 500 },
    );
  }
}
