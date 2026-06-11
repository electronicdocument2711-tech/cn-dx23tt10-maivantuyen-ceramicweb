"use client";

import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { useRouter } from "next/navigation";

const PaymentServiceBreadcrumbs = () => {
  const router = useRouter();

  return (
    <Breadcrumbs
      className="font-medium text-base"
      itemClasses={{
        item: "text-blue-700",
        separator: "text-blue-700",
      }}
    >
      <BreadcrumbItem
        onPress={() => {
          router.push(`/payment/service`);
        }}
      >
        Thiết lập dịch vụ
      </BreadcrumbItem>
      <BreadcrumbItem> </BreadcrumbItem>
    </Breadcrumbs>
  );
};

export default PaymentServiceBreadcrumbs;
