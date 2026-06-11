import axios from "axios";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CommandType = {
  Undefined: 0,

  // 1xx: Thêm mới
  /** Tạo HĐ, eHD tự cấp InvoiceForm, InvoiceSerial; InvoiceNo = 0 */
  CreateInvoiceMT: 100,
  /** Tạo HĐ, eHD tự cấp InvoiceForm, InvoiceSerial và cấp InvoiceNo (HĐ chờ ký) */
  CreateInvoiceTR: 101,
  /** Tạo HĐ, Client tự cấp InvoiceForm, InvoiceSerial; InvoiceNo = 0 */
  CreateInvoiceWithFormSerial: 110,
  /** Tạo HĐ, Client tự cấp InvoiceForm, InvoiceSerial, InvoiceNo */
  CreateInvoiceWithFormSerialNo: 111,
  /** Tạo HĐ thay thế */
  CreateInvoiceReplace: 120,
  /** Tạo HĐ điều chỉnh */
  CreateInvoiceAdjust: 121,
  /** Tạo HĐ điều chỉnh chiết khấu */
  CreateInvoiceAdjustDiscount: 122,
  /** Tạo HĐ thay thế cấp số luôn */
  CreateInvoiceReplaceSetInvoiceNo: 123,
  /** Tạo HĐ điều chỉnh cấp số luôn */
  CreateInvoiceAdjustSetInvoiceNo: 124,

  // 2xx: Cập nhật / Hủy
  /** Cập nhật thông tin HĐ theo PartnerInvoiceID */
  UpdateInvoiceByPartnerInvoiceID: 200,
  /** Hủy hóa đơn theo InvoiceGUID */
  CancelInvoiceByInvoiceGUID: 201,
  /** Hủy hóa đơn theo PartnerInvoiceID */
  CancelInvoiceByPartnerInvoiceID: 202,
  /** Cập nhật thông tin HĐ theo mẫu số, ký hiệu, số hóa đơn */
  UpdateInvoiceByInvoiceFormSerialNo: 203,
  /** Cập nhật thông tin HĐ theo InvoiceGUID */
  UpdateInvoiceByInvoiceGUID: 204,

  // 3xx: Xóa
  /** Xóa HĐ chưa phát hành theo PartnerInvoiceID */
  DeleteInvoiceByPartnerInvoiceID: 301,
  /** Xóa bảng cập nhật trạng thái HĐ (Tool) */
  DeleteInvoiceProcessing: 302,
  /** Xóa HĐ chưa phát hành theo InvoiceGUID */
  DeleteInvoiceByInvoiceGUID: 303,

  // 5xx: File
  /** Upload file Excel dữ liệu hóa đơn */
  UploadFile: 500,

  // 8xx: Lấy thông tin / báo cáo
  /** Lấy thông tin tờ hóa đơn */
  GetInvoiceDataWS: 800,
  /** Lấy trạng thái tờ hóa đơn */
  GetInvoiceStatusID: 801,
  /** Lấy lịch sử thay đổi tờ hóa đơn */
  GetInvoiceHistory: 802,
  /** Lấy bản thể hiện PDF của hóa đơn */
  GetInvoicePDFFile: 803,
  /** Lấy link tải file hóa đơn in chuyển đổi */
  GetInvoiceLink: 804,
  /** Lấy file XML để ký */
  GetInvoiceXML: 805,
  /** Lấy danh sách HĐ chờ ký */
  GetListInvoiceWS_CK: 806,
  /** Lấy số lượng hóa đơn còn lại */
  GetRemainInvoiceNum: 807,
  /** Lấy file PDF dạng Base64 */
  GetInvoiceDataFilePDF: 808,
  /** Lấy file XML dạng Base64 */
  GetInvoiceDataFileXML: 809,

  // 9xx: Tiện ích / Tài khoản
  /** Gửi lại HĐ cho KH qua email và SMS */
  ReSend: 901,
  /** Tạo tài khoản */
  CreateAccount: 902,
  /** Cập nhật thông tin tài khoản */
  UpdateAccount: 903,
  /** Lấy thông tin doanh nghiệp từ MST */
  GetUnitInforByTaxCode: 904,
  /** Cập nhật mật khẩu */
  UpdatePassword: 905,
  /** Cập nhật trạng thái tài khoản */
  UpdateAccountStatus: 906,
  /** Cập nhật số lượng HĐ, SMS, hạn tài khoản */
  UpdateExpireInfo: 907,
  /** Lấy thông tin số lượng/hạn HĐ, SMS còn lại */
  GetExpireInfo: 908,
  /** Kiểm tra tài khoản đã tồn tại theo MST */
  GetAccountInfoByTaxcode: 909,
  /** Xác thực user và trả về InvoiceForm, InvoiceSerial */
  AuthenticateUserRetunInvoiceFormSerial: 910,
  /** Gửi lại HĐ với email/mobile tùy chỉnh */
  ReSendWithEmail_Mobile: 911,

  // 10xx: Trao đổi với tool
  /** Lấy kiểu xử lý và FileName, ClassName */
  GetRunTypeInfo: 1000,
  /** Lấy nội dung file DLL */
  GetDLLContent: 1001,
} as const;

