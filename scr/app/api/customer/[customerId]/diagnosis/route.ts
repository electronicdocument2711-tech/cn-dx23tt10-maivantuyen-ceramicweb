import { validToken } from "@/lib/auth";
import { cms } from "@/lib/cms";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";
import * as Yup from "yup";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const diagnosisSchema = Yup.object().shape({
  diagnosisId: Yup.string().required("Mã chẩn đoán không được để trống"),
  anatomyBodyPartItemIds: Yup.array()
    .of(Yup.number().required("Mã bộ phận cơ thể không được để trống"))
    .min(1, "Vui lòng chọn ít nhất một bộ phận cơ thể")
    .required("Bộ phận cơ thể không được để trống"),
});

const validateSchema = Yup.object().shape({
  notes: Yup.string(),
  isAdult: Yup.boolean().required(
    "Vui lòng xác định khách hàng là người lớn hay trẻ em",
  ),
  diagnosis: Yup.array()
    .of(diagnosisSchema)
    .min(1, "Vui lòng thêm ít nhất một chẩn đoán")
    .required("Chẩn đoán không được để trống"),
});

export async function POST(
  request: NextRequest,
  { params }: Readonly<{ params: Promise<{ customerId: string }> }>,
) {
  try {
    const { customerId } = await params;
    if (!customerId) {
      throw new Error("Mã khách hàng không hợp lệ", {
        cause: 400,
      });
    }

    if (!(await validToken(request))) {
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

    // *: validate data
    const validatedData = await validateSchema
      .validate(await request.json())
      .catch((error) => {
        if (error instanceof Yup.ValidationError) {
          throw new Error(error?.message, { cause: 400 });
        }

        throw new Error("Dữ liệu không hợp lệ", { cause: 400 });
      });

    const formData = new FormData();

    formData.append("PersonDiagnosis[PersonId]", customerId);
    if (validatedData?.notes) {
      formData.append("PersonDiagnosis[Note]", validatedData?.notes);
    }
    formData.append(
      "PersonDiagnosis[StartDate]",
      dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD"),
    );
    formData.append(
      "PersonDiagnosis[IsAdult]",
      validatedData.isAdult ? "1" : "0",
    );

    for (let i = 0; i < validatedData.diagnosis.length; i++) {
      const diagnosis = validatedData.diagnosis[i];

      formData.append(`Diagnosis[${i}][DiagnosisId]`, diagnosis.diagnosisId);
      if (validatedData?.notes) {
        formData.append(`Diagnosis[${i}][Note]`, validatedData?.notes);
      }

      validatedData?.diagnosis?.[i]?.anatomyBodyPartItemIds?.forEach(
        (anatomyBodyPartItemId, index) => {
          formData.append(
            `Diagnosis[${i}][AnatomyBodyPartItemId][${index}]`,
            anatomyBodyPartItemId.toString(),
          );
        },
      );
    }


    console.log("FOrm", formData);
    

    // *: call cms to create diagnosis
    const createDiagnosisResponse = await cms.post(
      "/pos/treatment?_act=PersonDiagnosis.savePersonDiagnosisV2",
      formData,
    );
    console.log(
      "🚀 ~ POST ~ createDiagnosisResponse:",
      createDiagnosisResponse?.data,
    );

    if (!prop(createDiagnosisResponse, ...["data", "module", "code"])) {
      const message =
        prop(createDiagnosisResponse, ...["data", "messages"])
          ?.map((item: any) => item?.mes || "")
          ?.join("\n") || "Tạo chẩn đoán thất bại";

      throw new Error(message, { cause: 400 });
    }

    return NextResponse.json(
      {
        message: "Tạo chẩn đoán thành công",
        data: prop(createDiagnosisResponse, ...["data", "module", "data"]),
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
