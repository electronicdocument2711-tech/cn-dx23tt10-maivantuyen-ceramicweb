export interface OrgWorkProfile {
  OrgWorkProfileId: number;
  WorkProfileId: number;
  OrgId: number;
  Status: number;
  PosistionType: number;
  FromDate: Date;
  ToDate: Date;
  WorkProfilePositionId: number;
  StaffId: number;
  UserId: number;
  AliasWorkProfilePositionName: string;
  WorkProfilePositionName: string;
  IsJWT: number;
  work_profile_position: WorkProfilePosition;
  org: Org;
}

export interface Org {
  OrgId: number;
  ClientGroupId: number;
  OrgCode: string;
  OrgName: string;
  CompanyId: number;
  ParentId: number;
  DefaultBranchId: null;
  NumAnnualLeaveTraining: number;
  IsViewAllBranch: number;
  IsTimekeeping: number;
  IsActive: number;
  PosLeft: number;
  PosRight: number;
  RoleCode: null;
  CreatedDate: Date;
  CreatedStaffId: number;
  UpdatedDate: Date;
  UpdatedStaffId: number;
  ParentDeleteOrgId: null;
  Level: null;
  BranchId: null;
  BranchName: null;
  BranchCode: null;
}

export interface WorkProfilePosition {
  WorkProfilePositionId: number;
  Name: string;
  Code: string;
  Ordering: number;
  State: number;
  GroupCode: string;
  ClientGroupId: number;
  CreatedBy: null;
  CreatedDate: Date;
  UpdatedBy: number;
  UpdatedDate: Date;
}

// Doctor Type Definition
export type StaffType = "Bác sĩ" | "Y tá/Phụ tá" | "Trợ lý/Tư vấn viên";

export interface BusinessRole {
  name: string;
  ordering: number;
}

export interface StaffDraft {
  name: string;
  email: string;
  phone: string;
  position: string;
}

export type Doctor = {
  email?: string;
  phone?: string;
  status?: "active" | "inactive" | "pending";
  address?: string;
  joinAt?: string;
  invitationSentAt?: string;
  title?: StaffType;
  DoctorId?: string;
  StaffId?: string;
  StaffCode?: string;
  FullName?: string;
};

export type Room = {
  id: number;
  code: string;
  branch: string;
  used: boolean;
  action: boolean;
};

export type Service = {
  name: string;
  NameEn: string;
  NameVi: string;
  disc: string;
  status: string;
  ServiceGroupId: string;
};

export type Consumable = {
  name: string;
  disc: string;
  status: string;
};

export interface Customer {
  CustomerId: string;
  CustomerCode: string;
  FullName: string;
  Gender?: string;
  Age?: string;
  EmotionalState: string | null;
  Photo?: any;
  PersonId?: string;
  CustomerStatusId?: string;
  Status?: null | string;
  PaidAmount?: null | string;
  TotalRow?: string;
  TotalPage?: string;
  PhoneNumbers?: string[];
  Emails?: EmailElement[] | string[];
  Languages?: null;
  ServiceGroup?: ServiceGroup[];
  Appointment?: any[] | Appointment;
  AppointmentRecent?: any[] | Appointment;
  Address?: string;
  CustomerIdNumber?: string;
  CreatedAt?: string;
  Birthday?: string;
  PercentProfile?: string;
  Note?: string | string[];
  EthnicId?: string;
  HealthInsuranceType?: string;
  HealthInsuranceNumber?: null;
  JobName?: string;
  CompanyAddress?: string;
  UrgentContactName?: string;
  UrgentContactPhone?: string;
  UrgentContactAddress?: string;
  ClientGroupId?: string;
  CustomerSourceId?: null;
  CustomerSourceName?: null;
  Type?: string;
  CustomerTypeId?: string;
  Channel?: null;
  CustomerChannelId?: null;
  Country?: string;
  CountryId?: string;
  Province?: string;
  LabelProvince?: string;
  VnProvinceId?: string;
  District?: string;
  LabelDistrict?: string;
  VnDistrictId?: string;
  Ward?: string;
  LabelWard?: string;
  VnWardId?: string;
  CustomerLevelId?: null;
  CustomerPattern?: null;
  LevelName?: null;
  LevelCode?: null;
  EthnicName?: string;
  PhoneNumberIsMain?: PhoneNumberIsMain[];
  isStaff?: number;
  isStaffRelationship?: number;
  Relationships?: any[];
  CustomerType?: boolean;
  CustomerAppUsing?: null;
  FollowingByStaff?: FollowingByStaff[];
}

export interface FollowingByStaff {
  StaffId: string;
  FullName: string;
  StaffCode: string;
}

export interface PhoneNumberIsMain {
  PhoneNumbers: string;
  IsMain: string;
}

export interface EmailElement {
  Email: string;
  IsPrimary?: string;
}

export interface ServiceGroup {
  CustomerId: string;
  ServiceGroup_NameVi: string;
  ServiceDomain_Name: string;
  ClientGroupId: string;
}

