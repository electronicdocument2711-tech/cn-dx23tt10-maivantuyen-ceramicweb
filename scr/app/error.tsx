"use client";
import { Button } from "@heroui/react";
import { UI_META } from "@/const/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-4">
      {/* <p className="text-base font-medium text-default-500">
        Tải trang thất bại
      </p> */}
      <p>Lỗi: {error.message} </p>
      <div>
        <Button
          className={`${UI_META.Button.primary.classnames} max-w-28`}
          onPress={reset}
        >
          Thử lại
        </Button>
      </div>
    </div>
  );
}
