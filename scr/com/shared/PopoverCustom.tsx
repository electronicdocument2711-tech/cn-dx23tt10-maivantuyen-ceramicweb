/* eslint-disable react-hooks/exhaustive-deps */

import {
  Button,
  Popover,
  PopoverContent,
  PopoverProps,
  PopoverTrigger,
} from "@heroui/react";
import { IconChevronDown } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface PopoverCustomProps extends Omit<PopoverProps, "children"> {
  label?: string;
  datas: string[];
  onValueChanged: (value: string) => void;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  defaultTitle?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  firstValue?: boolean;
  hideLabel?: boolean;
  className?: string;
}
export const PopoverCustom = ({
  label,
  datas,
  onValueChanged,
  startContent,
  endContent,
  defaultTitle,
  isDisabled = false,
  isLoading = false,
  firstValue = true,
  hideLabel = false,
  className,
  ...props
}: PopoverCustomProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState(0);

  const sortDatas = useMemo(() => {
    if (!datas) return [];
    const sort = [...datas].sort((a, b) => a.localeCompare(b, "vi"));
    return [...new Set(sort)];
  }, [datas]);

  const [pickedValue, setPickedValue] = useState<string>("");

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      setWidth(triggerRef.current.offsetWidth);
    }
  }, [isOpen]);

  useEffect(() => {
    if (sortDatas.length > 0 && firstValue && !pickedValue) {
      const initialValue = sortDatas[0];
      setPickedValue(initialValue);
      onValueChanged(initialValue);
    }
  }, [sortDatas, firstValue]);

  const handleSelect = (val: string) => {
    setPickedValue(val);
    onValueChanged(val);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isLoading === null || isLoading === undefined) return;
    setPickedValue("");
    onValueChanged("");
  }, [isLoading]);

  return (
    <div className={`w-full flex flex-col gap-2 ${className || ""}`}>
      {hideLabel === false && (
        <span className="text-base font-bold min-h-6 px-1">
          {label ? label : ""}
        </span>
      )}
      <Popover
        aria-label="popover-custom"
        placement="bottom"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        style={{ "--trigger-width": `${width}px` } as any}
        classNames={{
          content: "rounded-xl text-md",
        }}
        {...props}
      >
        <PopoverTrigger>
          <Button
            isLoading={isLoading}
            isDisabled={isDisabled}
            ref={triggerRef}
            variant="bordered"
            className="h-12 w-full px-2 rounded-2xl !font-normal !text-base bg-white border-gray-400 hover:border-default-500 flex items-center justify-start gap-1"
            startContent={startContent ? startContent : null}
            endContent={
              endContent ? (
                endContent
              ) : (
                <IconChevronDown className="w-4 h-4 text-[#7C92A7] shrink-0" />
              )
            }
          >
            <div className="w-full flex items-center gap-2 m-2 line-clamp-1">
              {pickedValue
                ? pickedValue
                : defaultTitle
                  ? defaultTitle
                  : "Chọn ngân hàng"}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[var(--trigger-width)]">
          <div className="w-full">
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto py-2">
              {sortDatas.map((data, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`w-full min-h-10 flex text-nowrap items-center justify-start rounded-md pl-4  ${
                    data === pickedValue
                      ? " bg-blue-50"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    handleSelect(data);
                  }}
                >
                  {data}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
