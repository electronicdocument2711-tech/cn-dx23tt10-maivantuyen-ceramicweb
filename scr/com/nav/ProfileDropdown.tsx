"use client";

import { useRouter } from "next/navigation";

import { useAppContext } from "@/context";
import { useLayoutContext } from "@/context/LayoutContext";
import { UserContext } from "@/context/UserContext";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Switch,
} from "@heroui/react";
import {
  IconArrowAutofitWidth,
  IconDiamond,
  IconLogout,
} from "@tabler/icons-react";
import { useContext, useEffect, useState } from "react";
import { getUpgradePlanLabel } from "@/lib/upgradePlan";

const ProfileDropdown: React.FC = () => {
  const router = useRouter();
  const { logout, user } = useContext(UserContext);
  const { me, doctors, branches } = useAppContext();
  const currentPlan = me?.subscription?.plan ?? null;

  const planDisplayName = getUpgradePlanLabel(currentPlan?.name);
  const bussinessRole = me?.user_info?.business_role?.name || "-";

  const { isFullLayout, setIsFullLayout } = useLayoutContext();

  const handleLogout = () => {
    logout();
    router.replace("/auth/signin");
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const displayName = me?.user_info?.name || user?.Name;

  return (
    <Dropdown placement="bottom-end" closeOnSelect={false}>
      <DropdownTrigger>
        <button className="flex items-center gap-1 border border-gray-300 rounded-xl pr-2 pl-1 py-1">
          <Avatar
            className="transition-transform cursor-pointer w-7 h-7 rounded-full"
            src={user?.Avatar || undefined}
            name={user?.Name}
          />
          <span className="font-medium line-clamp-1 text-left">
            {displayName}
          </span>
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Profile Actions"
        variant="flat"
        className="w-72"
      >
        {/* Profile header */}
        <DropdownItem
          key="profile"
          isReadOnly
          showDivider
          className="cursor-default data-[hover=true]:bg-transparent py-3"
        >
          <div className="flex flex-col items-center gap-2 ">
            <Avatar
              className="size-16 rounded-full"
              src={user?.Avatar || undefined}
              name={user?.Name}
            />
            {/* <div className="absolute top-2 right-2 border border-[#CFE3F2] rounded-lg px-2 py-1 bg-[#E6F2FB] max-w-[80px]">
              <span className="font-medium text-md break-words">
                {planDisplayName}
              </span>
            </div> */}

            <div className="text-center">
              <p className="font-medium text-base">{displayName}</p>
              <p className="text-default-500 text-sm">{user?.Email}</p>
            </div>
          </div>
        </DropdownItem>

        {/* Rộng toàn trang toggle */}
        <DropdownItem
          key="layout"
          isReadOnly
          showDivider
          className="cursor-default data-[hover=true]:bg-transparent"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <IconArrowAutofitWidth size={24} className="text-default-500" />
              <span className="text-base font-medium text-[#112C5D]">
                Rộng toàn trang
              </span>
            </div>
            <Switch
              size="sm"
              aria-label="Fluid Layout"
              isSelected={isFullLayout}
              onValueChange={(value) => {
                return setIsFullLayout && setIsFullLayout(value);
              }}
            />
          </div>
        </DropdownItem>

        {/* Đội nhóm / plan info */}
        <DropdownItem
          key="team"
          isReadOnly
          showDivider
          className="cursor-default data-[hover=true]:bg-transparent py-3"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 font-bold">
              <IconDiamond size={24} className="text-default-500" />
              <span className="font-medium text-base">Tổ chức của bạn</span>
            </div>
            <ul className="flex flex-col gap-1 text-sm text-default-600 pl-9">
              <li>
                Gói đăng ký:{" "}
                <span className="font-semibold text-gray-800">
                  {planDisplayName}
                </span>
              </li>
              <li>
                Vai trò của bạn:{" "}
                <span className="font-semibold text-gray-800">
                  {bussinessRole}
                </span>
              </li>
              <li>
                Số bác sĩ:{" "}
                <span className="font-semibold text-gray-800">
                  {doctors.length}
                </span>
              </li>
              <li>
                Số chi nhánh:{" "}
                <span className="font-semibold text-gray-800">
                  {branches.length}
                </span>
              </li>
            </ul>
            {me?.is_owner || [8, 12].includes(me?.subscription?.plan?.id) ? (
              <Button
                color="primary"
                radius="full"
                className="w-full mt-1 rounded-xl font-medium"
                onPress={() => router.push("/upgrade?engage=true")}
              >
                Nâng cấp
              </Button>
            ) : null}
          </div>
        </DropdownItem>

        {/* Đăng xuất */}
        <DropdownItem
          key="logout"
          color="danger"
          onPress={handleLogout}
          startContent={<IconLogout size={22} color="#7C92A7" />}
        >
          <span className="font-medium text-base">Đăng xuất</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
