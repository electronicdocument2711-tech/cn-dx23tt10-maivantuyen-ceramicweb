import { Branch } from "./define.d";

export type WidgetEntry = { name: string; data: any };
export interface WidgetMap {
  AccountBalance?: AccountBalanceItem;
  CustomerWallet?: CustomerWalletData;
  FilterAppointment?: FilterAppointmentData;
  ListBranch?: ListBranch;
  // PartnerCompany?: PartnerCompanyData;
  CustomerNoteCategory?: CustomerNoteCategory[];
  CustomerRelationship?: CustomerRelationship[];
  BranchExts?: BranchExt[];
  CustomerFeedback?: CustomerFeedbackItem[];
}

// Account Balance
interface AccountBalanceItem {
  Deposit: string;
  PrepayCard: string | null;
  DebitVoucher: string;
  ExpriedDebitVoucherDate: string | null;
}

// Customer Wallet
interface CustomerWalletData {
  TotalPaymentAmount: number;
  PaymentAmount: string;
  DepositBalanceAmount: string;
  TotalOrderAmount: string;
  NextPayAmountRequired: number;
  MinPayment: number;
  DebitVoucher: string;
  ExpriedDebitVoucherDate: string | null;
}

// Filter Appointment
interface FilterAppointmentData {
  Branch: Branch[];
  BranchSelected: Branch | null;
  Status: AppointmentStatus[];
  AppointmentType: AppointmentStatus[];
  ServiceGroup: ServiceGroup[];
  Button: any[];
  DoctorId: string | null;
  FullName: string | null;
  SurveyList: SurveyList[];
}

// List Branch
type ListBranch = Branch[];

export interface CustomerNoteCategory {
  CustomerNoteCategoryId: string;
  Name: string;
  State: string;
  Ordering: string;
  AddedAt: string;
  AddedBy: string;
  EditedAt: string;
  EditedBy: string;
}

// Partner Company
// type PartnerCompanyData = PartnerCompany[];

// Service group
export interface ServiceGroup {
  ServiceGroupId: string;
  Name: string;
}

export interface AppointmentStatus {
  AppointmentLabelId?: string;
  Name?: string;
  Color?: string;
  Ordering?: string;
  AppointmentStatusId?: string;
  Sorting?: string;
  Description?: null;
  Label?: string;
  ConfirmMessage?: string;
}

export interface SurveyList {
  SurveyId: string;
  Name: string;
}

interface CustomerRelationship {
  SourceRelationCode: string;
  DestinationRelationCode: string;
  FullName: string;
  CustomerCode: string;
  Gender: string;
  Phone: string;
  ClientGroupId: string;
  // bổ sung field nào backend trả thêm
}

interface CustomerFeedbackItem {
  CustomerComplaintId: string;
  Note: string;
  AddedAt: string;
  AddedBy: string;
  // tùy response thực tế
}

interface BranchExt {
  link?: string;
  data?: unknown;
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

interface District {
  VnDistrictId: string;
  VnProvinceId: string;
  DistrictCode: string;
  DistrictPostalCode: string;
  NameVi: string;
  NameEn: string;
  LabelVi: string;
  LabelEn: string;
  Ordering: string;
}

interface Ward {
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
