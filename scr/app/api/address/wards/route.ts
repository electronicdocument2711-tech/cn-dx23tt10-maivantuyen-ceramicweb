import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, ValidateTokenAndAuth } from "@/lib/response";
import { cms } from "@/lib/cms";
import { prop } from "remeda";

export async function GET(request: NextRequest) {
  try {
    const searchParams = await request.nextUrl.searchParams;
    const provinceId = parseInt(searchParams.get("VnProvinceId") || "-1", 10);

    if (provinceId < 0) throwError("Id tỉnh không hợp lệ", 400);

    await ValidateTokenAndAuth(request);

    const res = await cms.post(
      `/pos/provinces?_act=getWardWithPagination&ProvinceId=${provinceId}`,
    );

    const ward = prop(res, ...["data", "module", "views", 0, "data"]) || [];
    return NextResponse.json(ward, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
