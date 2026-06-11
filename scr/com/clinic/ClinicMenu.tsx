"use client";

import {
  IconHr,
  IconClinic,
  // IconStar,
  // IconPill,
  // IconStock,
  IconServiceCat,
  // IconStockCat,
  // IconCustomerCat,
  // IconPaid,
  // IconInsurance,
  // IconLabo,
  // IconEmail,
  IconChair,
} from "@/com/icons/duotone";
import Link from "next/link";
import { usePathname } from "next/navigation";

const operations: {
  label: string;
  href: string;
  icon: React.ReactNode;
  isDisabled?: boolean;
}[] = [
  { label: "Nhân sự", href: "hr", icon: <IconHr size={20} /> },
  { label: "Chi nhánh", href: "branch", icon: <IconClinic size={20} /> },
  {
    label: "Phòng/Ghế nha",
    href: "dental-chair",
    icon: <IconChair size={20} />,
  },
  // {
  //   label: "Quản lý chất lượng",
  //   href: "quality",
  //   icon: <IconStar size={20} />,
  //   isDisabled: true,
  // },
  // {
  //   label: "Đơn thuốc mẫu",
  //   href: "prescription",
  //   icon: <IconPill size={20} />,
  //   isDisabled: true,
  // },
  // {
  //   label: "Vật tư tiêu hao",
  //   href: "consumable",
  //   icon: <IconStock size={20} />,
  //   isDisabled: true,
  // },
];

const categories = [
  {
    label: "Danh mục dịch vụ",
    href: "service-category",
    icon: <IconServiceCat size={20} />,
  },
  // {
  //   label: "Danh mục khách hàng",
  //   href: "customer-category",
  //   icon: <IconCustomerCat size={20} />,
  // },
  // {
  //   label: "Danh mục vật tư",
  //   href: "consumable-category",
  //   icon: <IconStockCat size={20} />,
  // },
];

// const connections = [
//   {
//     label: "Labo",
//     href: "labo",
//     icon: <IconLabo size={20} />,
//     isDisabled: true,
//   },
//   {
//     label: "Zalo / Email",
//     href: "message",
//     icon: <IconEmail size={20} />,
//     isDisabled: true,
//   },
//   {
//     label: "Bảo hiểm",
//     href: "insurance",
//     icon: <IconInsurance size={20} />,
//     isDisabled: true,
//   },
//   {
//     label: "Trả góp",
//     href: "installment",
//     icon: <IconPaid size={20} />,
//     isDisabled: true,
//   },
// ];

const ClinicMenu: React.FC = () => {
  const pathname = usePathname();
  return (
    <>
      <ul className="p-4">
        {operations.map((item) => (
          <li key={item.href} className="mb-1">
            <Link
              href={`/clinic/${item.href}`}
              className={`flex gap-5 p-2 hover:bg-blue-50 rounded-xl font-semibold ${item.isDisabled ? "opacity-50 pointer-events-none" : ""} ${
                pathname === `/clinic/${item.href}` ? "bg-blue-50" : ""
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <h3 className="px-5 font-medium text-sm text-gray-600">Danh mục</h3>
      <ul className="p-4 pt-2">
        {categories.map((item) => (
          <li key={item.href} className="mb-1">
            <Link
              href={`/clinic/${item.href}`}
              className={`flex gap-5 p-2 hover:bg-blue-50 rounded-xl font-semibold ${
                pathname === `/clinic/${item.href}` ? "bg-blue-50" : ""
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      {/* <h3 className="px-5 font-medium text-sm text-gray-600">Kết nối</h3>
      <ul className="p-4 pt-2">
        {connections.map((item) => (
          <li key={item.href} className="mb-1">
            <Link
              href={`/clinic/${item.href}`}
              className={`flex gap-5 p-2 hover:bg-blue-50 rounded-xl font-semibold ${item.isDisabled ? "opacity-50 pointer-events-none" : ""} ${
                pathname === `/clinic/${item.href}` ? "bg-blue-50" : ""
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        ))}
      </ul> */}
    </>
  );
};

export default ClinicMenu;
