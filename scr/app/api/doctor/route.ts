import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { handleError } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const data = { BranchId: searchParams.get("branchId") };
    const res = await cms.post("pos/appointment", data, {
      params: { _lay: "getDoctorByBranchId" },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const customers = res.data?.module?.views?.[0]?.data;
    if (!customers)
      return NextResponse.json(
        { message: "Không tìm thấy danh sách bác sĩ" },
        { status: 404 }
      );

    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
