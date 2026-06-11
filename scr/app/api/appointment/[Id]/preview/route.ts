import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";

export async function GET(
  _: NextRequest,
  { params }: Readonly<{ params: Promise<{ Id: string }> }>,
) {
  try {
    const authorize = await cms.get("/authen/authorize");

    if (
      authorize?.status !== 200 ||
      !prop(authorize, ...["data", "module", "code"])
    ) {
      throw new Error("Chưa đăng nhập", { cause: 401 });
    }

    const { Id } = await params;
    const appointmentId = parseInt(Id, 10);

    if (isNaN(appointmentId) || appointmentId <= 0) {
      throw new Error("Id không hợp lệ", { cause: 400 });
    }

    const response = await cms.get("/pos/appointment", {
      params: {
        _lay: "previewAppointment",
        appointment_id: appointmentId,
      },
    });

    const data = prop(response, ...["data", "module", "views", "0", "data"]);

    const message =
      (
        prop(response, ...["data", "messages"])?.map((item: any) =>
          prop(item, ...["mes"]),
        ) || []
      )?.join(", ") || "";

    if (!data && message) {
      throw new Error(message, { cause: 500 });
    }

    if (!data) {
      throw new Error("Không tìm thấy cuộc hẹn", { cause: 404 });
    }

    if (data?.AppointedTo) {
      const staffResponse = await saas.get("/api/users", {
        params: {
          filters: {
            id: {
              $eq: Number.parseInt(data?.AppointedTo, 10),
            },
          },
          populate: {
            user_info: {
              fields: ["name"],
              populate: {
                avatar: {
                  fields: ["url", "formats"],
                },
              },
            },
          },
          pagination: {
            pageSize: 1,
          },
        },
      });


      if (!staffResponse?.data?.[0]) {
        throw new Error("Không tìm thấy thông tin bác sĩ", { cause: 404 });
      }

      data.Staff = staffResponse?.data?.[0]?.user_info || null;
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
