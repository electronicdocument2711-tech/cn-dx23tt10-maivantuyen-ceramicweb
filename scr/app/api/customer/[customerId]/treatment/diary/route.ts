import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, withAuth } from "@/lib/response";
import { cms } from "@/lib/cms";
import { toFormData } from "axios";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ customerId: string }> }
) {
  try {
    //authorization
    const tokenData = await withAuth(req);
    if (!tokenData) throwError("Unauthorized", 401);

    const params = await context.params;
    const customerId = params.customerId;
    if (!customerId || customerId === "")
      throwError("Mã khách hàng không hợp lệ", 400);

    //call api
    const res = await cms.post(
      "/customer/treatment/list-medical-session",
      toFormData({ CustomerId: customerId })
    );

    const listDiary = res.data.module.views?.[0]?.data.MedicalSessions;

    //return [] if no data but status 200
    if (!listDiary || !Array.isArray(listDiary) || listDiary.length === 0)
      return NextResponse.json([], { status: 200 });

    return NextResponse.json(listDiary, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    //authorization
    const tokenData = await withAuth(req);
    if (!tokenData) throwError("Unauthorized", 401);

    const data = await req.json();
    const res = await cms.post(
      "/customer/treatment/save-medical-session",
      data
    );
    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
