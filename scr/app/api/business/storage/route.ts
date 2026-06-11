import { NextRequest, NextResponse } from "next/server";
import { throwError } from "@/lib/response";
import { validToken } from "@/lib/auth";
import { saas } from "@/lib/saas";
import { cms } from "@/lib/cms";
import { prop } from "remeda";
import dayjs from "@/lib/dayjs";

export async function GET(req: NextRequest) {
  try {
    const tokenData = await validToken(req);
    if (!tokenData) throwError("Invalid token", 401);

    const authorize = await cms.get("/authen/authorize");
    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId)
      throw new Error("Phòng khám không hợp lệ", { cause: 400 });

    // lấy tổng dung lượng đã sử dụng (theo KB)
    let params: any = {
      fields: ["used_storage"],
      filters: { id: { $eq: clientGroupId } },
    };

    const { data: bus } = await saas.get("/api/businesses", { params });

    // lấy số lượng hình từ trong bảng CustomerPhoto. Dựa vào khởi đầu và kết thúc của tháng để lọc
    const start = dayjs().startOf("month").toISOString();
    const end = dayjs().endOf("month").toISOString();

    params = {
      fields: ["id"],
      pagination: { limit: -1 },
      filters: {
        business_id: { $eq: clientGroupId },
        createdAt: { $gte: start, $lte: end },
      },
    };

    const { data: photos } = await saas.get("/api/customer-photos", { params });

    return NextResponse.json(
      {
        used_storage: bus?.data?.[0]?.used_storage || 0,
        photo_by_month: photos?.meta?.pagination?.total || 0,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}
