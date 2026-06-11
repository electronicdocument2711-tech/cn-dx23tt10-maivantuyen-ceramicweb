import { NextRequest, NextResponse } from "next/server";
import { throwError } from "@/lib/response";
import { validToken } from "@/lib/auth";
import { saas } from "@/lib/saas";

export async function GET(req: NextRequest) {
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
    const info = userInfor.data[0].user_info;

    const businessId = info.business.documentId;

    const res = await saas.get(`/api/businesses/${businessId}`);

    if (res.status !== 200) throwError("Invalid business", 403);

    return NextResponse.json(res?.data?.data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}
