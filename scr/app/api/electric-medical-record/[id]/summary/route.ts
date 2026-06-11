import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";

export async function GET(
  _request: NextRequest,
  { params }: Readonly<{ params: Promise<{ id: string }> }>,
) {
  try {
    const { id } = await params;

    const response = await saas.get(`/api/electronic-medical-records/${id}`, {
      params: {
        fields: ["order_detail_ids"],
      },
    });

    const orderDetailIds = response?.data?.data?.order_detail_ids || [];

    if (!orderDetailIds.length) {
      throw new Error("Không tìm thấy phiếu khám nào", {
        cause: 404,
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
      throw new Error("Không tìm thấy phiếu khám nào", {
        cause: 404,
      });
    }

    return NextResponse.json({ data: cmsResponse });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
