"use client";

import { IconNotification } from "@/com/icons/filled";
import { Badge } from "@heroui/react";
import { useState } from "react";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

const NotiDropdown: React.FC = () => {
  const [isInvisible, _setIsInvisible] = useState(false);
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <button type="button" className="cursor-pointer items-center flex pt-1">
          <Badge
            color="danger"
            content={5}
            isInvisible={isInvisible}
            shape="circle"
          >
            <IconNotification className="text-blue-200" />
          </Badge>
        </button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        {[1, 2, 3, 4, 5].map((i) => (
          <DropdownItem key={i} className="h-14 gap-2">
            <p className="font-semibold">Notification {i}</p>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default NotiDropdown;
