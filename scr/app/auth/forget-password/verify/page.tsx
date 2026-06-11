"use client";

import { Input } from "@heroui/input";
import { addToast, Button, Form, Link, Spinner } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/com/Header";
import { FormEvent, useEffect, useRef, useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";

export default function ChangePasswordPage() {
  const abortRef = useRef<AbortController | null>(null);
  const searchParams = useSearchParams();
  const verifyCode = searchParams.get("code") ?? "";
  const router = useRouter();
  const [verify, setVerify] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submiting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const [password, setPassword] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      if (!verifyCode || verifyCode.length === 0)
        throw new Error("Liên kết xác thực không hợp lệ hoặc đã quá hạn.");

      const res = await rest.post(
        `/auth/forget-password/verify?code=${encodeURIComponent(verifyCode)}`,
        {
          password,
        },
      );

      if (res.status !== 200) throw new Error("Thay đổi mật khẩu thất bại.");
      addToast({
        title: "Thành công",
        description: "Thay đổi mật khẩu thành công, vui lòng đăng nhập lại",
        color: "success",
      });
      router.push("/auth/signin");
    } catch (error) {
      addToast({
        title: "Thất bại",
        description: getErrorMessage(error, "Đã có lỗi xảy ra"),
        color: "warning",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!searchParams) return;
    const verifyToken = async () => {
      try {
        if (!verifyCode || verifyCode.length === 0) return;
        setLoading(true);
        setError("");
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const response = await rest.get(
          `/auth/forget-password/verify?code=${encodeURIComponent(verifyCode)}`,
        );
        if (response.status !== 200)
          throw new Error("Liên kết xác thực không hợp lệ hoặc đã quá hạn.");
        setVerify(true);
      } catch {
        setError(
          "Liên kết xác thực không hợp lệ hoặc đã quá hạn. Vui lòng yêu cầu một mã mới để tiếp tục bảo mật tài khoản của bạn.",
        );
        setVerify(false);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
    return () => {
      abortRef.current?.abort();
    };
  }, [searchParams]);

  const renderContent = () => {
    if (loading)
      return (
        <div className=" max-w-90 mx-auto pt-4">
          <div className="w-full h-60 pt-10 flex flex-col items-center justify-center gap-8">
            <Spinner size="sm" color="default" className="" />
          </div>
        </div>
      );
    if (!verify) {
      return (
        <section className="container max-w-90 mx-auto pt-4">
          <h1 className="flex flex-col text-2xl text-center font-bold">
            Xác thực yêu cầu thất bại
          </h1>
          <div className="w-full pt-10 flex flex-col gap-8">
            <div className="w-full flex flex-col items-center justify-center gap-8">
              <p className="w-full max-w-72">{error}</p>
              <div className="w-full flex flex-col items-center justify-center gap-4">
                <Button
                  color="primary"
                  size="lg"
                  // className="w-full"
                  isLoading={submiting || loading}
                  onPress={() => router.push("/auth/forget-password")}
                >
                  Gửi lại email đặt mật khẩu
                </Button>
                <Link href="/auth/signin">
                  <span className="font-medium text-default-500 ">
                    Về trang đăng nhập
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      );
    }
    return (
      <section className="container max-w-90 mx-auto pt-4">
        <h1 className="flex flex-col text-2xl text-center font-bold">
          Tạo mật khẩu mới
        </h1>

        <div className="w-full pt-10 flex flex-col gap-8">
          <Form
            id="forget-password-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            <Input
              isRequired
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-solid outline-transparent"
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                >
                  {isVisible ? <IconEye /> : <IconEyeOff />}
                </button>
              }
              label="Mật khẩu"
              labelPlacement="outside"
              name="password"
              placeholder="Nhập mật khẩu"
              defaultValue={password}
              variant="faded"
              size="lg"
              type={isVisible ? "text" : "password"}
              onValueChange={(value) => {
                setPassword(value);
              }}
              validate={(value) => {
                if (!value) return "Không được để trống";
                if (value.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";

                if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value))
                  return "Mật khẩu phải có ít nhất một kí tự viết hoa và viết thường";
                if (
                  !/(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]/~`+=;'])/.test(
                    value,
                  )
                )
                  return "Mật khẩu phải chứa ít nhất 1 kí tự đặc biệt";
                return true;
              }}
            />
            <Input
              isRequired
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="
                      focus:outline-solid
                      outline-transparent"
                  type="button"
                  onClick={() => setIsVisibleConfirm(!isVisibleConfirm)}
                >
                  {isVisibleConfirm ? <IconEye /> : <IconEyeOff />}
                </button>
              }
              label="Xác nhận mật khẩu"
              labelPlacement="outside"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              defaultValue={confirmPassword}
              size="lg"
              variant="faded"
              type={isVisibleConfirm ? "text" : "password"}
              onValueChange={(value) => {
                setConfirmPassword(value);
              }}
              validate={(value) => {
                if (value !== password)
                  return "Mật khẩu xác nhận không trùng khớp";
                return true;
              }}
            />
          </Form>

          <div className="w-full flex flex-col items-center justify-center gap-4">
            <Button
              color="primary"
              size="lg"
              type="submit"
              form="forget-password-form"
              className="w-full"
              isLoading={submiting || loading}
            >
              Xác nhận
            </Button>
            <Link href="/auth/signin">
              <span className="font-medium text-default-500 ">
                Về trang đăng nhập
              </span>
            </Link>
          </div>
        </div>
      </section>
    );
  };

  return (
    <>
      <Header />
      {renderContent()}
    </>
  );
}
