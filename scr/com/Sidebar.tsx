"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCookie } from "@/hook/cookie";
import { IconLogo, IconLogoX } from "@/com/icons/regular";
import { IconChevronLeft, IconChevronRight } from "@/com/icons/outline";

import {
  IconCustomer,
  IconHome,
  IconSchedule,
  IconService,
  IconClinic,
  IconReport,
  IconInvoice1,
} from "@/com/icons/duotone";
import SidebarEngage from "./upgrade/SidebarEngage";

interface SidebarItemProp {
  key: string;
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: any[];
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  isDisabled?: boolean;
}

type SidebarItemWrapperProps = {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) => void;
  children: React.ReactNode;
} & React.ComponentProps<"div"> &
  React.ComponentProps<typeof Link>;

const Sidebar: React.FC<{
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}> = ({ isOpen, onToggle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useCookie<boolean>(
    "sidebar-open",
    isOpen ?? true,
  );

  const pathname = usePathname();

  const handleToggle = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    onToggle?.(newState);
  };

  const items: SidebarItemProp[] = [
    {
      key: "/",
      label: "Trang chủ",
      icon: <IconHome />,
      onClick: () => {},
    },
    {
      key: "/schedule",
      label: "Lịch hẹn",
      icon: <IconSchedule />,
    },
    {
      key: "/customer",
      label: "Khách hàng",
      icon: <IconCustomer />,
    },
    {
      key: "/service",
      label: "Dịch vụ",
      icon: <IconService />,
    },
    {
      key: "/payment",
      label: "Hoá đơn",
      icon: <IconInvoice1 />,
      children: [
        { label: "Danh sách hóa đơn", key: "/list" },
        { label: "Thiết lập dịch vụ", key: "/service" },
        { label: "Chủ thể xuất hóa đơn", key: "/bill" },
        { label: "Kết nối HD điện tử", key: "/integrate" },
        // { label: "Cập nhật hóa đơn", key: "/change", isDisabled: true },
      ],
    },
    {
      key: "/clinic",
      label: "Phòng khám",
      icon: <IconClinic />,
    },
    {
      key: "/report",
      label: "Báo cáo",
      icon: <IconReport />,
    },
    // {
    //   key: "/marketing",
    //   label: "Marketing",
    //   icon: <IconPromo />,
    //   isDisabled: true,
    //   children: [
    // {
    //   label: "Referral",
    //   key: "/referral",
    // },
    // {
    //   label: "Khuyến mãi",
    //   key: "/promotion",
    // },
    // {
    //   label: "Loyalty & Điểm thưởng",
    //   key: "/loyalty",
    // },
    // {
    //   label: "Email & Sms tự động",
    //   key: "/email-sms",
    // },
    // {
    //   label: "Form đặt lịch",
    //   key: "/booking-form",
    // },
    //   ],
    // },
    // {
    //   key: "/edoc",
    //   label: "Bệnh án điện tử",
    //   icon: <IconEdoc />,
    //   isDisabled: true,
    // },
  ];

  const SidebarItem = ({ item }: { item: SidebarItemProp }) => {
    const key = `sidebar-item-opened-${item.key}`;
    const [isOpened, setIsOpened] = useCookie<boolean>(key, false);
    const isItemDisabled =
      item.isDisabled || (item as any).isDisable || (item as any).isDisbled;

    const SidebarItemWrapper: React.FC<SidebarItemWrapperProps> = ({
      children,
      onClick,
      ...props
    }) => {
      return item.children ? (
        <div
          {...props}
          onClick={() => !isItemDisabled && setIsOpened(!isOpened)}
        >
          <div className="flex items-center gap-1 w-full">{children}</div>
          {isSidebarOpen && (
            <button
              className="hover:bg-white rounded-full p-1"
              type="button"
              onClick={(e) => {
                if (isItemDisabled) {
                  e.stopPropagation();
                  return;
                }
                setIsOpened(!isOpened);
              }}
            >
              <IconChevronRight
                size={22}
                className={`ml-auto text-gray-600 ${
                  isOpened ? "rotate-90" : ""
                }`}
              />
            </button>
          )}
        </div>
      ) : (
        <Link
          {...props}
          onClick={(e) => {
            if (isItemDisabled) {
              e.preventDefault();
              return;
            }
            onClick?.(e);
          }}
        >
          {children}
        </Link>
      );
    };

    const isActive =
      item.key !== "/" ? pathname.startsWith(item.key) : pathname === "/";

    return (
      <li className="group px-3" key={item.key}>
        <SidebarItemWrapper
          href={isItemDisabled ? "#" : (item.key ?? "#")}
          onClick={
            item.onClick as (
              e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
            ) => void
          }
          className={`flex p-1 mx-auto items-center transition gap-1 rounded-xl hover:bg-blue-50 ${
            isActive ? "bg-blue-50" : ""
          } ${isItemDisabled ? "pointer-events-none opacity-50" : ""}`}
        >
          <div
            className={`w-10 h-10 flex items-center justify-center shrink-0 text-blue-200 group-hover:text-gray-800 transition-all ${
              pathname.startsWith(item.key) ? "text-gray-800" : ""
            }`}
          >
            {item.icon}
          </div>
          <div
            className={`font-semibold line-clamp-1 rounded-lg ${
              !isSidebarOpen
                ? "group-hover:absolute z-40 group-hover:left-18.5 group-hover:bg-white group-hover:rounded-xl group-hover:shadow-sm group-hover:py-2 group-hover:px-3"
                : ""
            }`}
          >
            <h4 className="truncate">{item.label}</h4>
            {!isSidebarOpen && item.children && (
              <ul
                className={`mt-1 mb-2 space-y-1 hidden border-t border-t-default-200 pt-3 group-hover:block`}
              >
                {item.children.map((child) => {
                  const childPath = `${item.key}${child.key}`;
                  const isChildActive =
                    child.key === "/"
                      ? pathname === item.key || pathname === childPath
                      : pathname.startsWith(childPath);
                  const isChildDisabled =
                    child.isDisabled || child.isDisable || child.isDisbled;

                  return (
                    <li key={child.key}>
                      <Link
                        href={isChildDisabled ? "#" : childPath}
                        onClick={(e) => isChildDisabled && e.preventDefault()}
                        className={`flex py-1.5 px-2 rounded-lg transition text-gray-800 hover:bg-blue-50 hover:text-gray-900 ${
                          isChildActive ? "text-gray-950 bg-blue-50" : ""
                        } ${isChildDisabled ? "opacity-50 cursor-default pointer-events-none" : ""}`}
                      >
                        <span className="font-medium line-clamp-1 truncate text-sm">
                          {child.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SidebarItemWrapper>
        {isSidebarOpen && isOpened && item.children && (
          <ul className={`ml-6 pl-4 my-2 space-y-1 border-l border-l-gray-500`}>
            {item.children.map((child) => {
              const childPath = `${item.key}${child.key}`;
              const isChildActive =
                child.key === "/"
                  ? pathname === item.key || pathname === childPath
                  : pathname.startsWith(childPath);
              const isChildDisabled =
                child.isDisabled || child.isDisable || child.isDisbled;

              return (
                <li key={child.key}>
                  <Link
                    href={isChildDisabled ? "#" : childPath}
                    onClick={(e) => isChildDisabled && e.preventDefault()}
                    className={`flex p-2 text-gray-800 rounded-xl transition hover:text-gray-950 hover:bg-blue-50 hover:rounded-xl ${
                      isChildActive ? "text-gray-950 bg-blue-50" : ""
                    } ${isChildDisabled ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <span className="font-medium line-clamp-1 text-sm">
                      {child.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="border-r w-fit bg-white border-slate-200 z-50">
      <div className="sticky top-0 h-dvh">
        <div className="relative h-dvh">
          <aside
            className={`flex-1 max-h-dvh relative transition-all duration-300 ${
              isSidebarOpen ? "w-65" : "w-18"
            }`}
          >
            <div className="px-2 py-3">
              <Link
                className={`h-10 flex items-center justify-center gap-4 p-1  rounded-2xl max-w-40 `}
                href={process.env.NEXT_PUBLIC_LANDINGPAGE_URL ?? "/"}
              >
                {isSidebarOpen ? (
                  <IconLogo size={40} />
                ) : (
                  <IconLogoX size={35} />
                )}
              </Link>
            </div>
            <div className="flex-1 p-0 overflow-y-auto no-scrollbar max-h-[calc(100dvh-64px)]">
              <ul
                className={`space-y-1 flex flex-col pt-5 ${isSidebarOpen ? "pb-80" : "pb-20"}`}
              >
                {items.map((item) => (
                  <SidebarItem key={item.key} item={item} />
                ))}
              </ul>
            </div>
          </aside>
          <div className="absolute bottom-0 left-0 right-0 w-full">
            <SidebarEngage isSidebarOpen={!!isSidebarOpen} />

            <div className="flex justify-end w-full bg-white pb-1">
              <div className="w-[53px]">
                <button
                  onClick={handleToggle}
                  aria-label="Toggle Sidebar"
                  type="button"
                  className="rounded-full p-2 hover:bg-slate-100 cursor-pointer transition"
                >
                  {isSidebarOpen ? (
                    <IconChevronLeft size={20} />
                  ) : (
                    <IconChevronRight size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
