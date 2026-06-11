import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { useState } from "react";

const timeOptions = [
  {
    label: "15 phút",
    value: 15,
  },
  {
    label: "30 phút",
    value: 30,
  },
  {
    label: "45 phút",
    value: 45,
  },
  {
    label: "1 giờ",
    value: 60,
  },
  {
    label: "1 giờ 15",
    value: 75,
  },
  {
    label: "1 giờ 30",
    value: 90,
  },
  {
    label: "1 giờ 45",
    value: 105,
  },
  {
    label: "2 giờ",
    value: 120,
  },
];
interface TimeLenghtPickerProps {
  portalContainer?: HTMLElement;
  readonly?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  isInvalid?: boolean;
  errorMessage?: string;
}
export const TimeLenghtPicker = ({
  portalContainer,
  readonly,
  value,
  onChange,
  isInvalid,
  errorMessage,
}: TimeLenghtPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom"
      portalContainer={portalContainer || undefined}
    >
      <PopoverTrigger>
        <div>
          <Input
            aria-label="time piker"
            placeholder="Thời lượng (phút)"
            onClick={() => setIsOpen(true)}
            variant="bordered"
            radius="lg"
            value={timeOptions?.find((item) => item?.value === value)?.label}
            readOnly={readonly}
            classNames={{
              inputWrapper: "h-12 w-full",
              input: "text-base text-center",
              label: "text-large font-bold",
            }}
            isInvalid={isInvalid}
            errorMessage={errorMessage}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="grid grid-cols-2 gap-2 py-3">
        {timeOptions.map((time) => (
          <Button
            fullWidth
            key={time?.value}
            variant={value === time?.value ? "solid" : "bordered"}
            onPress={() => {
              if (onChange) onChange(time?.value);
            }}
          >
            {time?.label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
