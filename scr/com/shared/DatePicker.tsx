import {
  addToast,
  DatePicker,
  DatePickerProps,
  DateValue,
} from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { useEffect, useState } from "react";

const todayValue = today(getLocalTimeZone()) as DateValue;

interface DatePickerCustomProps extends DatePickerProps {
  label: string;
  onDateChanged: (date: string) => void;
  canPickPastDate?: boolean;
  className?: string;
}
export const DatePickerCustom = ({
  label,
  onDateChanged,
  canPickPastDate = false,
  className,
  ...props
}: DatePickerCustomProps) => {
  const [dateValue, setDateValue] = useState<DateValue | null | undefined>(
    todayValue,
  );
  useEffect(() => {
    if (dateValue) {
      onDateChanged(dateValue.toString());
    }
  }, [dateValue]);
  return (
    <div className={`w-full flex flex-col gap-2 ${className || ""}`}>
      <span className="text-base font-bold min-h-6">{label ? label : ""}</span>
      <DatePicker
        aria-label="date-picker"
        showMonthAndYearPickers
        calendarWidth={280}
        value={dateValue}
        variant="bordered"
        radius="lg"
        onChange={(value) => {
          if (!value) return;
          if (canPickPastDate) {
            setDateValue(value);
            return;
          }
          if (value >= todayValue) setDateValue(value);
          else {
            setDateValue(todayValue);
            addToast({
              title: "Ngày không hợp lệ",
              description: "Vui lòng chọn ngày từ hôm nay trở đi.",
              color: "warning",
            });
          }
        }}
        classNames={{
          base: "",
          inputWrapper: "h-12 hover:border-default-500 ",
          input: " text-base font-medium ml-1",
        }}
        {...props}
      />
    </div>
  );
};
