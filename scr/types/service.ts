import type { UIEvent } from "react";



export type Service = {
  id: number;
  Code: string;
  Name: string;
  Plan: string;
  SalePrice: number;
  Tax: number;
  Category: string;
  Status: "active" | "paused";
  Description?: string;
  JsonData?: object;
  IsTax?: "0" | "1";
};

export type DetailStep = {
  ProgressName?: string;
  CompletedPrecentage?: number;
  MinimumDaysToNextStep?: number;
  KIMRevenueType?: number;
  KIMRevenueValue?: number;
  ClinicRevenueType?: number;
  ClinicRevenueValue?: number;
  ConsultingDoctorRevenueType?: number;
  ConsultingDoctorRevenueValue?: number;
  TreatmentDoctorRevenueType?: number;
  TreatmentDoctorRevenueValue?: number;
  AdvisorDoctorRevenueType?: number;
  AdvisorDoctorRevenueValue?: number;
  NursingDoctorRevenueType?: number;
  NursingDoctorRevenueValue?: number;
  IsApprovedNeeded?: number;
};
export type ServiceDetailData = {
  Service?: {
    ServiceName?: string;
    HISServiceCode?: string;
    SalePrice?: number;
    Tax?: string | number;
    Description?: string;
    ServiceGroupId?: string | number;
    notProcedureProgress?: string | number;
  };
  MedicalProcedure?: {
    MedicalProcedureName?: string;
    MedicalProcedure?: DetailStep[];
  };
};

export type ServiceDetailV2 = {
  AppliedDate: string;
  BasePrice: string;
  ClientGroupId: string;
  CompanyId: string;
  CreatedAt: string;
  CreatedBy: string;
  CreatedDate: string;
  Description: string | null;
  EditedAt: string;
  EditedBy: string;
  GeneralPhaseCount: string;
  GeneralityLevel: string | null;
  ImplantLevel: string | null;
  IndependentTreatmentUnitQuantity: string | null;
  InputWarrantyStep: string | null;
  IsApproved: string;
  IsReserved: string;
  IsSensitive: string;
  LanguageId: string;
  LatestUpdated: string;
  MedicalProcedure: DetailStep[];
  Name: string;
  NewServiceCode: string | null;
  ORCCategoryCode: string | null;
  ORCServiceCode: string | null;
  OrthodonticLevel: string | null;
  ProstheticLevel: string | null;
  SalePrice: string;
  ServiceCode: string;
  ServiceDomainId: string;
  ServiceDomainLevel: string | null;
  ServiceDomainType: string | null;
  ServiceDomain_Name: string;
  ServiceGroupId: string;
  ServiceGroup_NameVi: string;
  ServiceId: string;
  ServiceType: string;
  ServiceTypeId: string;
  Service_BasePrice: string;
  Service_SalePrice: string;
  Service_Tax: string;
  StartWarrantyStep: string | null;
  State: string;
  TaxAmount: string;
  IsTax?: 0 | 1;
};

export type SelectedServiceDetail = {
  service: Service;
  detail: ServiceDetailData | null;
} | null;

export type ServiceGroupItem = {
  ServiceGroupId: string;
  NameVi: string;
};

export type StepData = {
  stepName: string;
  treatmentPercent: number;
  daysToNextStep: number;
  companyRevenueType: string;
  companyRevenueValue: number;
  clinicRevenueType: string;
  clinicRevenueValue: number;
  doctorConsultantIncomeType: string;
  doctorConsultantIncomeValue: number;
  doctorTreatmentIncomeType: string;
  doctorTreatmentIncomeValue: number;
  doctorHTCMIncomeType: string;
  doctorHTCMIncomeValue: number;
  nurseIncomeType: string;
  nurseIncomeValue: number;
};

export type BasicInfoData = {
  serviceName: string;
  serviceCode: string;
  servicePrice: number;
  tax: number;
  serviceGroupId: string;
  serviceStatus?: number;
  serviceType: number;
  notes: string;
  // PermissionCode: string;
  // CurrentWorkProfilePositionId: number;
  // CurrentStaffId: number;
};

export type ServiceStatus = "active" | "paused";


export type ServiceFormData = {
  code: string;
  name: string;
  plan: string;
  price: string;
  tax: string;
  category: string;
  status: ServiceStatus;
  description: string;
};

export type StepSectionProps = {
  index: number;
  showRemove: boolean;
  stepData: StepData;
  onStepDataChange: (data: Partial<StepData>) => void;
  onRemove: () => void;
};

export type BasicInfoSectionProps = {
  hasTreatmentSteps: boolean;
  basicData: BasicInfoData;
  onToggleTreatmentSteps: (value: boolean) => void;
  serviceGroups: ServiceGroupItem[];
  onOpenServiceGroups: () => void;
  onLoadMoreServiceGroups: (event: UIEvent<HTMLElement>) => void;
  onBasicDataChange: (data: Partial<BasicInfoData>) => void;
};
