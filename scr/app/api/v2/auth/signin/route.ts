import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";
import * as Yup from "yup";

const inputSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "must contain at least one lowercase letter")
    .matches(/[A-Z]/, "must contain at least one uppercase letter")
    .matches(/\d/, "must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "must contain at least one special character (@$!%*?&)",
    )
    .required("Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedBody = await inputSchema.validate(body, {
      abortEarly: false,
    });

    const loginResponse = await cms
      .post("/authen/login", {
        email: validatedBody.email,
        password: validatedBody.password,
      })
      .then((res) => {
        if (res?.data?.status !== 200) {
          throw new Error(res?.data?.message || "Login failed", {
            cause: res?.data?.status,
          });
        }

        return prop(res, ...["data", "data"]);
      })
      .catch((error) => {
        throw new Error(error?.message || "Login failed", {
          cause: error?.status || error?.cause || 500,
        });
      });

    const userInfo = await saas
      .get("/api/users/me", {
        headers: {
          Authorization: loginResponse?.token,
        },
        params: {
          fields: ["id", "documentId"],
          populate: {
            user_info: {
              populate: {
                business: true,
              },
            },
          },
        },
      })
      .then((res) => {
        return prop(res, ...["data", "user_info"]);
      })
      .catch((error) => {
        throw new Error(error?.message || "Fetch user info failed", {
          cause: error?.status || error?.cause || 500,
        });
      });

    return NextResponse.json({ ...loginResponse, info: userInfo });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Internal Server Error",
      },
      { status: error?.cause || 500 },
    );
  }
}
