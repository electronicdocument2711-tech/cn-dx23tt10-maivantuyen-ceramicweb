import React from "react";
import {
  DateLocalizer,
  Event,
  Navigate,
  NavigateAction,
  TitleOptions,
} from "react-big-calendar";
import dayjs from "@/lib/dayjs";
import { CustomEvent } from "@/types/react-big-calendar";

const DEFAULT_LENGTH = 30;

const Agenda: React.ComponentType<any> = ({
  accessors,
  components,
  date,
  events,
  length = DEFAULT_LENGTH,
  localizer,
  onDoubleClickEvent,
  onSelectEvent,
  onNavigate,
  onView,
}) => {
  const end = localizer.add(date, length, "day");
  const range = localizer.range(date, end, "day");

  const goToDate = (d: dayjs.Dayjs) => {
    onNavigate(Navigate.DATE, d.toDate());
    onView("day");
  };

  const renderDay = (day: Date, eventList: CustomEvent[], dayKey: number) => {
    const { event: Event, date: AgendaDate } = components;

    // Lọc và sắp xếp Event theo giờ
    const eventListInRange = eventList
      .filter((e: CustomEvent) => {
        const start = accessors.start(e);
        const end = accessors.end(e);
        return (
          dayjs(start).isSame(dayjs(day), "day") ||
          dayjs(end).isSame(dayjs(day), "day")
        );
      })
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );

    return eventListInRange.map((event: CustomEvent, idx: number) => {
      const title = accessors.title(event);

      const dateLabel =
        idx === 0 ? localizer.format(day, "agendaDateFormat") : "";

      const first =
        idx === 0 ? (
          <td
            rowSpan={eventListInRange.length}
            className="rbc-agenda-date-cell !border-l-0"
          >
            <button
              onClick={() => goToDate(dayjs(day))}
              className="hover:text-blue-600 hover:underline"
            >
              {AgendaDate ? (
                <AgendaDate day={day} label={dateLabel} />
              ) : (
                dateLabel
              )}
            </button>
          </td>
        ) : null;

      return (
        <tr key={dayKey + "_" + idx}>
          {first}

          <td className="rbc-agenda-time-cell !w-18 !align-middle">
            {timeRangeLabel(day, event)}
          </td>

          <td
            className="rbc-agenda-event-cell"
            onClick={(e) => onSelectEvent && onSelectEvent(event, e)}
            onDoubleClick={(e) =>
              onDoubleClickEvent && onDoubleClickEvent(event, e)
            }
          >
            <div className="flex items-center gap-2">
              <div className="flex-1">
                {Event ? <Event event={event} title={title} /> : title}
              </div>
              {(event as any).doctorName && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    {(event as any).doctorName}
                  </span>
                </div>
              )}
            </div>
          </td>
        </tr>
      );
    });
  };

  const timeRangeLabel = (day: Date, event: Event) => {
    let label = localizer.messages.allDay;
    const end = accessors.end(event);
    const start = accessors.start(event);

    if (!accessors.allDay(event)) {
      if (localizer.eq(start, end)) {
        label = localizer.format(start, "agendaTimeFormat");
      } else if (localizer.isSameDate(start, end)) {
        label = localizer.format({ start, end }, "agendaTimeRangeFormat");
      } else if (localizer.isSameDate(day, start)) {
        label = localizer.format(start, "agendaTimeFormat");
      } else if (localizer.isSameDate(day, end)) {
        label = localizer.format(end, "agendaTimeFormat");
      }
    }

    return <span>{label}</span>;
  };

  return (
    <div className="overflow-y-auto">
      <div className="rbc-agenda-view">
        {events.length !== 0 ? (
          <div className="rbc-agenda-content border-b border-gray-500">
            <table className="rbc-agenda-table">
              <thead className="bg-white h-11">
                <tr className="border-b border-t text-gray-600 border border-gray-500 bg-slate-100 text-sm">
                  <th className="rbc-header !min-h-0 !w-30 !py-0.5 !leading-5">
                    {/* {messages.date} */}
                    Ngày
                  </th>
                  <th className="rbc-header !min-h-0 !w-1/8 !py-0.5 !leading-5 text-center">
                    {/* {messages.time} */}
                    Giờ
                  </th>

                  <th className="rbc-header !min-h-0 !py-0.5 !leading-5">
                    Thông tin
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {range.map((day: Date, idx: number) =>
                  renderDay(day, events, idx)
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rbc-agenda-empty !rounded-none !border-l-0 !border-r-0">
            <span className="text-gray-500">
              There are no posts in this range.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const navigate = (
  date: Date,
  action: NavigateAction,
  {
    length = DEFAULT_LENGTH,
    localizer,
  }: { length?: number; localizer: DateLocalizer }
) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return localizer.add(date, -length, "day");
    case Navigate.NEXT:
      return localizer.add(date, length, "day");
    default:
      return date;
  }
};

const title = (start: Date, { length, localizer }: TitleOptions) => {
  const end = localizer.add(start, length, "day");

  return localizer.format({ start, end }, "agendaHeaderFormat");
};

// Assign static methods
export default Object.assign(Agenda, { navigate, title });
