// /app/com/NewHeader.tsx
"use client";

import React from "react";
import ProgressIndicator from "./ProgressIndicator";

import Link from "next/link";
import { IconLogo } from "../icons/regular";

interface NewHeaderProps {
  currentStep: number;
  className?: string;
  preventNavigation?: boolean;
}

export default function NewHeader({
  currentStep,
  preventNavigation = false,
}: NewHeaderProps) {
  const steps = ["Tạo phòng khám", "Hoàn tất khởi tạo"];

  return (
    <header className={`bg-white px-6 py-4`}>
      <div className="mx-auto h-20 relative grid grid-cols-4 items-center">
        <div className="grid-cols-1">
          {!preventNavigation ? (
            <Link href={process.env.NEXT_PUBLIC_LANDINGPAGE_URL ?? "/"}>
              <IconLogo size={48} />
            </Link>
          ) : (
            <IconLogo size={48} />
          )}
        </div>

        <div className="flex mx-auto mr-0 lg:mr-auto my-auto justify-center col-span-2">
          <ProgressIndicator currentStep={currentStep} steps={steps} />
        </div>

        <div className="grid-cols-1" />
      </div>
    </header>
  );
}
