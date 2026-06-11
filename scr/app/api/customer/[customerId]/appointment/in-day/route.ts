import { cms } from "@/lib/cms";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;

    const response = await cms.get(
      "/pos/appointment?_lay=getCustomerAppointmentInDay",
      {
        params: {
          CustomerId: customerId,
        },
      },
    );

    const data =
      prop(response, ...["data", "module", "views", 0, "data"]) || null;

    return NextResponse.json(
      {
        data,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
