import { randomBytes } from "crypto";
import { saas } from "./saas";
import { throwError } from "./response";
import { getErrorMessage } from "./utils";

const apiToken = process.env.SYSTEM_TOKEN;

export type BusinessData = {
  id: string;
  documentId: string;
  name: string;
  email: string;
  phone: string;
  branches: any;
  owner: any;
  address: string;
  ref_id: string;
  user_infos: any;
};

export async function withOwnerPermission(userId: string): Promise<{
  isBusinessOwner: boolean;
  data: BusinessData;
}> {
  const business = await saas.get("/api/businesses", {
    params: { filters: { owner: { users: { id: { $eq: userId } } } } },
  });
  const businessData = business.data?.data as BusinessData[];
  if (!businessData || businessData.length === 0)
    return {
      isBusinessOwner: false,
      data: {
        id: "",
        documentId: "",
        name: "",
        email: "",
        phone: "",
        branches: [],
        owner: [],
        address: "",
        ref_id: "",
        user_infos: [],
      },
    };
  return {
    isBusinessOwner: true,
    data: businessData[0],
  };
}

export const generateToken = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const token = Array.from(randomBytes(length))
    .map((byte) => characters[byte % characters.length])
    .join("");
  return token;
};

export const createInviteToken = async (): Promise<{
  status: boolean;
  token: string;
  message: string;
  code: number;
}> => {
  const MAX_RETRIES = 5;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const inviteToken = generateToken(8);

      const hasTokenResponse = await saas.get(`/api/user-infos`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        params: {
          filters: {
            invite_token: {
              $eq: inviteToken,
            },
          },
        },
      });

      if (hasTokenResponse.status !== 200) {
        return {
          status: false,
          token: "",
          message: "Đã xảy ra lỗi máy chủ trong quá trình kiểm tra yêu cầu",
          code: hasTokenResponse.status,
        };
      }

      const results = hasTokenResponse.data?.data;
      if (!results || results.length === 0) {
        return {
          status: true,
          token: inviteToken,
          message: "Success",
          code: 200,
        };
      }
      attempts++;
    } catch {
      return {
        status: false,
        token: "",
        message: "Lỗi kết nối đến máy chủ Strapi",
        code: 500,
      };
    }
  }
  return {
    status: false,
    token: "",
    message:
      "Không thể tạo mã mời duy nhất sau nhiều lần thử. Vui lòng thử lại sau.",
    code: 500,
  };
};

export async function sendEmail(
  email: string,
  name: string,
  token: string,
): Promise<{ status: boolean; message: string; code: number }> {
  try {
    // Call API backEnd
    const res = await saas.post("/api/email/", {
      // from: "",
      to: email,
      subject: "Wellcome to GrowthBold Team",
      html: `
        <p>Hello, ${name}!</p>
        <p>Thank you for registering!</p>
        <p>You have to confirm your email address. Please click on the link below.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}">
            Verify account
          </a>
        </p>
        <p>Thanks.</p>
      `,
    });

    if (res.status !== 200) throwError("Send email error", 502);

    return {
      status: true,
      message: "Success",
      code: 200,
    };
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(error, "Send email error"),
      code: 500,
    };
  }
}

export async function sendEmailV2(
  email: string,
  subject: string,
  content: string,
): Promise<{ status: boolean; message: string; code: number }> {
  try {
    const res = await saas.post(
      "/api/email/",
      {
        // from: "",
        to: email,
        subject,
        html: content,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );

    if (res.status !== 200)
      throwError("Đã xảy ra lỗi trong quá trình gửi email", 502);

    return {
      status: true,
      message: "Success",
      code: 200,
    };
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(
        error,
        "Đã xảy ra lỗi trong quá trình gửi email",
      ),
      code: 500,
    };
  }
}

export async function getAllUserInfo(): Promise<{
  status: boolean;
  data: {
    id: string;
    documentId: string;
    name: string;
    email: string;
    invite_token: string;
  }[];
}> {
  try {
    const infos = await saas.get("/api/user-infos");
    const infoLists = infos.data.data as {
      id: string;
      documentId: string;
      name: string;
      email: string;
      invite_token: string;
    }[];
    if (!infoLists || infoLists.length === 0)
      return { status: false, data: [] };
    return {
      status: true,
      data: infoLists,
    };
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return {
      status: false,
      data: [],
    };
  }
}
