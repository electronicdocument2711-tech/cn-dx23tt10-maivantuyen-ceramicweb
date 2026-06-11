import React from "react";
import {
  useDisclosure,
} from "@heroui/react";

export default function DeleteDropdownItem() {
  const { isOpen: _isOpen, onOpen, onClose: _onClose } = useDisclosure();

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="font-semibold p-0"
      >
        Lịch sử chỉnh sửa
      </button>
    </>
  );
}
