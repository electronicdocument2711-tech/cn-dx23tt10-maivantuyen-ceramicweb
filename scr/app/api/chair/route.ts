import { NextRequest, NextResponse } from "next/server";
import { validToken } from "@/lib/auth";
import { cms } from "@/lib/cms";
import { prop } from "remeda";
import * as Yup from "yup";

const inputSchema = Yup.object().shape({
  AppointmentId: Yup.string(),
  CustomerId: Yup.string(),
  StartAt: Yup.string(),
  EstimateTime: Yup.string(),
  DentalChairId: Yup.string(),
});
export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;

    const BranchId = searchParams?.get("BranchId");
    const StartAt = searchParams?.get("StartAt");
    const EndAt = searchParams?.get("EndAt");

    const res = await cms.get("/pos/dentalChair", {
      params: { _lay: "availableDentalChair", BranchId, StartAt, EndAt },
    });

    return NextResponse.json(res?.data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}

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

    const formData = new FormData();

    formData.append("AppointmentId", validatedData?.AppointmentId ?? "");
    formData.append("CustomerId", validatedData?.CustomerId ?? "");
    formData.append("StartAt", validatedData?.StartAt ?? "");
    formData.append("EstimateTime", validatedData?.EstimateTime ?? "");
    formData.append("DentalChairId", validatedData?.DentalChairId ?? "");

    const res = await cms.post(
      `/pos/dentalChair?_act=dentalChairBooking.save`,
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
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}
