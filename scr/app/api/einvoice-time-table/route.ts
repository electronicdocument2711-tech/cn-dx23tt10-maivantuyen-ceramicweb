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

    const { timeId } = await req.json();

    const res = await saas.delete(`/api/einvoice-time-tables/${timeId}`);

    if (res.status !== 204 && res.status !== 200) {
      throw new Error("Xoá thông tin điều kiện tự xuất hoá đơn bị lỗi", {
        cause: "403",
      });
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
