import { cms } from "@/lib/cms";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";

export async function GET(
  _: NextRequest,
  { params }: Readonly<{ params: Promise<{ customerId: string }> }>,
) {
  try {
    const { customerId } = await params;

    const response = await cms.get("/pos/payment/order", {
      params: { _lay: "customerSummaryPayment", CustomerId: customerId },
    });

    const data =
      prop(response, ...["data", "module", "views", 0, "data"]) ?? null;
    const messages = prop(response, ...["data", "messages"]) ?? [];

    if (!data && messages.length > 0) {
      return NextResponse.json(
        {
          message:
            messages?.map((item: any) => item?.mes)?.join("\n") ||
            "Không tìm thấy thông tin thanh toán",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
