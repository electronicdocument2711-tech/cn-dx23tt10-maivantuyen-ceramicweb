"use client";

import AdmissionSection from "@/com/customer/treatment-diary-create/AdmissionSection";
import AnimatedSectionContent from "@/com/customer/treatment-diary-create/AnimatedSectionContent";
import TreatmentNoteSection from "@/com/customer/treatment-diary-create/TreatmentNoteSection";
import TreatmentProgressSection, {
  type TreatmentProgressPayload,
} from "@/com/customer/treatment-diary-create/TreatmentProgressSection";
import DischargeNoteSection from "./treatment-diary-create/DischargeNoteSection";

import SectionHeader from "@/com/customer/treatment-diary-create/SectionHeader";
import {
  validateAdmission,
  validateDischargeNote,
  validateTreatmentProgress,
  validateTreatmentNote,
  type AdmissionErrors,
  type DischargeNoteErrors,
  type TreatmentProgressErrors,
  type TreatmentNoteErrors,
} from "@/com/customer/treatment-diary-create/ValidateForm";
import {
  ADMISSION_OPTIONS,
  COURSE_OPTIONS,
  DISCHARGE_NOTE_OPTIONS,
  INITIAL_OPEN_SECTIONS,
  SECTION_DEFINITIONS,
  SectionKey,
  TREATMENT_NOTE_FOLLOW_UP_OPTION,
  TREATMENT_NOTE_OPTIONS,
} from "@/types/treatment";
import rest from "@/lib/rest";
import useFormData from "@/hook/useFormData";
import { addToast, Button } from "@heroui/react";
import { IconChevronRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { prop } from "remeda";

interface TreatmentDiaryCreateProps {
  onAction: () => void;
}

interface AdmissionOptionAdditionPayload {
  value: string;
  unit: string;
  key: number;
}

interface AdmissionOptionPayload {
  value: string;
  key: number;
  status: 0 | 1;
  additions?: AdmissionOptionAdditionPayload[];
}

interface AdmissionPayload {
  teethAndGumsDescrible: string;
  diagnosis: string;
  options: AdmissionOptionPayload[];
}

interface DiseaseProgressionPayload {
  HeartRate: string;
  BloodPressure: string;
  Status: string;
  Diagnosis: string;
  Options: DiseaseProgressionOptionPayload[];
}

interface DiseaseProgressionOptionPayload {
  value: string;
  key: number;
  status: 0 | 1;
}

interface TreatmentNoteAdditionPayload {
  value: string;
  key: number;
  unit?: string;
}

interface TreatmentNoteOptionPayload {
  value: string;
  key: number;
  status: 0 | 1;
  additions?: TreatmentNoteAdditionPayload[];
}

interface TreatmentNotePayload {
  options: TreatmentNoteOptionPayload[];
  other: string;
  isPatientRinsingMouth: boolean;
}

interface NextTimeTreatmentAdditionPayload {
  value: number | string;
  key: "{{months}}" | "{{day}}" | "{{year}}";
}

interface NextTimeTreatmentOptionPayload {
  value: string;
  key: number;
  status: 0 | 1;
  additions?: NextTimeTreatmentAdditionPayload[];
}

interface NextTimeTreatmentNotePayload {
  options: NextTimeTreatmentOptionPayload[];
}

interface TreatmentDiarySavePayloads {
  admissionPayload: AdmissionPayload;
  progressPayload: Record<string, string>;
  diseaseProgressionPayload: DiseaseProgressionPayload;
  treatmentNotePayload: TreatmentNotePayload;
  dischargeNotePayload: NextTimeTreatmentNotePayload;
}

const VITAL_OPTION_LABEL = "Nhập Mạch & Huyết áp";
const VITAL_OPTION_API_VALUE = "Nhập mạch & huyết áp";
const PERIODIC_CHECKUP_LABEL = "Tái khám định kỳ mỗi";
const APPOINTMENT_DATE_LABEL = "Hẹn ngày";
const COURSE_VITAL_OPTION_INDEX = COURSE_OPTIONS.findIndex(
  (option) => option === VITAL_OPTION_LABEL,
);
const DEFAULT_ADMISSION_CHECKED = ADMISSION_OPTIONS.reduce<
  Record<number, boolean>
>((result, _, index) => {
  result[index] = true;
  return result;
}, {});
const DEFAULT_COURSE_CHECKED = COURSE_OPTIONS.reduce<Record<number, boolean>>(
  (result, _, index) => {
    result[index] = true;
    return result;
  },
  {},
);

const buildTreatmentProgressApiPayload = (
  payload: TreatmentProgressPayload,
): Record<string, string> => {
  const apiPayload: Record<string, string> = {
    DentalChairId: payload.DentalChairId,
    Room: payload.Room || "TREATMENT",
  };

  const filteredProgress = payload.TreatmentProcedureProgress.filter(
    (item) => item.ProcedureProgressId?.trim() !== "",
  );

  filteredProgress.forEach((item, index) => {
    apiPayload[`TreatmentProcedureProgress[${index}][OrderDetailId]`] =
      item.OrderDetailId;
    if (item.ProcedureProgressId !== undefined) {
      apiPayload[`TreatmentProcedureProgress[${index}][ProcedureProgressId]`] =
        item.ProcedureProgressId;
    }
    if (item.DoctorId !== undefined) {
      apiPayload[`TreatmentProcedureProgress[${index}][DoctorId]`] =
        item.DoctorId;
    }
    if (item.DoctorAssistantId !== undefined) {
      apiPayload[`TreatmentProcedureProgress[${index}][DoctorAssistantId]`] =
        item.DoctorAssistantId;
    }
  });

  return apiPayload;
};

const buildDiseaseProgressionPayload = ({
  checkedMap,
  heartRate,
  bloodPressure,
  status,
  diagnosis,
}: {
  checkedMap: Record<number, boolean>;
  heartRate: string;
  bloodPressure: string;
  status: string;
  diagnosis: string;
}): DiseaseProgressionPayload => {
  const options = COURSE_OPTIONS.map<DiseaseProgressionOptionPayload>(
    (option, index) => {
      const optionIndex =
        COURSE_VITAL_OPTION_INDEX >= 0 && index > COURSE_VITAL_OPTION_INDEX
          ? index - 1
          : index;

      return {
        value:
          option === VITAL_OPTION_LABEL
            ? VITAL_OPTION_API_VALUE
            : `DP${optionIndex}`,
        key: index + 1,
        status: checkedMap[index] ? 1 : 0,
      };
    },
  );

  return {
    HeartRate: heartRate.trim(),
    BloodPressure: bloodPressure.trim(),
    Status: status.trim(),
    Diagnosis: diagnosis.trim(),
    Options: options,
  };
};

const buildTreatmentNotePayload = ({
  checkedMap,
  other,
  isPatientRinsingMouth,
  anesthesiaState,
}: {
  checkedMap: Record<number, boolean>;
  other: string;
  isPatientRinsingMouth: boolean;
  anesthesiaState: Record<
    string,
    Record<number, { isSelected: boolean; quantity: string }>
  >;
}): TreatmentNotePayload => {
  const options = TREATMENT_NOTE_OPTIONS.map<TreatmentNoteOptionPayload>(
    (option, index) => {
      const isSelected = checkedMap[index] ? 1 : 0;

      if (index === 5) {
        const anesthesiaData = anesthesiaState["Gây tê tại chỗ bằng"] || {};

        return {
          value: option,
          key: index + 1,
          status: isSelected,
          Diagnosis: anesthesiaData,
        };
      }

      if (index === 6) {
        const anesthesiaData = anesthesiaState["Gây tê vùng bằng"] || {};

        return {
          value: option,
          key: index + 1,
          status: isSelected,
          Diagnosis: anesthesiaData,
        };
      }

      return {
        value: option,
        key: index + 1,
        status: isSelected,
      };
    },
  );

  return {
    options,
    other: other.trim(),
    isPatientRinsingMouth,
  };
};

const toNumberOrString = (value: string): number | string => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : trimmed;
};