export interface Branch {
  CompanyId?: string;
  Company_NameVi?: string;
  Company_NameEn?: string;
  BranchId?: string;
  Name?: string;
  BranchCode?: string;
  Address?: string;
  ExcludeReport?: string;
  ClientGroupId?: string;
  Phone?: string;
  License?: BranchLicense[];
}

export interface BranchLicense {
  file: LicenseFile;
  status: LicenseStatus;
}

export interface LicenseFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadAt: string;
}

export type LicenseStatus = "valid" | "expired" | "pending";

export interface AppointmentRecord {
  StartTime: string;
  EndTime: string;
  Total: number;
  Data: Appointment[] | [];
}

export interface Appointment {
  AppointmentId: string;
  Note: null | string;
  FromCustomerChannel: string;
  AppointmentStatusId: string;
  AppointmentStatusNote: null | string;
  CustomerId: string;
  CreatedAt: string;
  CreatedBy: string;
  EditedAt: string;
  EditedBy: string;
  StartAt: string;
  EndAt: string;
  AppointedTo: string;
  RelatedTo: null | string;
  AtBranchId: string;
  AppIdKIM: string;
  BranchIdBackup: null | string;
  NoteBackup: null | string;
  ConsultantId: null | string;
  CampaignTypeCode: string;
  CampaignCode: null | string;
  SourceId: null | string;
  MasterSourceId: null | string;
  AppChannelId: string;
  ChannelPlatformId: null | string;
  LatestUpdated: Date | null;
  ClientGroupId: string;
  UpdatedBy: string;
  UpdatedAt: string;
  CreatedById: string;
  AppointmentStatus: string;
  AppointmentType: AppointmentType[];
  StaffId: string;
  AppointedToName: string;
  Complaint: null | string;
  AtBranchName: string;
  AtBranchCode: string;
  AppointmentLabel_Name?: string;
  AppointmentStatus_Name?: string;
  Doctor?: { [key: string]: null | string }[];
  DoctorId?: null | string;
  BranchCode?: string;
  BranchName?: string;
  Branch: { Id: string; Name: string };
  Customer: { Name: string; Id: string };
  doctor: {
    id: number;
    documentId: string;
    name: string;
    avatar: {
      documentId: string;
      formats: {
        thumbnail: any;
      };
      id: 92;
      url: string;
    };
  };
}

export interface AppointmentPreview {
  AppointmentId?: string;
  AppointedToName?: string;
  AppointedTo?: string;
  DoctorName?: string;
  Note?: string;
  StartAt?: string | number;
  EndAt?: string | number;
  StartTime?: string;
  EndTime?: string;
  Customer?: {
    Name?: string;
    Id?: string;
    Code?: string;
    Photo?: string;
    Gender?: string;
    PhoneNumbers?: string[];
  };
  AppointmentStatus?: {
    Id?: number;
    Label?: string;
    Name?: string;
  };
  AppointmentType?: {
    AppointmentLabelId?: string;
    Name?: string;
    Color?: string;
    Ordering?: string;
  }[];

  CustomerName?: string;
  CustomerId?: string;
  CustomerCode?: string;
}

export interface AppointmentType {
  AppointmentLabelId?: string | null;
  Name?: string | null;
  Color?: string | null;
  Ordering?: string | null;
}

export interface ApStatus {
  AppointmentStatusId: number;
  Name: string;
  Ordering: number;
  Sorting: number;
  Description: string | null;
  Label: string;
  ConfirmMessage: string;
}

export interface ApTypeOption {
  AppointmentLabelId: number;
  Name: string;
  Color: string;
  Ordering: number;
  ClientGroupId: number;
}

export interface AddAppointmentData {
  appointmentId?: string;
  date?: string;
  fromTime?: string;
  toTime?: string;
  notes?: string;
  doctorId?: string;
  branchId?: string;
}
export interface PaymentData {
  TotalAmount: string;
  TotalPaid: string;
  TotalPaymentRequired: string;
  TotalORPaymentAmount: string;
  TotalServicePaymentAmount: string;
}

export interface ReceiptTotal {
  CurrentBalance: string;
  PaidAmount: string;
  TotalAmount: string;
  ListReceipt: ReceiptData[];
}

export interface ReceiptData {
  ReceipStatusDate?: string;
  PartnerCompanyTypeName?: string;
  TotalPrepayCard?: string;
  ReceiptStatusId?: string;
  StaffId?: string;
  IsEditReceiptOR?: true;
  ReceiptId: string;
  ReceiptCode: string;
  TypeName: string;
  AddedAt: string;
  CreatedBy: string;
  BranchCode: string;
  Amount: string;
  PaymentMethodName: string;
  Note: string;
  id: number | string;
}

export interface Treatment {
  OrderDetailId?: string;
  ServiceName?: string;
  AnatomyBodyPartItemName?: string;
  LastestProcessName?: string;
  TotalPercentageCompleted?: string;
  Payment?: string;
  TotalAmount?: string;
  Revenue?: string;
  NextTimeTreatmentNote?: string;
}

