import { NextRequest, NextResponse } from "next/server";
import { validToken } from "@/lib/auth";
import { throwError } from "@/lib/response";
import { saas } from "@/lib/saas";

export async function DELETE(req: NextRequest) {
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

    if (!userInfor) throwError("Invalid user info", 401);

    const { conditionId } = await req.json();

    const res = await saas.delete(
      `/api/einvoice-condition-tables/${conditionId}`,
    );

    if (res.status !== 204 && res.status !== 200) {
      throwError("Xoá thông tin điều kiện tự xuất hoá đơn bị lỗi", 403);
    }

    return NextResponse.json({
      message: "Xoá thông tin điều kiện tự xuất hoá đơn thành công",
      status: 200,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}