const buildDischargeNotePayload = ({
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
}): NextTimeTreatmentNotePayload => {
  const options = DISCHARGE_NOTE_OPTIONS.map<NextTimeTreatmentOptionPayload>(
    (option, index) => {
      const payloadOption: NextTimeTreatmentOptionPayload = {
        value: option,
        key: index + 1,
        status: checkedMap[index] ? 1 : 0,
      };

      if (option === PERIODIC_CHECKUP_LABEL) {
        payloadOption.value = `${PERIODIC_CHECKUP_LABEL} {{months}} tháng`;
        payloadOption.additions = [
          {
            value: toNumberOrString(periodicCheckupMonth),
            key: "{{months}}",
          },
        ];
      }

      if (option === APPOINTMENT_DATE_LABEL) {
        payloadOption.value = `${APPOINTMENT_DATE_LABEL} {{day/monthsh/year}} `;
        payloadOption.additions = [
          {
            value: toNumberOrString(appointmentDay),
            key: "{{day}}",
          },
          {
            value: toNumberOrString(appointmentMonth),
            key: "{{months}}",
          },
          {
            value: toNumberOrString(appointmentYear),
            key: "{{year}}",
          },
        ];
      }

      return payloadOption;
    },
  );

  return { options };
};

const TreatmentDiaryCreate: React.FC<TreatmentDiaryCreateProps> = ({
  onAction,
}) => {
  const params = useParams<{ id: string }>();
  const { buildFormData } = useFormData();
  const customerId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [openSections, setOpenSections] = useState(INITIAL_OPEN_SECTIONS);
  const [checkedAdmission, setCheckedAdmission] = useState<
    Record<number, boolean>
  >(() => DEFAULT_ADMISSION_CHECKED);

  const [statusDescription, setStatusDescription] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [admissionHeartRate, setAdmissionHeartRate] = useState("75");
  const [admissionBloodPressure, setAdmissionBloodPressure] =
    useState("120/80");
  const [admissionErrors, setAdmissionErrors] = useState<AdmissionErrors>({});
  const [checkedCourse, setCheckedCourse] = useState<Record<number, boolean>>(
    () => DEFAULT_COURSE_CHECKED,
  );
  const [courseStatusDescription, setCourseStatusDescription] = useState("");
  const [courseDiagnosis, setCourseDiagnosis] = useState("");
  const [courseHeartRate, setCourseHeartRate] = useState("75");
  const [courseBloodPressure, setCourseBloodPressure] = useState("120/80");
  const [courseErrors, setCourseErrors] = useState<AdmissionErrors>({});
  const [checkedTreatmentNote, setCheckedTreatmentNote] = useState<
    Record<number, boolean>
  >({});
  const [treatmentNoteOther, setTreatmentNoteOther] = useState("");
  const [isTreatmentNoteFollowUpSelected, setIsTreatmentNoteFollowUpSelected] =
    useState(false);
  const [checkedDischargeNote, setCheckedDischargeNote] = useState<
    Record<number, boolean>
  >({});
  const [periodicCheckupMonth, setPeriodicCheckupMonth] = useState("");
  const [appointmentDay, setAppointmentDay] = useState("");
  const [appointmentMonth, setAppointmentMonth] = useState("");
  const [appointmentYear, setAppointmentYear] = useState("");
  const [dischargeErrors, setDischargeErrors] = useState<DischargeNoteErrors>(
    {},
  );
  const [dentalChairBooked, setDentalChairBooked] = useState<any | null>(null);
  const [saveErrors, setSaveErrors] = useState<any>(null);
  const [treatmentProgressPayload, setTreatmentProgressPayload] =
    useState<TreatmentProgressPayload>({
      DentalChairId: "",
      Room: "TREATMENT",
      TreatmentProcedureProgress: [],
    });
  const [treatmentProgressErrors, setTreatmentProgressErrors] =
    useState<TreatmentProgressErrors>({
      progressByOrderDetailId: {},
      doctorByOrderDetailId: {},
    });

  const toggleSection = (section: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const [treatmentNoteErrors, setTreatmentNoteErrors] =
    useState<TreatmentNoteErrors>({});

  const buildAdmissionPayload = (): AdmissionPayload => {
    const optionsPayload = ADMISSION_OPTIONS.map<AdmissionOptionPayload>(
      (option, index) => {
        const isSelected = Boolean(checkedAdmission[index]);

        if (option === VITAL_OPTION_LABEL) {
          return {
            value: VITAL_OPTION_API_VALUE,
            key: index + 1,
            status: isSelected ? 1 : 0,
            additions: [
              {
                value: admissionHeartRate.trim(),
                unit: "Lần/ph",
                key: 1,
              },
              {
                value: admissionBloodPressure.trim(),
                unit: "mmHg",
                key: 2,
              },
            ],
          };
        }

        return {
          value: option,
          key: index + 1,
          status: isSelected ? 1 : 0,
        };
      },
    );

    return {
      teethAndGumsDescrible: statusDescription.trim(),
      diagnosis: diagnosis.trim(),
      options: optionsPayload,
    };
  };

  const validateBeforeSave = (): boolean => {
    setSaveErrors(null);

    const admissionErrors = validateAdmission(
      checkedAdmission,
      admissionHeartRate,
      admissionBloodPressure,
      diagnosis,
    );

    setAdmissionErrors(admissionErrors);

    const courseErrors = validateAdmission(
      checkedCourse,
      courseHeartRate,
      courseBloodPressure,
      courseDiagnosis,
    );
    setCourseErrors(courseErrors);

    const progressErrors = validateTreatmentProgress(treatmentProgressPayload);
    setTreatmentProgressErrors(progressErrors);

    const treatmentNoteErrors = validateTreatmentNote(
      checkedTreatmentNote,
      anesthesiaState,
    );
    setTreatmentNoteErrors(treatmentNoteErrors);

    const dischargeErrors = validateDischargeNote({
      checkedMap: checkedDischargeNote,
      periodicCheckupMonth,
      appointmentDay,
      appointmentMonth,
      appointmentYear,
    });
    setDischargeErrors(dischargeErrors);

    const hasAdmissionErrors = Object.keys(admissionErrors).length > 0;
    const hasCourseErrors = Object.keys(courseErrors).length > 0;
    const hasDischargeErrors = Object.keys(dischargeErrors).length > 0;
    const hasProgressErrors =
      Boolean(progressErrors.dentalChairId) ||
      Boolean(progressErrors.noProgressData) ||
      Object.keys(progressErrors.progressByOrderDetailId).length > 0 ||
      Object.keys(progressErrors.doctorByOrderDetailId).length > 0;

    const hasTreatmentNoteErrors =
      Object.keys(treatmentNoteErrors.anesthesia ?? {}).length > 0;

    if (
      hasAdmissionErrors ||
      hasCourseErrors ||
      hasDischargeErrors ||
      hasProgressErrors ||
      hasTreatmentNoteErrors
    ) {
      addToast({
        title: "Chưa nhập đủ thông tin",
        description: "Vui lòng kiểm tra lại các trường bắt buộc",
        color: "warning",
      });

      setSaveErrors({
        admission: admissionErrors,
        course: courseErrors,
        progress: progressErrors,
        discharge: dischargeErrors,
      });

      return false;
    }

    return true;
  };

  const buildSavePayloads = (): TreatmentDiarySavePayloads => {
    return {
      // Payload hospilazation status
      admissionPayload: buildAdmissionPayload(),
      // Payload treatment progress
      progressPayload: buildTreatmentProgressApiPayload(
        treatmentProgressPayload,
      ),
      // Payload disease progression
      diseaseProgressionPayload: buildDiseaseProgressionPayload({
        checkedMap: checkedCourse,
        heartRate: courseHeartRate,
        bloodPressure: courseBloodPressure,
        status: courseStatusDescription,
        diagnosis: courseDiagnosis,
      }),
      // Payload treatment note
      treatmentNotePayload: buildTreatmentNotePayload({
        checkedMap: checkedTreatmentNote,
        other: treatmentNoteOther,
        isPatientRinsingMouth: isTreatmentNoteFollowUpSelected,
        anesthesiaState: anesthesiaState,
      }),
      // Payload next time treatment note
      dischargeNotePayload: buildDischargeNotePayload({
        checkedMap: checkedDischargeNote,
        periodicCheckupMonth,
        appointmentDay,
        appointmentMonth,
        appointmentYear,
      }),
    };
  };

  const buildTreatmentFormData = (
    payloads: TreatmentDiarySavePayloads,
  ): FormData => {
    return buildFormData(
      { CustomerId: customerId, ...payloads.progressPayload },
      {
        HospitalizationStatus: payloads.admissionPayload,
        DiseaseProgression: payloads.diseaseProgressionPayload,
        TreatmentNote: payloads.treatmentNotePayload,
        NextTimeTreatmentNote: payloads.dischargeNotePayload,
      },
    );
  };

  const submitTreatmentDiary = async (formData: FormData): Promise<void> => {
    try {
      const req = await rest.post("/customer/treatment", formData);
      if (req.data.success) {
        addToast({
          title: "Tạo phiên điều trị thành công",
          color: "success",
        });
        onAction();
      } else {
        addToast({
          title: "Không lưu được",
          description: req.data.message || "Tạo phiên điều trị thất bại",
          color: "danger",
        });
      }
    } catch {
      addToast({
        title: "Tạo phiên điều trị thất bại",
        color: "danger",
      });
    }
  };

  const handleSave = async () => {
    if (!validateBeforeSave()) return;
    const payloads = buildSavePayloads();

    const formData = buildTreatmentFormData(payloads);
    await submitTreatmentDiary(formData);
  };

  const admissionSectionProps = {
    options: ADMISSION_OPTIONS,
    selection: {
      checkedMap: checkedAdmission,
      onToggleOption: (index: number, isSelected: boolean) =>
        setCheckedAdmission((prev) => ({
          ...prev,
          [index]: isSelected,
        })),
    },
    form: {
      statusDescription,
      onStatusDescriptionChange: setStatusDescription,
      diagnosis,
      onDiagnosisChange: setDiagnosis,
      heartRate: admissionHeartRate,
      onHeartRateChange: setAdmissionHeartRate,
      bloodPressure: admissionBloodPressure,
      onBloodPressureChange: setAdmissionBloodPressure,
    },
    errors: {
      heartRate: admissionErrors["heartRate"],
      bloodPressure: admissionErrors["bloodPressure"],
      diagnosis: admissionErrors["diagnosis"],
    },
  };

  const courseSectionProps = {
    options: COURSE_OPTIONS,
    selection: {
      checkedMap: checkedCourse,
      onToggleOption: (index: number, isSelected: boolean) =>
        setCheckedCourse((prev) => ({
          ...prev,
          [index]: isSelected,
        })),
    },
    form: {
      statusDescription: courseStatusDescription,
      onStatusDescriptionChange: setCourseStatusDescription,
      diagnosis: courseDiagnosis,
      onDiagnosisChange: setCourseDiagnosis,
      heartRate: courseHeartRate,
      onHeartRateChange: setCourseHeartRate,
      bloodPressure: courseBloodPressure,
      onBloodPressureChange: setCourseBloodPressure,
    },
    errors: {
      heartRate: courseErrors["heartRate"],
      bloodPressure: courseErrors["bloodPressure"],
      diagnosis: courseErrors["diagnosis"],
    },
  };

  const [anesthesiaState, setAnesthesiaState] = useState<
    Record<string, Record<number, { isSelected: boolean; quantity: string }>>
  >({});

  const treatmentNoteSectionProps = {
    options: TREATMENT_NOTE_OPTIONS,
    selection: {
      checkedMap: checkedTreatmentNote,
      onToggleOption: (index: number, isSelected: boolean) =>
        setCheckedTreatmentNote((prev) => ({
          ...prev,
          [index]: isSelected,
        })),
    },
    form: {
      otherNote: treatmentNoteOther,
      onOtherNoteChange: setTreatmentNoteOther,
    },
    followUp: {
      option: TREATMENT_NOTE_FOLLOW_UP_OPTION,
      isSelected: isTreatmentNoteFollowUpSelected,
      onChange: setIsTreatmentNoteFollowUpSelected,
    },
    anesthesiaState: anesthesiaState,
    onAnesthesiaStateChange: setAnesthesiaState,
    errors: treatmentNoteErrors,
  };

  const dischargeNoteSectionProps = {
    options: DISCHARGE_NOTE_OPTIONS,
    selection: {
      checkedMap: checkedDischargeNote,
      onToggleOption: (index: number, isSelected: boolean) =>
        setCheckedDischargeNote((prev) => ({
          ...prev,
          [index]: isSelected,
        })),
    },
    schedule: {
      periodicCheckupMonth,
      onPeriodicCheckupMonthChange: setPeriodicCheckupMonth,
      appointmentDay,
      appointmentMonth,
      appointmentYear,
      onAppointmentDayChange: setAppointmentDay,
      onAppointmentMonthChange: setAppointmentMonth,
      onAppointmentYearChange: setAppointmentYear,
    },
    errors: {
      periodicCheckupMonth: dischargeErrors.periodicCheckupMonth,
      appointmentDay: dischargeErrors.appointmentDay,
      appointmentMonth: dischargeErrors.appointmentMonth,
      appointmentYear: dischargeErrors.appointmentYear,
    },
  };

  // Get active appontment
  useEffect(() => {
    if (!customerId) return;

    const fetchAppointmentInDayOfCustomer = async () => {
      try {
        const response = await rest.get(
          `/customer/${customerId}/appointment/in-day`,
        );

        const dentalChairBooked = {
          DentalChairId: prop(response, ...["data", "data", "DentalChairId"]),
          DentalChairCode: prop(
            response,
            ...["data", "data", "DentalChairCode"],
          ),
        };
        setDentalChairBooked(
          dentalChairBooked?.DentalChairId ? dentalChairBooked : null,
        );
      } catch {
        // DO NOTHING
      }
    };

    fetchAppointmentInDayOfCustomer();
  }, [customerId]);

  const renderSectionContent = (
    sectionKey: SectionKey,
    placeholder?: string,
  ) => {
    if (sectionKey === "admission") {
      return <AdmissionSection {...admissionSectionProps} />;
    }

    if (sectionKey === "progress") {
      return (
        <TreatmentProgressSection
          onChange={setTreatmentProgressPayload}
          errors={treatmentProgressErrors}
          dentalChairBooked={dentalChairBooked}
        />
      );
    }

    if (sectionKey === "course") {
      return <AdmissionSection {...courseSectionProps} />;
    }

    if (sectionKey === "treatmentNote") {
      return <TreatmentNoteSection {...treatmentNoteSectionProps} />;
    }

    if (sectionKey === "dischargeNote") {
      return <DischargeNoteSection {...dischargeNoteSectionProps} />;
    }

    return (
      <div className="rounded-2xl border border-dashed border-default-300 p-4 text-sm text-default-600">
        {placeholder}
      </div>
    );
  };

  // UI COMPONENT
  const Header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-foreground text-base font-medium tracking-[-0.02em]">
          Nhật ký điều trị
        </h2>
        <IconChevronRight size={20} className="text-default-500" />
        <h3 className="text-default-600 text-base font-medium tracking-[-0.02em]">
          Phiên điều trị
        </h3>
      </div>
      <Button variant="bordered" className="font-medium" onPress={onAction}>
        Quay lại
      </Button>
    </div>
  );

  // MAIN UI
  return (
    <div className="flex flex-col gap-5">
      {Header}
      <div className="flex flex-col">
        {SECTION_DEFINITIONS.map((section, index) => {
          return (
            <div key={section.key}>
              <SectionHeader
                index={index + 1}
                title={section.title}
                isOpen={openSections[section.key]}
                onToggle={() => toggleSection(section.key)}
                errors={saveErrors ? saveErrors[section.key] : null}
              />
              <AnimatedSectionContent
                isOpen={openSections[section.key]}
                className="ml-7.5 pl-4 pr-1 py-4 border-l border-default-300 border-dashed"
              >
                {renderSectionContent(section.key, section.placeholder)}
              </AnimatedSectionContent>
            </div>
          );
        })}
        <div className="flex justify-end border-t border-default-200 pt-5 mt-5">
          <Button
            color="primary"
            className="min-w-16 px-16 font-bold"
            onPress={handleSave}
          >
            Lưu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TreatmentDiaryCreate;
