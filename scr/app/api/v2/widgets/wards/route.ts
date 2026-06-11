import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { prop } from "remeda";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("page_size") || "10", 10);
    const ProvinceId = searchParams.get("province_id") || "";
    const DistrictId = searchParams.get("district_id") || "";
    const query = searchParams.get("q") || "";

    const res = await cms.get("/pos/provinces", {
      params: {
        _act: "getWardWithPagination",
        ProvinceId,
        DistrictId,
        q: query,
        limit: pageSize,
        lmstart: (page - 1) * pageSize,
      },
    });

    const data = prop(res, ...["data", "module", "views", 0, "data"]);

    const message =
      (
        prop(res, ...["data", "messages"])?.map((item: any) =>
          prop(item, ...["mes"]),
        ) || []
      )?.join(", ") || "";

    if (!data && message) throw new Error(message, { cause: 500 });

    return NextResponse.json(
      {
        data: data || [],
        pagination: prop(res, ...["data", "module", "views", 0, "pagination"]),
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Đã có lỗi xảy ra",
      },
      { status: error?.cause || 500 },
    );
  }
}
