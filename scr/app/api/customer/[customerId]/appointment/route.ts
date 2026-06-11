import { MULTIPART_HEADERS } from "@/const/api";
import { cms } from "@/lib/cms";
import { handleError, throwError } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: {
    params: Promise<{ customerId: string }>;
  }
) {
  try {
    const { customerId } = await context.params;

    if (!customerId || customerId === "") throwError("params missing", 400);

    const data = {
      CustomerId: customerId,
    };

    const res = await cms.post(
      `/pos/appointment/?_lay=listAppointmentCustomer`,
      data,
      MULTIPART_HEADERS
    );

    return NextResponse.json(res.data.module.views[0].data);
  } catch (error) {
    console.error("Error fetching customer appointments:", error);
    return NextResponse.json(...handleError(error));
  }
}
