"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import AppointmentItem from "../ap/AppointmentItem";
import { IconChevronRight } from "../icons/outline";
import { useCustomerContext } from "@/context/CustomerContext";
import { ApTypeOption } from "../../types/define.d";
import { AppointmentTypeOptions } from "@/data/appointmentType";
import { UI_META } from "@/const/ui";
import { getErrorMessage } from "@/lib/utils";
import ApStatusSelect from "../ap/ApStatusSelect";
import { IconChevronDown, IconCircleCheckFilled } from "@tabler/icons-react";
import rest from "@/lib/rest";

export default function AppointmentList() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { customer } = useCustomerContext();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [_trigger, setTrigger] = useState(1);

  const [statusOption] = useState<ApTypeOption[]>(AppointmentTypeOptions);

  const [selectedStatus, setSelectedStatus] = useState<number>(-1);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");

  const [appointmentData, setAppointmentData] = useState([]);
  const filteredAppointments = useMemo(() => {
    if (!Array.isArray(appointmentData) || appointmentData.length === 0)
      return [];
    return appointmentData.filter((ap: any) => {
      if (selectedDoctor && ap.doctor?.id.toString() !== selectedDoctor)
        return false;
      return true;
    });
  }, [selectedDoctor, appointmentData]);

  const doctorOptions: {
    avatar: string;
    documentId: string;
    id: number;
    name: string;
  }[] = useMemo(() => {
    const duplicateDoctorList = appointmentData
      .map((item: any) => item.doctor)
      .filter(Boolean);
    if (duplicateDoctorList.length === 0) return [];
    return Array.from(
      new Map(duplicateDoctorList.map((item: any) => [item.id, item])).values(),
    );
  }, [appointmentData]);

  const handleRefresh = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  const fetchAppointment = useCallback(async () => {
    if (!customer?.CustomerId) return;
    try {
      setLoading(true);
      setError(null);
      if (selectedDoctor) setSelectedDoctor("");
      const params = {
        customers: [customer.CustomerId],
        order: "DESC",
        ...(selectedStatus &&
          selectedStatus >= 0 && { statuses: [selectedStatus] }),
        ...(selectedType && { labels: [selectedType] }),
      };
      const res = await rest.get(`/v2/appointment`, {
        params,
      });
      if (!res.data.data)
        throw new Error("Tải lịch hẹn không thành công do lỗi máy chủ");
      setAppointmentData(res.data.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [customer?.CustomerId, selectedStatus, selectedType, selectedDoctor]);

  useEffect(() => {
    // if (!isOpen) return;
    fetchAppointment();
  }, [fetchAppointment, isOpen]);

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
        <div className="w-full min-h-96 flex justify-center items-center">
          <Spinner size="sm" color="default" />
        </div>
      );
    if (appointmentData.length === 0)
      return (
        <div className="w-full min-h-96 flex justify-center items-center text-default-500">
          Chưa có lịch hẹn
        </div>
      );
    return (
      <div className=" flex flex-col gap-5 px-4 pb-4">
        {filteredAppointments.map((item: any) => (
          <AppointmentItem key={item.AppointmentId} data={item} />
        ))}
      </div>
    );
  };

  return (
    <>
      {appointmentData.length > 0 && (
        <Button
          variant="light"
          className="mt-4 text-blue-700 font-semibold"
          onPress={onOpen}
        >
          Xem tất cả ({appointmentData.length})
          <IconChevronRight size={18} />
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        size="3xl"
        scrollBehavior="outside"
        onClose={onClose}
        isDismissable={UI_META.Modal.isDismissable}
        classNames={UI_META.Modal.classnames}
        className="min-h-[780px]"
      >
        <ModalContent>
          <ModalHeader>
            Tất cả lịch hẹn{" "}
            {customer?.FullName ? "của " + customer.FullName : ""}
          </ModalHeader>
          <ModalBody>
            <div className="flex gap-4 p-4">
              <Select
                isClearable
                placeholder="Loại lịch hẹn"
                variant="bordered"
                selectedKeys={[selectedType]}
                selectorIcon={<IconChevronDown size={20} />}
                onChange={(e) => setSelectedType(e.target.value)}
                classNames={{
                  value: "m-2 font-semibold text-base text-foreground",
                  label: "font-medium text-base pl-1 pb-1",
                  selectorIcon: "w-5 h-5",
                  clearButton: "mx-2",
                  trigger:
                    "h-10.5 w-full px-2 rounded-xl bg-white border-default-400 data-[hover=true]:border-default-500 flex items-center justify-start gap-1 ",
                }}
                className="max-w-40"
                listboxProps={{
                  classNames: { list: "!gap-1" },
                  itemClasses: {
                    base: "px-3 rounded-xl hover:bg-blue-50 data-[selected=true]:bg-blue-100",
                    title: "py-1 text-base font-semibold leading-[1.3]",
                    // description: "text-base text-default-500",
                  },
                }}
              >
                {statusOption.map((option) => (
                  <SelectItem
                    key={option.AppointmentLabelId}
                    textValue={option.Name}
                  >
                    {option.Name}
                  </SelectItem>
                ))}
              </Select>
              <ApStatusSelect
                value={selectedStatus}
                onChange={setSelectedStatus}
                isClearable
              />
              <Select
                isClearable
                placeholder="Bác sĩ / KTV"
                variant="bordered"
                selectedKeys={[selectedDoctor]}
                selectorIcon={<IconChevronDown size={20} />}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                classNames={{
                  value: "m-2 font-semibold text-base text-foreground",
                  label: "font-medium text-base pl-1 pb-1",
                  selectorIcon: "w-5 h-5",
                  clearButton: "mx-2",
                  trigger:
                    "h-10.5 w-full px-2 rounded-xl bg-white border-default-400 data-[hover=true]:border-default-500 flex items-center justify-start gap-1 ",
                }}
                className="max-w-56"
                listboxProps={{
                  hideSelectedIcon: true,
                  classNames: { list: "!gap-1" },
                  itemClasses: {
                    base: "px-3 rounded-xl hover:bg-blue-50 data-[selected=true]:bg-blue-100",
                    title: "py-1 text-base font-semibold leading-[1.3]",
                    // description: "text-base text-default-500",
                  },
                }}
              >
                {doctorOptions.map((doctor) => (
                  <SelectItem key={doctor.id} textValue={doctor.name}>
                    <div className="flex flex-row gap-1 justify-between w-full font-medium items-center">
                      <p className="text-base truncate">{doctor.name}</p>
                      {selectedDoctor === doctor.id.toString() && (
                        <IconCircleCheckFilled
                          className="text-primary-500 shrink-0"
                          size={24}
                        />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>
            {renderContent()}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
