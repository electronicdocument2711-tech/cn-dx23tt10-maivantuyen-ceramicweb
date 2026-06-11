"use client";
import React from "react";
import { IconChevronDown } from "../icons/regular";
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@heroui/react";
import { ServiceOffer } from "@/types/define.d";
import {
  IconCircle,
  IconCircleCheckFilled,
  IconTransfer,
  IconX,
} from "@tabler/icons-react";
import dayjs from "@/lib/dayjs";

export default function SelectServiceState({
  data,
  onChangeConfirm,
  onDelete,
  showLabel = true,
}: {
  data: ServiceOffer;
  onChangeConfirm: (isConfirm: boolean) => void;
  onDelete: () => void;
  showLabel?: boolean;
}) {
  const isLock = data.IsProcessed === "1" || Number(data.PaidAmount) > 0;

  return (
    <ButtonGroup>
      {isLock && data.ChangedAt && data.ChangedBy && (
        <Tooltip
          delay={500}
          content={
            <div className="text-xs max-w-45 py-2">
              Chốt xác nhận điều trị lúc{" "}
              <span className="font-medium text-gray-900 truncate">
                {dayjs.unix(Number(data.ChangedAt)).format("HH:mm DD/MM/YYYY")}
              </span>{" "}
              bởi{" "}
              <span className="font-medium text-gray-900">
                {data.ChangedBy}
              </span>
            </div>
          }
          placement="top"
        >
          <Button className="h-7 p-1 min-w-none cursor-default bg-white">
            <IconCircleCheckFilled size={18} className="text-success-500" />
            {showLabel && (
              <p className="text-[13px] font-medium  text-success-700">
                Đã xác nhận
              </p>
            )}
          </Button>
        </Tooltip>
      )}
      {!isLock && (
        <>
          <Button
            onPress={() => {
              if (isLock || data.IsConfirmed !== "0") return;
              onChangeConfirm(true);
            }}
            className="h-7 p-1 pr-2 min-w-none border border-default-400 bg-white"
          >
            {data.IsConfirmed === "0" ? (
              <IconCircle size={18} className="text-default-500 shrink-0" />
            ) : (
              <IconCircleCheckFilled size={18} className="text-success-500" />
            )}
            <p
              className={`text-[13px] font-medium ${data.IsConfirmed === "0" ? "text-foreground" : "text-success-700 pointer-events-none"}`}
            >
              {data.IsConfirmed === "0" ? "Xác nhận " : "Đã xác nhận"}
            </p>
          </Button>
          <Dropdown placement="bottom-end">
            <DropdownTrigger className="size-7 z-5">
              <Button
                isIconOnly
                className={`size-7 min-w-none py-1 px-0 border border-default-400 bg-white`}
              >
                <IconChevronDown size={18} className={`text-default-500`} />
              </Button>
            </DropdownTrigger>

            <DropdownMenu>
              <DropdownItem
                onClick={() => onChangeConfirm(false)}
                key="unconfirm"
                className={`${data.IsConfirmed === "0" ? "hidden" : ""}`}
                classNames={{
                  title: "flex items-center gap-2 px-1",
                }}
              >
                <IconTransfer className="size-6 shrink-0" />
                <p className="font-medium text-base">Chuyển thành chỉ định</p>
              </DropdownItem>
              <DropdownItem
                onClick={onDelete}
                key="remore"
                classNames={{
                  title: "flex items-center gap-2 px-1",
                }}
              >
                <IconX className="size-6 shrink-0 text-danger-900" />
                <p className="font-medium text-base text-danger-800">
                  Bỏ chọn dịch vụ
                </p>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </>
      )}
    </ButtonGroup>
  );
}
