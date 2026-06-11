import { NextRequest, NextResponse } from "next/server";
import * as Yup from "yup";
import crypto from "crypto";
import { saas } from "@/lib/saas";
import { defaultTo, prop, stringToPath } from "remeda";

const headers = {
  Authorization: `Bearer ${defaultTo(process.env.SYSTEM_TOKEN, "")}`,
};

const algorithm = "aes-256-cbc";
const keySource = process.env.PASSWORD_ENCRYPTION_KEY;

export function getEncryptionKey(source?: string) {
  if (!source) {
    throw new Error("Encryption key source is not defined");
  }

  const trimmed = source.trim();
  const isHexKey = /^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length === 64;

  if (isHexKey) {
    return Buffer.from(trimmed, "hex");
  }

  return crypto.scryptSync(trimmed, "dentalx-auth", 32);
}

const key = getEncryptionKey(keySource);

const signupSchema = Yup.object().shape({
  name: Yup.string().min(2).max(100).required("Tên không được bỏ trống"),
  email: Yup.string().email().required("Email không được bỏ trống"),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, ít nhất một chữ số và một ký tự đặc biệt (@$!%*?&)",
    )
    .required("Mật khẩu không được bỏ trống"),
});

// 1. Hàm Mã hóa (Dùng ở API Đăng ký)
function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export async function POST(request: NextRequest) {
  try {
    // *: validate input data

    const body = await request.json();

    const validatedBody = await signupSchema.validate(body, {
      abortEarly: false,
    });

    // *: check xem user đã tồn tại trong hệ thống chưa

    const checkResult = await saas
      .get("/api/users", {
        params: {
          filters: { email: validatedBody.email },
          pagination: { page: 1, pageSize: 1 },
        },
        headers,
      })
      .catch((error) => {
        throw new Error(
          error?.response?.data?.message || "Failed to check existing user",
          error?.status ? { cause: error.status } : undefined,
        );
      });

    if (checkResult?.data && checkResult?.data?.length > 0) {
      throw new Error("User already exists", { cause: 409 });
    }

    // *: Tạo ra register session và trả về client

    const expiredAt = // 24 hours from now
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const encryptedPassword = encrypt(validatedBody.password);

    const result = await saas
      .post(
        "/api/register-sessions",
        {
          data: {
            ...validatedBody,
            password: encryptedPassword,
            expires_at: expiredAt,
          },
        },
        { headers },
      )
      .catch((error) => {
        throw new Error(
          error?.response?.data?.message || "Failed to create register session",
          error?.status ? { cause: error.status } : undefined,
        );
      });

    const sessionDocId = prop(result, ...stringToPath("data.data.documentId"));

    return NextResponse.json({ data: sessionDocId }, { status: 201 });
  } catch (error: any) {
    if (error instanceof Yup.ValidationError) {
      return NextResponse.json(
        {
          message: error?.errors?.join("\n"),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: error?.message || "Internal Server Error",
      },
      { status: error?.cause || 500 },
    );
  }
}
