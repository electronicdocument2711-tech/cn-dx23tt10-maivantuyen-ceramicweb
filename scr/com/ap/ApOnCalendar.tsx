import { CustomEvent } from "@/types/react-big-calendar";
import { useMemo, useState } from "react";
import { StatusPoppointment } from "../calendar/type";
import ApDetailModal from "./ApDetailModal";
import AddApModal from "./AddApModal";
import dayjs from "@/lib/dayjs";

const greenStatuses = ["71", "61", "51", "46", "45", "44", "41", "31", "21"];

const STATUS_BORDER: Record<string, string> = greenStatuses.reduce(
  (acc, key) => ({ ...acc, [key]: "border-l-green-500" }),
  {
    "11": "border-l-orange-500",
    "1": "border-l-red-500",
  },
);

// Logic lấy tên bác sĩ dùng formatDoctorShort từ ResourceHeader

const ApOnCalendar = ({
  event,
  onRefreshAppointments,
  view,
  showSchedule = false,
}: {
  event: CustomEvent;
  onRefreshAppointments: () => void;
  view?: string;
  showSchedule?: boolean;
}) => {
  const { title, raw }: any = event;
  const appointmentId = String(raw?.AppointmentId || event?.id || "");

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const status = (raw?.AppointmentStatusId ?? "") as StatusPoppointment;
  const doctorName = title || "";
  const customerName = raw?.CustomerName || "";

  const length = useMemo(() => {
    if (!raw?.EndTime || !raw?.StartTime) return "";
    const mins = dayjs(raw.EndTime, "HH:mm").diff(
      dayjs(raw.StartTime, "HH:mm"),
      "minute",
    );

    // convert minutes to hours and minutes
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;

    return hours > 0 ? `${hours} giờ ${minutes}` : `${minutes} phút`;
  }, [raw?.AppointmentId]);

  return (
    <>
      <div
        className={`block w-full relative max-w-full rounded-md px-2 py-1 text-sm bg-gray-100 border border-default-300 hover:border-blue-200 shadow-xs transition-all my-1 border-l-4 cursor-pointer ${STATUS_BORDER[status]}`}
        onClick={() => setIsDetailOpen(true)}
      >
        <h4 className="font-semibold text-base leading-5 line-clamp-2 mb-1">
          {customerName}
        </h4>
        {title && raw && <p>{doctorName}</p>}
        {view === "day" && length && (
          <div className="bg-white w-fit py-0.5 px-1 text-xs rounded-tl-md rounded-br-md absolute bottom-0 right-0 font-medium text-gray-700">
            {length}
          </div>
        )}
        {showSchedule && (
          <div className="bg-white w-fit py-0.5 px-1 text-xs rounded-tl-md rounded-br-md absolute bottom-0 right-0 font-medium text-gray-700">
            {raw.StartTime + " - " + raw.EndTime}
          </div>
        )}
      </div>

      <ApDetailModal
        appointmentId={appointmentId}
        isOpen={isDetailOpen}
        onOpenChange={() => {
          setIsDetailOpen(false);
          setTimeout(() => onRefreshAppointments(), 300);
        }}
        onEditAppointment={() => {
          setIsDetailOpen(false);
          setIsEditOpen(true);
        }}
      />

      <AddApModal
        isOpen={isEditOpen}
        onOpenChange={() => setIsEditOpen(false)}
        appointmentId={appointmentId}
        onSuccess={() => {
          setIsEditOpen(false);
          setTimeout(() => onRefreshAppointments(), 300);
        }}
      />
    </>
  );
};

export default ApOnCalendar;
