export const SetupServiceHeaders = [
  {
    key: "id",
    display: "#",
  },
  {
    key: "service",
    display: "Tên dịch vụ",
    className: "w-1/6",
  },
  {
    key: "paymentService",
    display: "Tên dịch vụ trên hoá đơn",
    className: "w-1/6 whitespace-pre-line break-words",
  },
  {
    key: "code",
    display: "Mã dịch vụ",
    className: "w-1/10",
  },
  {
    key: "unit",
    display: "Đơn vị tính",
    className: "w-1/11 text-center",
  },
  {
    key: "tax",
    display: "Thuế suất",
    className: "text-center w-1/11",
  },
  {
    key: "time",
    display: "Thời gian",
  },
  {
    key: "action",
    className: "w-1/10",
    display: "",
  },
];

export const BillTableHeader = [
  {
    key: "id",
    display: "#",
  },
  {
    key: "comp",
    display: "Công ty",
    className: "w-1/8",
  },
  {
    key: "room",
    display: "Phòng khám",
    className: "w-1/8",
  },
  {
    key: "address",
    display: "Địa chỉ",
    className: "w-1/8",
  },
  {
    key: "tax",
    display: "Mã số thuế",
  },
  {
    key: "typeNumber",
    display: "Mẫu số",
    className: "align-right",
  },
  {
    key: "symbol",
    display: "Ký hiệu",
  },
  {
    key: "date",
    display: "Ngày hiệu lực",
  },
  {
    key: "state",
    display: "Trạng thái",
  },
];

export const ServiceBillTable = [
  { key: "check", display: "", className: "sticky left-0" },
  { key: "id", display: "STT", className: "text-center" },
  {
    key: "service",
    display: "Dịch vụ",
    className: "",
  },
  {
    key: "unit",
    display: "Đơn vị tính",
    className: "text-center",
  },
  {
    key: "amount",
    display: "Số lượng",
    className: "text-center",
  },
  {
    key: "price",
    display: "Đơn giá\n(Chưa GTGT)",
    className: "text-center",
  },
  { key: "discount", display: "CKTM/KM", className: "text-center" },
  {
    key: "amount-before-tax",
    display: "Thành tiền\ntrước thuế",
    className: "text-center",
  },
  {
    key: "tax-percent",
    display: "Thuế suất\n%",
    className: "text-center",
  },
  {
    key: "tax-amount",
    display: "Thuế GTGT",
    className: "text-center",
  },
  {
    key: "amount-after-tax",
    display: "Thành tiền\nsau thuế",
    className: "text-end sticky right-0",
  },
];

export const ExportServiceBillTable = [
  { key: "check", display: "", className: "p-1 w-1/30" },
  { key: "id", display: "#", className: "w-1/15" },
  { key: "code", display: "Mã khách hàng", className: "w-1/5" },
  { key: "name", display: "Tên khách hàng" },
  {
    key: "price",
    display: "Số tiền xuất hoá đơn còn lại",
    className: "text-right",
  },
];

export const CustomerPaymentTableHeader = [
  { key: "id", display: "#" },
  { key: "receipt", display: "Hoá đơn", className: "w-2/5" },
  { key: "code", display: "Mã hoá đơn" },
  { key: "price", display: "Đơn giá", className: "text-right" },
  { key: "tax", display: "Thuế" },
  { key: "total", display: "Thành tiền", className: "w-1/7 text-right" },
];
