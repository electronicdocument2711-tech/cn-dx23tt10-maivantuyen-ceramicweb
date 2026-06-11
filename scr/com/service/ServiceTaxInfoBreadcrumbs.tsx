"use client";

import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { useRouter } from "next/navigation";

const ServiceTaxInfoBreadcrumbs = () => {
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

export default ServiceTaxInfoBreadcrumbs;
