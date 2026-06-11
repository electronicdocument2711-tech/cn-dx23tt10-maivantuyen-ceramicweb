import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, ValidateTokenAndAuth } from "@/lib/response";
import { validToken } from "@/lib/auth";
import { saas } from "@/lib/saas";
import { cms } from "@/lib/cms";
import { getErrorMessage } from "@/lib/utils";
import {
  generateToken,
  withOwnerPermission,
  sendEmailV2,
  BusinessData,
  createInviteToken,
} from "@/lib/saasHelper";
import { isValidEmail, isValidPhone } from "@/lib";
import { businessRoles, userRoles } from "@/data/roles";
import { defaultTo } from "remeda";

const sendInviteEmail = async (
  email: string,
  name: string,
  businessData: BusinessData,
  token: string,
): Promise<{
  status: boolean;
  message: string;
  code: number;
}> => {
  return await sendEmailV2(
    email,
    "Lời mời tham gia Dentalx",
    `
          <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tham gia Dentalx</title>
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
      <h1 style="margin:0; font-size: 24px;">Lời mời tham gia Dentalx</h1>
    </div>
    <div class="content">
      <p>Xin chào, ${name}!</p>
      <p>Bạn có một lời mời gia nhập ${businessData.name} trên DentalX, vui lòng nhấn vào liên kết sau để nhận lời:</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/verification/${token}">
              Tham gia ngay
            </a>
          </p>
      <hr style="border:none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px;">Nếu liên kết trên không hoạt động, bạn có thể copy link này vào trình duyệt:</p>
      <p class="link-alt">${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}</p>
      <p>Trân trọng,</p>
      <p>Đội ngũ DentalX</p>
    </div>
  </div>
</body>`,
  );
};

const authHeaders = {
  Authorization: `Bearer ${defaultTo(process.env.PERMANENT_TOKEN, "")}`,
};

function splitFullName(fullName: string) {
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length <= 1) {
    return { firstName: nameParts[0] || "", middleName: "", lastName: "" };
  }
  const firstName = nameParts.pop();
  const lastName = nameParts.shift();
  const middleName = nameParts.join(" ");
  return { lastName, middleName, firstName };
}

async function CreateAccount({
  email,
  name,
  phone,
  role,
  businessData,
  businessRoleId,
  businessNumericId,
}: {
  email: string;
  name: string;
  phone: string;
  role: number;
  businessRoleId: string;
  businessData: BusinessData;
  businessNumericId: string;
}): Promise<{
  email: string;
  status: boolean;
  accountStatus: "active" | "created" | "failed" | "pending";
  message: string;
  code: number;
}> {
  try {
    const password = generateToken(8);
    const res = await saas.post("/api/users", {
      username: email,
      email,
      password,
      role,
      confirmed: false,
    });

    const data = res.data as {
      id: string;
      documentId: string;
      username: string;
      email: string;
      provider: string;
      confirmed: boolean;
      blocked: boolean;
    };

    if (!data) throwError("Create user error", 500);

    // Create user in CMS Auth Service (same business's ClientGroup, no new group created)
    const clientGroupRes = await cms.get(
      `/authen/client-groups/${businessNumericId}`,
      { headers: authHeaders },
    );
    const JWTStatic = clientGroupRes?.data?.module?.data?.JWTStatic as
      | string
      | undefined;

    if (!JWTStatic) {
      await saas.delete(`/api/users/${data.id}`);
      return {
        email,
        status: false,
        accountStatus: "failed",
        message: "Failed to retrieve business auth token",
        code: 502,
      };
    }

    const nameSplited = splitFullName(name);
    const firstName = nameSplited?.firstName || nameSplited?.lastName;
    const lastName = nameSplited?.lastName || nameSplited?.firstName;

    const formData = new FormData();
    formData.append("Staff[Email]", email);
    formData.append("Staff[PersonalEmail]", "_" + email);
    if (firstName) formData.append("Staff[FirstName]", firstName);
    if (lastName) formData.append("Staff[LastName]", lastName);
    formData.append("Staff[Password]", password);
    formData.append("Staff[GenderId]", "1");
    formData.append("ClientGroupId", businessNumericId);
    formData.append("IsCreateWorkProfile", "1");
    formData.append("Staff[DateOfBirth]", "1990-01-01");
    formData.append("Staff[UserId]", data.id.toString());

    const cmsUserRes = await cms.post("/authen/users", formData, {
      headers: { Authorization: "Bearer " + JWTStatic },
    });

    const cmsUserId = cmsUserRes?.data?.module?.data?.UserId;
    if (!cmsUserId) {
      await saas.delete(`/api/users/${data.id}`);
      return {
        email,
        status: false,
        accountStatus: "failed",
        message: "Failed to create user in Auth Service",
        code: 502,
      };
    }

    const hasInfor = await saas.get("/api/user-infos", {
      params: {
        filters: {
          email: {
            $eq: email,
          },
        },
      },
    });

    if (hasInfor.status !== 200)
      throwError(
        "Đã xảy ra lỗi trong quá trình kiểm tra thông tin người dùng, vui lòng thử lại sau",
        500,
      );

    const infoLists = (hasInfor.data.data as any[]) ?? [];

    if (!infoLists || infoLists.length === 0) {
      const inviteToken = await createInviteToken();
      if (inviteToken.status === false) throwError(inviteToken.message, 500);

      const createInfo = await createUserInfor({
        email,
        name,
        phone,
        userId: data.documentId,
        businessId: businessData.documentId,
        businessRoleId,
        invite_token: inviteToken.token,
      });

      if (createInfo.status === false) {
        await saas.delete(`/api/users/${data.id}`);
        return {
          email,
          status: false,
          message:
            "Đã xảy ra lỗi trong quá trình khởi tạo thông tin người dùng, vui lòng thử lại sau",
          accountStatus: "failed",
          code: createInfo.code,
        };
      }
      //not-waiting send mail status
      sendInviteEmail(email, name, businessData, inviteToken.token);
    }

    return {
      email,
      status: true,
      message: "Success",
      accountStatus: "created",
      code: 201,
    };
  } catch (error: any) {
    if (error.status === 400) {
      const confirm = await getAccountConfirmed(email);
      if (confirm.status) {
        return {
          email,
          status: false,
          message: "Người dùng đã tồn tại trong hệ thống!!!",
          accountStatus: confirm.confirmed ? "active" : "pending",
          code: 400,
        };
      }
    }
    return {
      email,
      status: false,
      accountStatus: "failed",
      message: error.message,
      code: error.status ?? 500,
    };
  }
}

