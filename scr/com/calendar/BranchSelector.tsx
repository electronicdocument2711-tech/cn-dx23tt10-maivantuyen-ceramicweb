"use client";

import {
  Button,
  Checkbox,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { IconChevronDown } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import { Branch } from "@/context/AppContext";
import { IconMapPinFilled } from "../icons/filled";

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranchIds: string[];
  onChange: (ids: string[]) => void;
  mode?: "single" | "multi";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  branches,
  selectedBranchIds,
  onChange,
  mode = "multi",
  isOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isBranchPopoverOpen = isOpen ?? internalOpen;

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
      return;
    }
    setInternalOpen(open);
  };

  const handleSelect = useCallback(
    (branchId: string) => {
      if (mode === "single") {
        onChange([branchId]);
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setInternalOpen(false);
        }
        return;
      }
      // multi mode: toggle
      const next = selectedBranchIds.includes(branchId)
        ? selectedBranchIds.filter((id) => id !== branchId)
        : [...selectedBranchIds, branchId];
      onChange(next);
    },
    [mode, selectedBranchIds, onChange, onOpenChange],
  );

  const filteredBranches = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return branches;
    return branches.filter((branch) => {
      const name = String(branch?.Name || "").toLowerCase();
      const code = String(branch?.BranchCode || "").toLowerCase();
      return name.includes(search) || code.includes(search);
    });
  }, [branches, searchTerm]);

  const selectedLabel = useMemo(() => {
    if (selectedBranchIds.length === 0) {
      return mode === "single" ? "Chọn chi nhánh" : "Tất cả chi nhánh";
    }
    if (selectedBranchIds.length === 1) {
      const found = branches.find(
        (b) => String(b.BranchId) === selectedBranchIds[0],
      );
      return found?.Name || "1 chi nhánh";
    }
    return `${selectedBranchIds.length} chi nhánh`;
  }, [selectedBranchIds, branches, mode]);

  const renderContent = () => {
    if (!filteredBranches?.length)
      return (
        <div className="min-h-25 flex justify-center items-center text-gray-600 text-xs text-center">
          Chưa có dữ liệu chi nhánh
        </div>
      );

    return (
      <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
        {filteredBranches.map((branch) => (
          <Checkbox
            key={branch.BranchId}
            isSelected={selectedBranchIds.includes(String(branch.BranchId))}
            onValueChange={() => handleSelect(String(branch.BranchId))}
            classNames={{
              base: "p-0 m-0",
              label: "p-0 m-0",
            }}
          >
            {branch.Name}
          </Checkbox>
        ))}
      </div>
    );
  };

  return (
    <Popover
      placement="bottom-end"
      isOpen={isBranchPopoverOpen}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger>
        <Button
          variant="bordered"
          size="sm"
          className="font-medium text-base min-w-50 max-w-70"
          startContent={<IconMapPinFilled className="shrink-0" size={18} />}
          endContent={<IconChevronDown size={18} className="shrink-0" />}
        >
          <span className="truncate flex-1 text-start">{selectedLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <Input
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          isClearable
          onClear={() => setSearchTerm("")}
        />
        <div className="w-72 mt-4">{renderContent()}</div>
      </PopoverContent>
    </Popover>
  );
};

export default BranchSelector;
