import { cms } from "@/lib/cms";
import { handleError, throwError } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const serviceId = (await context.params).id;
    if (!serviceId || !/^\d+$/.test(serviceId.toString())) {
      throwError("ServiceId không hợp lệ", 400);
    }

    const formData = new FormData();
    formData.append("ServiceId", serviceId);

    const res = await cms.post(
      "/pos/service?_lay=getServiceDetailV2",
      formData,
    );
    if (res.status === 200 || res.status === 201) {
      return NextResponse.json(res.data, { status: 200 });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: res.message || "Lấy chi tiết dịch vụ thất bại",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
