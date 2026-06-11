import { Chip } from "@heroui/react";

type DoctorStatus = "active" | "inactive" | "pending";

interface StatusBadgeProps {
  status: DoctorStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          label: "Đang hoạt động",
          className: "bg-emerald-100 text-green-700",
        };
      case "inactive":
        return {
          label: "Ngưng hoạt động",
          className: "bg-rose-50 text-red-600",
        };
      case "pending":
        return {
          label: "Chờ duyệt",
          className: "bg-yellow-100 text-yellow-700",
        };
      default:
        return {
          label: "Không xác định",
          className: "bg-gray-100 text-gray-600",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      size="lg"
      variant="flat"
      className={`rounded-md px-3 py-1 ${config.className}`}
      classNames={{
        base: config.className,
        content: "font-semibold",
      }}
    >
      {config.label}
    </Chip>
  );
}
