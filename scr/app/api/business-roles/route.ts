import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/response";
import { saas } from "@/lib/saas";

export async function GET(_req: NextRequest) {
  try {
    const res = await saas.get("/api/business-roles");
    const data = res.data.data;
    if (!data || data.length === 0)
      return NextResponse.json("Không tìm thấy danh sách chức vụ", {
        status: 404,
      });
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