export interface TreatmentTotal {
  TreatmentAll?: Treatment[];
  TotalAmount?: string;
  Revenue?: string;
}

export interface CustomerNoteData {
  CustomerNoteId: string;
  CustomerId: string;
  CustomerNoteCategoryId: string;
  Note: string;
  AddedAt: string;
  AddedBy: string;
  EditedAt: string;
  EditedBy: string;
  kimsysId: string;
  NoteBackup: string;
  ClientGroupId: string;
  CustomerNoteCategoryName: string;
  AddedByName: string;
  EditedByName: string;
  IsEdit: boolean;
  Type: string;
}

export interface PaymentPromotionData {
  TotalAccount: number;
  TotalPayment: number;
  TotalBalance: number;
  TotalPromotionAccount: number;
  TotalPromotionPayment: number;
  TotalPromotionBalance: number;
  TotalRefundPromotionAmount: number;
  TotalPromotionDiscountAmount: number;
  TotalPromotionExpiredDebitVoucher: number;
}

export interface Statistics {
  AmountCustomerComingConsultation: number;
  TotalAmount: number;
  TotalService: number;
}

export interface Bank {
  Address: string;
  BankId: string;
  ClientGroupId: string;
  NameEn: string;
  NameVi: string;
  Priority: string;
  State: string;
  Type: string;
}

export interface StaffInfo {
  email: string;
  id: number;
  name: string;
  phone: string;
  publishedAt: string;
  updatedAt: string;
  business_role: string;
}

export type BranchSaas = {
  id?: number;
  documentId?: string;
  name?: string;
  address?: string;
  phone?: string;
  BranchId?: string;
  Name?: string;
  Company_NameVi?: string;
  CompanyId?: string;
};

export type Chair = {
  id: number;
  documentId: string;
  code: string;
  isActive: boolean;
  note: string;
  branch: BranchSaas;
};

export interface ChairFormData {
  branchId: string | undefined;
  code: string;
  note: string;
  id: string;
}

export interface Product {
  id: number;
  product: string;
  plan: string;
  price: number;
}

export type BranchForm = {
  id?: string;
  code: string;
  name: string;
  phone: string;
  // district: string;
  province: string;
  ward: string;
  address: string;
  licenseCode: string;
  licenseName: string;
};

export type DiagnoseDetail = {
  Treatment: number;
  PersonDiagnosis: {
    IsAdult: string;
    Note: string | null;
    PersonDiagnosisDetail: any[];
    PersonDiagnosisId: string;
    PersonId: string;
    UpdatedAt?: string;
    UpdatedBy?: string;
  };
  Orders: any;
};

export type TeethType = "adult" | "junior";

export type DiagnoseConfig = {
  DiagnosisId: string;
  Name: string;
  MedicalDomainId: string;
  Note: string | null;
  ICD10Code: string;
  ICD10Name: string;
  DiagnosisLevelId: string | null;
  DiagnosisLevel_Name: string | null;
  AnatomyBodyPart_Name: string;
  AnatomyBodyPartId: string;
};

export type ServiceDetails = {
  Name: string;
  SalePrice: string;
  ServiceCode: string;
  ServiceGroup: { Id: string; Name: string };
  ServiceId: string;
  Status: string;
  Tax: string;
  MedicalProcedureId: string;
  IsTax: string;
};

export type ServiceOffer = {
  Id: string | null;
  ServiceId: string;
  ServiceName: string;
  ServicePrice: string;
  AnatomyBodyPartItemId: string;
  AnatomyBodyPartItemName: string;
  DiscountPercent: string;
  DiscountAmount: string;
  TaxPercent: string;
  TaxAmount: string;
  AmountBeforeTax: string;
  Amount: string;
  PaidAmount: string | null;
  IsConfirmed: string;
  record_ordering: string | null;
  IsProcessed: string;
  MedicalProcedureId: string | null;
  ChangedAt: string | null;
  ChangedBy: string | null;
};

export type ServiceAdd = ServiceOffer & {
  IsTax: string;
};

export type CustomerDiagnosisData = {
  id: string;
  teethType: string;
  selectedTeeths: string[];
};

export interface BusinessInfo {
  id: number;
  documentId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  finished?: boolean;
  owner?: any;
}

export interface OnboardingSteps {
  clinic: boolean;
  staff: boolean;
  service: boolean;
  dentalChair: boolean;
  customer: boolean;
  appointment: boolean;
}

export interface OnboardingData {
  finished: boolean;
  steps: OnboardingSteps;
}

export interface Ward {
  VnWardId: string;
  VnDistrictId: string;
  WardCode: string;
  WardPostalCode: string;
  NameVi: string;
  NameEn: string;
  LabelVi: string;
  LabelEn: string;
  Ordering: string;
  VnProvinceId: string;
}

export interface Province {
  VnProvinceId: string;
  ProvinceCode: string | null;
  ProvincePostalCode: string | null;
  NameVi: string;
  NameEn: string;
  LabelVi: string;
  LabelEn: string;
  Ordering: string;
  State: string;
  MigrateFrom: string | null;
}
