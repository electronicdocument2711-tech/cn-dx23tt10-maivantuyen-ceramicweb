import { cms } from "@/lib/cms";
import { handleError } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const customerId = searchParams.get("customerId")?.trim();

    if (!customerId) {
      return NextResponse.json(
        { message: "customerId is required" },
        { status: 400 },
      );
    }

    const res = await cms.post(
      `/pos/treatment?_lay=getCustomerMedicalSession&CustomerId=${customerId}`,
    );

    const isSuccess =
      !Array.isArray(res.data?.messages) || res.data.messages.length === 0;

    const firstMessage = Array.isArray(res.data?.messages)
      ? res.data.messages[0]
      : null;
    const backendMessage =
      firstMessage?.mes || firstMessage?.contentRaw || res.data?.message;

    if (isSuccess && res.data.data !== null) {
      return NextResponse.json({
        success: true,
        message: backendMessage || "Lấy danh sách nhật ký điều trị thành công",
        data: res.data?.module.views[0].data,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: backendMessage || "Lấy danh sách nhật ký điều trị thất bại",
      });
    }
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const res = await cms.post(
      `/pos/treatment?_act=updateTreatmentProgressAndCouncilV2`,
      formData,
    );

    const success = res.data?.module.code;
    if (!success) {
      return NextResponse.json({
        success: false,
        message:
          res.data?.messages[0]?.mes || "Cập nhật nhật ký điều trị thất bại",
      });
    }

    return NextResponse.json(
      { success: true, data: res.data },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
