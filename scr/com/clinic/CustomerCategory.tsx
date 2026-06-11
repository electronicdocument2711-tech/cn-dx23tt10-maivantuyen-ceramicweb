"use client";

import React, { useState } from "react";
import { Customer } from "@/types/define.d";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { faker as _faker } from "@faker-js/faker";
import CustomerCategoryTable from "./components/CustomerCategoryTable";
import { useConfirm } from "../ConfirmProvider";

interface CustomerCategoryProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function CustomerCategory({
  isOpen,
  onOpen: _onOpen,
  onClose,
}: CustomerCategoryProps) {
  const { confirm } = useConfirm();

  const [customers, setCustomers] = useState<Customer[]>([]);

  const handleDeleteCustomer = async (_id: number) => {
    if (
      await confirm({ message: "Xác nhận xóa khách hàng ?", type: "warning" })
    ) {
      setCustomers((prev) => prev.filter((_d, uid) => uid !== uid));
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-center font-bold text-xl">
                Thêm mới
              </ModalHeader>

              <ModalBody className="pb-6">
                <Input placeholder="Nhóm vật tư" />

                <Textarea minRows={2} placeholder="Mô tả" />

                <Select placeholder="Tình trạng">
                  <SelectItem>Đang sử dụng</SelectItem>
                  <SelectItem>Ngừng sử dụng</SelectItem>
                </Select>

                <Button color="primary" onPress={onClose}>
                  Hoàn thành
                </Button>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <CustomerCategoryTable
        customers={customers}
        onDeleteCustomer={handleDeleteCustomer}
      />
    </>
  );
}
