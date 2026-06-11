import { saas } from "@/lib/saas";
import { NextRequest, NextResponse } from "next/server";
import { defaultTo } from "node_modules/remeda/dist/index.cjs";
import { pick, prop } from "remeda";
import dayjs from "@/lib/dayjs";
import crypto from "crypto";

import * as Yup from "yup";
import { cms } from "@/lib/cms";
import { getEncryptionKey } from "../route";
import { DEFAULT_BUSINESS_ROLE } from "@/data/roles";

interface CreateBusinessResponse {
  ClientGroupId: number;
  JWTStatic: string;
  documentId: string;
}

const headers = {
  Authorization: `Bearer ${defaultTo(process.env.SYSTEM_TOKEN, "")}`,
};

const authHeaders = {
  Authorization: `Bearer ${defaultTo(process.env.PERMANENT_TOKEN, "")}`,
};

const inputSchema = Yup.object().shape({
  name: Yup.string()
    .min(5, "Tên phòng khám phải có ít nhất 5 ký tự")
    .max(100)
    .required("Name is required"),
  session: Yup.string().required("Session ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    // *: validate fields
    const body = await req.json();
    const validatedBody = await inputSchema.validate(body, {
      abortEarly: false,
    });

    // *: kiểm tra register session có hợp lệ không

    const session = await saas
      .get(`/api/register-sessions/${validatedBody?.session}`, {
        headers,
        params: {
          fields: ["name", "email", "expires_at", "password"],
        },
      })
      .then((res) => {
        const expiresAt = dayjs(prop(res, ...["data", "data", "expires_at"]));
        if (!expiresAt.isValid() || expiresAt.isBefore(dayjs())) {
          throw new Error("Registration session has expired", { cause: 400 });
        }

        return prop(res, ...["data", "data"]);
      })
      .catch(() => {
        throw new Error("Invalid or expired registration session", {
          cause: 400,
        });
      });

    // *: tạo phòng khám trong hệ thống
    const business = await createBusiness(validatedBody.name);

    // *: tạo user trong hệ thống
    const [authResponse, strapiResponse] = await createUser(session, business);

    // *: create user info
    const userInfoResponse = await saas
      .post(
        "/api/user-infos",
        {
          data: {
            email: prop(session, "email"),
            name: prop(session, "name"),
            users: prop(strapiResponse, "user", "documentId"),
            business: prop(business, "documentId"),
            own: prop(business, "documentId"),
            business_role: DEFAULT_BUSINESS_ROLE, // * set Role mặc định là bác sĩ cho chủ phòng khám
          },
        },
        {
          headers,
        },
      )
      .then((res) => {
        return prop(res, ...["data", "data"]);
      })
      .catch((error) => {
        throw new Error(
          error?.message || "Failed to create user info",
          error?.status ? { cause: error.status } : undefined,
        );
      });

    const updatedBusiness = await saas
      .put(
        `/api/businesses/${prop(business, "documentId")}`,
        {
          data: {
            user_infos: prop(userInfoResponse, "documentId"),
          },
        },
        { headers },
      )
      .then((res) => prop(res, ...["data", "data"]))
      .catch((error) => {
        throw new Error(
          error?.message || "Failed to update business with user info",
          error?.status ? { cause: error.status } : undefined,
        );
      });

    // *: xóa register session sau khi tạo user thành công
    saas.delete(`/api/register-sessions/${validatedBody?.session}`, {
      headers,
    });

    // *: create a default branch for the clinic
    const branchData = new FormData();

    branchData.append("Branch[Name]", validatedBody.name);
    branchData.append("Branch[BranchCode]", "CN001");
    branchData.append("Branch[CompanyId]", "1");
    branchData.append("Branch[CountryId]", "1");

    cms.post("/hr/branch?_act=saveBranch", branchData, {
      headers: {
        Authorization: prop(authResponse, "token"),
      },
    });

    // *: seed service groups for the clinic here
    for (const groupName of ["Implant", "Phục hình", "Chỉnh nha", "Nhổ Răng"]) {
      const formData = new FormData();
      formData.append("Name", groupName);

      await cms
        .post(`/pos/serviceGroup/?_act=save`, formData, {
          headers: {
            Authorization: prop(authResponse, "token"),
          },
        })
        .catch(() => {
          console.log(
            `Failed to create default service group ${groupName} for clinic ${validatedBody.name}`,
          );
        });
    }

    return NextResponse.json(
      {
        data: {
          ...authResponse,
          info: { ...userInfoResponse, business: updatedBusiness },
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Internal Server Error",
      },
      { status: error?.cause || 500 },
    );
  }
}

const createBusiness = async (
  name: string,
): Promise<CreateBusinessResponse> => {
  const business = await saas
    .post(
      "/api/businesses",
      {
        data: {
          name,
        },
      },
      {
        headers,
        params: {
          fields: ["id", "documentId"],
        },
      },
    )
    .then((res) => prop(res, ...["data", "data"]))
    .catch((error) => {
      throw new Error(
        error?.message || "Failed to create business in saas",
        error?.status ? { cause: error.status } : undefined,
      );
    });

  const authServiceBusiness = await cms
    .post(
      "/authen/client-groups",
      {
        ClientGroupId: prop(business, "id"),
        Name: name,
        Code: "DNX",
        StaffCode: "DNX",
        CustomerCode: "DNX",
      },
      { headers: authHeaders },
    )
    .then((res) => {
      let responseData = prop(res, ...["data", "module", "data"]);

      responseData = pick(responseData, ["ClientGroupId", "JWTStatic"]);

      if (!responseData) {
        throw new Error("Failed to create business in Authen Service", {
          cause: 500,
        });
      }

      return { ...responseData, documentId: prop(business, "documentId") };
    })
    .catch((error) => {
      throw new Error(
        error?.message || "Failed to create business in Authen Service",
        error?.status ? { cause: error.status } : undefined,
      );
    });

  return authServiceBusiness;
};

function splitFullName(fullName: string) {
  const nameParts = fullName.trim().split(/\s+/);

  if (nameParts.length <= 1) {
    return { firstName: nameParts[0] || "", middleName: "", lastName: "" };
  }

  const firstName = nameParts.pop(); // Lấy từ cuối cùng làm Tên
  const lastName = nameParts.shift(); // Lấy từ đầu tiên làm Họ
  const middleName = nameParts.join(" "); // Phần còn lại là Tên đệm

  return {
    lastName: lastName, // Họ
    middleName: middleName, // Tên đệm
    firstName: firstName, // Tên
  };
}

const algorithm = "aes-256-cbc";
const keySource = process.env.PASSWORD_ENCRYPTION_KEY;
const key = getEncryptionKey(keySource);

// 2. Hàm Giải mã (Dùng ở API hoàn tất tạo Group/User)
function decrypt(text: string) {
  const textParts = text.split(":");

  const firstEl = textParts.shift();

  if (!firstEl) throw new Error("Invalid encrypted text format");

  const iv = Buffer.from(firstEl, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const createUser = async (
  session: any,
  business: CreateBusinessResponse,
): Promise<any> => {
  // *: check user exists
  await saas
    .get("/api/users", {
      headers,
      params: {
        filters: {
          email: session?.email,
        },
        fields: ["id", "documentId"],
      },
    })
    .then((res) => {
      const users = prop(res, ...["data", "data"]);

      if (users && users?.length > 0) {
        throw new Error("User already exists", { cause: 409 });
      }
    })
    .catch((error) => {
      throw new Error(
        error?.message || "Failed to check existing user",
        error?.status ? { cause: error.status } : undefined,
      );
    });

  const passwordDecrypted = decrypt(session?.password); // decrypt password

  // *: tạo user trong strapi service trước để lấy id
  const registeredUser = await saas
    .post("/api/auth/local/register", {
      username: session?.email,
      email: session?.email,
      password: passwordDecrypted,
    })
    .then((res) => {
      return res?.data;
    })
    .catch((error) => {
      throw new Error(
        error?.message || "Failed to create user in saas",
        error?.status ? { cause: error.status } : undefined,
      );
    });

  // *: tạo user trong auth service với businessId và id từ strapi service
  const formData = new FormData();

  const nameSplited = splitFullName(session?.name);
  const firstName = nameSplited?.firstName || nameSplited?.lastName;
  const lastName = nameSplited?.lastName || nameSplited?.firstName;

  formData.append("Staff[Email]", session?.email);
  formData.append("Staff[PersonalEmail]", "_" + session?.email);
  if (firstName) formData.append("Staff[FirstName]", firstName);

  if (lastName) formData.append("Staff[LastName]", lastName);

  formData.append("Staff[Password]", passwordDecrypted);
  formData.append("Staff[GenderId]", "1");
  formData.append("ClientGroupId", business?.ClientGroupId?.toString());
  formData.append("IsCreateWorkProfile", "1");
  formData.append("Staff[DateOfBirth]", "1990-01-01");
  formData.append(
    "Staff[UserId]",
    prop(registeredUser, ...["user", "id"]).toString(),
  );

  await cms
    .post("/authen/users", formData, {
      headers: {
        Authorization: "Bearer " + business?.JWTStatic,
      },
    })
    .then((res) => {
      const UserId = prop(res, ...["data", "module", "data", "UserId"]);

      if (!UserId) {
        throw new Error("Failed to create user in Authen Service", {
          cause: 500,
        });
      }

      return prop(res, ...["data", "module", "data"]);
    })
    .catch((error) => {
      throw new Error(
        error?.message || "Failed to create user in Authen Service",
        error?.status ? { cause: error.status } : undefined,
      );
    });

  const userAuthData = await cms
    .post("/authen/login", {
      email: session?.email,
      password: passwordDecrypted,
    })
    .then((res) => {
      if (res?.data?.status !== 200) {
        throw new Error(res?.data?.message, {
          cause: res?.data?.status,
        });
      }
      return prop(res, ...["data", "data"]);
    })
    .catch((error) => {
      throw new Error(
        error?.message || "Failed to login user in Authen Service",
        error?.status ? { cause: error.status } : undefined,
      );
    });

  return [userAuthData, registeredUser];
};
