import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { saas } from "@/lib/saas";
import { sendEmail, generateToken, getAllUserInfo } from "@/lib/saasHelper";

export async function POST(req: NextRequest) {
  try {
    const { email, name, documentId } = await req.json();
    console.log("");

    // Validate Input
    if (!email || !name || !documentId) {
      throwError("Missing reqired fields: email, name, documentId", 400);
    }

    // 1. Lấy user-info theo documentId
    const userInfoResponse = await saas.get(`/api/user-infos/${documentId}`, {
      params: {
        populate: "*",
      },
    });

    if (!userInfoResponse.data?.data) {
      throwError("User Info not found", 404);
    }

    const userInfo = userInfoResponse.data.data;

    // 2. Kiểm tra user đã có invite token chưa
    let token = userInfo.invite_token;

    if (!token) {
      // 3. Generate unique token nếu chưa có
      const allUserInfo = await getAllUserInfo();
      const existingTokens = allUserInfo.data
        .map((info) => info.invite_token)
        .filter(Boolean);

      do {
        token = generateToken(8);
      } while (existingTokens.includes(token));

      // 4. Update user-info với token mới
      await saas.put(`/api/user-infos/${documentId}`, {
        data: {
          invite_token: token,
        },
      });
    }

    // 5. Gửi email xác thực
    const emailResult = await sendEmail(email, name, token);

    if (!emailResult.status) {
      throwError(`Send email failed: ${emailResult.message}`, emailResult.code);
    }
    return NextResponse.json({
      success: true,
      message: "Verication email sent successful",
      email: email,
    });
  } catch (err) {
    return NextResponse.json(...handleError(err));
  }
}
