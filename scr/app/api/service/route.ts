import { cms } from "@/lib/cms";
import { handleError } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const formData = new FormData();

    searchParams.forEach((value, key) => {
      formData.append(key, value);
    });

    const res = await cms.post(
      "/pos/service?_lay=getServicesManagementV2",
      formData,
    );

    if (res.status === 200 || res.status === 201) {
      return NextResponse.json(res.data);
    } else {
      return NextResponse.json({
        success: false,
        message: res.message || "Lấy danh sách dịch vụ thất bại",
      });
    }
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const serviceId = String(formData.get("Service[ServiceId]") || "").trim();
    const isUpdateMode = serviceId.length > 0;
    const action = isUpdateMode
      ? "updateService"
      : "saveServiceWithoutApproveV2";

    const res = await cms.post(`/pos/service?_act=${action}`, formData);

    const isSuccess = res.data?.module?.code == true;

    const firstMessage = Array.isArray(res.data?.messages)
      ? res.data.messages[0]
      : null;
    const backendMessage =
      firstMessage?.mes || firstMessage?.contentRaw || res.data?.message;

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        message:
          backendMessage ||
          (isUpdateMode
            ? "Cập nhật dịch vụ thành công"
            : "Tạo mới dịch vụ thành công"),
      });
    } else {
      return NextResponse.json({
        success: false,
        message:
          backendMessage ||
          (isUpdateMode
            ? "Cập nhật dịch vụ thất bại"
            : "Tạo mới dịch vụ thất bại"),
      });
    }
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
