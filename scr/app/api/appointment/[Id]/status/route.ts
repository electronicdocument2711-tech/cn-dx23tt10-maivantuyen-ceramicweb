import { NextRequest, NextResponse } from "next/server";
import { throwError } from "@/lib/response";
import { cms } from "@/lib/cms";
import { prop } from "remeda";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ Id: string }> },
) {
  try {
    const authorize = await cms.get("/authen/authorize");
    if (
      authorize?.status !== 200 ||
      !prop(authorize, ...["data", "module", "code"])
    ) {
      throw new Error("Chưa đăng nhập", { cause: 401 });
    }

    const { Id } = await context.params;
    const appointmentId = parseInt(Id, 10);
    if (isNaN(appointmentId) || appointmentId <= 0) {
      throw new Error("Id không hợp lệ", { cause: 400 });
    }

    const payload = await req.json();
    const curentId = parseInt(payload.currentId);
    const targetId = parseInt(payload.targetId);

    if (isNaN(curentId) || isNaN(targetId) || curentId <= 0 || targetId <= 0)
      throwError("Mã trạng thái không hợp lệ", 400);

    const formData = new FormData();
    if (appointmentId)
      formData.append("AppointmentId", appointmentId.toString());
    if (curentId)
      formData.append("CurrentAppointmentStatusId", curentId.toString());
    if (targetId) formData.append("AppointmentStatusId", targetId.toString());

    const res = await cms.post("/pos/appointment?_act=changeState", formData);

    if (res.status !== 200) throwError("Lỗi khi đổi trạng thái lịch hẹn", 500);
    const code = res.data?.module?.code;

    if (!code)
      throwError(
        res?.data?.messages?.[0]?.contentRaw ?? "Đã có lỗi xảy ra",
        502,
      );

    return NextResponse.json("success", { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.status || 500 },
    );
  }
}
