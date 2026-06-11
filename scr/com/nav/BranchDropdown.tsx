"use client";

import { useAppContext } from "@/context";
import {
  Dropdown,
  DropdownItem,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
} from "@heroui/react";
import { IconMapPin, IconChevronDown } from "@tabler/icons-react";
import { IconCheck } from "@/com/icons/outline";
import { useEffect, useState } from "react";

const BranchDropdown: React.FC = () => {
  const { branches, branch, setBranch } = useAppContext();
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (branches.length === 1 && !branch) setBranch(branches[0]);
  }, [branches, branch, setBranch]);

  useEffect(() => {
    if (branches?.length > 1 && !branch) {
      setOpen(true);
    }
  }, [branch, branches]);

  return (
    <Dropdown
      backdrop="opaque"
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!branch && !isOpen) return;

        setOpen(isOpen);
      }}
      placement="bottom-start"
    >
      <DropdownTrigger>
        <button className="flex items-center gap-1 border border-gray-300 rounded-xl px-2 py-1.5">
          <IconMapPin size={18} className="shrink-0" />
          {branch ? (
            <span className="line-clamp-1 text-left">{branch.Name}</span>
          ) : (
            <span>Chi nhánh</span>
          )}
          <IconChevronDown size={16} className="shrink-0" />
        </button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownSection title="Hãy chọn chi nhánh">
          {branches.map((b: any) => (
            <DropdownItem
              key={b.BranchId}
              onClick={() => {
                setBranch(b);
                setOpen(false);
              }}
              endContent={
                b.BranchId === branch?.BranchId ? <IconCheck size={16} /> : null
              }
            >
              {b.Name}
            </DropdownItem>
          ))}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export default BranchDropdown;
