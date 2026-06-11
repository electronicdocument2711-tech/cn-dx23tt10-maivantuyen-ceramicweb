import { validToken } from "@/lib/auth";
import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function POST(
  request: NextRequest,
  { params }: Readonly<{ params: Promise<{ id: string }> }>,
) {
  try {
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

    const UserId = prop(
      authorize,
      ...["data", "module", "data", "user", "UserId"],
    );

    if (!clientGroupId) {
      throw new Error("Phòng khám không hợp lệ", {
        cause: 400,
      });
    }

    const { id } = await params;

    const medicalRecordCheck = await saas
      .get("/api/electronic-medical-records", {
        params: {
          filters: {
            business: {
              // thuôc phòng khám mình quản lý
              $eq: clientGroupId,
            },
            documentId: {
              $eq: id,
            },
            deleted_at: {
              // Chưa xóa
              $null: true,
            },
            is_completed: {
              $eq: false, // Chưa hoàn tất
            },
          },
        },
      })
      .then((res) => prop(res, ...["data", "data", "0"]));

    if (!medicalRecordCheck) {
      throw new Error("[C001] Không thể đóng hồ sơ này", {
        cause: 404,
      });
    }

    const orderDetailIds = medicalRecordCheck?.order_detail_ids || [];

    if (!orderDetailIds?.length) {
      throw new Error("[C002] Không thể đóng hồ sơ này", {
        cause: 500,
      });
    }

    const formData = new FormData();
    orderDetailIds.forEach((orderDetailId: number) =>
      formData.append("OrderDetailIds[]", orderDetailId.toString()),
    );

    const cmsResponse = await cms
      .post("/pos/treatment?_lay=sumaryElectricMedicalRecord", formData)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(res?.message || "Lấy phiếu khám thất bại", {
            cause: res.status,
          });
        }

        return prop(res, ...["data", "module", "views", "0", "data"]) || [];
      });

    if (!cmsResponse) {
      throw new Error("[C003] Không thể đóng hồ sơ này", {
        cause: 500,
      });
    }

    // * check dieu kien
    const isPassedAmount =
      Number(cmsResponse?.PaidAmount) >= Number(cmsResponse?.TotalAmount);
    const isPassedService =
      Number(cmsResponse?.DoneServices) >= Number(cmsResponse?.TotalServices);
    const isPassed = isPassedAmount && isPassedService;

    if (!isPassed) {
      throw new Error(
        "Chưa đủ điều kiện để đóng hồ sơ. Vui lòng kiểm tra lại dịch vụ đã thực hiện và thanh toán",
        {
          cause: 400,
        },
      );
    }

    // * handle close medical record logic here
    const updateResponse = await saas.put(
      `/api/electronic-medical-records/${id}`,
      {
        data: {
          is_completed: true,
          closed_by: UserId,
          closed_at: dayjs().tz("Asia/Ho_Chi_Minh").format(),
        },
      },
    );

    if (updateResponse?.status !== 200) {
      throw new Error(updateResponse?.message || "Đóng hồ sơ thất bại", {
        cause: updateResponse.status,
      });
    }

    // *: handle check and close treatment in cms here

    // * check trên saas xem tất cả bệnh án điện tử thuộc treatment đã đóng hết chưa
    const medicalRecordsInTreatment = await saas
      .get("/api/electronic-medical-records", {
        params: {
          filters: {
            api_treatment_id: medicalRecordCheck?.api_treatment_id,
            deleted_at: {
              $null: true,
            },
            is_completed: {
              $eq: false,
            },
          },
        },
      })
      .then((res) => prop(res, ...["data", "data"]) || []);

    if (!medicalRecordsInTreatment?.length) {
      // *: đóng treatment bên cms nếu không có bệnh án điện tử nào đang mở
      const formData = new FormData();
      formData.append("TreatmentId", medicalRecordCheck?.api_treatment_id);
      cms
        .post("/pos/treatment?_act=closeTreatment", formData)
        .then((res) => {
          if (res?.status !== 200) {
            throw new Error(res?.message || "Đóng treatment thất bại", {
              cause: res.status,
            });
          }

          if (!prop(res, ...["data", "module", "code"])) {
            throw new Error(res?.data?.message || "Đóng treatment thất bại", {
              cause: res.status,
            });
          }

          return res;
        })
        .catch((error) => {
          // TODO: nếu lỗi thì làm gì ta, chắc là sẽ log vào trong database để sau này dễ dàng check chứ nếu trả lỗi về đây thì sẽ rất khó xử lý
          // TODO: chắc để sau này gắn sentry quá
          saas.post("/api/app-error-logs", {
            data: {
              business_id: clientGroupId,
              user_id: UserId,
              message: `Đóng treatment ${medicalRecordCheck?.api_treatment_id} thất bại sau khi đã đóng hết bệnh án điện tử, cần kiểm tra lại trên cms`,
              endpoint: "/pos/treatment?_act=closeTreatment",
              method: "POST",
              status_code: error?.status || error?.cause || 500,
              stack: error?.stack,
              environment: process.env.NODE_ENV,
            },
          });
        });
    }

    return NextResponse.json(
      { message: "Đóng hồ sơ thành công" },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
