export const percentOptions = ["Phần trăm", "Số tiền"];

export const percentValues: Record<string, number> = {
  "Phần trăm": 2,
  "Số tiền": 1,
};

export const fieldClassNames = {
  label: "w-40 text-right pr-4 text-md",
  inputWrapper: "bg-gray-50 w-full border border-gray-300",
  mainWrapper: "flex-1",
};

export const SERVICE_GROUP_LIMIT = 20;

export const INITIAL_STEP_DATA = {
  stepName: "",
  treatmentPercent: 0,
  daysToNextStep: 0,
  companyRevenueType: "Phần trăm",
  companyRevenueValue: 100,
  clinicRevenueType: "Phần trăm",
  clinicRevenueValue: 100,
  doctorConsultantIncomeType: "Số tiền",
  doctorConsultantIncomeValue: 0,
  doctorTreatmentIncomeType: "Số tiền",
  doctorTreatmentIncomeValue: 0,
  doctorHTCMIncomeType: "Số tiền",
  doctorHTCMIncomeValue: 0,
  nurseIncomeType: "Số tiền",
  nurseIncomeValue: 0,
};

export const INITIAL_BASIC_INFO = {
  serviceName: "",
  serviceCode: "",
  servicePrice: 0,
  tax: -1,
  serviceGroupId: "",
  serviceType: 1,
  notes: "",
  // PermissionCode: "service-management",
  // CurrentWorkProfilePositionId: 448,
  // CurrentStaffId: 45,
};
