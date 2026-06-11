// /app/com/signin/MainContain.tsx
"use client";

import React from "react";
// import { Button } from "@heroui/react";
import Link from "next/link";
// import { IconGoogleBrand } from "@/com/icons/regular";

const OtherSignin = () => {
  return (
    <section className="container max-w-90 mx-auto pt-8">
      {/* 1. Liner */}
      <div className="relative flex justify-center mb-8">
        <span className="bg-background px-4 relative z-10">Hoặc</span>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-1 border-gray-300"></div>
        </div>
      </div>

      {/* 2. Sigin with google Button */}
      {/* <div className="py-8">
        <Button variant="bordered" type="submit" className="w-full">
          <IconGoogleBrand size={18} className="text-gray-400" />
          <span className="text-[1rem]">Đăng nhập bằng Google</span>
        </Button>
      </div> */}

      {/* 3. Register */}
      <div className="flex mx-auto justify-center text-xl">
        Không có tài khoản?
        <Link href="/register/name">
          <span className="font-bold pl-1">Đăng ký</span>
        </Link>
      </div>
    </section>
  );
};

export default OtherSignin;
