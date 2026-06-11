// /app/com/signin/OtherRegister.tsx
"use client";

import React from "react";

import { Button } from "@heroui/react";
import Link from "next/link";

import { IconGoogleBrand } from "@/com/icons/regular";

const OtherRegister = () => {
  return (
    <section className="container max-w-90 mx-auto pt-8">
      {/* 1. Liner */}
      <div className="relative flex justify-center">
        <span className="bg-background px-4 relative z-10">Hoặc</span>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-1 border-gray-300"></div>
        </div>
      </div>

      {/* 2. Register with google Button */}
      <div className="py-8">
        <Button variant="bordered" type="submit" className="w-full">
          <IconGoogleBrand size={18} className="text-gray-400" />
          <span className="text-[1rem]">Đăng ký bằng Google</span>
        </Button>
      </div>

      {/* 3. Sign in link */}
      <div className="flex mx-auto justify-center text-xl">
        Bạn đã có tài khoản?{" "}
        <Link href="/signin">
          <span className="font-bold pl-1">Đăng nhập</span>
        </Link>
      </div>
    </section>
  );
};

export default OtherRegister;
