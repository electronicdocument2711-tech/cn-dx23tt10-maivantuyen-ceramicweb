import {
  Button,
  Input,
  Select as _Select,
  SelectItem as _SelectItem,
} from "@heroui/react";
import {
  percentOptions as _percentOptions,
  fieldClassNames,
} from "@/lib/serviceConstants";
import type { StepSectionProps } from "@/types/service";

export const StepSection = ({
  index,
  showRemove,
  stepData,
  onStepDataChange,
  onRemove,
}: StepSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <div className="inline-flex items-center rounded bg-blue-500 text-white text-xs font-semibold px-3 py-1">
        Bước tiến trình {index + 1}
      </div>
      {showRemove && (
        <Button variant="light" color="danger" onPress={onRemove}>
          Xóa bước
        </Button>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Tên bước tiến trình"
        labelPlacement="outside-left"
        size="lg"
        classNames={fieldClassNames}
        isRequired
        value={stepData.stepName}
        onChange={(e) => onStepDataChange({ stepName: e.target.value })}
      />
      <Input
        label="Phần trăm điều trị"
        labelPlacement="outside-left"
        size="lg"
        min={0}
        classNames={fieldClassNames}
        placeholder={index === 0 ? "100" : "0"}
        type="number"
        value={String(stepData.treatmentPercent)}
        onChange={(e) =>
          onStepDataChange({ treatmentPercent: Number(e.target.value) || 0 })
        }
      />

      <Input
        label="Số ngày đến bước tiếp theo"
        labelPlacement="outside-left"
        size="lg"
        classNames={fieldClassNames}
        isRequired
        placeholder="0"
        type="number"
        min={0}
        value={String(stepData.daysToNextStep)}
        onChange={(e) =>
          onStepDataChange({ daysToNextStep: Number(e.target.value) || 0 })
        }
      />

      {/* RevenueField component bị comment ở dưới hãy mở comment ra nếu cần sử dụng */}
      {/* <RevenueField
        label="Doanh thu công ty"
        defaultType="Phần trăm"
        typeValue={stepData.companyRevenueType}
        amountValue={stepData.companyRevenueValue}
        onChange={(value) =>
          onStepDataChange({ companyRevenueType: value })
        }
        onAmountChange={(value) =>
          onStepDataChange({ companyRevenueValue: Number(value) || 0 })
        }
        placeholder={index === 0 ? "100" : "0"}
      /> */}

      {/* <RevenueField
        label="Doanh thu phòng khám"
        defaultType="Phần trăm"
        typeValue={stepData.clinicRevenueType}
        amountValue={stepData.clinicRevenueValue}
        onChange={(value) =>
          onStepDataChange({ clinicRevenueType: value })
        }
        onAmountChange={(value) =>
          onStepDataChange({ clinicRevenueValue: Number(value) || 0 })
        }
        placeholder={index === 0 ? "100" : "0"}
      /> */}

      {/* <RevenueField
        label="Thu nhập BS Tư vấn"
        defaultType="Số tiền"
        typeValue={stepData.doctorConsultantIncomeType}
        amountValue={stepData.doctorConsultantIncomeValue}
        onChange={(value) =>
          onStepDataChange({ doctorConsultantIncomeType: value })
        }
        onAmountChange={(value) =>
          onStepDataChange({ doctorConsultantIncomeValue: Number(value) || 0 })
        }
        placeholder="0"
      /> */}

      {/* <RevenueField
        label="Thu nhập BS Điều trị"
        defaultType="Số tiền"
        typeValue={stepData.doctorTreatmentIncomeType}
        amountValue={stepData.doctorTreatmentIncomeValue}
        onChange={(value) =>
          onStepDataChange({ doctorTreatmentIncomeType: value })
        }
        onAmountChange={(value) =>
          onStepDataChange({ doctorTreatmentIncomeValue: Number(value) || 0 })
        }
        placeholder="0"
      /> */}

      {/* <RevenueField
        label="Thu nhập BS HTCM"
        defaultType="Số tiền"
        typeValue={stepData.doctorHTCMIncomeType}
        amountValue={stepData.doctorHTCMIncomeValue}
        onChange={(value) =>
          onStepDataChange({ doctorHTCMIncomeType: value })
        }
        onAmountChange={(value) =>
          onStepDataChange({ doctorHTCMIncomeValue: Number(value) || 0 })
        }
        placeholder="0"
      /> */}

      {/* <RevenueField
        label="Thu nhập điều dưỡng"
        defaultType="Số tiền"
        typeValue={stepData.nurseIncomeType}
        amountValue={stepData.nurseIncomeValue}
        onChange={(value) =>
          onStepDataChange({ nurseIncomeType: value })
        }
        onAmountChange={(value) =>
          onStepDataChange({ nurseIncomeValue: Number(value) || 0 })
        }
        placeholder="0"
      /> */}
    </div>
  </div>
);

// type RevenueFieldProps = {
//   label: string;
//   defaultType: string;
//   typeValue: string;
//   amountValue: number;
//   onChange: (value: string) => void;
//   onAmountChange: (value: string) => void;
//   placeholder: string;
// };

// const formatThousands = (value: string) =>
//   value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// const RevenueField = ({
//   label,
//   defaultType,
//   typeValue,
//   amountValue,
//   onChange,
//   onAmountChange,
//   placeholder,
// }: RevenueFieldProps) => {
//   const isMoneyType = defaultType === "Số tiền";

//   const handleAmountInputChange = (value: string) => {
//     if (!isMoneyType) {
//       onAmountChange(value);
//       return;
//     }

//     const numericValue = value.replace(/\D/g, "");
//     onAmountChange(numericValue);
//   };

//   const displayValue = isMoneyType
//     ? formatThousands(String(amountValue || 0).replace(/\D/g, ""))
//     : String(amountValue ?? 0);

//   return (
//     <div className="grid grid-cols-[360px_1fr] gap-3">
//       <Select
//         label={label}
//         labelPlacement="outside-left"
//         size="lg"
//         isRequired
//         isDisabled
//         placeholder="Phần trăm"
//         classNames={{
//           ...fieldClassNames,
//           base: "opacity-100",
//           label: `${fieldClassNames.label} opacity-100`,
//           value: "opacity-100",
//         }}
//         selectedKeys={[typeValue || defaultType]}
//         onChange={(e) => onChange(e.target.value)}
//       >
//         {percentOptions.map((opt) => (
//           <SelectItem key={opt}>{opt}</SelectItem>
//         ))}
//       </Select>
//       <Input
//         label=""
//         placeholder={placeholder}
//         type={isMoneyType ? "text" : "number"}
//         inputMode={isMoneyType ? "numeric" : undefined}
//         value={displayValue}
//         size="lg"
//         classNames={fieldClassNames}
//         onChange={(e) => handleAmountInputChange(e.target.value)}
//       />
//     </div>
//   );
// };
