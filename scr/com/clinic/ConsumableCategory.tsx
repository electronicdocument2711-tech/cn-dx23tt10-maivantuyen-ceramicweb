"use client";

import React, { useState } from "react";
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
import { Consumable } from "@/types/define.d";
import { faker as _faker } from "@faker-js/faker";
import ConsumableategoryTable from "./components/ConsumableategoryTable";
import { useConfirm } from "../ConfirmProvider";

interface ConsumableCategorProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function ConsumableCategor({
  isOpen,
  onOpen: _onOpen,
  onClose,
}: ConsumableCategorProps) {
  const { confirm } = useConfirm();

  const [consumables, setConsumables] = useState<Consumable[]>([
    {
      name: "Vật tư tiêu hao điều trị",
      disc: "Các vật tư sử dụng một lần hoặc thời gian ngắn",
      status: "pause",
    },
    {
      name: "Vật liệu nha khoa",
      disc: "Các vật liệu chuyên dụng được dùng để phục hình, trám, cấy ghép, hoặc phục hồi răng.",
      status: "active",
    },
    {
      name: "Thuốc và dung dịch nha khoa",
      disc: "Các loại thuốc, dung dịch sát khuẩn, dung dịch điều trị được dùng trong hoặc sau khi điều trị",
      status: "pause",
    },
    {
      name: "Dụng cụ - thiết bị nhỏ",
      disc: "Dụng cụ tái sử dụng trong thăm khám, điều trị, chỉnh nha, phẫu thuật.",
      status: "pause",
    },
  ]);

  const handleDeleteConsumable = async (_id: number) => {
    if (await confirm({ message: "Xác nhận xóa vật tư ?", type: "warning" })) {
      setConsumables((prev) => prev.filter((_d, uid) => uid !== uid));
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

                <Textarea placeholder="Mô tả" />

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

      <ConsumableategoryTable
        consumables={consumables}
        onDeleteConsumable={handleDeleteConsumable}
      />
    </>
  );
}
