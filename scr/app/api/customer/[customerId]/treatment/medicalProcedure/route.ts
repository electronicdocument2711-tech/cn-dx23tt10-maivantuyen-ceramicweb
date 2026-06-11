import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { throwError, handleError, ValidateTokenAndAuth } from "@/lib/response";
import { prop } from "remeda";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ customerId: string }>;
  },
) {
  try {
    const { customerId } = await context.params;

    const id = parseInt(customerId, 10);
    if (isNaN(id) || id <= 0) throwError("Id khách hàng không hợp lệ", 400);

    await ValidateTokenAndAuth(req);

    const res = await cms.post(
      `/pos/treatment?_lay=getTreatmentMedicalProcedure&CustomerId=${customerId}`,
    );


    if (res.data.messages[0]?.mes !== null && res.data.messages[0]?.mes.length > 0)
      throwError(res.data.messages[0]?.mes, 500);

    const medicalProcedure = prop(res, "data", "module", "views", 0, "data");

    if (!medicalProcedure)
      throwError("Không tìm thấy danh sách tiến trình điều trị", 404);

    return NextResponse.json(medicalProcedure, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
