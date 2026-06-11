"use client";
import React, { useMemo, useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  IconChevronDown,
  IconCircle,
  IconCircleCheckFilled,
  IconX,
} from "@tabler/icons-react";
import { ApStatus } from "@/types/define.d";
import { AppointmentStatus } from "@/data/appointmentType";

const getAppointmentStatusStyle = (
  id: number,
): {
  style: string;
  label: string;
} => {
  switch (id) {
    case 41:
      return {
        style: "bg-[#E6FBEE] text-[##367B56] border-1 border-[#CFF2DE]",
        label: "Đã tiếp nhận",
      };
    case 44:
      return {
        style: "bg-[#E6FBEE] text-[##367B56] border-1 border-[#CFF2DE]",
        label: "Đang tư vấn",
      };
    case 45:
      return {
        style: "bg-[#E6FBEE] text-[##367B56] border-1 border-[#CFF2DE]",
        label: "Đang điều trị",
      };
    case 46:
      return {
        style: "bg-[#E6FBEE] text-[##367B56] border-1 border-[#CFF2DE]",
        label: "Đang chụp X quang",
      };
    case 31:
      return {
        style: "bg-[#E6FBEE] text-[##367B56] border-1 border-[#CFF2DE]",
        label: "Đã chuyển đến bác sĩ",
      };
    case 11:
      return {
        style: "bg-[#FCEFE3] text-[#934518] border-1 border-[##F9E1CB]",
        label: "Chưa đến",
      };
    case 51:
      return {
        style: "bg-[#E6FBEE] text-[##367B56] border-1 border-[#CFF2DE]",
        label: "Đã chuyển đến lễ tân",
      };
    case 61:
      return {
        style: "bg-[#E6FBEE] text-[##367B56] border-1 border-[#CFF2DE]",
        label: "Đã thanh toán",
      };
    case 71:
      return {
        style: "bg-[#E6FBEE] text-[##367B56] border-1 border-[#CFF2DE]",
        label: "Đã checkout",
      };
    case 1:
      return {
        style: "bg-[#FCECEC] text-[#AB342D] border-1 border-[#FADDDC]",
        label: "Hủy hẹn",
      };

    case 21:
      return {
        style: "bg-[#E6FBEE] text-[##367B56] border-1 border-[#CFF2DE]",
        label: "Đã đến",
      };

    default:
      return {
        style: "bg-background text-foreground ",
        label: "Trạng thái",
      };
  }
};

export default function ApStatusSelect({
  value,
  onChange,
  isClearable = false,
  currentStatusId,
}: {
  value: number;
  onChange: (value: number) => void;
  isClearable?: boolean;
  currentStatusId?: number;
}) {
  const [appointmentStatusList] = useState<ApStatus[]>(AppointmentStatus);
  const selectedAp = useMemo(() => {
    return appointmentStatusList.find(
      (status) => status.AppointmentStatusId === value,
    );
  }, [value, appointmentStatusList]);

  const optimizedAppointmentStatus = useMemo(() => {
    const cancelledStatus = appointmentStatusList.find(
      (item) => item.AppointmentStatusId === 1,
    );

    return [
      ...appointmentStatusList
        .filter((status) => status?.AppointmentStatusId !== 1)
        .sort((a, b) => a.AppointmentStatusId - b.AppointmentStatusId),
      ...(cancelledStatus ? [cancelledStatus] : []),
    ];
  }, [appointmentStatusList]);

  const disabledStatusIds = useMemo(() => {
    const disabledIds: string[] = [];

    if ((currentStatusId || value) === 1)
      disabledIds.push(
        ...(appointmentStatusList
          ?.filter((item) => item?.AppointmentStatusId > 1)
          ?.map((item) => String(item.AppointmentStatusId)) || []),
      );

    disabledIds.push(
      ...appointmentStatusList
        .filter(
          (item) =>
            item.AppointmentStatusId < (currentStatusId || value) &&
            item.AppointmentStatusId !== 1,
        )
        .map((item) => String(item.AppointmentStatusId)),
    );

    // Disable hủy hẹn nếu như đã thanh toán hoặc checkout
    if (["61", "71"]?.includes(String(currentStatusId || value))) {
      disabledIds.push("1");
    }

    return disabledIds;
  }, [currentStatusId, appointmentStatusList, value]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="solid"
          className="flex justify-between min-h-10.5 bg-white !p-0 !pr-2 border-1 border-default-400 shadow-[0px_1px_2px_#14151A0D] data-[hover=true]:border-default-500"
        >
          <div
            className={`min-h-8 m-1.5  font-medium rounded-lg flex items-center justify-center px-1.5 ${
              getAppointmentStatusStyle(selectedAp?.AppointmentStatusId || 0)
                .style
            } text-base font-semibold`}
          >
            {
              getAppointmentStatusStyle(selectedAp?.AppointmentStatusId || 0)
                .label
            }
          </div>

          <div className="flex items-center justify-center">
            {isClearable && value >= 0 && (
              <div className="pr-2">
                <IconX
                  className="bg-default-600 p-0.5 text-white rounded-full"
                  size={15}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(-1);
                  }}
                />
              </div>
            )}
            <IconChevronDown size={20} />
          </div>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disabledKeys={disabledStatusIds}
        className="timeline-menu timeline-specific"
        itemClasses={{ base: "p-1 opacity-90 timeline-item", wrapper: "p-0" }}
      >
        {optimizedAppointmentStatus.map((status) => (
          <DropdownItem
            key={status.AppointmentStatusId}
            textValue={
              getAppointmentStatusStyle(status.AppointmentStatusId).label
            }
            className={`rounded-md`}
            onClick={() => {
              if (status.AppointmentStatusId == value) return;
              onChange(status.AppointmentStatusId);
            }}
            startContent={
              status.AppointmentStatusId !== 1 ? (
                <>
                  {selectedAp?.AppointmentStatusId &&
                  status.AppointmentStatusId <=
                    selectedAp?.AppointmentStatusId ? (
                    <div className="relative active">
                      <IconCircleCheckFilled
                        className="text-primary-500 z-10 rounded-full relative bg-white"
                        size={22}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <IconCircle
                        size={22}
                        className="text-default-400 z-10 relative bg-white rounded-full"
                      />
                    </div>
                  )}
                </>
              ) : (
                <IconX size={20} />
              )
            }
            showDivider={status.AppointmentStatusId === 71}
          >
            <div className="flex flex-row gap-1 justify-between w-full font-medium items-center">
              <p className="text-base">
                {getAppointmentStatusStyle(status.AppointmentStatusId).label}
              </p>
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
