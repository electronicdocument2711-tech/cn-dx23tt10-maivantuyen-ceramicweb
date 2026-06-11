import React from "react";
import { Input, InputProps } from "@heroui/react";

export const formatPhone = (value: string) => {
  if (!value) return "";
  const cleaned = value.replace(/[^\d+]/g, "");
  const is84 = cleaned.startsWith("+84");
  const maxLength = is84 ? 12 : 10;
  const limited = cleaned.slice(0, maxLength);
  const len = limited.length;

  if (is84) {
    if (len <= 3) return limited;
    if (len <= 5) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    if (len <= 8)
      return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5)}`;
    return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5, 8)} ${limited.slice(8)}`;
  } else {
    if (len <= 3) return limited;
    if (len <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
  }
};

// const countryCodes = [
//   { label: "VN", value: "+84", flag: "🇻🇳" },
//   // { label: "US", value: "+1", flag: "🇺🇸" },
// ];

interface PhoneInputProps extends Omit<InputProps, "value"> {
  portalNode?: HTMLDivElement;
  isRequired?: boolean;
  value?: string;
  onPhoneChange?: (value: string) => void;
}

export const PhoneInput = ({
  portalNode,
  isRequired = false,
  onPhoneChange,
  value: externalValue,
  ...props
}: PhoneInputProps) => {
  // const [isOpen, setIsOpen] = React.useState(false);
  // const [valueRegion, setValueRegion] = React.useState<string>(
  //   countryCodes[0].value,
  // );

  const [localValue, setLocalValue] = React.useState<string>(
    externalValue ? formatPhone(externalValue) : "",
  );

  return (
    <Input
      size="lg"
      // label="Số điện thoại"
      label={
        <span className="font-bold text-base text-foreground">
          Số điện thoại{" "}
          <span
            className={`text-base font-bold text-red-500 ${isRequired ? "" : "hidden"}`}
          >
            *
          </span>
        </span>
      }
      labelPlacement="outside-top"
      type="tel"
      variant="bordered"
      radius="lg"
      placeholder="098 765 4321"
      value={localValue}
      onValueChange={(val) => {
        const formatted = formatPhone(val);
        setLocalValue(formatted);
        if (!formatted) {
          onPhoneChange?.("");
        } else {
          onPhoneChange?.(formatted.replace(/[^\d+]/g, ""));
        }
      }}
      classNames={{
        base: "w-full",
        label: "!font-bold !text-base",
        inputWrapper:
          "h-12 rounded-2xl border-default-400 data-[hover=true]:border-default-500 data-[invalid=true]:!border-danger",
        input: "text-base font-medium ml-1",
      }}
      // startContent={
      //   <div className="h-full flex items-center">
      //     <Popover
      //       isOpen={isOpen}
      //       onOpenChange={setIsOpen}
      //       portalContainer={portalNode}
      //       placement="bottom"
      //       classNames={{ base: "h-full m-0 p-0", trigger: "h-full m-0 p-0" }}
      //     >
      //       <PopoverTrigger>
      //         <div className="w-full flex items-center justify-end gap-1 m-0 pl-3 pr-2 py-2 min-w-14 text-right rounded-l-2xl cursor-pointer hover:bg-default-200 border-r-[0.5px] border-divider">
      //           <p className="text-right font-medium text-base">
      //             {valueRegion}
      //           </p>
      //           <IconChevronDown className="w-4 h-4 text-default-700 shrink-0" />
      //         </div>
      //       </PopoverTrigger>
      //       <PopoverContent>
      //         <div>
      //           {countryCodes.map((item) => (
      //             <div
      //               key={item.value}
      //               className="text-right px-2 py-2 hover:bg-default-200 rounded-2xl cursor-pointer"
      //               onClick={() => {
      //                 setValueRegion(item.value);
      //                 setIsOpen(false);
      //               }}
      //             >
      //               <div className="flex items-center gap-2 px-2">
      //                 <p>{item.flag}</p>
      //                 <p>{item.label}</p>
      //               </div>
      //             </div>
      //           ))}
      //         </div>
      //       </PopoverContent>
      //     </Popover>
      //   </div>
      // }
      {...props}
    />
  );
};
