import { cms } from "@/lib/cms";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";

export async function GET(
  _request: NextRequest,
  { params }: Readonly<{ params: Promise<{ id: string }> }>,
) {
  try {
    const { id } = await params;

    const formData = new FormData();
    formData.append("ServiceTaxInfoId", id);
    const response = await cms.post(
      "pos/service?_lay=ServiceTaxInfo.getServiceTaxInfoDetails",
      formData,
    );

    const data =
      prop(response, ...["data", "module", "views", "0", "data"]) || {};

    if (!data) {
      throw new Error(`Không tìm thấy thông tin dịch vụ với id: ${id}`, {
        cause: 404,
      });
    }

    return NextResponse.json({
      data: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
