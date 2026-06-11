"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/react";

import { Key, useEffect, useMemo, useState } from "react";
import { IconMap } from "../icons/regular";
import { useAppContext } from "@/context/AppContext";

interface BranchSelectorProps {
  value?: { label?: string; value?: string };
  onChange: (value: { label: string; value: string }) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isHidden?: boolean;
  isDisabled?: boolean;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  value,
  onChange,
  isInvalid,
  errorMessage,
  isHidden,
  isDisabled = false,
}) => {
  const { branches } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);

  const branchesFiltered = useMemo(() => {
    return items.filter((b) =>
      b.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, items]);

  /**
   * function
   * ====================================================================
   */

  /**
   * useEffect
   * ====================================================================
   */

  /**
   * Fetch data when select opens
   */
  useEffect(() => {
    setItems(branches.map((b) => ({ label: b.Name, value: b.BranchId })));
  }, [branches]);

  /**
   * render view
   * ====================================================================
   */

  const renderEmptyContent = () => {
    if (searchTerm) return "Không tìm thấy chi nhánh nào";

    return "Không có chi nhánh nào";
  };

  return (
    <Autocomplete
      aria-label="Branch Select"
      variant="bordered"
      label={
        !isHidden ? (
          <span className="text-base font-bold">
            Chi nhánh <span className="text-danger">*</span>
          </span>
        ) : null
      }
      placeholder="Chọn chi nhánh"
      items={branchesFiltered}
      labelPlacement="outside-top"
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      startContent={
        !isHidden ? <IconMap size={24} className="text-default-500" /> : null
      }
      selectedKey={value?.value}
      onSelectionChange={(key: Key | null) => {
        const selected = items.find((item) => item.value === key);
        if (selected) onChange(selected);
      }}
      isClearable={false}
      onInputChange={setSearchTerm}
      onOpenChange={() => setSearchTerm("")}
      listboxProps={{
        emptyContent: renderEmptyContent(),
      }}
      size={isHidden ? "md" : "lg"}
    >
      {(item) => (
        <AutocompleteItem key={item.value} className="capitalize">
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};
export default BranchSelector;
