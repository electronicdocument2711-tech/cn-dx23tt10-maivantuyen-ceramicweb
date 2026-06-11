import { cms } from "@/lib/cms";
import { NextResponse } from "next/server";
import { saas } from "@/lib/saas";

const Domain = process.env.CHECK_DOMAIN || "https://dentalx.growthbold.co";

export async function POST(request: Request) {
  try {
    // invalid Domain
    if (!Domain) throw new Error("Domain is required");

    const { email, password } = await request.json();

    //invalid email
    let pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) throw new Error("Invalid email format");

    // valid password: minimum 8 chars, include upper, lower, number and special char
    pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pattern.test(password)) throw new Error("Invalid password format");

    // Get TokenLogin from check-domain API
    const res = await cms.post("/authen/check-domain", { Domain });

    if (res.status !== 200 || !res.data?.module?.views[0]?.data?.TokenLogin)
      throw new Error("Check domain failed");

    const TokenLogin = res.data?.module?.views[0]?.data?.TokenLogin;
    const params: any = { email, password, TokenLogin };

    // Call login API
    const { status, data } = await cms.post("/authen/login", params);

    if (status !== 200 || !data.data?.token)
      throw new Error(data?.message || `Login failed, status code ${status}`);

    const { token, user } = data.data;

    //attact business & user info data
    const payload = {
      headers: { Authorization: token },
      params: {
        populate: { business: true },
        filter: { user: { id: user.id } },
      },
    };

    const info = await saas.get("/api/user-infos", payload);

    // required to have corresponding user info
    if (info.status !== 200 || !info.data?.data)
      throw new Error(`Get user info failed, code ${info.status}`);

    user["info"] = info.data.data[0];

    return NextResponse.json({ token, user });
  } catch (error) {
    console.log(error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json({ message }, { status: 400 });
  }
}
