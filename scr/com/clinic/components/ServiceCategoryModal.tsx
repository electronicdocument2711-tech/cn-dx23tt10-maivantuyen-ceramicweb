"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";

type ServiceCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialValue?: string;
  submitLabel?: string;
  onSubmit: (value: string) => void | Promise<void>;
};

export default function ServiceCategoryModal({
  isOpen,
  onClose,
  title,
  initialValue = "",
  submitLabel = "Hoàn thành",
  onSubmit,
}: ServiceCategoryModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [initialValue, isOpen]);

  const handleSubmit = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    await onSubmit(trimmedValue);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex justify-center font-bold text-xl">
              {title}
            </ModalHeader>

            <ModalBody className="pb-6">
              <Input
                placeholder="Nhóm dịch vụ"
                value={value}
                onValueChange={setValue}
              />

              <Button
                color="primary"
                onPress={handleSubmit}
                isDisabled={!value.trim()}
              >
                {submitLabel}
              </Button>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
