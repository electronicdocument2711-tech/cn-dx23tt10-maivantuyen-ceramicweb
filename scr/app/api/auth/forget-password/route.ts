import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { isValidEmail } from "@/lib";
import { saas } from "@/lib/saas";
import { createInviteToken, sendEmailV2 } from "@/lib/saasHelper";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const apiToken = process.env.SYSTEM_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string" || !isValidEmail(email))
      throwError("Email không hợp lệ", 400);

    const mailResponse = await saas.get(`/api/users`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      params: {
        populate: "*",
        filters: {
          email: {
            $eq: email,
          },
        },
      },
    });

    if (
      !mailResponse.data ||
      !(Array.isArray(mailResponse.data) && mailResponse.data.length > 0)
    )
      throwError("Email người dùng không tồn tại", 500);

    const userData = mailResponse.data[0];
    const currentUserInfo = userData.user_info;
    if (!currentUserInfo) throwError("Thông tin người dùng không tồn tại", 500);

    const inviteToken = await createInviteToken();
    if (inviteToken.status === false) throwError(inviteToken.message, 500);

    const updateTokenRes = await saas.put(
      `/api/user-infos/${currentUserInfo.documentId}`,
      {
        data: {
          invite_token: inviteToken.token,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );

    if (updateTokenRes.status !== 200)
      throwError(
        "Đã có lỗi xảy ra trong quá trình đặt lại mật khẩu, vui lòng thử lại sau",
        502,
      );

    const linkCreate = `${appUrl}/auth/forget-password/verify?code=${encodeURIComponent(inviteToken.token)}`;
    sendEmailV2(
      email,
      "Đặt lại mật khẩu tài khoản Dentalx",
      `
        <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt lại mật khẩu</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background-color: #4945ff; padding: 30px; text-align: center; color: white; }
    .content { padding: 30px; line-height: 1.6; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { background-color: #4945ff; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .link-alt { word-break: break-all; color: #4945ff; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 24px;">Khôi phục mật khẩu</h1>
    </div>
    <div class="content">
      <p>Chào bạn,</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nếu là bạn, vui lòng nhấn vào liên kết dưới đây để tiếp tục:</p>
      <p>
          <a href="${linkCreate}">
            Đặt lại mật khẩu ngay
          </a>
        </p>
      <hr style="border:none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px;">Nếu liên kết trên không hoạt động, bạn có thể copy link này vào trình duyệt:</p>
      <p class="link-alt">${linkCreate}</p>
    </div>
  </div>
</body>
      `,
    );

    return NextResponse.json(
      {
        message:
          "Đã gửi yêu cầu thành công, vui lòng kiểm tra email của bạn để tiếp tục",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
