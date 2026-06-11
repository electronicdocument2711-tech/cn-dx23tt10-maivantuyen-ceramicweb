import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

const timeList = [
  {
    label: "Sớm",
    values: [
      { label: "3:00", min: "3:00", max: "3:29" },
      { label: "3:30", min: "3:30", max: "3:59" },
      { label: "4:00", min: "4:00", max: "4:29" },
      { label: "4:30", min: "4:30", max: "4:59" },
      { label: "5:00", min: "5:00", max: "5:29" },
      { label: "5:30", min: "5:30", max: "5:59" },
      { label: "6:00", min: "6:00", max: "6:29" },
      { label: "6:30", min: "6:30", max: "6:59" },
    ],
  },
  {
    label: "Sáng",
    values: [
      { label: "7:00", min: "7:00", max: "7:29" },
      { label: "7:30", min: "7:30", max: "7:59" },
      { label: "8:00", min: "8:00", max: "8:29" },
      { label: "8:30", min: "8:30", max: "8:59" },
      { label: "9:00", min: "9:00", max: "9:29" },
      { label: "9:30", min: "9:30", max: "9:59" },
      { label: "10:00", min: "10:00", max: "10:29" },
      { label: "10:30", min: "10:30", max: "10:59" },
      { label: "11:00", min: "11:00", max: "11:29" },
      { label: "11:30", min: "11:30", max: "11:59" },
      { label: "12:00", min: "12:00", max: "12:29" },
      { label: "12:30", min: "12:30", max: "12:59" },
    ],
  },
  {
    label: "Chiều",
    values: [
      { label: "13:00", min: "13:00", max: "13:29" },
      { label: "13:30", min: "13:30", max: "13:59" },
      { label: "14:00", min: "14:00", max: "14:29" },
      { label: "14:30", min: "14:30", max: "14:59" },
      { label: "15:00", min: "15:00", max: "15:29" },
      { label: "15:30", min: "15:30", max: "15:59" },
      { label: "16:00", min: "16:00", max: "16:29" },
      { label: "16:30", min: "16:30", max: "16:59" },
      { label: "17:00", min: "17:00", max: "17:29" },
      { label: "17:30", min: "17:30", max: "17:59" },
      { label: "18:00", min: "18:00", max: "18:29" },
      { label: "18:30", min: "18:30", max: "18:59" },
      { label: "19:00", min: "19:00", max: "19:29" },
      { label: "19:30", min: "19:30", max: "19:59" },
      { label: "20:00", min: "20:00", max: "20:29" },
      { label: "20:30", min: "20:30", max: "20:59" },
      { label: "21:00", min: "21:00", max: "21:29" },
    ],
  },
];

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  selectedDate: Date;
}
export const TimePicker = ({
  value,
  onChange,
  isInvalid,
  errorMessage,
  selectedDate,
}: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const disabledItems = useMemo(() => {
    const targetDate = dayjs(selectedDate);
    const currentDate = dayjs();

    if (!targetDate?.isSame(currentDate, "day")) {
      return [];
    }

    const currentTime = currentDate.format("H:mm");

    const disabledTimes = timeList
      .flatMap((group) => group.values)
      .filter((time) =>
        dayjs(time.max, "H:mm").isBefore(dayjs(currentTime, "H:mm")),
      )
      .map((time) => time.label);

    return disabledTimes;
  }, [selectedDate]);

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
      <PopoverTrigger>
        <Input
          aria-label="time piker"
          onClick={() => setIsOpen(true)}
          variant="bordered"
          radius="lg"
          value={value}
          isInvalid={isInvalid}
          errorMessage={errorMessage}
          onValueChange={(i) => {
            onChange?.(i);
          }}
          classNames={{
            inputWrapper: "h-12 w-full ",
            input: "text-base text-center",
            label: "text-large font-bold",
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="px-4">
        <Accordion
          className="w-md p-0 m-0"
          itemClasses={{
            trigger: "py-2",
            content: "flex flex-wrap items-center",
            indicator: "w-5 h-5 text-foreground font-bold",
          }}
          selectionMode="multiple"
          defaultSelectedKeys={["1", "2"]}
        >
          {timeList.map((timeStep, idx) => (
            <AccordionItem key={idx} title={timeStep.label}>
              <div className="grid grid-cols-6 gap-1.5 w-full">
                {timeStep.values.map((time) => {
                  const isDisabled = disabledItems.includes(time.label);
                  return (
                    <Button
                      isDisabled={isDisabled}
                      key={time?.label}
                      variant={value === time?.label ? "solid" : "bordered"}
                      className={`!px-1 w-full !min-w-0 ${isDisabled ? "text-gray-600 bg-gray-50" : "font-medium"}`}
                      onPress={() => {
                        onChange?.(time?.label);
                      }}
                    >
                      {time?.label}
                    </Button>
                  );
                })}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </PopoverContent>
    </Popover>
  );
};
