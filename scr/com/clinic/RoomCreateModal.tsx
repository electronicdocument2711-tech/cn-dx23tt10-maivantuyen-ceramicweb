import { clinicData } from "@/data/clinic";
import { BranchSaas } from "@/types/define.d";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

type CreateRoomPayload = {
  roomId?: string;
  name: string;
  branchId: string;
  roomType: string;
};

type RoomModalMode = "create" | "edit";

type RoomModalInitialData = {
  roomId?: string;
  name?: string;
  branchId?: string;
  roomType?: string;
};

type RoomCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  branches: BranchSaas[];
  mode?: RoomModalMode;
  initialData?: RoomModalInitialData | null;
  onSubmit: (payload: CreateRoomPayload) => void;
};

export default function RoomCreateModal({
  isOpen,
  onClose,
  branches,
  mode = "create",
  initialData,
  onSubmit,
}: RoomCreateModalProps) {
  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState("");
  const [roomType, setRoomType] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(initialData?.name || "");
    setBranchId(initialData?.branchId || "");

    const initialRoomType = (initialData?.roomType || "").trim();
    const matchedType = clinicData.find(
      (type) =>
        type.RoomTypeId === initialRoomType ||
        type.Name.trim().toLowerCase() === initialRoomType.toLowerCase(),
    );

    setRoomType(matchedType?.RoomTypeId || "");
  }, [initialData, isOpen]);

  const canSubmit = useMemo(
    () => name.trim().length > 0 && !!branchId && !!roomType,
    [name, branchId, roomType],
  );

  const handleClose = () => {
    setName("");
    setBranchId("");
    setRoomType("");
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      roomId: initialData?.roomId,
      name: name.trim(),
      branchId,
      roomType,
    });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalContent>
        <ModalHeader>
          {mode === "edit" ? "Chỉnh sửa phòng khám" : "Thêm mới phòng khám"}
        </ModalHeader>
        <ModalBody>
          <Input
            label="Name"
            placeholder="Nhập tên phòng khám"
            value={name}
            onChange={(e) => setName(e.target.value)}
            isRequired
          />

          <Select
            label="Chi nhánh"
            // placeholder="Chọn chi nhánh"
            selectedKeys={branchId ? [branchId] : []}
            onSelectionChange={(keys) =>
              setBranchId(String(Array.from(keys)[0] || ""))
            }
            isRequired
          >
            {branches.map((branch) => (
              <SelectItem key={branch.BranchId || String(branch.id || "")}>
                {branch.Name || "-"}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Loại phòng"
            // placeholder="Chọn loại phòng"
            selectedKeys={roomType ? [roomType] : []}
            onSelectionChange={(keys) =>
              setRoomType(String(Array.from(keys)[0] || ""))
            }
            isRequired
          >
            {clinicData.map((type) => (
              <SelectItem key={type.RoomTypeId}>{type.Name}</SelectItem>
            ))}
          </Select>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Hủy
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!canSubmit}
          >
            {mode === "edit" ? "Cập nhật" : "Hoàn thành"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
