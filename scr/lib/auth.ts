import { jwtVerify } from "jose";
import { get, remove, set } from "./cookie";
import { NextRequest } from "next/server";
import { isOn } from "./utils";

export function getJwtSecretKey() {
  const secret = process.env.SECRET;

  if (!secret) {
    throw new Error("JWT Secret key is not matched");
  }

  return new TextEncoder().encode(secret);
}

export async function verifyJwtToken(
  token: string,
): Promise<Record<string, any> | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch {
    return null;
  }
}

export async function checkJwtToken(): Promise<string | null> {
  try {
    const accessToken = await get("access_token");
    if (!accessToken) return null;
    // const payload = await verifyJwtToken(accessToken);
    // console.log(`payload:${payload}`);
    // if (!payload?.id) return null;

    // return payload?.id;
    return accessToken;
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
}

export const validToken = async (request: NextRequest) => {
  // check if token is valid in request header
  const { headers } = request;
  if (isOn(headers.get("Authorization"))) {
    const token = `${headers.get("Authorization")}`.split(" ")[1];
    return await verifyJwtToken(token);
  }

  // check the cookie
  const token = await get("access_token");

  return await verifyJwtToken(token);
};

export const setAccessToken = (token: string) => {
  set("access_token", token, {
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    sameSite: "lax",
  });
};

export const removeAccessToken = () => {
  remove("access_token", {
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  });

  // Backward compatibility: remove cookie without domain
  remove("access_token");
};
