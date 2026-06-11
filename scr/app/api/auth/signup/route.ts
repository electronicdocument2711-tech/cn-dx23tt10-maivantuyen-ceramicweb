import { cms } from "@/lib/cms";
import { NextResponse } from "next/server";
import { handleError } from "@/lib/response";
import { saas } from "@/lib/saas";

const Domain = process.env.NEXT_PUBLIC_CHECK_DOMAIN;

export async function POST(req: Request) {
  try {
    if (!Domain) throw new Error("Domain is required");

    const { name, email, password } = await req.json();

    //invalid email
    let pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) throw new Error("Invalid email format");

    // valid password: minimum 8 chars, include upper, lower, number and special char
    pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pattern.test(password)) throw new Error("Invalid password format");

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email format" });
    }

    // Get SignupToken from check-domain API
    const res = await cms.post("/authen/check-domain", { Domain });

    if (res.status !== 200 || !res.data?.module?.views[0]?.data?.TokenLogin)
      throw new Error("Check domain failed");

    const TokenLogin = res.data?.module?.views[0]?.data?.TokenLogin;
    const params = {
      Email: email,
      Password: password,
      FirstName: name,
      LastName: name,
      DateofBirth: "2000-01-01",
      GenderId: 1,
      TokenLogin,
    };

    const params1 = {
      email,
      password,
      TokenLogin,
    };

    // Call signup API
    const { status } = await cms.post("/authen/register", {
      ...params,
    });

    if (status !== 200) throw new Error(`Login failed, status code ${status}`);

    // Login API
    const { status: status1, data } = await cms.post("/authen/login", params1);

    if (status1 !== 200 || !data.data?.token)
      throw new Error(data?.message || `Login failed, status code ${status}`);

    const { token, user } = data.data;

    // Get User API
    const userId = data.data.user.UserId;

    const { status: userStatus, data: userData } = await saas.get(
      `/api/users/${userId}`,
      { headers: { Authorization: token } }
    );

    if (!(userStatus === 200 || userStatus === 201) || !userData)
      throw new Error(
        data?.message || `get User failed, status code ${status}`
      );

    // Post + Link User-info API
    const { status: userInfoStatus, data: userInfoData } = await saas.post(
      "/api/user-infos",
      {
        data: {
          email: userData.email,
          name: userData.username,
          users: userData.documentId,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (!(userInfoStatus === 200 || userInfoStatus === 201) || !userInfoData) {
      throw new Error(data?.message || `Login failed, status code ${status}`);
    }

    // Get one user-Info API
    const { status: getUserInfoStatus, data: getUserInfoData } = await saas.get(
      `/api/user-infos/${userInfoData.data.documentId}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (getUserInfoStatus !== 200 || !getUserInfoData)
      throw new Error(`Get user info failed, code ${getUserInfoStatus}`);

    user["info"] = getUserInfoData.data;

    console.log("user:", user);

    return NextResponse.json({ token, user });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
