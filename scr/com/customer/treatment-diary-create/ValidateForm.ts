import { ADMISSION_OPTIONS } from "@/types/treatment";
import type { TreatmentProgressPayload } from "@/com/customer/treatment-diary-create/TreatmentProgressSection";
import { DISCHARGE_NOTE_OPTIONS } from "@/types/treatment";

const VITAL_OPTION_LABEL = "Nhập Mạch & Huyết áp";

export interface AdmissionErrors {
  heartRate?: string;
  bloodPressure?: string;
  diagnosis?: string;
}

export interface TreatmentProgressErrors {
  dentalChairId?: string;
  noProgressData?: string;
  progressByOrderDetailId: Record<string, string>;
  doctorByOrderDetailId: Record<string, string>;
}

export interface TreatmentNoteErrors {
  anesthesia?: Record<string, string>;
}

export interface DischargeNoteErrors {
  periodicCheckupMonth?: string;
  appointmentDay?: string;
  appointmentMonth?: string;
  appointmentYear?: string;
}

export interface SelectOption {
  key: string;
  id: string;
  label: string;
  percent?: number;
}

const PERIODIC_CHECKUP_LABEL = "Tái khám định kỳ mỗi";
const APPOINTMENT_DATE_LABEL = "Hẹn ngày";

export const validateAdmission = (
  checkedAdmission: Record<number, boolean>,
  admissionHeartRate: string,
  admissionBloodPressure: string,
  diagnosis: string,
): AdmissionErrors => {
  const errors: AdmissionErrors = {};
  const vitalOptionIndex = ADMISSION_OPTIONS.findIndex(
    (option) => option === VITAL_OPTION_LABEL,
  );

  // Check if vital option is selected
  if (checkedAdmission[vitalOptionIndex]) {
    if (!admissionHeartRate.trim()) {
      errors.heartRate = "Trường bắt buộc nhập";
    }
    if (!admissionBloodPressure.trim()) {
      errors.bloodPressure = "Trường bắt buộc nhập";
    }
  }

  // Check diagnosis is required
  if (!diagnosis.trim()) {
    errors.diagnosis = "Trường bắt buộc nhập";
  }

  return errors;
};

export const validateTreatmentProgress = (
  payload: TreatmentProgressPayload,
): TreatmentProgressErrors => {
  const errors: TreatmentProgressErrors = {
    progressByOrderDetailId: {},
    doctorByOrderDetailId: {},
  };

  if (!payload.DentalChairId.trim()) {
    errors.dentalChairId = "Trường bắt buộc nhập";
  }

  const hasAnyProcedureProgress = payload.TreatmentProcedureProgress.some(
    (item) => item.ProcedureProgressId?.trim(),
  );

  if (!hasAnyProcedureProgress) {
    if (payload.TreatmentProcedureProgress.length === 0) {
      errors.noProgressData = "Vui lòng cập nhật ít nhất 1 tiến trình điều trị";
    } else {
      payload.TreatmentProcedureProgress.forEach((item, index) => {
        const orderDetailId = item.OrderDetailId.trim();
        const rowKey = item.RowKey?.trim();
        const key = orderDetailId || rowKey || `row-${index}`;
        errors.progressByOrderDetailId[key] = "Vui lòng chọn tiến trình";
      });
    }
  }

  payload.TreatmentProcedureProgress.forEach((item, index) => {
    const orderDetailId = item.OrderDetailId.trim();
    const rowKey = item.RowKey?.trim();
    const key = orderDetailId || rowKey || `row-${index}`;
    const procedureProgressId = item.ProcedureProgressId?.trim() || "";
    const doctorId = item.DoctorId?.trim() || "";
    const assistantId = item.DoctorAssistantId?.trim() || "";
    const initialProgressId = item.InitialProcedureProgressId?.trim() || "";
    const hasChangedProgress = procedureProgressId !== initialProgressId;
    const hasMeaningfulChange = Boolean(
      doctorId || assistantId || hasChangedProgress,
    );

    if (!hasMeaningfulChange) return;

    if (procedureProgressId && !doctorId) {
      errors.doctorByOrderDetailId[key] = "Trường bắt buộc nhập";
    }
  });

  return errors;
};

export const validateTreatmentNote = (
  checkedMap: Record<number, boolean>,
  anesthesiaState: Record<
    string,
    Record<number, { isSelected: boolean; quantity: string }>
  >,
): TreatmentNoteErrors => {
  const errors: TreatmentNoteErrors = {};
  const anesthesiaErrors: Record<string, string> = {};

  const ANESTHESIA_INDICES: Record<number, string> = {
    5: "Gây tê tại chỗ bằng",
    6: "Gây tê vùng bằng",
  };

  Object.entries(ANESTHESIA_INDICES).forEach(([indexStr, title]) => {
    const index = Number(indexStr);
    if (!checkedMap[index]) return;

    const drugs = anesthesiaState[title] ?? {};
    const hasSelectedDrug = Object.values(drugs).some((d) => d.isSelected);

    if (!hasSelectedDrug) {
      anesthesiaErrors[title] =
        `Vui lòng chọn ít nhất 1 loại thuốc cho "${title}"`;
    }
  });

  if (Object.keys(anesthesiaErrors).length > 0) {
    errors.anesthesia = anesthesiaErrors;
  }

  return errors;
};

export const validateDischargeNote = ({
  checkedMap,
  periodicCheckupMonth,
  appointmentDay,
  appointmentMonth,
  appointmentYear,
}: {
  checkedMap: Record<number, boolean>;
  periodicCheckupMonth: string;
  appointmentDay: string;
  appointmentMonth: string;
  appointmentYear: string;
}): DischargeNoteErrors => {
  const errors: DischargeNoteErrors = {};

  const periodicCheckupIndex = DISCHARGE_NOTE_OPTIONS.findIndex(
    (option) => option === PERIODIC_CHECKUP_LABEL,
  );
  const appointmentDateIndex = DISCHARGE_NOTE_OPTIONS.findIndex(
    (option) => option === APPOINTMENT_DATE_LABEL,
  );

  if (checkedMap[periodicCheckupIndex] && !periodicCheckupMonth.trim()) {
    errors.periodicCheckupMonth = "Trường bắt buộc nhập";
  }

  if (checkedMap[appointmentDateIndex]) {
    if (!appointmentDay.trim()) {
      errors.appointmentDay = "Trường bắt buộc nhập";
    }
    if (!appointmentMonth.trim()) {
      errors.appointmentMonth = "Trường bắt buộc nhập";
    }
    if (!appointmentYear.trim()) {
      errors.appointmentYear = "Trường bắt buộc nhập";
    }
  }

  return errors;
};
