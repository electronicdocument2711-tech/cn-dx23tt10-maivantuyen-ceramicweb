import { saas } from "@/lib/saas";
import { NextRequest, NextResponse } from "next/server";
import * as Yup from "yup";

const inputSchema = Yup.object().shape({
  email: Yup.string().email().required(),
});

const headers = {
  Authorization: `Bearer ${process.env.SYSTEM_TOKEN}`,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await inputSchema.validate(body);

    const response = await saas
      .get("/api/users", {
        headers,
        params: {
          filters: {
            email: body.email,
          },
          pagination: {
            page: 1,
            pageSize: 1,
          },
        },
      })
      .catch((axiosError) => {
        throw new Error(
          axiosError.response?.data?.message ||
            axiosError?.message ||
            "Lỗi kiểm tra email",
          axiosError.response?.status
            ? { cause: axiosError.response.status }
            : undefined
        );
      });

    console.log("response: ", response);

    if (response.data && response.data.length > 0) {
      throw new Error("Email đã được đăng ký", { cause: 409 });
    }

    return NextResponse.json({ message: "Email khả dụng" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Lỗi không xác định",
      },
      { status: error?.cause || 500 }
    );
  }
}
