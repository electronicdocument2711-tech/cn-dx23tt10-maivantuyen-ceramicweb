"use client";

import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import rest from "@/lib/rest";

type DentalChairState = "0" | "1";

type DentalChairStateSwitchProps = {
  chair: {
    id: string;
    chairCode: string;
    state: string;
    branchId?: string;
  };
  onStateUpdated: (chairId: string, state: DentalChairState) => void;
};

const isChairActive = (state?: string) => String(state) === "1";

export default function DentalChairStateSwitch({
  chair,
  onStateUpdated,
}: DentalChairStateSwitchProps) {
  const [nextState, setNextState] = useState<DentalChairState | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleRequestChange = (isSelected: boolean) => {
    setNextState(isSelected ? "1" : "0");
    onOpen();
  };

  const handleClose = () => {
    if (isUpdating) return;

    setNextState(null);
    onClose();
  };

  const handleConfirmChange = async () => {
    if (!nextState) return;

    if (!chair.branchId) {
      addToast({
        color: "danger",
        description: "Không tìm thấy chi nhánh của ghế nha",
      });
      handleClose();
      return;
    }

    setIsUpdating(true);

    console.log("nextState: ", typeof nextState);

    try {
      const formData = new FormData();

      formData.append("DentalChairId", chair.id);
      formData.append("DentalChairCode", chair.chairCode);
      formData.append("BranchId", chair.branchId);
      formData.append("State", nextState);

      const res = await rest.post("/chairs", formData);

      if (res.status === 200 || res.status === 201) {
        onStateUpdated(chair.id, nextState);
        addToast({
          color: "success",
          description: `Đã cập nhật trạng thái ghế ${chair.chairCode}`,
        });
        setNextState(null);
        onClose();
      }
    } catch {
      addToast({
        color: "danger",
        description: `Cập nhật trạng thái ghế ${chair.chairCode} thất bại`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Switch
        size="sm"
        isSelected={isChairActive(chair.state)}
        onValueChange={handleRequestChange}
        aria-label={`Trạng thái ghế ${chair.chairCode}`}
      >
        {isChairActive(chair.state) ? "Hoạt động" : "Tạm dừng"}
      </Switch>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalContent>
          <ModalHeader>Thay đổi tình trạng ghế nha</ModalHeader>
          <ModalBody>
            <p>
              Bạn muốn thay đổi tình trạng ghế nha{" "}
              <strong>{chair.chairCode}</strong> không?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Hủy
            </Button>
            <Button
              color="primary"
              isLoading={isUpdating}
              onPress={handleConfirmChange}
            >
              Xác nhận
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
