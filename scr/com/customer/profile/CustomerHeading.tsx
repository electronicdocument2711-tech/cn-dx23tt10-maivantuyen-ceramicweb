"use client";

import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { useCustomerContext } from "@/context/CustomerContext";

const CustomerHeading: React.FC = () => {
  const { customer } = useCustomerContext();

  return (
    <>
      <div className="flex items-center text-sm font-medium gap-2 mb-2">
        <Link href="/customer" className="text-blue-700">
          Khách hàng
        </Link>
        <IconChevronRight className="w-4 h-4" />
        <span className="text-gray-600">{customer?.FullName}</span>
      </div>
      <h1 className="text-3xl text-blue-700 font-bold">Hồ sơ khách hàng</h1>
    </>
  );
};

export default CustomerHeading;
