import dayjs from "@/lib/dayjs";
dayjs.locale("vi");
import { IconClock, IconMap } from "@tabler/icons-react";
import ApActions from "./ApActions";
import { Appointment } from "@/types/define.d";
import { useEffect, useState } from "react";
import ApStatusSelect from "./ApStatusSelect";
import rest from "../../lib/rest";
import { addToast } from "@heroui/react";
import { getErrorMessage } from "../../lib/utils";
import { useConfirm } from "../ConfirmProvider";
import clsx from "clsx";

const getAppointmentTypeStyle = (type: number) => {
  switch (type) {
    case 9:
      return "bg-[#479BD5] text-white";
    case 6:
      return "bg-[#26BD6C] text-white";
    case 3:
      return "bg-[#6465E8] text-white";
    default:
      return "bg-background text-foreground";
  }
};

const AppointmentItem = ({
  data,
  onRefresh,
  isInsideHistoyModal = false,
  onClick: onCardClick,
}: {
  data: Appointment;
  onRefresh?: () => void;
  isInsideHistoyModal?: boolean;
  onClick?: () => void;
}) => {
  const { confirm } = useConfirm();
  const [apStatus, setApStatus] = useState<number>(
    Number(data.AppointmentStatusId),
  );

  const handleApStatusChange = async (value: number) => {
    if (
      !(await confirm({
        message: "Bạn muốn đổi trạng thái lịch hẹn này?",
        type: "info",
        hideCancel: true,
      }))
    ) {
      return;
    }

    if (value < 0) return;

    try {
      const res = await rest.patch(
        `/appointment/${data.AppointmentId}/status`,
        { currentId: data.AppointmentStatusId, targetId: value.toString() },
      );
      if (res.status !== 200)
        throw new Error("Lỗi khi đổi trạng thái lịch hẹn");

      addToast({
        title: "Thành công",
        description: "Đổi trạng thái lịch hẹn thành công",
        color: "success",
      });
      setApStatus(value);
      onRefresh?.();
    } catch (error) {
      addToast({
        title: "Thất bại",
        description: getErrorMessage(error, "Lỗi khi đổi trạng thái lịch hẹn"),
        color: "danger",
      });
    }
  };

  // Update app status when data outside changes
  useEffect(() => {
    setApStatus(Number(data.AppointmentStatusId));
  }, [data.AppointmentStatusId]);

  return (
    <div
      className={clsx(
        "bg-default-50 border border-default-200 w-full rounded-2xl p-4 pt-3 flex items-center justify-start gap-5",
        onCardClick &&
          "cursor-pointer hover:bg-default-100 transition-background",
      )}
      onClick={onCardClick}
    >
      {data.StartAt && (
        <div className=" min-w-19 h-26 rounded-xl bg-white shadow-[0_1px_2px_#14151A0F,0_1px_3px_#14151A1A]">
          <div className="relative w-full h-7.5 py-1.25 gap-2 flex items-center justify-center">
            <p className="text-[13px] uppercase font-semibold leading-[1.5]">
              {dayjs(data.StartAt).format("MMMM")}
            </p>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[repeating-linear-gradient(to_right,transparent_0px,transparent_4px,#D2D6DF_4px,#D2D6DF_8px)]" />
          </div>
          <div className="w-full h-18 flex items-center justify-center">
            <h3 className=" text-[44px] font-bold tracking-[-0.02em]">
              {dayjs(data.StartAt).format("DD")}
            </h3>
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex w-full items-start justify-between gap-4">
          {data.StartAt && data.EndAt && (
            <div>
              <p className="font-bold text-base capitalize">
                {dayjs(data.StartAt).format("dddd, DD/MM/YYYY")}
              </p>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <IconClock size={20} />
                <span className="font-medium">
                  {dayjs(data.StartAt).format("HH:mm")} -{" "}
                  {dayjs(data.EndAt).format("HH:mm")}
                </span>
              </div>
            </div>
          )}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <ApStatusSelect value={apStatus} onChange={handleApStatusChange} />
            <ApActions data={data} disableHistoryModal={isInsideHistoyModal} />
          </div>
        </div>

        <ul className="flex items-center font-medium gap-2 text-sm">
          {data.AppointmentType[0].Name && (
            <li
              className={`rounded-full truncate line-clamp-1 px-3 py-1 text-black ${data.AppointmentId ? `${getAppointmentTypeStyle(Number(data.AppointmentType[0].AppointmentLabelId ?? 0))}` : "bg-white text-foreground "}`}
            >
              {data.AppointmentType[0].Name}
            </li>
          )}

          {data?.doctor?.name && (
            <li className="max-w-56 bg-white border border-stone-200 rounded-full px-3 py-1 flex gap-2 items-center truncate line-clamp-1">
              {data.doctor.name}
            </li>
          )}

          {data.Branch.Name && (
            <li className="max-w-56 bg-white border border-stone-200 rounded-full px-3 py-1 flex gap-2 items-center">
              <IconMap size={18} className="text-blue-400" />
              <p className="truncate line-clamp-1">{data.Branch.Name}</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AppointmentItem;
