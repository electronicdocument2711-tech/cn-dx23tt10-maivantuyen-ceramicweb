import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";
import { NextRequest, NextResponse } from "next/server";
import { prop, uniqueBy } from "remeda";

export async function GET(
  _: NextRequest,
  { params }: Readonly<{ params: Promise<{ customerId: string }> }>,
) {
  try {
    const { customerId } = await params;

    const authorize = await cms.get("/authen/authorize");

    if (!prop(authorize, ...["data", "module", "code"])) {
      throw new Error("Chưa đăng nhập", { cause: 401 });
    }

    const userBusinessId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    const response = await saas.get("/api/electronic-medical-records", {
      params: {
        filters: {
          api_customer_id: {
            $eq: customerId,
          },
          business: {
            id: {
              $eq: userBusinessId,
            },
          },
          deleted_at: {
            $null: true,
          },
        },
        sort: ["createdAt:desc"],
        pagination: {
          page: 1,
          pageSize: 100,
        },
      },
    });

    if (response.status !== 200) {
      throw new Error(response?.message || "Lấy bệnh án điện tử thất bại", {
        cause: response.status,
      });
    }

    const eMedicalRecords = prop(response, ...["data", "data"]) || [];

    const orderDetailIds =
      eMedicalRecords
        ?.map((item: any) => item?.order_detail_ids || [])
        ?.flat() || [];

    const formData = new FormData();
    orderDetailIds.forEach((id: string) => {
      formData.append("OrderDetailIds[]", id);
    });

    // *: get medical session
    const medicalSessions = await cms
      .post("/pos/treatment?_lay=getMedicalSessionByOrderDetailIds", formData)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(res?.message || "Lấy phiếu khám thất bại", {
            cause: res.status,
          });
        }

        return prop(res, ...["data", "module", "views", "0", "data"]) || [];
      });

    for (const record of eMedicalRecords) {
      record.medicalSessions = uniqueBy(
        medicalSessions.filter((session: any) =>
          record?.order_detail_ids.some(
            (id: string) => id === session?.OrderDetailId,
          ),
        ),
        (item) => item?.MedicalSessionId,
      );

      delete record?.order_detail_ids;
    }

    return NextResponse.json(eMedicalRecords, {
      status: 200,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
