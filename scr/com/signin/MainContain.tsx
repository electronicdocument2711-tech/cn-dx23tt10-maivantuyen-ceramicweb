// /app/com/signin/MainContain.tsx
"use client";

import React from "react";
import { Button, Form, Input } from "@heroui/react";

import { IconEyeOff, IconEye } from "@/com/icons/outline";

import Link from "next/link";

const MainContain = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  // 2. Form -Submit Button Logic
  const [submitted, setSubmitted] = React.useState<Record<string, FormDataEntryValue> | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    setSubmitted(data);
  };

  return (
    <section className="container max-w-90 mx-auto pt-4">
      {/* 1. Header */}
      <h1 className="flex flex-col text-center font-bold text-[28px] text-[#042D60]">
        Đăng nhập
      </h1>

      {/* 2. Form */}
      <Form className="w-full pt-6" onSubmit={onSubmit}>
        {/* 2.1. Input Email  */}
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
          className="min-h-17 flex flex-col justify-start"
          classNames={{
            inputWrapper: "bg-gray-200",
          }}
        />

        {/* 2.2. Input Password  */}
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
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <IconEye className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <IconEyeOff className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          label="Password"
          labelPlacement="outside"
          placeholder="Nhập mật khẩu"
          type={isVisible ? "text" : "password"}
          variant="faded"
          classNames={{
            inputWrapper: "bg-gray-200",
          }}
        />

        {/* 3. Link forget password */}
        <Link
          href="/forget-password"
          className="flex ml-auto pb-6 font-semibold text-gray-700 "
        >
          Quên mật khẩu
        </Link>

        {/* 4. Submit Button */}
        <Button color="primary" type="submit" className="w-full">
          Đăng nhập
        </Button>
        {submitted && (
          <div className="text-small text-default-500">
            You submitted: <code>{JSON.stringify(submitted)}</code>
          </div>
        )}
      </Form>
    </section>
  );
};

export default MainContain;
