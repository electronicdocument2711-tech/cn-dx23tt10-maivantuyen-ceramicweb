import { cms } from "@/lib/cms";
import { handleError } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const medicalSessionId = searchParams.get("medicalSessionId")?.trim();

    if (!medicalSessionId) {
      return NextResponse.json(
        { message: "Id phiên điều trị là bắt buộc" },
        { status: 400 },
      );
    }

    const res = await cms.post(
      `/pos/treatment?_lay=getMedicalSessionDetail&MedicalSessionId=${medicalSessionId}`,
    );

    const isSuccess =
      !Array.isArray(res.data?.messages) || res.data.messages.length === 0;

    const firstMessage = Array.isArray(res.data?.messages)
      ? res.data.messages[0]
      : null;
    const backendMessage =
      firstMessage?.mes || firstMessage?.contentRaw || res.data?.message;

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        message: backendMessage || "Lấy chi tiết phiên điều trị thành công",
        data: res.data?.module.views[0].data,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: backendMessage || "Lấy chi tiết phiên điều trị thất bại",
      });
    }
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
