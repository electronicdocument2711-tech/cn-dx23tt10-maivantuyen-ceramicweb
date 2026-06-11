import { Doctor } from "@/data";
import { CustomEvent } from "@/types/react-big-calendar";

export interface CreateAppointmentPayload {
  patientName: string;
  status: "scheduled" | "arrived" | "pending" | "cancelled";
  phone?: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  notes?: string;
  doctorId?: string;
}

export type AppointmentType = "tu-van" | "cham-soc" | "hen-gap";
export type StatusPoppointment = "scheduled" | "arrived" | "pending" | "cancelled";
export const WEEKDAY_VN = ["Chủ nhật", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy"];


export interface CreateAppointmentConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  phone?: string;
  status: "scheduled" | "arrived" | "pending" | "cancelled";
  date?: string; // yyyy-mm-dd
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  doctorId?: string;
  doctors: Doctor[];
  suggestion?: any; // selected suggestion item for avatar/local/code display if available
  primaryLabel?: string;
  primaryDisabled?: boolean;
  viewOnly?: boolean;
  onConfirm: () => void;
  onChangeDoctorId?: (doctorId: string) => void;
  appointmentType?: AppointmentType;
  onChangeAppointmentType?: (type: AppointmentType) => void;
  onChangeStartTime?: (value: string) => void;
  onChangeEndTime?: (value: string) => void;
  onChangeDate?: (value: string) => void;
}

export const APPOINTMENT_TYPES: ReadonlyArray<{
  value: AppointmentType;
  label: string;
}> = [
  { value: "tu-van", label: "Tư vấn" },
  { value: "cham-soc", label: "Chăm sóc" },
  { value: "hen-gap", label: "Hẹn gặp" },
];

export const APPOINTMENT_TYPE_LABEL: Record<AppointmentType, string> = {
  "tu-van": "Tư vấn",
  "cham-soc": "Chăm sóc",
  "hen-gap": "Hẹn gặp",
};

export interface PatientModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: Partial<CustomEvent> | null;
}

export interface TimeButtonsProps {
    startTime?: string;
    endTime?: string;
    onChangeStartTime?: (value: string) => void;
    onChangeEndTime?: (value: string) => void;
  }
  