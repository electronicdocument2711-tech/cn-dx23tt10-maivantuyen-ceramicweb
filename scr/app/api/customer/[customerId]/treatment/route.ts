import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { throwError, handleError } from "@/lib/response";

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
    const res = await cms.post("/pos/treatment", data, {
      headers: { "Content-Type": "multipart/form-data" },
      params: {
        _lay: "getGetTreatmentProcessAll",
      },
    });

    const receipt = res.data.module.views[0].data;
    if (!receipt) throwError("receipt null", 404);
    return NextResponse.json(receipt, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(...handleError(error));
  }
}
