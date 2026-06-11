import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { IconTrash, IconX } from "@tabler/icons-react";
import React, { useState } from "react";

interface DeleteRowButtonProps {
  rowId: number;
  rowType: "condition" | "time";
  serverId?: string;
  onDelete: (id: number) => void;
  onApiDelete?: (
    serverId: string,
    rowType: "condition" | "time",
  ) => Promise<void>;
}

const DeleteRowButton = ({
  rowId,
  rowType,
  serverId = "",
  onDelete,
  onApiDelete,
}: DeleteRowButtonProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (serverId && serverId !== "" && onApiDelete) {
        await onApiDelete(serverId, rowType);
      }

      onDelete(rowId);

      onOpenChange();
    } finally {
      setIsDeleting(false);
    }
  };

  const getModalMessage = () => {
    if (serverId && serverId !== "") {
      return rowType === "condition"
        ? "Bạn có chắc chắn muốn xoá điều kiện này?"
        : "Bạn có chắc chắn muốn xoá lịch trình này?";
    }
    return "Bạn có chắc chắn muốn xoá dòng này";
  };

  return (
    <>
      <Button
        isIconOnly
        variant="bordered"
        className="border-slate-200"
        onPress={onOpen}
      >
        <IconTrash size={20} color="gray" />
      </Button>

      <Modal hideCloseButton isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center justify-between">
                <h1>Xác nhận xoá</h1>

                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  onPress={onClose}
                  className="bg-slate-50"
                >
                  <IconX size={20} />
                </Button>
              </ModalHeader>

              <ModalBody>
                <p>{getModalMessage()}</p>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="bordered"
                  disabled={isDeleting}
                  onPress={onClose}
                >
                  Huỷ
                </Button>

                <Button
                  color="danger"
                  onPress={handleDelete}
                  isLoading={isDeleting}
                  className="test-base font-semibold"
                >
                  Xoá
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteRowButton;
