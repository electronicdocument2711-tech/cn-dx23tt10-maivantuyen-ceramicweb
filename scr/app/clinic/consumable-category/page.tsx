"use client";

import React from "react";
import { Button, useDisclosure } from "@heroui/react";
import { IconPlus } from "@tabler/icons-react";
import ConsumableCategory from "@/com/clinic/ConsumableCategory";

export default function ConsumableCategoryPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Danh mục vật tư</h1>

        <Button color="primary" onPress={onOpen} className="pr-6">
          <IconPlus size={20} />
          Thêm mới
        </Button>
      </div>

      <ConsumableCategory isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </>
  );
}
