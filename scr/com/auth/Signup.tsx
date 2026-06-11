"use client";

import React, { useEffect, useState } from "react";
import { Button, Form, Input, Checkbox, addToast } from "@heroui/react";
import Link from "next/link";
import {
  IconGoogleBrand,
  IconInfoCircle,
  IconCheck,
} from "@/com/icons/regular";
import { IconEye, IconEyeOff } from "@/com/icons/outline";
import { useRouter } from "next/navigation";
import rest from "@/lib/rest";
import { prop } from "remeda";

const SetPassword = ({
  password,
  setPassword,
  isVisible,
  setIsVisible,
  loadingSignup,
}: {
  password: any;
  setPassword: any;
  isVisible: any;
  setIsVisible: any;
  loadingSignup?: boolean;
}) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Mật khẩu phải chứa ít nhất 8 ký tự.");
  }

  const isButtonDisabled = password.length < 8;
  const hasMinLength = password.length >= 8;
  const hasUpperAndLower = /(?=.*[a-z])(?=.*[A-Z])/.test(password);
  const hasNumberAndSpecial =
    /(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]/~`+=;'])/.test(password);

  return (
    <section className="container max-w-90 mx-auto pt-4">
      <h1 className="flex flex-col text-center font-bold mb-12 text-2xl">
        Tạo mật khẩu
      </h1>
      <Input
        description={
          <div className="space-y-1 text-sm">
            <div
              className={`flex items-center gap-2 ${hasMinLength ? "text-green-600" : "text-default-500"}`}
            >
              {hasMinLength ? (
                <IconCheck className="w-4 h-4" />
              ) : (
                <IconInfoCircle className="w-4 h-4" />
              )}
              Ít nhất 8 ký tự
            </div>
            <div
              className={`flex items-center gap-2 ${hasUpperAndLower ? "text-green-600" : "text-default-500"}`}
            >
              {hasUpperAndLower ? (
                <IconCheck className="w-4 h-4" />
              ) : (
                <IconInfoCircle className="w-4 h-4" />
              )}
              Phải chứa chữ viết hoa và chữ viết thường
            </div>
            <div
              className={`flex items-center gap-2 ${hasNumberAndSpecial ? "text-green-600" : "text-default-500"}`}
            >
              {hasNumberAndSpecial ? (
                <IconCheck className="w-4 h-4" />
              ) : (
                <IconInfoCircle className="w-4 h-4" />
              )}
              Chứa ít nhất 1 ký tự số và 1 ký tự đặc biệt
            </div>
          </div>
        }
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
        size="lg"
        variant="faded"
        type={isVisible ? "text" : "password"}
        onValueChange={(value) => {
          setPassword(value);
        }}
      />

      <Button
        isDisabled={isButtonDisabled}
        color="primary"
        type="submit"
        className="w-full font-semibold mt-5"
        size="lg"
        isLoading={loadingSignup}
      >
        Hoàn tất
      </Button>
    </section>
  );
};

const Signup: React.FC = () => {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [agree, setAgree] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [inputPassword, setInputPassword] = useState<boolean>(false);
  const [validInfo, setValidInfo] = useState<boolean>(false);
  const [loadingSignup, setLoadingSignup] = useState<boolean>(false);
  const [loadingCheckEmail, setLoadingCheckEmail] = useState<boolean>(false);

  useEffect(() => {
    setValidInfo(
      name.trim().length >= 3 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
        agree,
    );
  }, [email, name, agree]);

  async function onSignup() {
    try {
      setLoadingSignup(true);

      const result = await rest.post("/v2/auth/signup", {
        name,
        email,
        password,
      });

      if (result.status !== 200 && result.status !== 201) {
        throw new Error(
          result.data?.message || `Đăng ký thất bại với mã ${result.status}`,
        );
      }

      router.push(
        `/auth/signup/clinic?session=${encodeURIComponent(prop(result, "data", "data"))}`,
      );
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Không thể đăng ký, vui lòng thử lại";

      addToast({ title: "Thất bại", description, color: "danger" });
    } finally {
      setLoadingSignup(false);
    }
  }

  const handleCheckEmail = async (e: any) => {
    e.preventDefault();
    try {
      setLoadingCheckEmail(true);
      // *: need to check user is existed here
      await rest
        .post("/v2/auth/signup/check", { email })
        .catch((axiosError) => {
          throw new Error(
            axiosError.response?.data?.message ||
              axiosError?.message ||
              "Lỗi kiểm tra email",
            axiosError.response?.status
              ? { cause: axiosError.response.status }
              : undefined,
          );
        });

      setInputPassword(true);
    } catch (error: any) {
      addToast({
        title: "Thất bại",
        description: error?.message || "Không thể kiểm tra email",
        color: "danger",
      });
    } finally {
      setLoadingCheckEmail(false);
    }
  };

  return (
    <>
      {!inputPassword ? (
        <Form
          className="w-full pt-6 flex flex-col gap-6"
          onSubmit={handleCheckEmail}
        >
          <section className="container max-w-90 mx-auto pt-4">
            <h1 className="flex flex-col text-center font-bold text-2xl mb-12">
              Đăng ký
            </h1>
            <div className="flex flex-col gap-6">
              <Input
                isRequired
                defaultValue={name}
                onValueChange={setName}
                label="Họ và tên"
                labelPlacement="outside"
                placeholder="Nhập họ và tên"
                variant="faded"
                type="text"
                size="lg"
                validate={(value) => {
                  if (value.trim().length < 3) {
                    return "Vui lòng nhập họ và tên hợp lệ";
                  }
                }}
              />
              <Input
                isRequired
                defaultValue={email}
                onValueChange={setEmail}
                label="Email"
                labelPlacement="outside"
                placeholder="Nhập Email"
                variant="faded"
                type="email"
                size="lg"
                validate={(value) => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(value)) {
                    return "Vui lòng nhập địa chỉ email hợp lệ";
                  }
                }}
              />

              <div className="flex items-center">
                <Checkbox
                  color="primary"
                  isSelected={agree}
                  onValueChange={setAgree}
                  className="!font-light !text-gray-500"
                  size="lg"
                  id="terms"
                />
                <label htmlFor="terms">Chấp nhận</label>
                <Link
                  href="https://dentalx.vn/terms"
                  className="underline decoration-dotted pl-1"
                >
                  Điều khoản sử dụng
                </Link>
              </div>
              <Button
                isDisabled={!validInfo}
                color="primary"
                type="submit"
                className="w-full"
                size="lg"
                isLoading={loadingCheckEmail}
              >
                Đăng ký
              </Button>
            </div>
          </section>
          <section className="container max-w-90 mx-auto pt-8">
            <div className="relative flex justify-center">
              <span className="bg-background px-4 relative z-10">Hoặc</span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-1 border-gray-300"></div>
              </div>
            </div>
            <div className="py-8">
              <Button
                variant="bordered"
                size="lg"
                type="submit"
                className="w-full"
                isDisabled={!validInfo}
                isLoading={loadingSignup}
              >
                <IconGoogleBrand size={18} className="text-gray-400" />
                <span className="text-[1rem]">Đăng ký bằng Google</span>
              </Button>
            </div>

            <div className="flex mx-auto justify-center">
              Bạn đã có tài khoản?{" "}
              <Link href="/auth/signin">
                <span className="font-bold pl-1">Đăng nhập</span>
              </Link>
            </div>
          </section>
        </Form>
      ) : (
        <Form
          className="w-full pt-6 flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSignup();
          }}
        >
          <SetPassword
            password={password}
            setPassword={setPassword}
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            loadingSignup={loadingSignup}
          />
        </Form>
      )}
    </>
  );
};

export default Signup;
