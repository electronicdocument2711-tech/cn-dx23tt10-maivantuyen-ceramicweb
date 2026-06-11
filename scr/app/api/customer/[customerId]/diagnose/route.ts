import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { prop } from "remeda";
import { cms } from "@/lib/cms";
import { validToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ customerId: string }>;
  }
) {
  try {
    const { customerId } = await context.params;
    const id = parseInt(customerId, 10);
    if (isNaN(id) || id <= 0) throwError("Id khách hàng không hợp lệ", 400);

    const validateToken = validToken(req);
    if (!validateToken) throwError("Token không hợp lệ", 401);

    const authRes = await cms.get("/authen/authorize");
    if (
      authRes?.status !== 200 ||
      !prop(authRes, ...["data", "module", "code"])
    )
      throwError("Chưa đăng nhập", 401);

    const formData = new FormData();
    formData.append("CustomerId", customerId);
    const res = await cms.post(
      "/pos/treatment?_lay=getActiveTreatmentByCustomerId",
      formData
    );

    if (res.status !== 200)
      throwError("Lấy thông tin chuẩn đoán thất bại do lỗi máy chủ", 502);

    const diagnose = res.data?.module?.views?.[0];
    if (!diagnose)
      throwError("Lấy thông tin chuần đoán thất bại do lỗi máy chủ", 502);

    const diagnoseData = {
      name: diagnose.name,
      data: {
        code: diagnose.data.code,
        data: diagnose.data.data ?? "",
      },
    };

    return NextResponse.json(diagnoseData, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json();
    const id = parseInt(customerId, 10);
    if (isNaN(id) || id <= 0) throwError("Id khách hàng không hợp lệ", 400);

    const validateToken = validToken(req);
    if (!validateToken) throwError("Token không hợp lệ", 401);
    const authRes = await cms.get("/authen/authorize");
    if (
      authRes?.status !== 200 ||
      !prop(authRes, ...["data", "module", "code"])
    )
      throwError("Chưa đăng nhập", 401);

    const formData = new FormData();
    formData.append("CustomerId", customerId);
    const res = await cms.post(
      "/pos/treatment?_act=createBlankTreatment",
      formData
    );

    const data = res.data?.module;
    if (res.status !== 200 || !data)
      throwError("Tạo đợt điều trị thất bại do lỗi máy chủ", 502);

    if (!data.code) {
      const mes =
        res.data.messages?.[0]?.mes ||
        "Tạo đợt điều trị thất bại do lỗi máy chủ";
      throwError(mes, 502);
    }

    const diagnoseData = {
      code: data.code,
      data: data.data ?? "",
    };

    return NextResponse.json(diagnoseData, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
