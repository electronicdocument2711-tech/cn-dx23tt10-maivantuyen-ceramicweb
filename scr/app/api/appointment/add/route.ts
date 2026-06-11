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
  branch_id: Yup.string().required("Mã chi nhánh là bắt buộc"),
  customer_id: Yup.string().required("Mã khách hàng là bắt buộc"),
  date: Yup.string()
    .required("Ngày hẹn là bắt buộc")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Ngày hẹn phải có định dạng YYYY-MM-DD"),
  start_time: Yup.string()
    .required("Giờ bắt đầu là bắt buộc")
    .matches(/^([0-1]?\d|2[0-3]):([0-5]\d)$/, "Giờ bắt đầu không đúng"),
  duration: Yup.number()
    .required("Thời lượng là bắt buộc")
    .positive("Thời lượng phải là số dương"),
  doctor_id: Yup.string(),
  appointment_label_id: Yup.string().required("Mã loại lịch hẹn là bắt buộc"),
  notes: Yup.string(),
  appointmentId: Yup.number().optional(),
  chair_id: Yup.string().nullable(),
  mark_deleted_booked_chair_id: Yup.string().nullable(),
});

export async function POST(req: NextRequest) {
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

    let userByDoctorId = 0;

    if (validatedData?.doctor_id) {
      userByDoctorId = await saas
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
    }

    const [hour, minute] = validatedData?.start_time?.split(":");

    const startAt = dayjs
      .tz(validatedData?.date, "Asia/Ho_Chi_Minh")
      .set("hour", parseInt(hour, 10))
      .set("minute", parseInt(minute, 10));

    const endAt = startAt.add(validatedData?.duration, "minute");

    const formData = new FormData();

    formData.append("Appointment[AtBranchId]", validatedData?.branch_id);
    formData.append("Appointment[StartAt]", startAt.format("YYYY-MM-DD HH:mm"));
    formData.append("Appointment[EndAt]", endAt.format("YYYY-MM-DD HH:mm"));
    if (userByDoctorId) {
      formData.append("Appointment[AppointedTo]", String(userByDoctorId));
    }
    formData.append("Appointment[CustomerId]", validatedData?.customer_id);
    formData.append("Labels[0]", validatedData?.appointment_label_id);

    formData.append("Appointment[Note]", validatedData?.notes || "");

    if (validatedData?.appointmentId) {
      formData.append(
        "Appointment[AppointmentId]",
        String(validatedData?.appointmentId),
      );
    }

    const res = await cms.post("/pos/appointment/?_act=save", formData);

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

    const appointmentData = prop(res, ...["data", "module", "data"]);

    let chairBookingError = false;

    if (validatedData?.mark_deleted_booked_chair_id) {
      try {
        const deleteBookingFormData = new FormData();
        deleteBookingFormData.append(
          "DentalChairBookingId",
          validatedData.mark_deleted_booked_chair_id,
        );

        const deleteBookingRes = await cms.post(
          "/pos/dentalChair?_act=dentalChairBooking.markDelete",
          deleteBookingFormData,
        );

        if (deleteBookingRes?.status === 200) {
          const deleteBookingCode = prop(
            deleteBookingRes,
            ...["data", "module", "code"],
          );

          if (!deleteBookingCode) {
            chairBookingError = true;
          }
        } else {
          chairBookingError = true;
        }
      } catch {
        chairBookingError = true;
      }
    }

    if (validatedData?.chair_id && appointmentData) {
      try {
        const appointmentId = String(appointmentData?.AppointmentId);
        const bookingFormData = new FormData();
        bookingFormData.append("AppointmentId", appointmentId);
        bookingFormData.append("CustomerId", validatedData.customer_id);
        bookingFormData.append("StartAt", startAt.unix().toString());
        bookingFormData.append(
          "EstimateTime",
          validatedData.duration.toString(),
        );
        bookingFormData.append("DentalChairId", validatedData.chair_id);

        const chairRes = await cms.post(
          "/pos/dentalChair?_act=dentalChairBooking.save",
          bookingFormData,
        );

        if (chairRes?.status === 200) {
          const chairCode = prop(chairRes, ...["data", "module", "code"]);

          if (!chairCode) {
            chairBookingError = true;
          }
        } else {
          chairBookingError = true;
        }
      } catch {
        chairBookingError = true;
      }
    }

    return NextResponse.json(
      {
        data: appointmentData,
        chairBookingError,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
