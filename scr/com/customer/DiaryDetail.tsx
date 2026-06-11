import {
  Checkbox,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import {
  COURSE_OPTIONS,
  DISCHARGE_NOTE_OPTIONS,
  TREATMENT_NOTE_FOLLOW_UP_OPTION,
} from "@/types/treatment";
import { useMemo } from "react";
import dayjs from "dayjs";

type DiseaseProgressionNote = {
  HeartRate: string;
  BloodPressure: string;
  Status: string;
  Diagnosis: string;
  Options: string[];
  OptionItems: Array<{ value: string; status: 0 | 1 }>;
};

type DiseaseProgressionOption = {
  value?: string;
  key?: number;
  status?: number;
  additions?: {
    value?: string | number;
    unit?: string;
    key?: number;
  }[];
};

type HospitalizationStatusView = {
  options: Array<{ value: string; status: 0 | 1 }>;
  heartRate: string;
  bloodPressure: string;
  statusDescription: string;
  diagnosis: string;
};

type TreatmentNoteOption = {
  value: string;
  key: number;
  status?: number | string;
  Diagnosis?: any;
};

type TreatmentNoteItem = {
  value: string;
  status: 0 | 1;
  diagnosis?: any;
};

type TreatmentNoteView = {
  optionItems: TreatmentNoteItem[];
  other: string;
  isPatientRinsingMouth: boolean;
  diagnosis?: any;
};

type DischargeNoteView = {
  optionItems: Array<{ value: string; status: 0 | 1 }>;
  other: string;
  appointmentDate: string;
};

type NextTimeTreatmentOption = {
  value: string;
  key: number;
  status?: number | string;
  additions?: {
    value: number | string;
    key: "{{months}}" | "{{day}}" | "{{year}}";
  }[];
};

type NextTimeTreatmentNote = {
  options?: NextTimeTreatmentOption[];
  Options?: string[];
  OptionData?: {
    HC12?: { date?: string };
    OTHER99999?: string;
    HC2?: string[];
    [key: string]: unknown;
  };
};

type TreatmentSessionDetail = {
  MedicalSessionId?: string;
  TreatmentId?: string;
  DiseaseProgressionNote?: unknown;
  NextTimeTreatmentNote?: unknown;
  HospitalizationStatus?: unknown;
  TreatmentNote?: unknown;
  OrderDetails?: any[];
};

type TreatmentProcedureRow = {
  name: string;
  position: string;
  time: string;
  quantity: string;
  procedure: string | null;
  doctor: string | null;
  technician: string | null;
};

function parseJSON<T>(value: unknown, fallback: T): T {
  try {
    if (typeof value === "string") {
      return JSON.parse(value) as T;
    }
    return (value as T) ?? fallback;
  } catch {
    return fallback;
  }
}

const layoutStyle = {
  title: "pl-4 text-base font-bold text-foreground",
};

const DIARY_CHECKBOX_CLASSNAMES = {
  base: "opacity-60",
  wrapper:
    "before:border-default-300 group-data-[selected=true]:before:border-primary group-data-[selected=true]:after:border-primary group-data-[selected=true]:after:bg-primary",
  icon: "text-white",
};

const COURSE_OPTION_LABELS: Record<string, string> = {
  DP0: COURSE_OPTIONS[0],
  DP1: COURSE_OPTIONS[1],
  DP2: COURSE_OPTIONS[3],
  DP3: COURSE_OPTIONS[4],
};

const COURSE_LABEL_TO_CODE: Record<string, string> = Object.entries(
  COURSE_OPTION_LABELS,
).reduce<Record<string, string>>((result, [code, label]) => {
  result[label] = code;
  return result;
}, {});

const LEGACY_DISCHARGE_LABELS: Record<string, string> = {
  HC9: DISCHARGE_NOTE_OPTIONS[0],
  HC10: DISCHARGE_NOTE_OPTIONS[1],
  HC11: DISCHARGE_NOTE_OPTIONS[2],
  HC12: DISCHARGE_NOTE_OPTIONS[4],
};

const TREATMENT_NOTE_ANESTHESIA_TITLES = [
  "Gây tê tại chỗ bằng",
  "Gây tê vùng bằng",
];

const TREATMENT_NOTE_ANESTHESIA_DRUGS = [
  "Lidocain 2%",
  "Mepivacaine 3% (Không Adrenaline)",
  "Articaine 4%",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatAppointmentDate(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(trimmed)
    ? trimmed.replace(" ", "T")
    : trimmed;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return trimmed;

  const hasTime = /(?:T|\s)\d{2}:\d{2}/.test(trimmed);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(hasTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function normalizeDiseaseProgression(value: unknown): DiseaseProgressionNote {
  const parsed = parseJSON<Record<string, unknown>>(value, {
    HeartRate: "",
    BloodPressure: "",
    Status: "",
    Diagnosis: "",
    Options: [],
  });

  const optionItemsMap = new Map<string, 0 | 1>();
  const nextOptions: string[] = Array.isArray(parsed.Options)
    ? parsed.Options.filter((item): item is string => typeof item === "string")
    : [];

  let heartRate = typeof parsed.HeartRate === "string" ? parsed.HeartRate : "";
  let bloodPressure =
    typeof parsed.BloodPressure === "string" ? parsed.BloodPressure : "";

  const optionList = Array.isArray(parsed.options)
    ? parsed.options.filter(
        (item): item is DiseaseProgressionOption =>
          isRecord(item) && typeof item.value === "string",
      )
    : [];

  nextOptions.forEach((code) => {
    const label = COURSE_OPTION_LABELS[code] || code;
    if (!optionItemsMap.has(label)) {
      optionItemsMap.set(label, 1);
    }
  });

  optionList.forEach((option) => {
    const optionValue = option.value?.trim();
    if (!optionValue) return;

    const status = Number(option.status) === 1 ? 1 : 0;
    const label = COURSE_OPTION_LABELS[optionValue] || optionValue;
    optionItemsMap.set(label, status);

    const optionCode = COURSE_LABEL_TO_CODE[label];
    if (status === 1 && optionCode && !nextOptions.includes(optionCode)) {
      nextOptions.push(optionCode);
    }

    if (label === "Nhập mạch & huyết áp" && status === 1) {
      const additions = Array.isArray(option.additions) ? option.additions : [];
      const heartRateAddition = additions.find((item) => item.key === 1)?.value;
      const bloodPressureAddition = additions.find(
        (item) => item.key === 2,
      )?.value;

      heartRate =
        heartRateAddition != null
          ? String(heartRateAddition).trim()
          : heartRate;
      bloodPressure =
        bloodPressureAddition != null
          ? String(bloodPressureAddition).trim()
          : bloodPressure;
    }
  });

  return {
    HeartRate: heartRate,
    BloodPressure: bloodPressure,
    Status:
      (typeof parsed.Status === "string" && parsed.Status) ||
      (typeof parsed.teethAndGumsDescrible === "string"
        ? parsed.teethAndGumsDescrible
        : ""),
    Diagnosis:
      (typeof parsed.Diagnosis === "string" && parsed.Diagnosis) ||
      (typeof parsed.diagnosis === "string" ? parsed.diagnosis : ""),
    Options: nextOptions,
    OptionItems: Array.from(optionItemsMap.entries()).map(
      ([value, status]) => ({
        value,
        status,
      }),
    ),
  };
}

function normalizeHospitalizationStatus(
  value: unknown,
): HospitalizationStatusView {
  const parsed = parseJSON<Record<string, unknown>>(value, {});

  const options = Array.isArray(parsed.options)
    ? parsed.options
        .filter(
          (item): item is DiseaseProgressionOption =>
            isRecord(item) && typeof item.value === "string",
        )
        .map((item) => ({
          value: item.value?.trim() || "",
          status: (Number(item.status) === 1 ? 1 : 0) as 0 | 1,
          additions: Array.isArray(item.additions) ? item.additions : [],
        }))
        .filter((item) => item.value)
    : [];

  const vitalOption = options.find(
    (item) => item.value === "Nhập mạch & huyết áp",
  );
  const heartRateAddition = vitalOption?.additions.find(
    (addition) => addition.key === 1,
  )?.value;
  const bloodPressureAddition = vitalOption?.additions.find(
    (addition) => addition.key === 2,
  )?.value;

  return {
    options: options.map(({ value, status }) => ({ value, status })),
    heartRate:
      heartRateAddition != null ? String(heartRateAddition).trim() : "",
    bloodPressure:
      bloodPressureAddition != null ? String(bloodPressureAddition).trim() : "",
    statusDescription:
      typeof parsed.teethAndGumsDescrible === "string"
        ? parsed.teethAndGumsDescrible
        : "",
    diagnosis: typeof parsed.diagnosis === "string" ? parsed.diagnosis : "",
  };
}

function renderHospitalizationStatus(note: HospitalizationStatusView) {
  const rows: React.ReactNode[] = [];

  note.options.forEach((item) => {
    rows.push(
      <div key={item.value} className="flex items-center gap-3">
        <Checkbox
          color="primary"
          classNames={DIARY_CHECKBOX_CLASSNAMES}
          isSelected={item.status === 1}
          isDisabled
          aria-label={item.value}
        />
        <p>{item.value}</p>
      </div>,
    );
  });

  if (note.heartRate || note.bloodPressure) {
    rows.push(
      <div key="hospital-vitals">
        <p>Mạch & Huyết áp</p>
        <div className="flex flex-col gap-4 pl-8 pt-3">
          {note.heartRate ? (
            <div className="flex gap-1 items-center">
              <span>Mạch:</span>
              <span className="font-bold!">{note.heartRate}</span>
              <span className="text-default-600!">lần/ph</span>
            </div>
          ) : null}
          {note.bloodPressure ? (
            <div className="flex gap-1 items-center">
              <span>Huyết áp:</span>
              <span className="font-bold!">{note.bloodPressure}</span>
              <span className="text-default-600!">mmHg</span>
            </div>
          ) : null}
        </div>
      </div>,
    );
  }

  if (note.statusDescription) {
    rows.push(
      <p key="hospital-status">
        Tình trạng răng nướu: {note.statusDescription}
      </p>,
    );
  }

  if (note.diagnosis) {
    rows.push(<p key="hospital-diagnosis">Chẩn đoán: {note.diagnosis}</p>);
  }

  if (rows.length === 0) {
    return <p>Không có dữ liệu</p>;
  }

  return rows;
}

type AnesthesiaDiagnosis = {
  label: string;
  quantity: string;
  isSelected: boolean;
};
interface MapValue {
  status: 0 | 1;
  diagnosis?: AnesthesiaDiagnosis[];
}
function normalizeTreatmentNote(value: unknown): TreatmentNoteView {
  const parsed = parseJSON<Record<string, unknown>>(value, {});

  const optionItemsMap = new Map<string, MapValue>();

  const newFormatOptions = Array.isArray(parsed.options)
    ? parsed.options.filter(
        (item): item is TreatmentNoteOption =>
          isRecord(item) && typeof item.value === "string",
      )
    : [];
  newFormatOptions.forEach((item) => {
    const label = item.value.trim();
    if (!label) return;

    const diagnosis: any[] = [];

    if (
      TREATMENT_NOTE_ANESTHESIA_TITLES.includes(label) &&
      Number(item.status) === 1 &&
      isRecord(item.Diagnosis)
    ) {
      Object.entries(item.Diagnosis).forEach(([key, val]) => {
        if (!isRecord(val)) return;
        const drugIndex = Number(key);

        const drugName = TREATMENT_NOTE_ANESTHESIA_DRUGS[drugIndex];
        if (!drugName) return;
        const quantity = typeof val.quantity === "string" ? val.quantity : "";
        const isSelected = val.isSelected === true;
        // const drugLabel = quantity ? `${drugName}: ${quantity} ống` : drugName;

        diagnosis.push({
          label: drugName,
          quantity,
          isSelected,
        });
      });
    }

    optionItemsMap.set(label, {
      status: Number(item.status) === 1 ? 1 : 0,
      ...(diagnosis?.length > 0
        ? {
            diagnosis,
          }
        : {}),
    });
  });

  const legacyProgress = normalizeDiseaseProgression(parsed);
  legacyProgress.OptionItems.forEach((item) => {
    if (!optionItemsMap.has(item.value)) {
      optionItemsMap.set(item.value, { status: item.status });
    }
  });

  const other =
    typeof parsed.other === "string"
      ? parsed.other
      : typeof parsed.OTHER99999 === "string"
        ? parsed.OTHER99999
        : "";

  return {
    optionItems: Array.from(optionItemsMap.entries()).map(([value, obj]) => ({
      value,
      status: obj?.status,
      diagnosis: obj?.diagnosis,
    })),
    other,
    isPatientRinsingMouth: Boolean(parsed.isPatientRinsingMouth),
  };
}

function normalizeDischargeNote(value: unknown): DischargeNoteView {
  const parsed = parseJSON<NextTimeTreatmentNote>(value, {});
  const optionItemsMap = new Map<string, 0 | 1>();
  let appointmentDate = "";

  if (Array.isArray(parsed.options)) {
    parsed.options.forEach((item) => {
      if (!isRecord(item) || typeof item.value !== "string") return;

      const status = Number(item.status) === 1 ? 1 : 0;

      const additions = Array.isArray(item.additions) ? item.additions : [];
      if (item.value.startsWith("Tái khám định kỳ mỗi")) {
        // optionItemsMap.set(DISCHARGE_NOTE_OPTIONS[3], status);
        if (status !== 1) return;
        const month = additions.find((entry) => entry.key === "{{months}}");
        optionItemsMap.set(
          `Tái khám định kỳ mỗi: ${month?.value ?? "0"} tháng`,
          1,
        );
        return;
      }

      if (item.value.startsWith("Hẹn ngày")) {
        optionItemsMap.set(DISCHARGE_NOTE_OPTIONS[4], status);
        if (status !== 1) return;
        const day = additions.find((entry) => entry.key === "{{day}}")?.value;
        const month = additions.find(
          (entry) => entry.key === "{{months}}",
        )?.value;

        const year = additions.find((entry) => entry.key === "{{year}}")?.value;
        appointmentDate = [day, month, year].filter(Boolean).join("/");
        return;
      }

      optionItemsMap.set(item.value.trim(), status);
    });
  }

  if (Array.isArray(parsed.Options)) {
    parsed.Options.forEach((code) => {
      if (typeof code !== "string") return;
      const label = LEGACY_DISCHARGE_LABELS[code] || code;
      optionItemsMap.set(label, 1);
    });
  }

  if (!appointmentDate) {
    const rawDate = isRecord(parsed.OptionData?.HC12)
      ? parsed.OptionData?.HC12?.date
      : undefined;
    appointmentDate = typeof rawDate === "string" ? rawDate : "";
  }

  const appointmentDisplay = formatAppointmentDate(appointmentDate);
  if (
    appointmentDisplay &&
    optionItemsMap.get(DISCHARGE_NOTE_OPTIONS[4]) === 1
  ) {
    optionItemsMap.delete(DISCHARGE_NOTE_OPTIONS[4]);
    optionItemsMap.set(`Hẹn ngày: ${appointmentDisplay}`, 1);
  }

  return {
    optionItems: Array.from(optionItemsMap.entries()).map(
      ([value, status]) => ({
        value,
        status,
      }),
    ),
    other:
      typeof parsed.OptionData?.OTHER99999 === "string"
        ? parsed.OptionData.OTHER99999
        : "",
    appointmentDate,
  };
}

function renderStatusCheckboxList(
  items: Array<{ value: string; status: 0 | 1 }>,
) {
  return items.map((item) => (
    <div key={item.value} className="flex items-center gap-3">
      <Checkbox
        color="primary"
        classNames={DIARY_CHECKBOX_CLASSNAMES}
        isSelected={item.status === 1}
        isDisabled
        aria-label={item.value}
      />
      <p>{item.value}</p>
    </div>
  ));
}

function renderTreatmentNote(note: TreatmentNoteView) {
  const rows: React.ReactNode[] = [];

  const regularItems = note.optionItems.filter((item) => {
    if (TREATMENT_NOTE_ANESTHESIA_TITLES.includes(item.value)) return false;

    return !TREATMENT_NOTE_ANESTHESIA_DRUGS.some(
      (drugName) =>
        item.value === drugName ||
        item.value.startsWith(`${drugName}:`) ||
        item.value.startsWith(`${drugName} -`),
    );
  });

  rows.push(...renderStatusCheckboxList(regularItems));

  TREATMENT_NOTE_ANESTHESIA_TITLES.forEach((title) => {
    const parentItem = note.optionItems.find((item) => item.value === title);
    if (!parentItem) return;

    rows.push(
      <div key={title} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Checkbox
            classNames={DIARY_CHECKBOX_CLASSNAMES}
            isSelected={parentItem.status === 1}
            isDisabled
            aria-label={title}
          />
          <p className="font-semibold">{title}</p>
        </div>

        {parentItem.status === 1 ? (
          <div className="pl-11 flex flex-col">
            {TREATMENT_NOTE_ANESTHESIA_DRUGS.map((drugName, drugIndex) => {
              const drugDiagnosis = parentItem.diagnosis?.find(
                (item: any) => item.label === drugName,
              );

              const quantity = drugDiagnosis?.quantity ?? "";
              const isSelected = drugDiagnosis?.isSelected ?? false;

              return (
                <div
                  key={`${title}-${drugName}`}
                  className={`flex items-center justify-between gap-4 py-2 pr-15 ${
                    drugIndex !== TREATMENT_NOTE_ANESTHESIA_DRUGS.length - 1
                      ? "border-b border-default-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      color="primary"
                      classNames={DIARY_CHECKBOX_CLASSNAMES}
                      isSelected={isSelected}
                      isDisabled
                      aria-label={`${title}-${drugName}`}
                    />
                    <p>{drugName}</p>
                  </div>

                  <div className="flex h-10 w-32 shrink-0 items-center overflow-hidden rounded-xl border border-default-300 bg-default-50">
                    <div className="flex h-full w-full items-center justify-center bg-white px-5 text-base font-semibold text-[#6D8197]">
                      {quantity || "___"}
                    </div>
                    <span className="flex h-full items-center border-l border-default-300 px-3 text-base font-medium text-[#6D8197]">
                      ống
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>,
    );
  });

  if (note.other) {
    rows.push(<p key="treatment-note-other">Ghi chú: {note.other}</p>);
  }

  if (note.isPatientRinsingMouth) {
    rows.push(
      <p key="treatment-note-followup">{TREATMENT_NOTE_FOLLOW_UP_OPTION}</p>,
    );
  }

  if (rows.length === 0) {
    return <p>Không có ghi chú điều trị</p>;
  }

  return rows;
}

function renderDiseaseProgression(note: DiseaseProgressionNote) {
  const rows: React.ReactNode[] = [];

  rows.push(...renderStatusCheckboxList(note.OptionItems));

  if (note.HeartRate || note.BloodPressure) {
    rows.push(
      <div key="vitals">
        <p>Mạch & Huyết áp</p>
        <div className="flex flex-col gap-4 pl-5 pt-3">
          {note.HeartRate ? (
            <div className="flex gap-1 items-center">
              <span>Mạch:</span>
              <span className="font-bold!">{note.HeartRate}</span>
              <span className="text-default-600!">lần/ph</span>
            </div>
          ) : null}
          {note.BloodPressure ? (
            <div className="flex gap-1 items-center">
              <span>Huyết áp:</span>
              <span className="font-bold!">{note.BloodPressure}</span>
              <span className="text-default-600!">mmHg</span>
            </div>
          ) : null}
        </div>
      </div>,
    );
  }

  if (note.Status) {
    rows.push(<p key="status">Tình trạng răng nướu: {note.Status}</p>);
  }
  if (note.Diagnosis) {
    rows.push(<p key="diagnosis">Chẩn đoán: {note.Diagnosis}</p>);
  }

  if (rows.length === 0) {
    return <p>Không có dữ liệu</p>;
  }

  return rows;
}

interface ProcessTableProps {
  data: TreatmentProcedureRow[];
}

const ProcessTable = ({ data }: ProcessTableProps) => {
  return (
    <Table
      aria-label="table process"
      layout="fixed"
      shadow="none"
      radius="none"
      classNames={{
        base: "p-0 rounded-2xl border-1 border-default-400",
        wrapper: "p-0 rounded-2xl",
        th: "bg-default-100 px-1",
        td: "px-1 w-full",
      }}
    >
      <TableHeader>
        <TableColumn width={"5%"} align="center">
          #
        </TableColumn>
        <TableColumn width={"22%"} align="start">
          Dịch vụ
        </TableColumn>
        <TableColumn width={"6%"} align="center">
          Vị trí
        </TableColumn>
        <TableColumn width={"10%"} align="center">
          Số lượng
        </TableColumn>
        <TableColumn width={"15%"} align="center">
          Tiến trình
        </TableColumn>
        <TableColumn width={"17.5%"} align="center">
          Bác sĩ
        </TableColumn>
        <TableColumn width={"17.5%"} align="center">
          Kỹ thuật viên
        </TableColumn>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <p className="font-medium text-base text-wrap">{item.name}</p>
                <p className="font-medium text-xs text-default-600 text-wrap">
                  {item.time}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div className="rounded-md items-center justify-center bg-primary-200 font-semibold text-xs py-1 px-0 text-nowrap">
                <span className="text-xs font-semibold text-center">
                  {item.position === "Cả hai hàm"
                    ? "CH"
                    : item.position === "Hàm trên"
                      ? "HT"
                      : item.position === "Hàm dưới"
                        ? "HD"
                        : item.position}
                </span>
              </div>
            </TableCell>
            <TableCell>{item?.quantity}</TableCell>
            <TableCell>
              <div className="min-h-8 flex items-center gap-1 py-1 px-4 border border-default-400 rounded-3xl ">
                <p className="text-xs font-semibold text-start line-clamp-1">
                  {item.procedure}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div className="min-h-8 flex items-center gap-1 py-1 px-4 border border-default-400 rounded-3xl ">
                <p className="text-xs font-semibold text-start line-clamp-1">
                  {item.doctor}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div className="min-h-8 flex items-center gap-1 py-1 px-4 border border-default-400 rounded-3xl ">
                <p className="text-xs font-semibold text-start line-clamp-1">
                  {item.technician}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

interface DiaryDetailProps {
  detail: any;
}

const DiaryDetail = ({ detail }: DiaryDetailProps) => {
  const datas = useMemo(() => {
    const raw = parseJSON<TreatmentSessionDetail>(detail, {});

    // tình trạng vào viện
    const hospitalizationStatus = normalizeHospitalizationStatus(
      raw.HospitalizationStatus,
    );
    // diễn biến bệnh
    const courseProgress = normalizeDiseaseProgression(
      raw.DiseaseProgressionNote,
    );
    // ghi chú điều trị (Y lệnh điều trị)
    const treatmentNote = normalizeTreatmentNote(raw.TreatmentNote);
    // ghi chú ra viện (Y lệnh ra viện)
    const dischargeNote = normalizeDischargeNote(raw.NextTimeTreatmentNote);
    // tiến trình điều trị
    const treatmentProcedureProgress = Array.isArray(raw.OrderDetails)
      ? raw.OrderDetails
      : [];

    const processRows = treatmentProcedureProgress.map<TreatmentProcedureRow>(
      (item: any) => {
        return {
          name: item?.ServiceName,
          position: item?.AnatomyBodyPartItemName || "-",
          time: dayjs(detail?.TreatmentTime).format("HH:mm DD/MM/YYYY"),
          quantity: item?.Quantity || "-",
          procedure: item?.ProcedureProgress?.ProgressName || null,
          doctor:
            item?.Staffs?.find((staff: any) => {
              return staff?.TreatmentRoleId == 2;
            })?.StaffInfo?.user_info?.name || "-",
          technician:
            item?.Staffs?.find((staff: any) => {
              return staff?.TreatmentRoleId == 10;
            })?.StaffInfo?.user_info?.name || "-",
        };
      },
    );

    return {
      hospitalizationStatus,
      courseProgress,
      treatmentNote,
      dischargeNote,
      processRows,
      medicalSessionId: raw.MedicalSessionId || "",
      treatmentId: raw.TreatmentId || "",
    };
  }, [detail]);

  return (
    <div className="flex flex-col gap-7 px-4 pt-4 pb-1">
      <div className="flex flex-col gap-4">
        <p className={layoutStyle.title}>Tình trạng vào viện</p>
        <div className="table-diary">
          {renderHospitalizationStatus(datas.hospitalizationStatus)}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p className={layoutStyle.title}>Tiến trình điều trị</p>
        <div className="flex pl-4 gap-3">
          <Chip
            radius="full"
            size="lg"
            variant="bordered"
            classNames={{
              content: "font-bold text-[13px] text-foreground",
              base: "border-default-400",
            }}
          >
            Điều trị #{datas.treatmentId || "-"}
          </Chip>

          <Chip
            radius="full"
            size="lg"
            variant="bordered"
            classNames={{
              content: "font-bold text-[13px] text-foreground",
              base: "border-default-400",
            }}
          >
            Phiên #{datas.medicalSessionId || "-"}
          </Chip>
        </div>

        {datas.processRows.length > 0 ? (
          <ProcessTable data={datas.processRows} />
        ) : (
          <div className="rounded-2xl border border-default-300 p-3 text-sm text-default-500">
            Không có tiến trình điều trị
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <p className={layoutStyle.title}>Diễn biến bệnh</p>
        <div className="table-diary">
          {renderDiseaseProgression(datas.courseProgress)}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p className={layoutStyle.title}>Ghi chú điều trị (Y lệnh điều trị)</p>
        <div className="table-diary">
          {renderTreatmentNote(datas.treatmentNote)}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p className={layoutStyle.title}>Ghi chú ra viện (Y lệnh ra viện)</p>
        <div className="table-diary">
          {renderStatusCheckboxList(datas.dischargeNote.optionItems)}
          {datas.dischargeNote.other ? (
            <p>Ghi chú: {datas.dischargeNote.other}</p>
          ) : null}
          {datas.dischargeNote.optionItems.length === 0 &&
          !datas.dischargeNote.other &&
          !datas.dischargeNote.appointmentDate ? (
            <p>Không có ghi chú ra viện</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DiaryDetail;
