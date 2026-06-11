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
    formData.append("ServiceId", id);

    const res = await cms.post("/pos/service?_lay=getServiceTaxInfoList", formData);

    if (res?.status !== 200) {
      throw new Error(`Lỗi khi gọi API: ${res?.message || "Unknown error"}`, {
        cause: res?.status || 500,
      });
    }

    const data = prop(res, ...["data", "module", "views", "0"]) || {};

    return NextResponse.json(
      {
        ...data,
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
