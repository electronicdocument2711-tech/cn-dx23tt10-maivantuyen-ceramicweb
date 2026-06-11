import { Select, SelectItem } from "@heroui/react";
import { IconCircle, IconCircleCheckFilled } from "@tabler/icons-react";
import { formatProgressLabel } from "./treatmentProgressUtils";
import { SelectOption } from "./ValidateForm";
import clsx from "clsx";

// Components
interface SelectFieldProps {
  placeholder: string;
  options: SelectOption[];
  selectedKey?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  size?: "sm" | "md" | "lg";
  emptyMessage?: string;
  isRightAlign?: boolean;
  hideTimeLine?: boolean;
}

// Constants
const SELECT_TRIGGER_CLASS =
  "rounded-2xl border-default-300 bg-white px-2 data-[hover=true]:border-default-300";

const SelectField = ({
  placeholder,
  options,
  selectedKey,
  onChange,
  disabled = false,
  error,
  size = "sm",
  emptyMessage = "Không có dữ liệu",
  isRightAlign,
  hideTimeLine,
}: SelectFieldProps) => {
  const isEmpty = options.length === 0;

  return (
    <div className="relative">
      <Select
        aria-label={placeholder}
        placeholder={placeholder}
        variant="bordered"
        className="w-full"
        selectedKeys={selectedKey ? [selectedKey] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0];
          onChange(selected ? String(selected) : "");
        }}
        isDisabled={disabled}
        popoverProps={{
          placement: "bottom-end",
          className: ` ${isRightAlign ? "float-right" : ""}`,
          classNames: {
            content: `${size == "lg" ? "min-w-60" : size == "md" ? "min-w-48" : "min-w-36"} p-1`,
          },
        }}
        classNames={{
          trigger: `${SELECT_TRIGGER_CLASS} h-auto min-h-10 py-2 ${
            error ? "!border-danger" : ""
          }`,
          value:
            "text-[13px] font-semibold text-[#1E376B] truncate line-clamp-1",
          selectorIcon: "text-[#8AA0B8]",
        }}
        listboxProps={{
          classNames: {
            list: clsx(!hideTimeLine && "timeline-menu"),
          },
          itemClasses: {
            base: "data-[hover=true]:bg-[#E8F1FD] data-[focus=true]:bg-transparent data-[focus-visible=true]:bg-transparent data-[selected=true]:bg-[#E8F1FD]",
            title:
              "whitespace-normal break-words text-[13px] font-semibold text-[#1E376B]",
          },
        }}
      >
        {isEmpty ? (
          <SelectItem key="__empty" isDisabled className="opacity-100">
            {emptyMessage}
          </SelectItem>
        ) : (
          options.map((option) => {
            return (
              <SelectItem
                startContent={
                  hideTimeLine ? null : (
                    <div
                      className={clsx(
                        "relative",
                        (selectedKey || 0) >= option.key ? "active" : "",
                      )}
                    >
                      {(selectedKey || 0) >= option.key ? (
                        <IconCircleCheckFilled
                          className="text-primary-500 z-10 rounded-full relative bg-white"
                          size={22}
                        />
                      ) : (
                        <IconCircle
                          size={22}
                          className="text-default-400 z-10 relative bg-white rounded-full"
                        />
                      )}
                    </div>
                  )
                }
                key={option.key}
                className={clsx(!hideTimeLine && "timeline-item opacity-90")}
                selectedIcon={null}
                hideSelectedIcon={!hideTimeLine}
              >
                {option.percent !== undefined
                  ? formatProgressLabel(option.label, option.percent)
                  : option.label}
              </SelectItem>
            );
          })
        )}
      </Select>
      {error && (
        <span className="absolute left-0 top-full mt-1 text-xs font-medium leading-4 text-danger">
          {error}
        </span>
      )}
    </div>
  );
};

export default SelectField;
