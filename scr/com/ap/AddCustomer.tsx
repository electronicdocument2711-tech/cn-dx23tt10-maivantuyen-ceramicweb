"use client";

import React, { useState } from "react";
import ModalAddCustomer from "../customer/ModalAddCustomer";
import { useRouter } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";

interface AddNewCustomerProps {
  onCreateSuccess?: (customerId?: string) => void;
}

export default function AddCustomer({ onCreateSuccess }: AddNewCustomerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = (customerId?: string) => {
    if (onCreateSuccess) onCreateSuccess(customerId);
    else router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full max-w-52 bg-primary flex items-center justify-center gap-2 text-white py-2 px-4 rounded-xl "
      >
        <IconPlus size={20} />
        <p className="font-bold">Thêm khách hàng</p>
      </button>
      <ModalAddCustomer
        isOpen={isOpen}
        setOpen={setIsOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
