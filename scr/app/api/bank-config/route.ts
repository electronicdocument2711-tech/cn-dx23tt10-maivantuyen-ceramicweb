import { saas } from "@/lib/saas";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await saas.get("/api/config", {
      params: {
        fields: ["bank_info"],
      },
    });

    return NextResponse.json(
      {
        data: data?.data?.data?.bank_info || null,
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
