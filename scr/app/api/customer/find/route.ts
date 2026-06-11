import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { cms } from "@/lib/cms";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const findCode = searchParams.get("find") || "";
    if (!findCode) return NextResponse.json([], { status: 200 });

    const data = { search: findCode, limit: "10" };
    const res = await cms.post("pos/customer", data, {
      params: { _lay: "listCustomer" },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const customers = res.data?.module?.views?.[0]?.data;
    if (!customers) throwError("Không tìm thấy danh sách khách hàng", 404);

    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
