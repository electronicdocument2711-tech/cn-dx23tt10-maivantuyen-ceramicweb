// import { NextRequest, NextResponse } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { validToken } from "@/lib/auth";
import { prop } from "remeda";
import * as Yup from "yup";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { saas } from "@/lib/saas";

dayjs.extend(utc);
dayjs.extend(timezone);

const inputSchema = Yup.object().shape({
  doctor_id: Yup.string(),
});

export async function POST(
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

    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId) {
      throw new Error("Phòng khám không hợp lệ", {
        cause: 400,
      });
    }

    const validatedData = await inputSchema
      .validate(await req?.json(), {
        abortEarly: false,
      })
      .catch((error) => {
        let message = error?.message || "Dữ liệu không hợp lệ";

        if (error instanceof Yup.ValidationError) {
          message = error.errors.join("\n");
        }

        throw new Error(message, {
          cause: 400,
        });
      });

    const userByDoctorId = await saas
      .get("/api/user-infos", {
        params: {
          filters: {
            id: {
              $eq: validatedData?.doctor_id,
            },
          },
          populate: {
            users: true,
          },
        },
      })
      .then(
        (res) => prop(res, ...["data", "data", "0", "users", "0", "id"]) || 0,
      );

    if (!userByDoctorId) {
      throw new Error("Bác sĩ không hợp lệ", {
        cause: 400,
      });
    }

    const formData = new FormData();

    formData.append("AppointedTo", userByDoctorId);

    const { Id } = await params;

    formData.append("AppointmentId", String(Id));

    const res = await cms.post(
      "/pos/appointment/?_act=assignToDoctor",
      formData,
    );

    if (res?.status !== 200) {
      throw new Error("Tạo lịch hẹn thất bại, vui lòng thử lại", {
        cause: 502,
      });
    }

    const isSuccess = prop(res, ...["data", "module", "code"]);

    const messages = prop(res, ...["data", "messages"]) || [];

    if (!isSuccess && messages.length > 0) {
      throw new Error(
        messages?.map((item: any) => item?.mes || "").join("\n"),
        { cause: 502 },
      );
    } else if (!isSuccess) {
      throw new Error("Tạo lịch hẹn thất bại, vui lòng thử lại", {
        cause: 502,
      });
    }

    return NextResponse.json(prop(res, ...["data", "module", "code"]), {
      status: 201,
    });
  } catch (error: any) {
    console.error("error: ", error);
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
