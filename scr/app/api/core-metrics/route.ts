import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { prop } from "remeda";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";

    if (!fromDate || !toDate || dayjs(fromDate).isAfter(dayjs(toDate))) {
      return NextResponse.json(
        { error: "Missing required or invalid query parameters" },
        { status: 400 },
      );
    }

    const formData = new FormData();
    formData.append("FromDate", fromDate);
    formData.append("ToDate", toDate);

    const res = await cms.post(
      `/pos/report?_lay=ClientGroupCoreMetric`,
      formData,
    );

    const data = prop(res, ...["data", "module", "views", "0", "data"]) || null;

    const messages = prop(data, "messages") || [];

    if (data === null && messages?.length > 0) {
      throw new Error(
        messages?.map((msg: any) => msg?.mes).join("\n") ||
          "Lỗi khi tải dữ liệu",
        {
          cause: 500,
        },
      );
    }

    return NextResponse.json({ data, fromDate, toDate }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
