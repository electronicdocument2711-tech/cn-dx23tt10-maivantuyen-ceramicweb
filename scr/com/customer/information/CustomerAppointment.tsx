import { useCustomerContext } from "@/context/CustomerContext";
import AddApModal from "../../ap/AddApModal";
import AppointmentItem from "../../ap/AppointmentItem";
import { ButtonCustom } from "@/com/shared";
import { IconPlus, IconChevronRight } from "@/com/icons/outline";
import { useDisclosure } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { Appointment } from "@/types/define.d";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import dayjs from "dayjs";
import { Button, Spinner } from "@heroui/react";
import { UI_META } from "@/const/ui";
import Link from "next/link";
import ApDetailModal from "@/com/ap/ApDetailModal";
import { prop } from "remeda";

const getToday = () => dayjs().startOf("day").format("YYYY-MM-DD HH:mm");

export const CustomerAppointment = () => {
  const { isOpen, onOpenChange } = useDisclosure();
  const { customer } = useCustomerContext();

  const [appointment, setAppointment] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(1);

  const handleRefresh = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  const fetchAppointment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!customer?.CustomerId) return;
      const res = await rest.get(`/v2/appointment`, {
        params: {
          page: 1,
          page_size: 1,
          from_time: getToday(),
          customers: [customer.CustomerId],
          statuses: [11, 21, 41, 61, 71],
        },
      });

      if (!res.data.data)
        throw new Error("Tải lịch hẹn không thành công do lỗi máy chủ");

      setAppointment(res.data.data);
    } catch (error) {
      setAppointment([]);
      setError(getErrorMessage(error, "Đã có lỗi xảy ra"));
    } finally {
      setLoading(false);
    }
  }, [customer?.CustomerId]);

  const fetchAppointmentQuietly = useCallback(async () => {
    try {
      if (!customer?.CustomerId) return;
      const res = await rest.get(`/v2/appointment`, {
        params: {
          page: 1,
          page_size: 1,
          from_time: getToday(),
          customers: [customer.CustomerId],
          statuses: [11, 21, 41, 61, 71],
        },
      });

      const appointmentList = prop(res, ...["data", "data"]) || [];

      if (appointmentList.length === 0) return;

      setAppointment(appointmentList);
    } catch {
      // DO NOTHING
    }
  }, [customer]);

  useEffect(() => {
    if (!customer?.CustomerId) return;
    fetchAppointment();
  }, [trigger, customer?.CustomerId, fetchAppointment]);

  const renderContent = () => {
    if (error)
      return (
        <div className="w-full min-h-33 flex flex-col gap-2 justify-center items-center text-default-500">
          {getErrorMessage(error, "Đã có lỗi xảy ra")}
          <Button
            className={`${UI_META.Button.primary.classnames} max-w-20`}
            onPress={handleRefresh}
          >
            Tải lại
          </Button>
        </div>
      );
    if (loading)
      return (
        <div className="w-full min-h-24 flex justify-center items-center">
          <Spinner size="sm" color="default" />
        </div>
      );
    if (appointment.length === 0)
      return (
        <div className="w-full rounded-xl bg-gray-50 border border-gray-100 min-h-24 flex justify-center items-center text-default-500">
          Chưa có lịch hẹn sắp tới
        </div>
      );
    return (
      <AppointmentItemWrapper
        appointment={appointment?.[0]}
        onAppointmentChange={fetchAppointmentQuietly}
      />
    );
  };

  return (
    <>
      <div className="w-full @container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground text-xl font-bold">Lịch hẹn</h2>

          <ButtonCustom
            styleType="primary"
            label="Tạo lịch hẹn"
            isDisabled={!customer}
            startContent={<IconPlus />}
            onClick={onOpenChange}
            className="w-fit"
          />
        </div>

        {/* Show 1 item nearby today */}
        {renderContent()}

        {/* show all appointments of customer */}
        <Link
          className="py-2 px-4 w-fit mt-4 rounded-xl hover:bg-sky-50 text-default-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          href={`/customer/${customer?.CustomerId}/appointments`}
        >
          Xem tất cả lịch hẹn
          <IconChevronRight size={18} />
        </Link>
      </div>
      <AddApModal
        customer={customer}
        onSuccess={handleRefresh}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </>
  );
};

interface AppointmentItemWrapperProps {
  appointment: Appointment;
  onAppointmentChange?: () => void;
}
const AppointmentItemWrapper: React.FC<AppointmentItemWrapperProps> = ({
  appointment,
  onAppointmentChange,
}) => {
  const { isOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <AppointmentItem
        data={appointment}
        onClick={onOpenChange}
        onRefresh={() => {
          onAppointmentChange?.();
        }}
      />
      <ApDetailModal
        isOpen={isOpen}
        onOpenChange={() => {
          onOpenChange();
          setTimeout(() => onAppointmentChange?.(), 300);
        }}
        appointmentId={appointment?.AppointmentId}
        preventRedirectToast
        closeOnSuccess
      />
    </>
  );
};
