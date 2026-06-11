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
import rest from "@/lib/rest";
import { BranchSaas } from "@/types/define.d";
import { UI_META } from "@/const/ui";

type CreateChairPayload = {
  chairId?: string;
  chairCode: string;
  branchId: string;
};

type ChairModalMode = "create" | "edit";

type DentalChairInitialData = {
  chairId?: string;
  chairCode?: string;
  branchId?: string;
};

type DentalChairCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode?: ChairModalMode;
  initialData?: DentalChairInitialData | null;
  onSubmit: (payload: CreateChairPayload) => void;
};

const LIMIT = 20;
const START = 0;

export default function DentalChairCreateModal({
  isOpen,
  onClose,
  mode = "create",
  initialData,
  onSubmit,
}: DentalChairCreateModalProps) {
  const [chairCode, setChairCode] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState<BranchSaas[]>([]);

  const canSubmit = useMemo(
    () => chairCode.trim().length > 0 && !!branchId,
    [chairCode, branchId],
  );

  useEffect(() => {
    if (isOpen) {
      setChairCode(initialData?.chairCode || "");
      setBranchId(initialData?.branchId || "");
    }

    if (!isOpen) return;

    const fetchOptions = async () => {
      try {
        const branchRes = await rest.get(
          `/branch?limit=${LIMIT}&lmstart=${START}`,
        );

        const branchData = Array.isArray(branchRes?.data?.data)
          ? branchRes.data.data
          : Array.isArray(branchRes?.data)
            ? branchRes.data
            : [];

        setBranches(branchData as BranchSaas[]);
      } catch {
        setBranches([]);
      }
    };

    void fetchOptions();
  }, [initialData, isOpen]);

  const handleClose = () => {
    setChairCode("");
    setBranchId("");
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    onSubmit({
      chairId: initialData?.chairId,
      chairCode: chairCode.trim(),
      branchId,
    });

    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalContent>
        <ModalHeader>
          {mode === "edit" ? "Chỉnh sửa ghế nha" : "Tạo ghế nha"}
        </ModalHeader>
        <ModalBody className="gap-4">
          <Input
            label="Mã ghế nha"
            labelPlacement="outside-top"
            placeholder="CC001"
            value={chairCode}
            onChange={(e) => setChairCode(e.target.value)}
            variant="bordered"
            classNames={UI_META.Input.classNames}
            isRequired
          />

          <Select
            label="Chi nhánh"
            labelPlacement="outside-top"
            variant="bordered"
            classNames={{
              label: "font-medium text-base pl-1 pb-1",
              trigger:
                "h-12 rounded-2xl border-default-400 data-[hover=true]:border-default-500",
              value: "!font-normal !text-base",
            }}
            selectedKeys={branchId ? [branchId] : []}
            onSelectionChange={(keys) =>
              setBranchId(String(Array.from(keys)[0] || ""))
            }
            isRequired
            placeholder="Chọn chi nhánh"
          >
            {branches.map((branch) => (
              <SelectItem key={branch.BranchId || ""}>
                {branch.Name || branch.name || "-"}
              </SelectItem>
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
