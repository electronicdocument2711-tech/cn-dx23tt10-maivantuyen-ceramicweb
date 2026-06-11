"use client";
import { Button } from "@heroui/react";
import React, { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { UI_META } from "@/const/ui";
import ModalBranch from "./ModalBranch";

export default function AddBranch() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        color="primary"
        onPress={() => {
          setIsOpen(true);
        }}
        className={`${UI_META.Button.primary.classnames} max-w-48`}
      >
        <IconPlus size={24} className="font-bold shrink-0" />
        Thêm chi nhánh
      </Button>
      <ModalBranch isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
