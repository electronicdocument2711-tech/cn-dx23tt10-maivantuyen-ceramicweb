import { NextRequest } from "next/server";
import { validToken } from "./auth";
import { prop } from "remeda";
import { cms } from "./cms";

export function handleError(error: any): [any, { status: number }] {
  const status = error.response?.status ?? error.status ?? 500;
  const message =
    error.response?.data?.message ??
    error.response?.data ??
    error.message ??
    "Internal Server Error";
  console.log(error);
  return [{ message }, { status }];
}

type HttpError = Error & { status?: number };

export function throwError(message: string, status = 500): never {
  const error: HttpError = new Error(message);
  error.status = status;
  throw error;
}

export async function withAuth(req: NextRequest) {
  const tokenData = await validToken(req);
  if (!tokenData) throwError("Xác thực không hợp lệ, vui lòng đăng nhập", 401);
  return tokenData;
}

export async function ValidateTokenAndAuth(req: NextRequest) {
  if (!validToken(req)) throwError("Token không hợp lệ", 401);
  const authRes = await cms.get("/authen/authorize");
  if (authRes?.status !== 200 || !prop(authRes, ...["data", "module", "code"]))
    throwError("Chưa đăng nhập", 401);
}
