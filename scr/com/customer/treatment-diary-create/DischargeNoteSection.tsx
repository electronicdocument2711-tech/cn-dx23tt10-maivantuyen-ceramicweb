import dayjs from "@/lib/dayjs";
import { parseDate } from "@internationalized/date";
import { Checkbox, DatePicker } from "@heroui/react";
import { useMemo, useRef } from "react";

interface DischargeNoteSelectionProps {
  checkedMap: Record<number, boolean>;
  onToggleOption: (index: number, isSelected: boolean) => void;
}

interface DischargeNoteScheduleProps {
  periodicCheckupMonth: string;
  onPeriodicCheckupMonthChange: (value: string) => void;
  appointmentDay: string;
  appointmentMonth: string;
  appointmentYear: string;
  onAppointmentDayChange: (value: string) => void;
  onAppointmentMonthChange: (value: string) => void;
  onAppointmentYearChange: (value: string) => void;
}

interface DischargeNoteErrorProps {
  periodicCheckupMonth?: string;
  appointmentDay?: string;
  appointmentMonth?: string;
  appointmentYear?: string;
}

interface DischargeNoteSectionProps {
  options: string[];
  selection: DischargeNoteSelectionProps;
  schedule: DischargeNoteScheduleProps;
  errors?: DischargeNoteErrorProps;
}

const INLINE_INPUT_CLASS =
  "w-5 border-b border-default-300 bg-transparent pb-0.5 text-base font-semibold text-[#7A8593] focus:outline-none";

const DIGITS_ONLY = /\D/g;

const keepDigits = (value: string, maxLength: number) =>
  value.replace(DIGITS_ONLY, "").slice(0, maxLength);

const stopCheckboxToggle = (event: { stopPropagation: () => void }) => {
  event.stopPropagation();
};

const getAppointmentDateValue = (
  appointmentDay: string,
  appointmentMonth: string,
  appointmentYear: string,
) => {
  if (!appointmentDay || !appointmentMonth || !appointmentYear) {
    return null;
  }

  const formattedDate = `${appointmentYear.padStart(4, "0")}-${appointmentMonth.padStart(2, "0")}-${appointmentDay.padStart(2, "0")}`;
  const parsedDate = dayjs(formattedDate);

  if (
    !parsedDate.isValid() ||
    parsedDate.format("YYYY-MM-DD") !== formattedDate
  ) {
    return null;
  }

  return parseDate(formattedDate);
};

const DischargeNoteSection: React.FC<DischargeNoteSectionProps> = ({
  options,
  selection,
  schedule,
  errors,
}) => {
  const { checkedMap, onToggleOption } = selection;
  const {
    periodicCheckupMonth,
    onPeriodicCheckupMonthChange,
    appointmentDay,
    appointmentMonth,
    appointmentYear,
    onAppointmentDayChange,
    onAppointmentMonthChange,
    onAppointmentYearChange,
  } = schedule;
  const {
    periodicCheckupMonth: errorPeriodicCheckupMonth,
    appointmentDay: errorAppointmentDay,
    appointmentMonth: errorAppointmentMonth,
    appointmentYear: errorAppointmentYear,
  } = errors ?? {};

  const isPeriodicCheckupSelected = checkedMap[3] ?? false;
  const isAppointmentDateSelected = checkedMap[4] ?? false;
  const appointmentDateValue = useMemo(
    () =>
      getAppointmentDateValue(
        appointmentDay,
        appointmentMonth,
        appointmentYear,
      ),
    [appointmentDay, appointmentMonth, appointmentYear],
  );

  const periodicInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-default-300">
        {options.map((option, index) => (
          <div
            key={option}
            className={`px-4 py-3 ${
              index !== options.length - 1 ? "border-b border-default-200" : ""
            }`}
          >
            {index === 3 ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Checkbox
                    isSelected={checkedMap[index] ?? false}
                    onValueChange={(isSelected) => {
                      onToggleOption(index, isSelected);
                      if (isSelected) {
                        onPeriodicCheckupMonthChange("1");
                        setTimeout(() => periodicInputRef.current?.focus(), 0);
                      } else {
                        onPeriodicCheckupMonthChange("");
                      }
                    }}
                    aria-label={option}
                  />
                  <span className="text-foreground text-base font-medium">
                    Tái khám định kỳ mỗi
                  </span>
                  <input
                    ref={periodicInputRef}
                    value={periodicCheckupMonth}
                    onChange={(event) =>
                      onPeriodicCheckupMonthChange(
                        keepDigits(event.target.value, 2),
                      )
                    }
                    disabled={!isPeriodicCheckupSelected}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`${INLINE_INPUT_CLASS} ${
                      errorPeriodicCheckupMonth ? "border-danger!" : ""
                    } w-14 underline border border-slate-200 rounded-xl text-center`}
                    onClick={stopCheckboxToggle}
                    onMouseDown={stopCheckboxToggle}
                    onPointerDown={stopCheckboxToggle}
                  />
                  <span className="text-base font-semibold text-[#6D8197]">
                    tháng
                  </span>
                </div>
                {errorPeriodicCheckupMonth && (
                  <span className="pl-8 text-xs font-medium text-danger">
                    {errorPeriodicCheckupMonth}
                  </span>
                )}
              </div>
            ) : index === 4 ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Checkbox
                    isSelected={checkedMap[index] ?? false}
                    onValueChange={(isSelected) =>
                      onToggleOption(index, isSelected)
                    }
                    aria-label={option}
                  />
                  <span className="text-foreground text-base font-medium">
                    Hẹn ngày
                  </span>
                  <div className="ml-1 ">
                    <DatePicker
                      aria-label="appointment-date-picker"
                      showMonthAndYearPickers
                      calendarWidth={280}
                      value={appointmentDateValue}
                      onChange={(date) => {
                        const [year = "", month = "", day = ""] =
                          date?.toString().split("-") ?? [];

                        onAppointmentDayChange(day);
                        onAppointmentMonthChange(month);
                        onAppointmentYearChange(year);
                      }}
                      isReadOnly={false}
                      isDisabled={!isAppointmentDateSelected}
                      isInvalid={Boolean(
                        errorAppointmentDay ||
                        errorAppointmentMonth ||
                        errorAppointmentYear,
                      )}
                      variant="flat"
                      radius="sm"
                      classNames={{
                        // base: "w-full",
                        inputWrapper:
                          "h-9 min-h-9 border-none !bg-transparent px-0 pr-0 shadow-none hover:!bg-transparent data-[hover=true]:!bg-transparent group-data-[hover=true]:!bg-transparent group-data-[focus=true]:!bg-transparent group-data-[focus-visible=true]:!bg-transparent",
                        input: "ml-1 text-sm font-semibold text-[#475569]",
                        segment: "text-sm font-semibold text-[#475569]",
                        selectorButton:
                          "!bg-transparent px-0 text-[#64748B] shadow-none hover:!bg-transparent data-[hover=true]:!bg-transparent",
                      }}
                    />
                  </div>
                </div>
                {(errorAppointmentDay ||
                  errorAppointmentMonth ||
                  errorAppointmentYear) && (
                  <span className="pl-8 text-xs font-medium text-danger">
                    Trường bắt buộc nhập
                  </span>
                )}
              </div>
            ) : (
              <Checkbox
                isSelected={checkedMap[index] ?? false}
                onValueChange={(isSelected) =>
                  onToggleOption(index, isSelected)
                }
              >
                <span className="text-foreground text-base font-medium">
                  {option}
                </span>
              </Checkbox>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DischargeNoteSection;
