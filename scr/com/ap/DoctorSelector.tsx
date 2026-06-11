"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { IconUsers } from "@tabler/icons-react";
import { Key, useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useAppContext } from "@/context/AppContext";
import { useDebounce } from "@/hook/useDebounce";

interface Option {
  label: string;
  value?: string;
}

interface DoctorSelectorProps {
  value?: Option;
  onChange?: (value: Option) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  hideLabel?: boolean;
}

const DoctorSelector: React.FC<DoctorSelectorProps> = ({
  value,
  onChange,
  isInvalid,
  errorMessage,
  hideLabel,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayInput, setDisplayInput] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [items, setItems] = useState<Option[]>([]);
  const { staffs, nurses } = useAppContext();
  const searchTermDebounced = useDebounce(searchTerm, 500);
  const selectedLabel = value?.label || "";

  useEffect(() => {
    if (isOpen && staffs.length > 0) {
      // exclude nurses from staff list to avoid duplication since we will combine them together
      const options = staffs
        .filter((staff) => !nurses.some((nurse) => nurse.id === staff.id))
        .map((staff) => ({ label: staff.name, value: staff.id }));

      // if there is search term, filter the options based on it
      const filteredOptions = searchTermDebounced
        ? options.filter((option) =>
            option.label
              .toLowerCase()
              .includes(searchTermDebounced.toLowerCase()),
          )
        : options;

      setItems(filteredOptions as Option[]);
    }
  }, [isOpen, staffs, nurses, searchTermDebounced, searchTerm]);

  const [, scrollerRef] = useInfiniteScroll({
    isEnabled: isOpen,
    shouldUseLoader: false, // we will handle loader in our own way
  });

  /**
   * useEffect
   * ====================================================================
   */

  // init display input
  useEffect(() => {
    setDisplayInput(selectedLabel);
  }, [selectedLabel]);

  /**
   * render content
   * ====================================================================
   */

  const renderEmptyContent = useCallback(() => {
    if (searchTerm) {
      return "Không tìm thấy bác sĩ nào";
    }

    return "Không có bác sĩ nào";
  }, [searchTerm]);

  return (
    <Autocomplete
      aria-label="Staff Selector"
      variant="bordered"
      label={!hideLabel && <span className="text-base font-bold">Hẹn gặp</span>}
      placeholder="Chọn bác sĩ"
      items={items}
      size="lg"
      labelPlacement="outside-top"
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      startContent={
        !hideLabel && <IconUsers size={24} className="text-default-500" />
      }
      onSelectionChange={(key: Key | null) => {
        const selected = items.find((item) => item.value == key);
        if (selected) {
          onChange?.(selected);
          inputRef.current?.blur(); // close the dropdown after selection
          setDisplayInput(selected.label); // update input display to selected label
        }
      }}
      scrollRef={scrollerRef}
      isClearable={false}
      inputValue={displayInput}
      onInputChange={(text) => {
        setSearchTerm(text);
        setDisplayInput(isOpen ? text : selectedLabel || text);
      }}
      onOpenChange={(isOpen) => {
        setIsOpen(isOpen);
        setSearchTerm("");
        if (!isOpen) {
          setDisplayInput(selectedLabel);
        }
      }}
      inputProps={{
        ref: inputRef,
        classNames: {
          input: `${hideLabel ? "font-bold" : ""}`,
          inputWrapper: `${hideLabel ? "p-0" : ""}`,
          label: "pointer-events-none",
        },
      }}
      listboxProps={{
        emptyContent: renderEmptyContent(),
      }}
    >
      {(item) => (
        <AutocompleteItem key={item.value} className="capitalize">
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};

export default DoctorSelector;
