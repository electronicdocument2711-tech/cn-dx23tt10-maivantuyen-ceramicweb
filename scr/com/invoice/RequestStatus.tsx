"use client";
import React from "react";

import {
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  IconCheck,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconClockHour4Filled,
  IconInfoCircleFilled,
  IconChevronDown,
  IconLockFilled,
} from "@tabler/icons-react";

import { request_status } from "@/data/einvoice";
import { useConfirm } from "../ConfirmProvider";

type StatusState = "warning" | "info" | "success" | "danger";

const colorMap: Record<StatusState, string> = {
  warning: "text-orange-600",
  info: "text-sky-600",
  success: "text-success-600",
  danger: "text-red-600",
};

const iconMap: Record<StatusState, React.ReactNode> = {
  warning: <IconClockHour4Filled className="text-orange-500" size={16} />,
  info: <IconInfoCircleFilled className="text-sky-500" size={16} />,
  success: <IconCircleCheckFilled className="text-success-400" size={16} />,
  danger: <IconCircleXFilled className="text-red-500" size={16} />,
};

export default function RequestStatus({
  status,
  onChange,
  isLocked = true,
}: {
  status: string;
  onChange: (status: string) => void;
  isLocked: boolean;
}) {
  const { confirm } = useConfirm();
  const handleChange = async (newStatus: any) => {
    const newStatusName = request_status.find(
      (item) => item.key === newStatus,
    )?.name;
    const isConfirmed = await confirm({
      title: "Phê duyệt hóa đơn",
      message:
        newStatus === "da_duyet"
          ? "Sau khi phê duyệt, yêu cầu sẽ được gửi sang hệ thống của **đối tác hóa đơn điện tử (BKAV, Viettel,...)**."
          : `Bạn có chắc chắn muốn thay đổi trạng thái thành **${newStatusName}**?`,
      hideCancel: true,
    });

    if (isConfirmed) onChange(newStatus);
  };

  const StatusButton: React.FC<{ status: string }> = ({ status }) => {
    const objStatus =
      request_status.find((item) => item.key === status) || null;

    if (!objStatus) return null;

    return (
      <button className="min-w-none !p-0 rounded-l-xl border border-r-0 border-default-400 bg-white">
        <div
          key={objStatus.key}
          className={`border-default-400 flex gap-1 p-1 text-sm font-medium ${colorMap[objStatus.state as StatusState]}`}
        >
          {iconMap[objStatus.state as StatusState]}
          <span className="text-xs line-clamp-1 overflow-hidden">
            {objStatus.name}
          </span>
        </div>
      </button>
    );
  };

  return (
    <ButtonGroup>
      <StatusButton status={status} />
      {isLocked ? (
        <button className="p-1 pr-1.5 border-1 border-default-400 bg-white rounded-r-xl">
          <IconLockFilled size={16} className="text-default-500" />
        </button>
      ) : (
        <Dropdown
          placement="bottom-end"
          classNames={{ base: "z-5", content: "z-5", trigger: "z-5" }}
        >
          <DropdownTrigger>
            <button className="p-1 pr-1.5 border-1 border-default-400 bg-white text-sm rounded-r-xl cursor-pointer">
              <IconChevronDown size={16} className="text-default-500" />
            </button>
          </DropdownTrigger>

          <DropdownMenu>
            {request_status.map((item) => (
              <DropdownItem
                isReadOnly={item.key === status}
                onClick={() => handleChange(item.key)}
                key={item.key}
                classNames={{
                  base: `font-medium ${item.key === status ? "bg-blue-50 cursor-default" : ""}`,
                }}
                endContent={
                  item.key === status ? <IconCheck size={16} /> : null
                }
              >
                {item.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      )}
    </ButtonGroup>
  );
}
