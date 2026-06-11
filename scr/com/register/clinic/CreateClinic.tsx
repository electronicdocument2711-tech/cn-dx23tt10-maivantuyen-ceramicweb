"use client";

import React, { useContext, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Input, Button, addToast } from "@heroui/react";
import rest from "@/lib/rest";
import { set } from "@/lib/cookie";
import { UserContext } from "@/context/UserContext";
import { useAppContext } from "@/context";
import { setAccessToken } from "@/lib/auth";

export default function CreateClinic() {
  const { onTriggerBootstrap } = useAppContext();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<boolean | null>(null);
  const { setUser } = useContext(UserContext);

  const searchParams = useSearchParams();

  const session = searchParams.get("session") || "";

  const [, setSubmitted] = useState<Record<string, any> | null>(null);
  const router = useRouter();
  const isButtonDisabled = name.trim() === "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      if (!session) {
        throw new Error("Phiên đăng ký không hợp lệ, vui lòng thử lại.");
      }

      const data = Object.fromEntries(new FormData(e.currentTarget));

      setSubmitted(data);

      const result = await rest
        .post("/v2/auth/signup/clinic", {
          name: name.trim(),
          session,
        })
        .then((res) => res?.data)
        .catch((axiosError) => {
          throw new Error(
            axiosError.response?.data?.message ||
              axiosError?.message ||
              "Đã có lỗi xảy ra, vui lòng thử lại.",
            { cause: axiosError?.status || 500 },
          );
        });

      if (!result?.data?.token || !result?.data?.user) {
        throw new Error("Đăng ký phòng khám thất bại, vui lòng thử lại.");
      }

      setAccessToken(result?.data?.token?.replace("Bearer ", ""));
      setUser(result?.data?.user);
      set("user_email", result?.data?.user?.Email);

      localStorage.setItem("name", name.trim());

      onTriggerBootstrap();
      // router.push("/register/combo");
      router.push("/upgrade");
    } catch (error: any) {
      addToast({
        title: "Thất bại",
        description: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container max-w-90 mx-auto pt-4">
      <h1 className="text-center font-bold text-[28px] text-blue-text">
        Tạo phòng khám
      </h1>

      <Form className="w-full pt-6" onSubmit={onSubmit}>
        <Input
          isRequired
          value={name}
          onValueChange={setName}
          label="Tên phòng khám"
          labelPlacement="outside"
          placeholder="Nhập tên phòng khám"
          description="Sau khi tạo phòng khám, bạn có thể mời các thành viên khác tham gia."
          classNames={{ description: "pt-3" }}
        />

        <Button
          type="submit"
          color="primary"
          isDisabled={isButtonDisabled}
          isLoading={loading === true}
          className="w-full mt-10"
        >
          Tiếp tục
        </Button>
      </Form>
    </section>
  );
}
