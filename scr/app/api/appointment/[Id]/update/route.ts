import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { validToken } from "@/lib/auth";
import { prop } from "remeda";
import * as Yup from "yup";
import { saas } from "@/lib/saas";

const inputSchema = Yup.object().shape({
  statusId: Yup.number().nullable(),
  currentStatusId: Yup.number().nullable(),
  doctorId: Yup.string().nullable(),
  chairId: Yup.string().nullable(),
  customerId: Yup.string().nullable(),
  startAt: Yup.number().nullable(),
  estimateTime: Yup.string().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: Readonly<{ params: Promise<{ Id: string }> }>,
) {
  try {
    if (!(await validToken(req))) {
      throw new Error("Chưa xác thực", { cause: 401 });
    }

    const authorize = await cms.get("/authen/authorize");
    if (!prop(authorize, ...["data", "module", "code"])) {
      throw new Error("Chưa đăng nhập", { cause: 401 });
    }

    const { Id } = await params;
    const appointmentId = parseInt(Id, 10);
    if (isNaN(appointmentId) || appointmentId <= 0) {
      throw new Error("Id không hợp lệ", { cause: 400 });
    }

    const body = await req.json();
    const data = await inputSchema
      .validate(body, { abortEarly: false })
      .catch((err) => {
        const message =
          err instanceof Yup.ValidationError
            ? err.errors.join("\n")
            : err?.message || "Dữ liệu không hợp lệ";
        throw new Error(message, { cause: 400 });
      });

    const tasks: Promise<void>[] = [];

    // Assign doctor
    if (data.doctorId != null) {
      tasks.push(
        (async () => {
          const userByDoctorId = await saas
            .get("/api/user-infos", {
              params: {
                filters: {
                  id: {
                    $eq: data?.doctorId,
                  },
                },
                populate: {
                  users: true,
                },
              },
            })
            .then(
              (res) =>
                prop(res, ...["data", "data", "0", "users", "0", "id"]) || 0,
            );

          if (!userByDoctorId) {
            throw new Error("Bác sĩ không hợp lệ", { cause: 400 });
          }

          const formData = new FormData();
          formData.append("AppointedTo", userByDoctorId?.toString());
          formData.append("AppointmentId", appointmentId.toString());

          const res = await cms.post(
            "/pos/appointment/?_act=assignToDoctor",
            formData,
          );
          if (res.status !== 200)
            throw new Error("Phân công bác sĩ thất bại", { cause: 502 });

          const code = prop(res, ...["data", "module", "code"]);
          if (!code) {
            const messages =
              (prop(res, ...["data", "messages"]) as any[]) || [];
            const msg =
              messages.length > 0
                ? messages.map((m: any) => m?.mes || "").join("\n")
                : "Phân công bác sĩ thất bại";
            throw new Error(msg, { cause: 502 });
          }
        })(),
      );
    }

    // Assign dental chair
    if (
      data.chairId != null &&
      data.customerId != null &&
      data.startAt != null &&
      data.estimateTime != null
    ) {
      tasks.push(
        (async () => {
          const formData = new FormData();
          formData.append("AppointmentId", appointmentId.toString());
          formData.append("CustomerId", data.customerId!);
          formData.append("StartAt", data.startAt!.toString());
          formData.append("EstimateTime", data.estimateTime!);
          formData.append("DentalChairId", data.chairId!);

          const res = await cms.post(
            "/pos/dentalChair?_act=dentalChairBooking.save",
            formData,
          );
          if (res.status !== 200)
            throw new Error("Đặt ghế nha thất bại", { cause: 502 });

          const code = prop(res, ...["data", "module", "code"]);
          if (!code) {
            const messages =
              (prop(res, ...["data", "messages"]) as any[]) || [];
            const msg =
              messages.length > 0
                ? messages.map((m: any) => m?.mes || "").join("\n")
                : "Đặt ghế nha thất bại";
            throw new Error(msg, { cause: 502 });
          }
        })(),
      );
    }

    if (
      tasks.length === 0 &&
      (data?.statusId == null || data?.currentStatusId == null)
    ) {
      return NextResponse.json(
        { message: "Không có thay đổi nào" },
        { status: 200 },
      );
    }

    await Promise.all(tasks);
    // Update status
    if (data.statusId != null && data.currentStatusId != null) {
      const formData = new FormData();
      formData.append("AppointmentId", appointmentId.toString());
      formData.append(
        "CurrentAppointmentStatusId",
        data.currentStatusId!.toString(),
      );
      formData.append("AppointmentStatusId", data.statusId!.toString());

      const res = await cms.post("/pos/appointment?_act=changeState", formData);
      if (res.status !== 200)
        throw new Error("Lỗi khi đổi trạng thái lịch hẹn", { cause: 502 });

      const code = prop(res, ...["data", "module", "code"]);
      if (!code) {
        const msg =
          (prop(res, ...["data", "messages"]) as any[])
            ?.map((m: any) => m?.contentRaw || m?.mes || "")
            .join(", ") || "Đổi trạng thái thất bại";
        throw new Error(msg, { cause: 502 });
      }
    }

    return NextResponse.json(
      { message: "Cập nhật thành công" },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}
