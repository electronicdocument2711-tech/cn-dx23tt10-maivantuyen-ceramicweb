import { Checkbox, Textarea } from "@heroui/react";
import VitalInput from "./VitalInput";

interface AdmissionSectionSelectionProps {
  checkedMap: Record<number, boolean>;
  onToggleOption: (index: number, isSelected: boolean) => void;
}

interface AdmissionSectionFormProps {
  statusDescription: string;
  diagnosis: string;
  heartRate: string;
  bloodPressure: string;
  onStatusDescriptionChange: (value: string) => void;
  onDiagnosisChange: (value: string) => void;
  onHeartRateChange: (value: string) => void;
  onBloodPressureChange: (value: string) => void;
}

interface AdmissionSectionErrorProps {
  heartRate?: string;
  bloodPressure?: string;
  diagnosis?: string;
}

interface AdmissionSectionProps {
  options: string[];
  selection: AdmissionSectionSelectionProps;
  form: AdmissionSectionFormProps;
  errors?: AdmissionSectionErrorProps;
}

const TEXTAREA_WRAPPER_CLASS =
  "rounded-2xl bg-[#F3F3F4] !border-transparent !shadow-none data-[hover=true]:!border-transparent data-[hover=true]:!shadow-none group-data-[hover=true]:!border-transparent group-data-[hover=true]:!shadow-none group-data-[focus=true]:!border-transparent group-data-[focus=true]:!shadow-none group-data-[focus-visible=true]:!border-transparent group-data-[focus-visible=true]:!ring-0";

const AdmissionSection: React.FC<AdmissionSectionProps> = ({
  options,
  selection,
  form,
  errors,
}) => {
  const { checkedMap, onToggleOption } = selection;
  const {
    statusDescription,
    onStatusDescriptionChange,
    diagnosis,
    onDiagnosisChange,
    heartRate,
    onHeartRateChange,
    bloodPressure,
    onBloodPressureChange,
  } = form;
  const {
    heartRate: errorHeartRate,
    bloodPressure: errorBloodPressure,
    diagnosis: errorDiagnosis,
  } = errors ?? {};

  const vitalOptionIndex = options.findIndex(
    (option) => option === "Nhập Mạch & Huyết áp",
  );
  const showVitalInputs =
    vitalOptionIndex >= 0 && Boolean(checkedMap[vitalOptionIndex]);

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-default-300">
        {options.map((option, index) => (
          <div
            key={option}
            className={`px-4 py-3 ${
              index !== options.length - 1 ? "border-b border-default-200" : ""
            }`}
          >
            <Checkbox
              isSelected={checkedMap[index] ?? false}
              onValueChange={(isSelected) => onToggleOption(index, isSelected)}
            >
              <span className="text-foreground text-base font-medium">
                {option}
              </span>
            </Checkbox>

            {option === "Nhập Mạch & Huyết áp" && showVitalInputs && (
              <div className="mt-4 flex flex-wrap gap-4 pl-8 pb-2">
                <VitalInput
                  value={heartRate}
                  onChange={onHeartRateChange}
                  placeholder="Mạch"
                  unit="lần/ph"
                  error={errorHeartRate}
                />
                <VitalInput
                  value={bloodPressure}
                  onChange={onBloodPressureChange}
                  placeholder="Huyết áp"
                  unit="mmHg"
                  error={errorBloodPressure}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-foreground text-base font-medium">
          Mô tả tình trạng răng nướu
        </p>
        <Textarea
          value={statusDescription}
          onChange={(event) => onStatusDescriptionChange(event.target.value)}
          placeholder="Nhập mô tả"
          minRows={2}
          variant="bordered"
          classNames={{
            inputWrapper: TEXTAREA_WRAPPER_CLASS,
            input: "text-base placeholder:text-[#7A8593]",
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-foreground text-base font-medium">
          Chẩn đoán <span className="text-danger">*</span>
        </p>
        <Textarea
          value={diagnosis}
          onChange={(event) => onDiagnosisChange(event.target.value)}
          placeholder="Nhập chẩn đoán"
          minRows={2}
          variant="bordered"
          classNames={{
            inputWrapper: `${TEXTAREA_WRAPPER_CLASS} ${
              errorDiagnosis ? "!border-gray" : ""
            }`,
            input: "text-base placeholder:text-[#7A8593]",
          }}
        />
        {errorDiagnosis && (
          <span className="text-xs font-medium text-danger">
            {errorDiagnosis}
          </span>
        )}
      </div>
    </div>
  );
};

export default AdmissionSection;
