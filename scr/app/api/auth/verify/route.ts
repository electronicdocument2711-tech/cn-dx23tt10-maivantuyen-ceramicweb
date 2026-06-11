import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { saas } from "@/lib/saas";
import { cms } from "@/lib/cms";
import { defaultTo } from "remeda";

const apiToken = process.env.VERIFY_CONFIRM_TOKEN;

const authHeaders = {
  Authorization: `Bearer ${defaultTo(process.env.PERMANENT_TOKEN, "")}`,
};

async function getInfoByVerifyToken(
  token: string,
): Promise<{ status: boolean; data: any }> {
  try {
    const info = await saas.get(`/api/user-infos`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      params: {
        populate: "*",
        filters: {
          invite_token: {
            $eq: token,
          },
        },
      },
    });
    const infoData = info.data.data;
    return {
      status: infoData && infoData.length > 0 ? true : false,
      data: infoData,
    };
  } catch {
    return {
      status: false,
      data: [],
    };
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");
    if (!token) throw throwError("Token is required", 400);

    const infoData = await getInfoByVerifyToken(token);
    if (!infoData || !infoData.status || infoData.data.length === 0)
      throwError("Token invalid", 400);

    const businessID = infoData.data[0].business.documentId;
    const business = await saas.get(`/api/businesses/${businessID}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      params: {
        populate: "*",
      },
    });

    const position = infoData.data[0].business_role.name;
    if (!position) throwError("Business-role not found", 400);

    const ownerBusiness = business.data.data;
    if (!ownerBusiness) throwError("Business not found");

    const email = infoData.data[0].email;
    const userDatas = infoData.data[0].users as {
      id: string;
      documentId: string;
      username: string;
      email: string;
      provider: string;
      confirmed: boolean;
      blocked: boolean;
    }[];
    if (!userDatas || userDatas.length === 0) throwError("User not found", 400);

    const user = userDatas.find((user) => user.email === email);
    if (!user) throwError("User data not found", 400);

    const isActivated = user.confirmed;
    const response = {
      isValidToken: true,
      isActivated,
      businessName: ownerBusiness.name,
      ownerName: isActivated ? "" : ownerBusiness.owner.name,
      userName: isActivated ? "" : infoData.data[0].name,
      email: isActivated ? "" : infoData.data[0].email,
      position: isActivated ? "" : position,
    };

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token) throwError("Token is required", 400);

    if (
      !password ||
      password.length < 8 ||
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]+/.test(password)
    )
      throwError(
        "Password must be at least 8 characters and contain at least one special character",
        400,
      );

    const infoData = await getInfoByVerifyToken(token);
    if (!infoData || !infoData.status || infoData.data.length === 0)
      throwError("Token invalid", 400);

    const emailUser = infoData.data[0].email;
    const userDatas = infoData.data[0].users as {
      id: string;
      documentId: string;
      username: string;
      email: string;
      provider: string;
      confirmed: boolean;
      blocked: boolean;
    }[];
    if (!userDatas || userDatas.length === 0) throwError("User not found", 400);

    const user = userDatas.find((user) => user.email === emailUser);
    if (!user) throwError("User data not found", 400);
    if (user.confirmed) throwError("User already activated", 400);

    const id = user.id;
    const confirm = await saas.put(
      `/api/users/${id}`,
      {
        password,
        confirmed: true,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );

    if (confirm.status !== 200) throwError("Verify failed", 502);

    // Sync new password to CMS Auth Service
    try {
      const cmsRes = await cms.post(
        "/authen/change-password-by-system",
        { Email: emailUser, Password: password },
        { headers: authHeaders },
      );
      if (!cmsRes?.data?.module?.code) {
        console.error("[verify] CMS password sync failed for:", emailUser);
      }
    } catch (cmsErr) {
      console.error("[verify] CMS password sync error:", cmsErr);
    }

    const response = {
      isValidToken: true,
      isActivated: true,
      businessName: infoData.data[0].business.name,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
