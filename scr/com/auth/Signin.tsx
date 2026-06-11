"use client";

import React, { useState } from "react";
import { Button, Form, Input } from "@heroui/react";
// import { IconGoogleBrand } from "@/com/icons/regular";
import Link from "next/link";
import { IconEye, IconEyeOff } from "@/com/icons/outline";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

const Signin = () => {
  const [email, setEmail] = useState("hoantruong200@test.com");
  const [password, setPassword] = useState("Abcd@123");
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const { login, loading } = useUser();

  const onSubmit = (e: any) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    const success = await login({ email, password });
    if (success) {
      router.push("/");
    }
  };

  return (
    <>
      <section className="container max-w-90 mx-auto pt-4">
        <h1 className="flex flex-col text-2xl text-center font-bold">
          Đăng nhập
        </h1>

        <Form className="w-full pt-6 flex flex-col gap-6" onSubmit={onSubmit}>
          <Input
            isRequired
            errorMessage={({ validationDetails, validationErrors }) => {
              if (validationDetails.typeMismatch) {
                return "Please enter a valid email address";
              }

              return validationErrors;
            }}
            label="Email"
            labelPlacement="outside"
            placeholder="Nhập Email"
            variant="faded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            size="lg"
            autoComplete="email"
          />
          <div className="w-full">
            <Input
              isRequired
              errorMessage={({ validationDetails, validationErrors }) => {
                if (validationDetails.typeMismatch) {
                  return "Please enter a valid email address";
                }

                return validationErrors;
              }}
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
              label="Password"
              labelPlacement="outside"
              placeholder="Nhập mật khẩu"
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              variant="faded"
              size="lg"
            />

            <Link
              href="/forget-password"
              className="block text-sm w-full text-right text-gray-700 mt-3"
            >
              Quên mật khẩu
            </Link>
          </div>

          <Button
            color="primary"
            size="lg"
            type="submit"
            onPress={handleSubmit}
            className="w-full"
            isLoading={loading === true}
          >
            Đăng nhập
          </Button>
        </Form>
      </section>
      <section className="container max-w-90 mx-auto pt-8">
        <div className="relative flex justify-center mb-8">
          <span className="bg-background px-4 relative z-10">Hoặc</span>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-1 border-gray-300"></div>
          </div>
        </div>

        {/* <div className="py-8">
          <Button variant="bordered" size="lg" type="submit" className="w-full">
            <IconGoogleBrand size={18} className="text-gray-400" />
            <span className="text-[1rem]">Đăng nhập bằng Google</span>
          </Button>
        </div> */}

        <div className="flex mx-auto justify-center">
          Không có tài khoản?
          <Link href="/auth/signup">
            <span className="font-bold pl-1">Đăng ký</span>
          </Link>
        </div>
      </section>
    </>
  );
};

export default Signin;
