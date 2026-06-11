import React from "react";
import { TimeButtonsProps } from "./type";
import {
  addMinutes,
  buildQuarterHourOptions,
  pad2,
  parseDigitsToHM,
  parseHHmmToMinutes,
  to24,
  to24WithSuffix,
} from "./func";

type TimeOption = { h: number; m: number; label: string };

const inputClass =
  "w-[84px] h-8 text-base text-center text-blue-900 font-normal border border-white focus:outline-none focus:ring-2 focus:ring-white";
const dropdownWrapperLeft =
  "absolute left-0 top-full my-1 w-40 max-h-64 overflow-auto no-scrollbar bg-white border border-gray-300 rounded-md shadow-lg z-50";
const dropdownWrapperRight =
  "absolute right-0 top-full my-1 w-40 max-h-64 bg-white border border-gray-300 rounded-md z-50";

const Dropdown: React.FC<{
  open: boolean;
  align: "left" | "right";
  items: TimeOption[];
  onMouseDown: () => void;
  onSelect: (opt: TimeOption) => void;
  renderSecondary?: (opt: TimeOption) => React.ReactNode;
}> = ({ open, align, items, onMouseDown, onSelect, renderSecondary }) => {
  if (!open) return null;
  const wrapper = align === "left" ? dropdownWrapperLeft : dropdownWrapperRight;
  return (
    <div className={wrapper}>
      <div className="grid grid-cols-1">
        {items.map((t) => (
          <button
            key={`${t.h}-${t.m}`}
            type="button"
            className="w-full px-2 py-1 text-left hover:bg-gray-100 rounded"
            onMouseDown={onMouseDown}
            onClick={() => onSelect(t)}
          >
            <div className="flex items-center justify-start w-full">
              <span className="text-sm text-blue-900">{`${pad2(t.h)}:${pad2(
                t.m
              )}`}</span>
              {renderSecondary ? (
                <span className="text-xs text-gray-500 ml-2">
                  {renderSecondary(t)}
                </span>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const TimeButtons: React.FC<TimeButtonsProps> = ({
  startTime,
  endTime,
  onChangeStartTime,
  onChangeEndTime,
}) => {
  // Helpers moved to func.tsx

  // Local display states (digits while typing, AM/PM after blur)
  const [startText, setStartText] = React.useState<string>(
    startTime
      ? to24WithSuffix(
          parseInt(startTime.split(":")[0], 10),
          parseInt(startTime.split(":")[1], 10)
        )
      : ""
  );
  const [endText, setEndText] = React.useState<string>(
    endTime
      ? to24WithSuffix(
          parseInt(endTime.split(":")[0], 10),
          parseInt(endTime.split(":")[1], 10)
        )
      : ""
  );
  const [endEdited, setEndEdited] = React.useState<boolean>(false);

  // Start input suggestion popover
  const [isStartSuggestOpen, setStartSuggestOpen] =
    React.useState<boolean>(false);
  const selectingStartRef = React.useRef<boolean>(false);
  // End input suggestion dropdown
  const [isEndSuggestOpen, setEndSuggestOpen] = React.useState<boolean>(false);
  const selectingEndRef = React.useRef<boolean>(false);
  const timeOptions = React.useMemo(buildQuarterHourOptions, []);

  const startDigits = React.useMemo(
    () => startText.replace(/\D/g, "").slice(0, 4),
    [startText]
  );
  const timeOptionsFiltered = React.useMemo(() => {
    if (!isStartSuggestOpen) return timeOptions;
    const d = startDigits;
    if (!d) return timeOptions;
    // 1 digit: treat as hour with leading zero (e.g., '1' -> 01:xx)
    if (d.length === 1) {
      const hour = parseInt(`0${d}`, 10);
      if (isNaN(hour) || hour > 23) return timeOptions;
      return timeOptions.filter((t) => t.h === hour);
    }
    // 2 digits: exact hour
    if (d.length === 2) {
      const hour = parseInt(d, 10);
      if (isNaN(hour) || hour > 23) return timeOptions;
      return timeOptions.filter((t) => t.h === hour);
    }
    // 3 digits: hour + minute tens
    if (d.length === 3) {
      const hour = parseInt(d.slice(0, 1), 10);
      if (isNaN(hour) || hour > 23) return timeOptions;
      const mTens = d[2];
      return timeOptions.filter(
        (t) => t.h === hour && pad2(t.m).startsWith(mTens)
      );
    }
    // 4 digits: exact HHMM
    const hour = parseInt(d.slice(0, 2), 10);
    const minute = parseInt(d.slice(2, 4), 10);
    if (isNaN(hour) || hour > 23) return timeOptions;
    if (isNaN(minute) || minute > 59)
      return timeOptions.filter((t) => t.h === hour);
    return timeOptions.filter((t) => t.h === hour && t.m === minute);
  }, [isStartSuggestOpen, startDigits, timeOptions]);

  const endDigits = React.useMemo(
    () => endText.replace(/\D/g, "").slice(0, 4),
    [endText]
  );
  const timeOptionsEndFiltered = React.useMemo(() => {
    // Determine current start minutes from typed start digits or committed startTime
    const typedStartDigits = startText.replace(/\D/g, "").slice(0, 4);
    const startMins = (() => {
      const hm = parseDigitsToHM(typedStartDigits);
      if (hm) return hm.h * 60 + hm.m;
      return parseHHmmToMinutes(startTime) ?? 0;
    })();
    const minEnd = addMinutes(startMins, 15);

    // If dropdown not open, still enforce future-only list when it opens next
    let base: typeof timeOptions = timeOptions;
    if (isEndSuggestOpen) {
      const d = endDigits;
      if (d) {
        if (d.length === 1) {
          const hour = parseInt(`0${d}`, 10);
          if (!isNaN(hour) && hour <= 23)
            base = timeOptions.filter((t) => t.h === hour);
        } else if (d.length === 2) {
          const hour = parseInt(d, 10);
          if (!isNaN(hour) && hour <= 23)
            base = timeOptions.filter((t) => t.h === hour);
        } else if (d.length === 3) {
          const hour = parseInt(d.slice(0, 1), 10);
          const mTens = d[2];
          if (!isNaN(hour) && hour <= 23)
            base = timeOptions.filter(
              (t) => t.h === hour && pad2(t.m).startsWith(mTens)
            );
        } else {
          const hour = parseInt(d.slice(0, 2), 10);
          const minute = parseInt(d.slice(2, 4), 10);
          if (!isNaN(hour) && hour <= 23) {
            if (!isNaN(minute) && minute <= 59)
              base = timeOptions.filter((t) => t.h === hour && t.m === minute);
            else base = timeOptions.filter((t) => t.h === hour);
          }
        }
      }
    }
    // Enforce only times at or after minEnd
    return base.filter((t) => t.h * 60 + t.m >= minEnd);
  }, [isEndSuggestOpen, endDigits, timeOptions, startText, startTime]);

  // Base start minutes used for displaying the offset text in end suggestions
  const startMinsForEndLabel = React.useMemo(() => {
    const typedStartDigits = startText.replace(/\D/g, "").slice(0, 4);
    const hm = parseDigitsToHM(typedStartDigits);
    if (hm) return hm.h * 60 + hm.m;
    return parseHHmmToMinutes(startTime) ?? 0;
  }, [startText, startTime]);

  const formatEndOffset = React.useCallback(
    (targetMins: number) => {
      const delta = Math.max(0, targetMins - startMinsForEndLabel);
      if (delta < 60) return `(${delta} phút)`;
      const h = Math.floor(delta / 60);
      const m = delta % 60;
      return m ? `(${h} giờ ${m} phút)` : `(${h} giờ)`;
    },
    [startMinsForEndLabel]
  );

  const onDigitsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setter(digits);
  };

  // When start time is committed, auto-adjust end to start+15 if not edited or below min
  const handleStartBlur = () => {
    const hm = parseDigitsToHM(startText);
    let h = 0,
      m = 0;
    if (hm) {
      h = hm.h;
      m = hm.m;
    } else {
      const mins = parseHHmmToMinutes(startTime) ?? 0;
      h = Math.floor(mins / 60);
      m = mins % 60;
    }
    const startMins = h * 60 + m;
    setStartText(to24WithSuffix(h, m));
    onChangeStartTime?.(to24(h, m));

    const minEnd = addMinutes(startMins, 15);
    // compute current end minutes from display
    let currentEndMins: number | null = null;
    const digits = endText.replace(/\D/g, "");
    if (digits) {
      const parsed = parseDigitsToHM(digits);
      currentEndMins = parsed ? parsed.h * 60 + parsed.m : null;
    } else {
      const m2 = endText.match(/^(\d{2}):(\d{2})(AM|PM)$/);
      if (m2) {
        const hh = parseInt(m2[1], 10);
        const mm = parseInt(m2[2], 10);
        currentEndMins = hh * 60 + mm; // 24h display, ignore suffix
      }
    }
    if (!endEdited || (currentEndMins ?? 0) < minEnd) {
      const newEnd = minEnd;
      setEndText(to24WithSuffix(Math.floor(newEnd / 60), newEnd % 60));
      onChangeEndTime?.(to24(Math.floor(newEnd / 60), newEnd % 60));
    }
  };

  return (
    <div
      className="h-10 rounded-xl border px-3 border-gray-400 bg-white 
      text-base grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 w-full items-center relative"
    >
      <div className="flex justify-center min-w-0 ">
        <input
          inputMode="numeric"
          pattern="\\d*"
          placeholder="HHmm"
          className={inputClass}
          value={startText}
          onChange={(e) => onDigitsChange(e, setStartText)}
          onFocus={() => {
            const digits = startText.replace(/\\D/g, "").slice(0, 4);
            if (digits) setStartText(digits);
            setStartSuggestOpen(true);
          }}
          onBlur={() => {
            if (selectingStartRef.current) return; // selection will handle commit
            setStartSuggestOpen(false);
            handleStartBlur();
          }}
        />
        <Dropdown
          open={isStartSuggestOpen}
          align="left"
          items={timeOptionsFiltered}
          onMouseDown={() => {
            selectingStartRef.current = true;
          }}
          onSelect={(t) => {
            const newStart = `${pad2(t.h)}:${pad2(t.m)}`;
            setStartText(to24WithSuffix(t.h, t.m));
            onChangeStartTime?.(newStart);
            const startMins = t.h * 60 + t.m;
            const minEnd = addMinutes(startMins, 15);
            let currentEndMins: number | null = null;
            const digits = endText.replace(/\\D/g, "");
            if (digits) {
              const parsed = parseDigitsToHM(digits);
              currentEndMins = parsed ? parsed.h * 60 + parsed.m : null;
            } else {
              const m2 = endText.match(/^(\\d{2}):(\\d{2})(AM|PM)$/);
              if (m2) {
                const hh = parseInt(m2[1], 10);
                const mm = parseInt(m2[2], 10);
                currentEndMins = hh * 60 + mm;
              }
            }
            if (!endEdited || (currentEndMins ?? 0) < minEnd) {
              const newEndH = Math.floor(minEnd / 60);
              const newEndM = minEnd % 60;
              setEndText(to24WithSuffix(newEndH, newEndM));
              onChangeEndTime?.(`${pad2(newEndH)}:${pad2(newEndM)}`);
            }
            setStartSuggestOpen(false);
            setTimeout(() => (selectingStartRef.current = false), 0);
          }}
        />
      </div>
      <span className="text-blue-900 px-1 text-sm sm:text-base text-center">
        to
      </span>
      <div className="flex justify-center min-w-0">
        <input
          inputMode="numeric"
          pattern="\\d*"
          placeholder="HHmm"
          className={inputClass}
          value={endText}
          onChange={(e) => {
            setEndEdited(true);
            onDigitsChange(e, setEndText);
          }}
          onFocus={() => {
            const digits = endText.replace(/\\D/g, "").slice(0, 4);
            if (digits) setEndText(digits);
            setEndSuggestOpen(true);
          }}
          onBlur={() => {
            if (selectingEndRef.current) return;
            setEndSuggestOpen(false);
            const hm = parseDigitsToHM(endText);
            if (!hm) {
              setEndText(endText);
              return;
            }
            const startMins = parseHHmmToMinutes(startTime) ?? 0;
            const minEnd = addMinutes(startMins, 15);
            let endMins = hm.h * 60 + hm.m;
            if (endMins < minEnd) endMins = minEnd;
            setEndText(to24WithSuffix(Math.floor(endMins / 60), endMins % 60));
            onChangeEndTime?.(to24(Math.floor(endMins / 60), endMins % 60));
          }}
        />
      </div>
      <Dropdown
        open={isEndSuggestOpen}
        align="right"
        items={timeOptionsEndFiltered}
        onMouseDown={() => {
          selectingEndRef.current = true;
        }}
        onSelect={(t) => {
          let endMins = t.h * 60 + t.m;
          const startMins = parseHHmmToMinutes(startTime) ?? 0;
          const minEnd = addMinutes(startMins, 15);
          if (endMins < minEnd) endMins = minEnd;
          const eh = Math.floor(endMins / 60);
          const em = endMins % 60;
          setEndText(to24WithSuffix(eh, em));
          onChangeEndTime?.(to24(eh, em));
          setEndSuggestOpen(false);
          setTimeout(() => (selectingEndRef.current = false), 0);
        }}
        renderSecondary={(t) => formatEndOffset(t.h * 60 + t.m)}
      />
    </div>
  );
};

export default TimeButtons;
