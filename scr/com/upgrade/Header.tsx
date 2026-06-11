"use client";

import Link from "next/link";
import { IconLogo } from "../icons/regular";

const steps = ["Tạo phòng khám", "Hoàn tất khởi tạo"];

export default function NewHeader() {
  let isEngage = false;
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    // ?engage=true from search params
    isEngage = searchParams.get("engage") === "true";
  }

  return (
    <header className="bg-white px-6 py-4">
      <div className="mx-auto grid grid-cols-4 items-center">
        {/* Logo */}
        <Link href={process.env.NEXT_PUBLIC_LANDINGPAGE_URL ?? "/"}>
          <IconLogo size={48} />
        </Link>

        {/* Steps */}
        {!isEngage && (
          <div className="col-span-2 flex justify-center">
            <div className="flex w-full max-w-xl justify-between">
              {steps.map((step, idx) => {
                const stepNumber = idx + 1;
                const isActive = stepNumber === 2;

                const circleClass = `
                size-8 flex items-center justify-center rounded-full border text-base font-bold
                ${isActive ? "border-blue-600 text-blue-600" : "border-default-500 text-gray-600"}
              `;

                const textClass = `
                ml-2 text-xl font-bold
                ${isActive ? "text-blue-600" : "text-default-600"}
              `;

                return (
                  <div key={step} className="flex items-center">
                    <div className={circleClass}>{stepNumber}</div>
                    <span className={textClass}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div />
      </div>
    </header>
  );
}
