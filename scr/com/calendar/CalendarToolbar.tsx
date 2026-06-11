"use client";

import { CalendarStatusKey, CalendarStatusSummary } from "@/data/appointmentType";
import { CustomEvent } from "@/types/react-big-calendar";
import { ToolbarProps, Views } from "react-big-calendar";

const views = [Views.DAY, Views.WEEK, Views.MONTH];
const viewTrans = { day: "Ngày", week: "Tuần", month: "Tháng" };

// UI classes
const viewBtnBase =
  "flex-1 min-w-20 rounded-3xl px-4 py-2 text-sm transition-all duration-200";
const viewBtnActive = "bg-white text-blue-900 shadow-sm font-bold";
const viewBtnInactive = "text-gray-700 hover:text-gray-800 font-medium";

interface CustomToolbarProps extends Pick<
  ToolbarProps<CustomEvent, object>,
  "onNavigate" | "onView" | "view"
> {
  loading: boolean;
  label: string | React.JSX.Element;
  selectedStatus: CalendarStatusKey;
  onSelectStatus: (statusKey: CalendarStatusKey) => void;
  summaryCounts: Record<CalendarStatusKey, number>;
}

const CalendarToolbar = (props: CustomToolbarProps) => {
  const { onView, view, selectedStatus, onSelectStatus, summaryCounts } = props;

  return (
    <div className="flex gap-6 items-end">
      <div className="rounded-3xl bg-slate-200 p-0.5">
        {views.map((el) => (
          <button
            key={`calendar-view-${el}`}
            className={`${viewBtnBase} ${
              el === view ? viewBtnActive : viewBtnInactive
            }`}
            onClick={() => onView(el)}
          >
            <span className="capitalize">{viewTrans[el]}</span>
          </button>
        ))}
      </div>

      <div className="flex rounded-xl bg-white border-b-2 border-b-gray-500 overflow-hidden">
        {CalendarStatusSummary.map((status, idx) => (
          <div key={`status-${idx}`} className="flex items-center">
            <button
              type="button"
              onClick={() => onSelectStatus(status.key)}
              className={`flex items-end gap-2 p-1 m-0.5 rounded-lg transition-colors ${
                selectedStatus === status.key
                  ? "bg-gray-500"
                  : "hover:bg-gray-100"
              }`}
            >
              <div
                className={`w-8 h-8 ${
                  status.bgColor
                } rounded-lg flex items-center justify-center`}
              >
                <span className="text-white text-xl font-bold">
                  {summaryCounts[status.key] ?? 0}
                </span>
              </div>
              <span
                className={`text-sm font-normal ${ "text-gray-600"
                }`}
              >
                {status.label}
              </span>
            </button>
            {idx < CalendarStatusSummary.length - 1 && (
              <div className="h-6 mx-2 w-px bg-gray-500"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarToolbar;