async function getAccountConfirmed(
  email: string,
): Promise<{ status: boolean; confirmed: boolean }> {
  try {
    const res = await saas.get(`/api/users?filters[email][$eq]=${email}`);
    const data = res.data as {
      id: string;
      documentId: string;
      username: string;
      email: string;
      provider: string;
      confirmed: boolean;
      blocked: boolean;
    }[];
    return {
      status: true,
      confirmed: data[0].confirmed,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      status: false,
      confirmed: false,
    };
  }
}

async function createUserInfor({
  email,
  name,
  phone,
  userId,
  businessId,
  businessRoleId,
  invite_token,
}: {
  email: string;
  name: string;
  phone: string;
  userId: string;
  businessId: string;
  businessRoleId: string;
  invite_token: string;
}): Promise<{
  status: boolean;
  message: string;
  code: number;
  data: any;
}> {
  try {
    const base = {
      email,
      name,
      users: userId,
      business: businessId,
      business_role: businessRoleId,
      invite_token,
    };

    const data =
      phone !== ""
        ? { ...base, phone }
        : {
            ...base,
          };

    const res = await saas.post("/api/user-infos", {
      data,
    });

    const info = res.data.data;
    if (!info) throwError("Tạo thông tin người dùng thất bại", 500);
    return {
      status: true,
      message: "Success",
      code: 201,
      data: info,
    };
  } catch (error: any) {
    return {
      status: false,
      message: getErrorMessage(error, "Tạo thông tin người dùng thất bại"),
      code: 500,
      data: {
        id: "",
        documentId: "",
        email: "",
        name: "",
        invite_token: "",
      },
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = await request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20", 10);
    if (isNaN(page) || page < 1) throwError("Page không hợp lệ", 400);
    if (isNaN(pageSize) || pageSize < 1)
      throwError("Page size không hợp lệ", 400);

    await ValidateTokenAndAuth(request);

    const tokenData = await validToken(request);
    const userRes = await saas.get("/api/users", {
      params: {
        populate: {
          user_info: {
            populate: "*",
          },
        },
        filters: {
          id: {
            $eq: tokenData?.id ?? "",
          },
        },
      },
    });

    const businessId = userRes.data[0].user_info.business.documentId;
    const infos = await saas.get("/api/user-infos", {
      params: {
        populate: "*",
        filters: {
          users: {
            confirmed: {
              $eq: false,
            },
          },
          business: {
            documentId: {
              $eq: businessId,
            },
          },
        },
        pagination: {
          page,
          pageSize,
        },
      },
    });

    const userInfors = infos.data.data;
    if (!userInfors) throwError("Get user null", 500);
    if (userInfors.length === 0) return NextResponse.json([], { status: 200 });
    const pagination = infos.data.meta.pagination;

    const response = userInfors.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        title: item.business_role.name,
        inviteTime: item.createdAt,
      };
    });

    return NextResponse.json({ data: response, pagination }, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const tokenData = await validToken(req);
    if (!tokenData) throwError("Chưa đăng nhập, vui lòng đăng nhập lại", 401);

    const { staffs } = await req.json();
    if (!staffs || staffs.length === 0)
      throwError(
        "Thông tin nhân viên không hợp lệ, vui lòng kiểm tra lại",
        400,
      );

    for (const staff of staffs) {
      if (
        !staff.name ||
        staff.name.trim() === "" ||
        !staff.email ||
        !staff.position ||
        staff.position.trim() === ""
      )
        throwError("Missing required fields", 400);
      if (staff.phone && !isValidPhone(staff.phone))
        throwError(
          "Số điện thoại không hợp lệ, 0xx-xxx-xxxx hoặc +84xx-xxx-xxxx",
          400,
        );

      if (!isValidEmail(staff.email)) throwError("Email không hợp lệ", 400);

      if (
        !businessRoles.some((role) => role.ordering === Number(staff.position))
      )
        throwError("Chức vụ không hợp lệ", 400);
    }

    const businessPermission = await withOwnerPermission(tokenData.id);
    if (businessPermission.isBusinessOwner === false)
      throwError("Không đủ quyền hạn thực hiện tác vụ", 403);

    const authenticatedRole = userRoles.find(
      (role) => role.type === "authenticated",
    );
    if (!authenticatedRole) throwError("Tài khoản không đủ quyền hạn", 502);

    const createUsers: {
      status: boolean;
      message: string;
      code: number;
    }[] = [];

    for (const staff of staffs) {
      const businessRoleId =
        businessRoles.find(
          (businessrole) => businessrole.ordering === Number(staff.position),
        )?.documentId ?? "";

      createUsers.push(
        await CreateAccount({
          email: staff.email,
          name: staff.name,
          phone: staff.phone,
          role: authenticatedRole.id,
          businessData: businessPermission.data,
          businessNumericId: businessPermission.data.id,
          businessRoleId,
        }),
      );
    }

    return NextResponse.json(createUsers, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const tokenData = await validToken(req);
    if (!tokenData) throwError("Chưa đăng nhập, vui lòng đăng nhập lại", 401);

    const { id } = await req.json();
    if (!id || !/^[0-9]+$/.test(id)) throwError("Id không hợp lệ", 400);

    const businessPermission = await withOwnerPermission(tokenData.id);
    if (!businessPermission.isBusinessOwner)
      throwError("Không đủ quyền hạn thực hiện tác vụ", 403);

    const userInfor = await saas.get("/api/user-infos", {
      params: {
        populate: "*",
        filters: { id: { $eq: id } },
      },
    });
    const userInforData = userInfor.data.data;
    if (!userInforData || userInforData.length === 0)
      throwError("Đã xảy ra lỗi trong quá trình lấy thông tin người dùng", 500);

    const info = userInforData[0];
    const activeUser = await getAccountConfirmed(info.email);
    if (!activeUser || activeUser.confirmed) {
      return NextResponse.json(
        { message: "Người dùng đã được kích hoạt trước đó" },
        { status: 400 },
      );
    }

    let token = info.invite_token;
    if (!token) {
      token = generateToken(8);
      // bypass unique check for invite_token exists on another account,because strapi limit document when get all
      await saas.put(`/api/user-infos/${info.documentId}`, {
        data: {
          invite_token: token,
        },
      });
    }
    sendInviteEmail(info.email, info.name, businessPermission.data, token);

    return NextResponse.json(
      { message: "Gửi lời mời thành công" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const tokenData = await validToken(req);
    if (!tokenData) throwError("Chưa đăng nhập, vui lòng đăng nhập lại", 401);

    const { id } = await req.json();
    if (!id || !/^[0-9]+$/.test(id)) throwError("Id không hợp lệ", 400);

    const businessPermission = await withOwnerPermission(tokenData.id);
    if (!businessPermission.isBusinessOwner)
      throwError("Không đủ quyền hạn thực hiện tác vụ", 403);

    const userInfor = await saas.get("/api/user-infos", {
      params: {
        populate: "*",
        filters: { id: { $eq: id } },
      },
    });
    const userInforData = userInfor.data.data;
    if (!userInforData || userInforData.length === 0)
      throwError("Đã xảy ra lỗi trong quá trình lấy thông tin người dùng", 500);

    const users = userInforData[0].users;
    if (!users || users.length === 0)
      throwError("Thông tin người dùng không tồn tại", 500);

    const errorMessages: string[] = [];

    for (const user of users) {
      const userRes = await saas.delete(`/api/users/${user.id}`);
      if (userRes.status !== 200)
        errorMessages.push("Lỗi xóa người dùng, id:" + user.id);
    }

    const userInfosRes = await saas.delete(
      `/api/user-infos/${userInforData[0].documentId}`,
    );
    if (userInfosRes.status < 200 || userInfosRes.status >= 300)
      errorMessages.push(
        "Lỗi xóa thông tin người dùng, id:" + userInforData[0].id,
      );

    if (errorMessages.length > 0) throwError(errorMessages.join("; "), 502);

    return NextResponse.json(
      { message: "Xóa người dùng thành công" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
