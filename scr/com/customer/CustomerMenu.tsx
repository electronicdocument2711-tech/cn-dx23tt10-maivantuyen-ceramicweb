"use client";

import {
  IconCustomer,
  // IconService,
  IconEdoc,
  IconTelescope,
  // IconPill,
  // IconInsurance,
  IconTreatment,
  IconPhoto,
  IconForm,
  IconSchedule,
  IconPayment,
  IconInvoice1,
} from "@/com/icons/duotone";
import { useCustomerContext } from "@/context/CustomerContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items: {
  key: string;
  label: string;
  icon: React.ReactNode;
  isDisabled?: boolean;
}[] = [
  {
    key: "board",
    label: "Hồ sơ",
    icon: <IconCustomer />,
  },
  {
    key: "diagnose",
    label: "Chẩn đoán & Chỉ định",
    icon: <IconTelescope />,
  },
  {
    key: "diary",
    label: "Nhật ký điều trị",
    icon: <IconTreatment />,
  },
  {
    key: "records",
    label: "Bệnh án Điện tử",
    icon: <IconEdoc />,
  },
  {
    key: "appointments",
    label: "Lịch hẹn",
    icon: <IconSchedule />,
  },
  {
    key: "financial",
    label: "Thanh toán",
    icon: <IconPayment />,
  },
  {
    key: "notes",
    label: "Các ghi chú",
    icon: <IconForm />,
  },
  {
    key: "photos",
    label: "Hình ảnh",
    icon: <IconPhoto />,
  },
  {
    key: "payment",
    label: "Hoá đơn",
    icon: <IconInvoice1 />,
  },
  // {
  //   key: "services",
  //   label: "Dịch vụ",
  //   icon: <IconService />,
  //   isDisabled: true,
  // },
  // {
  //   key: "prescription",
  //   label: "Kê đơn",
  //   icon: <IconPill />,
  //   isDisabled: true,
  // },
  // {
  //   key: "insurance",
  //   label: "Bảo hiểm",
  //   icon: <IconInsurance />,
  //   isDisabled: true,
  // },
  // {
  //   key: "forms",
  //   label: "Form mẫu",
  //   icon: <IconForm />,
  //   isDisabled: true,
  // },
];

const CustomerMenu: React.FC = () => {
  const path = usePathname();
  const { customer } = useCustomerContext();

  return (
    <ul className="flex flex-col gap-2 p-2 sm:p-4">
      {items.map((item) => {
        const href =
          "/customer/" +
          customer?.CustomerId +
          (item.key ? "/" + item.key : "");

        return (
          <li key={item.key}>
            <Link
              href={href}
              className={`w-full min-h-12 text-left p-3 flex items-center gap-3 ${item?.isDisabled ? "opacity-50 cursor-default pointer-events-none" : "cursor-pointer"} ${
                path.startsWith(href)
                  ? "bg-blue-50  rounded-xl"
                  : "rounded-xl hover:bg-gray-50"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="hidden @3xl:block text-base text-blue-700 font-semibold truncate line-clamp-1">
                {item.label}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default CustomerMenu;
