"use client";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  DropdownSection,
} from "@heroui/react";
import { IconDotsVertical } from "@tabler/icons-react";
import AppointmentItem from "./AppointmentItem";
import { IconBan, IconCirclePlus, IconPencil } from "../icons/outline";
import { UI_META } from "@/const/ui";
import { Appointment } from "@/types/define.d";
import { useEffect, useMemo, useState } from "react";
import rest from "@/lib/rest";
import dayjs from "dayjs";
import AddApModal from "./AddApModal";
import { usePathname, useRouter } from "next/navigation";

export function getDurationFromNow(start: string): string {
  const startTime = dayjs(start);
  const now = dayjs();
  const diffMinutes = now.diff(startTime, "minute");
  if (diffMinutes < 60 * 24) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours} giờ`;
  }
  const days = Math.floor(diffMinutes / (60 * 24));
  return `${days} ngày`;
}

const getHistoryUI = (value: string) => {
  switch (value) {
    case "CANCELLED":
      return {
        icon: <IconBan size={16} className="text-slate-400" />,
        label: "hủy",
      };
    case "UPDATED":
      return {
        icon: <IconPencil size={16} className="text-slate-400" />,
        label: "chỉnh sửa",
      };
    case "CREATED":
      return {
        icon: <IconCirclePlus size={16} className="text-slate-400" />,
        label: "tạo",
      };
    default:
      return {
        icon: null,
        label: "",
      };
  }
};

const ApActions = ({
  data,
  onCancelAppointment,
  onUpdated,
  onEditAppointment,
  disableHistoryModal: disableHistoryModal = false,
  disableKeys = [],
  hideKeys = [],
}: {
  data: Appointment;
  onCancelAppointment?: () => void;
  onUpdated?: () => void;
  /** When provided, called instead of opening AddApModal internally (avoids modal stacking) */
  onEditAppointment?: () => void;
  /**
   * @deprecated - Không dùng nữa
   */
  disableHistoryModal?: boolean;
  disableKeys?: string[];
  hideKeys?: string[];
}) => {
  const [isOpenHistory, setIsOpenHistory] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const route = useRouter();
  const pathname = usePathname();

  const insideDisableKeys = useMemo(() => {
    return disableKeys.concat(disableHistoryModal ? ["edit-history"] : []);
  }, [disableKeys, disableHistoryModal]);

  const [appointmentHistory, setAppointmentHistory] = useState<
    {
      Action: { Key: string; Name: string };
      ActionAt: string;
      EditedBy: { documentId: string; id: string; name: string };
    }[]
  >([]);

  useEffect(() => {
    if (!isOpenHistory) return;
    const fetchHistory = async () => {
      const res = await rest.get(
        `/appointment/${data.AppointmentId}/histories`,
      );
      setAppointmentHistory(res.data.data);
    };
    fetchHistory();
  }, [isOpenHistory, data.AppointmentId]);

  const handleAction = (key: string) => {
    switch (key) {
      case "edit-history":
        if (!disableHistoryModal) setIsOpenHistory(true);
        break;
      case "edit-appointment":
        if (onEditAppointment) {
          onEditAppointment();
        } else {
          setIsOpenEdit(true);
        }
        break;

      case "diagnose":
        if (pathname?.startsWith("/customer/")) {
          route.push(`/customer/${data?.Customer?.Id}/diagnose`);
          return;
        }
        window.open(`/customer/${data?.Customer?.Id}/diagnose`, "_blank");
        break;
      case "treatment":
        if (pathname?.startsWith("/customer/")) {
          route.push(`/customer/${data?.Customer?.Id}/diary`);
          return;
        }
        window.open(`/customer/${data?.Customer?.Id}/diary`, "_blank");
        break;

      case "cancel-appointment":
        onCancelAppointment?.();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button
            variant="solid"
            className="bg-white border shadow-xs !p-2 border-default-400 data-[hover=true]:border-default-500 min-w-10"
          >
            <IconDotsVertical size={20} />
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          closeOnSelect
          onAction={(key) => handleAction(key.toString())}
          disabledKeys={insideDisableKeys}
        >
          <DropdownSection title="Bác sĩ">
            <DropdownItem
              hidden={hideKeys.includes("diagnose")}
              key="diagnose"
              classNames={{
                title: "text-base font-semibold",
              }}
            >
              Chỉ định (tư vấn)
            </DropdownItem>
            <DropdownItem
              hidden={hideKeys.includes("treatment")}
              key="treatment"
              classNames={{
                title: "text-base font-semibold",
              }}
            >
              Điều trị
            </DropdownItem>
          </DropdownSection>
          <DropdownSection title="Khác">
            <DropdownItem
              hidden={hideKeys.includes("edit-appointment")}
              key="edit-appointment"
              classNames={{
                title: "text-base font-semibold",
              }}
            >
              Chỉnh sửa lịch hẹn
            </DropdownItem>
            <DropdownItem
              key="edit-history"
              hidden={hideKeys.includes("edit-history")}
              classNames={{
                title: "text-base font-semibold",
              }}
            >
              Lịch sử chỉnh sửa
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      {/* Edit History Modal, if appointment-item inside edit-history willbe disable show modal(duplicate)*/}
      {!disableHistoryModal && (
        <Modal
          isOpen={isOpenHistory}
          onOpenChange={setIsOpenHistory}
          size="3xl"
          isDismissable={UI_META.Modal.isDismissable}
          classNames={UI_META.Modal.classnames}
          className="max-w-[736px]"
          scrollBehavior="outside"
        >
          <ModalContent>
            <ModalHeader>Lịch sử chỉnh sửa lịch hẹn</ModalHeader>
            <hr className="border-slate-200" />

            <ModalBody className="p-7 gap-9">
              <AppointmentItem data={data} isInsideHistoyModal />
              {appointmentHistory.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  {item.Action.Key && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                      {getHistoryUI(item.Action.Key).icon}
                    </div>
                  )}
                  {item.Action.Key && item.EditedBy.name && (
                    <div className="w-full flex justify-between">
                      <div>
                        <b>Lịch hẹn</b> được{" "}
                        {getHistoryUI(item.Action.Key).label} bởi{" "}
                        <b>{item.EditedBy.name}</b>
                      </div>
                      {/* <div className="text-slate-400">10 giờ trước</div> */}
                      {item.ActionAt && (
                        <div className="text-slate-400">
                          {/* {dayjs(item.ActionAt).format("HH:mm DD/MM/YYYY")} */}
                          {getDurationFromNow(item.ActionAt)} trước
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      {/* Edit Appointment Modal — only rendered when not using onEditAppointment callback */}
      {!onEditAppointment && (
        <AddApModal
          isOpen={isOpenEdit}
          onOpenChange={() => setIsOpenEdit(false)}
          appointmentId={data.AppointmentId}
          onSuccess={() => {
            setIsOpenEdit(false);
            onUpdated?.();
          }}
        />
      )}
    </>
  );
};

export default ApActions;
