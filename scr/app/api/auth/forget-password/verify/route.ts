import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { saas } from "@/lib/saas";
import { cms } from "@/lib/cms";

const apiToken = process.env.SYSTEM_TOKEN;

export async function GET(_req: NextRequest) {
  try {
    const searchParams = await _req.nextUrl.searchParams;
    const code = searchParams.get("code");
    if (!code || code.trim() === "") throwError("Mã yêu cầu không hợp lệ", 400);

    const checkTokenRes = await saas.get(`/api/user-infos`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      params: {
        filters: {
          invite_token: {
            $eq: code,
          },
        },
      },
    });

    if (
      !(
        checkTokenRes.status === 200 &&
        checkTokenRes.data &&
        Array.isArray(checkTokenRes.data.data) &&
        checkTokenRes.data.data.length > 0
      )
    )
      throwError("Mã yêu cầu không tồn tại hoặc đã hoàn thành", 502);

    return NextResponse.json(
      { status: true, message: "Success" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const searchParams = await req.nextUrl.searchParams;
    const code = searchParams.get("code");

    const { password } = await req.json();
    if (!password || password.trim() === "")
      throwError("Mật khẩu không được để trống", 400);

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]/~`+=;']).{8,}$/.test(
        password,
      )
    ) {
      throwError(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
        400,
      );
    }

    const checkTokenRes = await saas.get(`/api/user-infos`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      params: {
        populate: "*",
        filters: {
          invite_token: {
            $eq: code,
          },
        },
      },
    });

    if (
      !(
        checkTokenRes.status === 200 &&
        checkTokenRes.data &&
        Array.isArray(checkTokenRes.data.data) &&
        checkTokenRes.data.data.length > 0
      )
    )
      throwError("Liên kết yêu cầu không tồn tại hoặc đã hoàn thành", 502);

    const userInfo = checkTokenRes.data.data[0];

    //update password
    const passRes = await saas.put(
      `/api/users/${userInfo.users[0].id}`,
      {
        password,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );

    if (passRes.status !== 200)
      throwError("Đã có lỗi xảy ra, vui lòng thử lại sau", 502);

    //sync password with cms server
    const syncPasswordRes = await cms.post(
      "/authen/change-password-by-system",
      { Email: userInfo.email, Password: password },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERMANENT_TOKEN}`,
        },
      },
    );

    if (!syncPasswordRes?.data?.module?.code) {
      console.error(
        "[verify] CMS password sync failed for:",
        userInfo.email,
        "error:",
        syncPasswordRes.data.messages[0].mes || "Unknown error",
      );
    }

    //clear token after update password, not allow reuse token
    saas
      .put(
        `/api/user-infos/${userInfo.documentId}`,
        {
          data: {
            invite_token: null,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        },
      )
      .catch(() => {}); // ignore error if clear token fail, not important

    return NextResponse.json(
      { status: true, message: "Success" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
