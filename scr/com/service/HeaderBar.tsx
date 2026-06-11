import Link from "next/link";
import { Button } from "@heroui/react";

type HeaderBarProps = {
  title?: string;
};

export const HeaderBar = ({ title = "Tạo mới dịch vụ" }: HeaderBarProps) => (
  <div className="flex items-center justify-between pt-3">
    <h1 className="text-3xl font-bold mb-3">{title}</h1>
    <Button as={Link} href="/service" variant="light">
      Quay lại
    </Button>
  </div>
);
