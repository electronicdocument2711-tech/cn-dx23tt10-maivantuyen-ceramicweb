import { cms } from "@/lib/cms";
import { handleError } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const lmstart = Number(searchParams.get("lmstart") ?? 0); // vị trí bắt đầu item đầu tiên
    const limit = Number(searchParams.get("limit") ?? 20); // số item lấy về

    const safeLmstart = Number.isFinite(lmstart) && lmstart >= 0 ? lmstart : 0;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;

    const res = await cms.get(
      `/pos/serviceGroup/?_act=getServiceGroups&lmstart=${safeLmstart}&limit=${safeLimit}`,
    );

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const formData = new FormData();
    formData.append("Name", body.Name);
    if (body.ServiceGroupId)
      formData.append("ServiceGroupId", body.ServiceGroupId);

    const res = await cms.post(`/pos/serviceGroup/?_act=save`, formData);

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

// ĐÂY LÀ HÀM XOÁ
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await cms.post(
      `pos/serviceGroup/?_act=delete&ServiceGroupId=${body.id}`,
    );
    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
