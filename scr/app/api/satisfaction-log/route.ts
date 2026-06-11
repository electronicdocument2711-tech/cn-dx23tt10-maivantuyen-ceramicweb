import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, emotionState } = body as {
      customerId?: string;
      emotionState: number;
    };

    if (!customerId || emotionState < 0) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ" },
        { status: 400 },
      );
    }

    const formData = new FormData();
    formData.append("CustomerId", customerId);
    formData.append("EmotionalState", String(emotionState));

    const res = await cms.post(
      "pos/customer?_lay=updateEmotionalState",
      formData,
    );

    if (res?.status !== 200) {
      throw new Error("Cập nhật trạng thái cảm xúc thất bại");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
