import { Input } from "@heroui/react";
import { a as _a } from "framer-motion/client";
import { useEffect, useState } from "react";

type InputCustomType = "default" | "curency" | "number" | "email";
const getRawValue = (value: string) => {
  return value.replace(/\D/g, "");
};

interface InputCustomProps {
  inputType?: InputCustomType;
  label?: string;
  inputValue?: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  isInvalid?: boolean;
  isRequired?: boolean;
  errorMessage?: string;
  hideLableSpace?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isDisable?: boolean;
  isFormatVND?: boolean;
  classname?: string;
  inputAlign?: "left" | "right" | "center";
  maxLenght?: number;
  autoFocus?: boolean;
  autoComplete?: string;
}
export const InputCustom = ({
  inputType = "default",
  label,
  inputValue,
  placeholder,
  onValueChange,
  isInvalid,
  isRequired = false,
  errorMessage,
  hideLableSpace = false,
  startContent,
  endContent,
  isDisable = false,
  isFormatVND = true,
  classname,
  inputAlign,
  maxLenght,
  autoFocus,
  autoComplete,
}: InputCustomProps) => {
  const [value, setValue] = useState<string>();

  const formatDisplayValue = (val: string) =>
    isFormatVND
      ? getRawValue(val).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      : getRawValue(val);

  const handleInput = (val: string) => {
    const rawValue = getRawValue(val);
    if (inputType === "curency") {
      setValue(formatDisplayValue(rawValue));
      onValueChange(rawValue);
    } else if (inputType === "number") {
      setValue(rawValue);
      onValueChange(rawValue);
    } else if (inputType === "email") {
      setValue(val);
      onValueChange(val);
    } else {
      setValue(val);
      onValueChange(val);
    }
  };

  useEffect(() => {
    const newVal = inputValue ? inputValue.toString() : "";
    setValue(inputType === "curency" ? formatDisplayValue(newVal) : newVal);
  }, [inputValue, isFormatVND]);

  return (
    <div className={`w-full flex flex-col gap-2  ${classname}`}>
      <span
        className={`!text-base !font-bold shrink-0 ${
          hideLableSpace ? "hidden" : "min-h-6"
        }`}
      >
        {label ? label : ""}
      </span>
      {!isDisable ? (
        <Input
          autoComplete={autoComplete ? autoComplete : undefined}
          autoFocus={autoFocus || undefined}
          aria-label="input custom"
          isInvalid={isInvalid}
          isRequired={isRequired}
          errorMessage={errorMessage}
          maxLength={maxLenght ? maxLenght : undefined}
          radius="lg"
          type={inputType === "email" ? "email" : "text"}
          variant="bordered"
          labelPlacement={"outside"}
          placeholder={
            placeholder ? placeholder : inputType === "curency" ? "0" : ""
          }
          startContent={
            startContent ? (
              startContent
            ) : inputType === "curency" ? (
              <p className="text-gray-700 pl-3">₫</p>
            ) : null
          }
          endContent={endContent}
          onValueChange={handleInput}
          value={value?.toString()}
          classNames={{
            input: `${!!inputAlign ? `text-${inputAlign}` : inputType === "default" ? "text-left" : "text-right"} font-medium text-base ml-1 `,
            base: "w-full",
            inputWrapper:
              "opacity-100 w-full h-12 data-[hover=true]:border-default-500",
          }}
        />
      ) : (
        <div className="h-13 border border-gray-300 rounded-2xl flex items-center justify-between hover:border-default-500">
          {startContent ? (
            startContent
          ) : inputType === "curency" ? (
            <p className="text-gray-700 pl-3">₫</p>
          ) : null}
          <p className="text-right font-medium text-base pr-3">
            {value?.toString()}
          </p>
        </div>
      )}
    </div>
  );
};