export const TaxRateID = {
  /** 0% */
  Khong: 1,
  /** 5% */
  Nam: 2,
  /** 10% */
  Muoi: 3,
  /** Không chịu thuế */
  KhongChiuThue: 4,
  /** Không kê khai thuế */
  KhongKeKhaiThue: 5,
  /** Khác */
  Khac: 6,
} as const;

export const ItemTypeID = {
  HangHoa: 0,
  ThueKhac: 1,
  PhiKhac: 2,
  PhiDichVu: 3,
  GhiChu: 4,
  PhuThu: 5,
  PhiHoan: 6,
} as const;

/** Hình thức thanh toán */
export const PayMethodID = {
  /** Tiền mặt (mặc định) */
  TienMat: 1,
  /** Chuyển khoản */
  ChuyenKhoan: 2,
  /** Tiền mặt / Chuyển khoản */
  TienMatChuyenKhoan: 3,
  /** Xuất hàng cho chi nhánh */
  XuatHangChiNhanh: 4,
  /** Hàng biếu tặng */
  HangBieuTang: 5,
} as const;

/** Hình thức nhận hóa đơn */
export const ReceiveTypeID = {
  /** Email */
  Email: 1,
  /** Tin nhắn */
  TinNhan: 2,
  /** Email và tin nhắn */
  EmailVaTinNhan: 3,
  /** Chuyển phát nhanh */
  ChuyenPhatNhanh: 4,
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BkavConfig {
  url: string;
  partnerGuid: string;
}

/** Kết quả trả về sau khi tạo / cập nhật hóa đơn */
export interface InvoiceResult {
  PartnerInvoiceID: number;
  PartnerInvoiceStringID: string | null;
  InvoiceGUID: string;
  InvoiceForm: string;
  InvoiceSerial: string;
  InvoiceNo: number;
  /** 0 = thành công, 1 = lỗi */
  Status: number;
  MessLog: string;
}

export interface BaseResult<T = any> {
  Status: number;
  isOke?: boolean;
  isError?: boolean;
  Permission?: unknown;
  Code?: unknown;
  Object: T;
}

/** Thông tin header hóa đơn */
export interface InvoiceWS {
  /** Loại HĐ: luôn là 1 (GTGT) */
  InvoiceTypeID: number;
  /** Ngày trên hóa đơn (ISO string) */
  InvoiceDate: string;
  BuyerName?: string;
  BuyerTaxCode?: string;
  BuyerUnitName?: string;
  BuyerAddress?: string;
  BuyerBankAccount?: string;
  /** PayMethodID */
  PayMethodID?: number;
  /** ReceiveTypeID */
  ReceiveTypeID?: number;
  ReceiverEmail?: string;
  ReceiverMobile?: string;
  ReceiverAddress?: string;
  ReceiverName?: string;
  Note?: string;
  /** Dữ liệu tự định nghĩa (JSON string) */
  UserDefine?: string;
  BillCode?: string;
  /** Mã tiền tệ, mặc định "VND" */
  CurrencyID?: string;
  /** Tỷ giá so với VND, mặc định 1 */
  ExchangeRate?: number;
  InvoiceGUID?: string;
  InvoiceStatusID?: number;
  InvoiceForm?: string;
  InvoiceSerial?: string;
  InvoiceNo?: number;
  InvoiceCode?: string;
  SignedDate?: string;
  /** 0=Mới, 1=Thay thế, 2=Điều chỉnh thông tin, 3=Điều chỉnh tăng, 4=Điều chỉnh giảm */
  TypeCreateInvoice?: number;
  /** Định danh HĐ gốc, vd: "[01GTKT0/001]_[AA/17E]_[0000001]" */
  OriginalInvoiceIdentify?: string;
}

/** Dòng hàng hóa / dịch vụ trên hóa đơn */
export interface InvoiceDetailsWS {
  /** ItemTypeID */
  ItemTypeID?: number;
  ItemName: string;
  UnitName?: string;
  Qty?: number;
  Price?: number;
  Amount: number;
  /** TaxRateID */
  TaxRateID?: number;
  TaxAmount?: number;
  /** true = chiết khấu */
  IsDiscount?: boolean;
  UserDefineDetails?: string;
  /** Dùng cho lệnh 121 (điều chỉnh): true = tăng, false = giảm */
  IsIncrease?: boolean | null;
}

/** File đính kèm dạng Base64 */
export interface InvoiceAttachFileWS {
  FileName: string;
  FileExtension: string;
  FileContent: string;
}

/** Container chính để tạo hóa đơn */
export interface InvoiceDataWS {
  Invoice: InvoiceWS;
  ListInvoiceDetailsWS: InvoiceDetailsWS[];
  ListInvoiceAttachFileWS: InvoiceAttachFileWS[];
  /** > 0 nếu dùng số ID, để 0 nếu dùng PartnerInvoiceStringID */
  PartnerInvoiceID: number;
  /** Dùng thay thế PartnerInvoiceID khi ID là chuỗi */
  PartnerInvoiceStringID: string | null;
}

/** Lịch sử thay đổi tờ hóa đơn */
export interface HistoryLog {
  CreateDate: string;
  ID: number;
  IP: string;
  LogContent: string;
  ObjectGUID: string;
  UserID: number;
}

/** Thông tin doanh nghiệp từ mã số thuế */
export interface BusinessInfo {
  MaSoThue: string;
  TenChinhThuc: string;
  DiaChiGiaoDichChinh: string;
  DiaChiGiaoDichPhu: string;
  TrangThaiHoatDong: string;
}

/** Thông tin tạo tài khoản từ Partner */
export interface CreateAccountInfoFromPartner {
  TaxCode: string;
  UnitName: string;
  UnitAddress: string;
  TaxDepartmentID?: number;
  UnitPersonRepresent?: string;
  UnitPersonRepresentPosition?: string;
  UnitEmail?: string;
  UnitPhone?: string;
  BankAccount?: string;
  BankName?: string;
  BrandName?: string;
  DomainCheckInvoice?: string;
}

/** Kết quả tạo/lấy tài khoản */
export interface AccountResult {
  AccountGUID: string;
  Account: string;
  Password: string;
  NumberInvoice: number;
  NumberMSG: number;
  PartnerGUID: string;
  PartnerToken: string;
}

/** File PDF và XML dạng Base64 */
export interface InvoiceDataFileBase64 {
  PDF: string;
  XML: string;
}

// ---------------------------------------------------------------------------
// Helper: tạo InvoiceDataWS mặc định
// ---------------------------------------------------------------------------

export function createInvoiceDataWS(
  partial?: Partial<InvoiceDataWS>,
): InvoiceDataWS {
  return {
    Invoice: { InvoiceTypeID: 1, InvoiceDate: new Date().toISOString() },
    ListInvoiceDetailsWS: [],
    ListInvoiceAttachFileWS: [],
    PartnerInvoiceID: 0,
    PartnerInvoiceStringID: null,
    ...partial,
  };
}

// ---------------------------------------------------------------------------
// Class Bkav
// ---------------------------------------------------------------------------

export class Bkav {
  private url: string;
  private partnerGuid: string;

  constructor(config: BkavConfig) {
    this.url = config.url;
    this.partnerGuid = config.partnerGuid;
  }

  // -------------------------------------------------------------------------
  // Low-level transport
  // -------------------------------------------------------------------------

  private static fromBase64<T = unknown>(base64: string): T {
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  }

  private static toBase64(obj: unknown): string {
    const str = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(str);
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
  }

  static getTaxRateId(vatRate: number): number {
    switch (vatRate) {
      case 0:
        return TaxRateID.Khong;
      case 5:
        return TaxRateID.Nam;
      case 10:
        return TaxRateID.Muoi;
      default:
        return TaxRateID.Khac;
    }
  }

  async execCommand<T = unknown>(
    cmdType: number,
    commandObject: unknown,
  ): Promise<T> {
    try {
      const response = await axios.post(this.url, {
        partnerGUID: this.partnerGuid,
        CommandData: Bkav.toBase64({
          CmdType: cmdType,
          CommandObject: commandObject,
        }),
      });

      const responseAsObject: any = response?.data?.d
        ? Bkav.fromBase64(response.data.d)
        : null;

      if (responseAsObject?.Status === 0) {
        // Thành công
        let object: any = null;
        try {
          object = JSON.parse(responseAsObject?.Object);
        } catch {
          object = responseAsObject?.Object;
        }

        responseAsObject.Object = object;
      }

      return responseAsObject as T;
    } catch (error) {
      console.error("Lỗi Webservice Bkav:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // 1xx: Tạo hóa đơn
  // -------------------------------------------------------------------------

  /** Tạo HĐ mới, eHD tự cấp Form, Serial, InvoiceNo = 0 */
  createInvoice(data: InvoiceDataWS[]) {
    return this.execCommand<BaseResult<InvoiceResult[]>>(
      CommandType.CreateInvoiceMT,
      data,
    );
  }

  /** Tạo HĐ chờ ký, eHD cấp InvoiceNo */
  createInvoiceTR(data: InvoiceDataWS[]) {
    return this.execCommand<BaseResult<InvoiceResult[]>>(
      CommandType.CreateInvoiceTR,
      data,
    );
  }

  /** Tạo HĐ, client tự cấp Form + Serial; InvoiceNo = 0 */
  createInvoiceWithFormSerial(data: InvoiceDataWS[]) {
    return this.execCommand<BaseResult<InvoiceResult[]>>(
      CommandType.CreateInvoiceWithFormSerial,
      data,
    );
  }

  /** Tạo HĐ, client tự cấp Form + Serial + InvoiceNo */
  createInvoiceWithFormSerialNo(data: InvoiceDataWS[]) {
    return this.execCommand<BaseResult<InvoiceResult[]>>(
      CommandType.CreateInvoiceWithFormSerialNo,
      data,
    );
  }

  /** Tạo HĐ thay thế */
  createInvoiceReplace(data: InvoiceDataWS[]) {
    return this.execCommand<BaseResult<InvoiceResult[]>>(
      CommandType.CreateInvoiceReplace,
      data,
    );
  }

  /** Tạo HĐ điều chỉnh */
  createInvoiceAdjust(data: InvoiceDataWS[]) {
    return this.execCommand<BaseResult<InvoiceResult[]>>(
      CommandType.CreateInvoiceAdjust,
      data,
    );
  }

  /** Tạo HĐ điều chỉnh chiết khấu */
  createInvoiceAdjustDiscount(data: InvoiceDataWS[]) {
    return this.execCommand<BaseResult<InvoiceResult[]>>(
      CommandType.CreateInvoiceAdjustDiscount,
      data,
    );
  }

  /** Tạo HĐ thay thế và cấp số ngay */
  createInvoiceReplaceSetInvoiceNo(data: InvoiceDataWS[]) {
    return this.execCommand<BaseResult<InvoiceResult[]>>(
      CommandType.CreateInvoiceReplaceSetInvoiceNo,
      data,
    );
  }

  /** Tạo HĐ điều chỉnh và cấp số ngay */
  createInvoiceAdjustSetInvoiceNo(data: InvoiceDataWS[]) {
    return this.execCommand<BaseResult<InvoiceResult[]>>(
      CommandType.CreateInvoiceAdjustSetInvoiceNo,
      data,
    );
  }

  // -------------------------------------------------------------------------
  // 2xx: Cập nhật / Hủy
  // -------------------------------------------------------------------------

  /** Cập nhật thông tin HĐ theo PartnerInvoiceID */
  updateInvoiceByPartnerID(data: InvoiceDataWS) {
    return this.execCommand<InvoiceResult>(
      CommandType.UpdateInvoiceByPartnerInvoiceID,
      data,
    );
  }

  /** Cập nhật thông tin HĐ theo mẫu số, ký hiệu, số hóa đơn */
  updateInvoiceByFormSerialNo(data: InvoiceDataWS) {
    return this.execCommand<InvoiceResult>(
      CommandType.UpdateInvoiceByInvoiceFormSerialNo,
      data,
    );
  }

  /** Cập nhật thông tin HĐ theo InvoiceGUID */
  updateInvoiceByGUID(data: InvoiceDataWS) {
    return this.execCommand<InvoiceResult>(
      CommandType.UpdateInvoiceByInvoiceGUID,
      data,
    );
  }

  /** Hủy hóa đơn theo InvoiceGUID */
  cancelInvoiceByGUID(invoiceGUID: string) {
    return this.execCommand<InvoiceResult>(
      CommandType.CancelInvoiceByInvoiceGUID,
      { InvoiceGUID: invoiceGUID },
    );
  }

  /** Hủy hóa đơn theo PartnerInvoiceID */
  cancelInvoiceByPartnerID(partnerInvoiceID: number) {
    return this.execCommand<InvoiceResult>(
      CommandType.CancelInvoiceByPartnerInvoiceID,
      { PartnerInvoiceID: partnerInvoiceID },
    );
  }

  // -------------------------------------------------------------------------
  // 3xx: Xóa
  // -------------------------------------------------------------------------

  /** Xóa HĐ chưa phát hành theo PartnerInvoiceID */
  deleteInvoiceByPartnerID(partnerInvoiceID: number) {
    return this.execCommand<InvoiceResult>(
      CommandType.DeleteInvoiceByPartnerInvoiceID,
      { PartnerInvoiceID: partnerInvoiceID },
    );
  }

  /** Xóa HĐ chưa phát hành theo InvoiceGUID */
  deleteInvoiceByGUID(invoiceGUID: string) {
    return this.execCommand<InvoiceResult>(
      CommandType.DeleteInvoiceByInvoiceGUID,
      { InvoiceGUID: invoiceGUID },
    );
  }

  // -------------------------------------------------------------------------
  // 8xx: Lấy thông tin
  // -------------------------------------------------------------------------

  /** Lấy thông tin đầy đủ tờ hóa đơn theo PartnerInvoiceID */
  getInvoiceData(partnerInvoiceID: number) {
    return this.execCommand<InvoiceDataWS>(CommandType.GetInvoiceDataWS, {
      PartnerInvoiceID: partnerInvoiceID,
    });
  }

  /** Lấy trạng thái tờ hóa đơn theo InvoiceGUID*/
  getInvoiceStatus(invoiceGUID: string) {
    return this.execCommand<BaseResult<number>>(
      CommandType.GetInvoiceStatusID,
      invoiceGUID,
    );
  }

  /** Lấy lịch sử thay đổi tờ hóa đơn */
  getInvoiceHistory(partnerInvoiceID: number) {
    return this.execCommand<HistoryLog[]>(CommandType.GetInvoiceHistory, {
      PartnerInvoiceID: partnerInvoiceID,
    });
  }

  /** Lấy bản PDF của hóa đơn (URL hoặc binary) */
  getInvoicePDF(partnerInvoiceID: number) {
    return this.execCommand<string>(CommandType.GetInvoicePDFFile, {
      PartnerInvoiceID: partnerInvoiceID,
    });
  }

  /** Lấy link tải file hóa đơn in chuyển đổi */
  getInvoiceLink(partnerInvoiceID: number) {
    return this.execCommand<string>(CommandType.GetInvoiceLink, {
      PartnerInvoiceID: partnerInvoiceID,
    });
  }

  /** Lấy file XML để ký */
  getInvoiceXML(partnerInvoiceID: number) {
    return this.execCommand<string>(CommandType.GetInvoiceXML, {
      PartnerInvoiceID: partnerInvoiceID,
    });
  }

  /** Lấy danh sách hóa đơn chờ ký */
  getListInvoiceWaitingSign() {
    return this.execCommand<InvoiceDataWS[]>(
      CommandType.GetListInvoiceWS_CK,
      {},
    );
  }

  /** Lấy số lượng hóa đơn còn lại trong tài khoản */
  getRemainInvoiceNum() {
    return this.execCommand<number>(CommandType.GetRemainInvoiceNum, {});
  }

  /** Lấy file PDF dạng Base64 */
  getInvoiceFilePDFBase64(partnerInvoiceStringID: string) {
    return this.execCommand<BaseResult<InvoiceDataFileBase64>>(
      CommandType.GetInvoiceDataFilePDF,
      partnerInvoiceStringID,
    );
  }

  /** Lấy file XML dạng Base64 */
  getInvoiceFileXMLBase64(partnerInvoiceStringID: string) {
    return this.execCommand<BaseResult<InvoiceDataFileBase64>>(
      CommandType.GetInvoiceDataFileXML,
      partnerInvoiceStringID,
    );
  }

  /** Lấy cả PDF và XML dạng Base64 cùng lúc */
  async getInvoiceFilesBase64(partnerInvoiceStringID: string): Promise<any> {
    const [PDF, XML] = await Promise.all([
      this.getInvoiceFilePDFBase64(partnerInvoiceStringID),
      this.getInvoiceFileXMLBase64(partnerInvoiceStringID),
    ]);
    return { PDF, XML };
  }

  // -------------------------------------------------------------------------
  // 9xx: Tiện ích / Tài khoản
  // -------------------------------------------------------------------------

  /** Gửi lại hóa đơn qua email và SMS */
  reSend(partnerInvoiceID: number) {
    return this.execCommand<void>(CommandType.ReSend, {
      PartnerInvoiceID: partnerInvoiceID,
    });
  }

  /** Gửi lại hóa đơn với email/mobile tùy chỉnh */
  reSendWithContact(partnerInvoiceID: number, email?: string, mobile?: string) {
    return this.execCommand<void>(CommandType.ReSendWithEmail_Mobile, {
      PartnerInvoiceID: partnerInvoiceID,
      ReceiverEmail: email,
      ReceiverMobile: mobile,
    });
  }

  /** Tạo tài khoản mới */
  createAccount(info: CreateAccountInfoFromPartner) {
    return this.execCommand<AccountResult>(CommandType.CreateAccount, info);
  }

  /** Cập nhật thông tin tài khoản */
  updateAccount(info: CreateAccountInfoFromPartner) {
    return this.execCommand<AccountResult>(CommandType.UpdateAccount, info);
  }

  /** Lấy thông tin doanh nghiệp từ mã số thuế */
  getUnitInfoByTaxCode(taxCode: string) {
    return this.execCommand<BusinessInfo>(CommandType.GetUnitInforByTaxCode, {
      TaxCode: taxCode,
    });
  }

  /** Lấy thông tin số lượng/hạn HĐ, SMS còn lại */
  getExpireInfo() {
    return this.execCommand<unknown>(CommandType.GetExpireInfo, {});
  }

  /** Kiểm tra tài khoản đã tồn tại theo MST */
  getAccountInfoByTaxCode(taxCode: string) {
    return this.execCommand<BaseResult<AccountResult>>(
      CommandType.GetAccountInfoByTaxcode,
      { TaxCode: taxCode },
    );
  }
}
