// /app/com/register/password/PaswordRegisterContain.tsx
"use client";

import React from "react";
import { Button, Form, Input } from "@heroui/react";
import { useRouter } from "next/navigation";

import { IconInfoCircle, IconCheck } from "@/com/icons/regular";

import { IconEye, IconEyeOff } from "@/com/icons/outline";

const PasswordRegisterContain = () => {
  const router = useRouter();

  // End content eye Button
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  // Error message - old
  const [submitted, setSubmitted] = React.useState<Record<string, FormDataEntryValue> | null>(null);
  const [password, setPassword] = React.useState("");
  const errors = [];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    setSubmitted(data);

    // Redirect to verified page after successful registration
    router.push("/register/verified");
  };

  if (password.length < 8) {
    errors.push("Mật khẩu phải chứa ít nhất 8 ký tự.");
  }

  const isButtonDisabled = password.length < 8;

  return (
    <section className="container max-w-90 mx-auto pt-4">
      {/* 1. Header */}
      <h1 className="flex flex-col text-center font-bold text-[28px] text-blue-text">
        Tạo mật khẩu
      </h1>

      {/* 2. Form */}
      <Form className="w-full pt-10" onSubmit={onSubmit}>
        <Input
          description={
            // Hint
            password.length < 8 ? (
              <span className="text-default-500 flex items-center">
                <IconInfoCircle className="size-5 mr-1" />
                Mật khẩu phải chứa ít nhất 8 ký tự.
              </span>
            ) : (
              <span className="text-success-700 flex items-center">
                <IconCheck className="size-5 mr-1" />
                Mật khẩu phải chứa ít nhất 8 ký tự.
              </span>
            )
          }
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
          // isInvalid={errors.length > 0}
          label="Mật khẩu"
          labelPlacement="outside"
          name="password"
          placeholder="Nhập mật khẩu"
          value={password}
          size="lg"
          variant="faded"
          type={isVisible ? "text" : "password"}
          onValueChange={setPassword}
          classNames={{ description: "pt-3" }}
        />

        {/* 3. Button */}
        <Button
          isDisabled={isButtonDisabled}
          color="primary"
          type="submit"
          className="w-full font-semibold mt-5"
          size="lg"
        >
          Hoàn tất
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

export default PasswordRegisterContain;
