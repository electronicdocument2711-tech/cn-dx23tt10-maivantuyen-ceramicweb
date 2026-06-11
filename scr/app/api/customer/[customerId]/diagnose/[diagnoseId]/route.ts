import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { validToken } from "@/lib/auth";
import { prop } from "remeda";
import { cms } from "@/lib/cms";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ customerId: string; diagnoseId: string }> }
) {
  try {
    const { diagnoseId } = await context.params;
    const id = parseInt(diagnoseId, 10);
    if (isNaN(id) || id <= 0) throwError("Id không hợp lệ", 400);

    const validateToken = validToken(req);
    if (!validateToken) throwError("Token không hợp lệ", 401);

    const authRes = await cms.get("/authen/authorize");
    if (
      authRes?.status !== 200 ||
      !prop(authRes, ...["data", "module", "code"])
    )
      throwError("Chưa đăng nhập", 401);

    const res = await cms.get(
      `/pos/treatment?_lay=getTreatmentDetail&treatment_id=${id}`
    );

    if (res?.status !== 200)
      throwError("Lỗi máy chủ khi lấy thông tin chẩn đoán", 500);
    const data = res?.data?.module?.views?.[0];
    if (!data) throwError("Không tìm thấy thông tin chẩn đoán", 404);

    return NextResponse.json(data.data, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const validateToken = await validToken(req);
    if (!validateToken) throwError("Token không hợp lệ", 401);

    const payload = await req.json();
    if (!payload || typeof payload !== "object")
      throwError("Dữ liệu gửi lên không hợp lệ", 400);

    const personId = parseInt(payload.personId, 10);
    if (isNaN(personId) || personId <= 0)
      throwError("personId không hợp lệ", 400);

    const starDay = payload.startDate;
    if (!starDay || typeof starDay !== "string")
      throwError("startDate không hợp lệ", 400);

    const note = payload.Note;
    if (typeof note !== "string") throwError("Ghi chú không hợp lệ", 400);

    const isAdult = payload.isAdult;
    if (isAdult !== "0" && isAdult !== "1")
      throwError("Id loại răng không hợp lệ", 400);

    const diagnose = payload.diagnose;
    if (!Array.isArray(diagnose))
      throwError("Danh sách chuẩn đoán không hợp lệ", 400);
    else {
      for (const d of diagnose) {
        const id = parseInt(d.id, 10);
        if (isNaN(id) || id <= 0) throwError("Id chuẩn đoán không hợp lệ", 400);
        const selectedTeeths = d.anatomyBodyPartItemId;
        if (!Array.isArray(selectedTeeths))
          throwError("Danh sách răng không hợp lệ", 400);
        for (const tooth of selectedTeeths) {
          const toothId = parseInt(tooth, 10);
          if (isNaN(toothId) || toothId <= 0)
            throwError("Id răng không hợp lệ", 400);
        }
      }
    }

    const authRes = await cms.get("/authen/authorize");
    if (
      authRes?.status !== 200 ||
      !prop(authRes, ...["data", "module", "code"])
    )
      throwError("Chưa đăng nhập", 401);

    const formData = new FormData();
    formData.append("PersonDiagnosis[PersonDiagnosisId]", personId.toString());
    formData.append("PersonDiagnosis[Note]", note);
    formData.append("PersonDiagnosis[StartDate]", starDay);
    formData.append("PersonDiagnosis[IsAdult]", isAdult);
    diagnose.forEach((d, index) => {
      formData.append(`Diagnosis[${index}][DiagnosisId]`, d.id.toString());
      d.anatomyBodyPartItemId.forEach((tooth: string, toothIndex: number) => {
        formData.append(
          `Diagnosis[${index}][AnatomyBodyPartItemId][${toothIndex}]`,
          tooth.toString()
        );
      });
    });

    const res = await cms.post(
      "/pos/treatment?_act=PersonDiagnosis.savePersonDiagnosisV2",
      formData
    );

    if (res?.status !== 200)
      throwError("Lỗi máy chủ khi lưu thông tin chẩn đoán", 500);
    const resData = res?.data?.module;

    if (!resData.code) {
      const mes =
        res.data.messages?.[0]?.mes ||
        "Lỗi máy chủ khi lưu thông tin chẩn đoán";
      throwError(mes, 502);
    }

    return NextResponse.json(resData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(...handleError(error));
  }
}
