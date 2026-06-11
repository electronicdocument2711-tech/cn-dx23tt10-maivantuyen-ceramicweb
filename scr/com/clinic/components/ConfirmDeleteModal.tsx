"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  title,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(closeModal) => (
          <>
            <ModalHeader className="flex justify-center font-bold text-xl">
              {title}
            </ModalHeader>
            <ModalBody>
              <p>Bạn có chắc muốn xóa mục này?</p>
            </ModalBody>
            <ModalFooter className="gap-2">
              <Button variant="light" onPress={closeModal}>
                Hủy
              </Button>
              <Button color="danger" onPress={onConfirm}>
                Xóa
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
