"use client";

import React from "react";
import { Button, useDisclosure } from "@heroui/react";
import { IconPlus } from "@tabler/icons-react";
import CustomerCategory from "@/com/clinic/CustomerCategory";

export default function CustomerCategoryPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Danh mục khách hàng</h1>

        <Button color="primary" onPress={onOpen} className="pr-6">
          <IconPlus size={20} />
          Thêm mới
        </Button>
      </div>

      <CustomerCategory isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </>
  );
}
