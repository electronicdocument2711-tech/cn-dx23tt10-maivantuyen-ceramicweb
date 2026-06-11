import { Input, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { normalizeString } from "@/lib/utils";

type CustomSelectsItem = {
  id: string;
  label: string;
};

interface CustomSelectsProps {
  items: CustomSelectsItem[];
  label?: string;
  placementPopover?:
    | "top"
    | "bottom"
    | "right"
    | "left"
    | "top-start"
    | "top-end"
    | "bottom-start"
    | "bottom-end"
    | "left-start"
    | "left-end"
    | "right-start"
    | "right-end";
  showPickerId?: boolean;
  disabled?: boolean;
  placeholder?: string;
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (value: string) => void;
  popoverWidth?: string;
  style?: {
    title?: string;
    base?: string;
    content?: string;
    trigger?: string;
    backdrop?: string;
  };
  className?: string;
  ref?: HTMLDivElement;
}

export function Selector({
  items,
  label,
  placementPopover = "bottom",
  showPickerId = false,
  disabled = false,
  placeholder,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  popoverWidth,
  style,
  className,
  ref,
}: CustomSelectsProps) {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [internalKey] = useState(defaultSelectedKey ?? "");

  const currentKey = selectedKey ?? internalKey;
  const selectedOption = items?.find((opt) => opt.id === currentKey);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (!query) return items;
    const term = normalizeString(query);
    return items?.filter((opt) => normalizeString(opt.label).includes(term));
  }, [items, query]);

  const striggerLabel =
    (showPickerId ? selectedOption?.id : selectedOption?.label) ??
    placeholder ??
    "";
  // const width = popoverWidth || "var(--heroui-popover-trigger-width)";

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <span className={`pb-2 font-bold  ${style?.title}`}>{label}</span>
      )}
      <Popover
        portalContainer={ref ? ref : undefined}
        aria-label={label || placeholder}
        className=""
        isOpen={isOpen && !disabled}
        onOpenChange={setOpen}
        placement={placementPopover}
        classNames={{
          base: ` ${style?.base}`,
          content: style?.content,
          trigger: `min-h-12 flex w-full  items-center justify-between gap-1 p-1 border-1 rounded-2xl border-gray-500 ${style?.trigger}`,
          backdrop: `${style?.backdrop} `,
        }}
      >
        <PopoverTrigger>
          <button
            disabled={disabled}
            type="button"
            className={`${disabled ? "cursor-not-allowed opacity-50" : ""} ${
              striggerLabel === placeholder ? "text-medium text-gray-600" : ""
            }`}
          >
            <span className="p-2">{striggerLabel}</span>
            <IconChevronDown className="w-4 h-4 tex text-gray-500" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className={` ${
            popoverWidth ? `w-${popoverWidth} max-w-${popoverWidth}` : "w-30"
          }`}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="sm"
            className="w-full"
            placeholder={"Search..."}
            startContent={<IconSearch className="w-4 h-4 text-gray-500" />}
          />

          <div className="max-h-60 overflow-y-auto mt-2">
            {filtered?.map((opt) => (
              <button
                key={opt.id}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                onClick={() => {
                  onSelectionChange?.(opt?.id ?? "");
                  setOpen(false);
                  setQuery("");
                }}
              >
                {opt.label}
              </button>
            ))}
            {filtered?.length === 0 && (
              <p className="text-sm text-gray-500 px-3 py-2">
                Không có kết quả
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
