import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";
import { validToken } from "@/lib/auth";
import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";
import { throwError } from "@/lib/response";

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

    if (!clientGroupId) {
      throw new Error("Phòng khám không hợp lệ", {
        cause: 400,
      });
    }

    const res = await saas.get("/api/einvoice-channels");

    if (res.status !== 200) {
      throwError("Lấy thông tin kênh bán hàng thất bại", 403);
    }

    return NextResponse.json(res?.data?.data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}
