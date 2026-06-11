import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { cms } from "@/lib/cms";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Number.parseInt(
      searchParams.get("pageSize") || "20",
      10,
    );
    const fromTime = searchParams.get("from_time") || "";
    const toTime = searchParams.get("to_time") || "";

    if (!Number.isInteger(page) || page < 1) {
      throwError("page không hợp lệ", 400);
    }

    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throwError("pageSize không hợp lệ", 400);
    }

    if (!fromTime || !toTime) {
      throwError("Thiếu from_time hoặc to_time", 400);
    }

    const formData = new FormData();
    formData.append("from_time", fromTime);
    formData.append("to_time", toTime);
    formData.append("limit", pageSize.toString());
    formData.append("lmstart", ((page - 1) * pageSize).toString());

    const res = await cms.post(
      "/pos/appointment?_lay=listAppointmentInDayV3",
      formData,
    );

    const view = res?.data?.module?.views?.[0] || {};

    return NextResponse.json(
      {
        data: view?.data || [],
        pagination: view?.pagination || {},
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

