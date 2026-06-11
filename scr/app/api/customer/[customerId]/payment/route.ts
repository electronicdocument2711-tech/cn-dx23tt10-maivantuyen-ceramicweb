import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { cms } from "@/lib/cms";
import { MULTIPART_HEADERS } from "@/const/api";

export async function GET(
  _req: NextRequest,
  context: {
    params: Promise<{ customerId: string }>;
  }
) {
  try {
    const { customerId } = await context.params;
    if (!customerId || customerId === "") throwError("params missing", 400);

    const data = { _renderer: "module", CustomerId: customerId };
    const res = await cms.post(
      "/customer/receipt/summary",
      data,
      MULTIPART_HEADERS
    );

    const payment = res?.data?.module?.views?.[0]?.data;
    if (!payment) throwError("payment null", 404);
    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
