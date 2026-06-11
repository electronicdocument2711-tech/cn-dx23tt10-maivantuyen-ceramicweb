/**
 * tương tự enum trên strapi backend
 */
export const request_status = [
  { id: 33, name: "Đang chờ duyệt", key: "dang_cho_duyet", state: "warning" },
  { id: 29, name: "Đã từ chối", key: "da_tu_choi", state: "danger" },
  { id: 35, name: "Đã duyệt", key: "da_duyet", state: "success" },
  // { id: 28, name: "Đã thay thế", key: "da_thay_the", state: "info" },
  // { id: 30, name: "Đã hủy", key: "da_huy", state: "danger" },
];

export const providers = [
  {
    id: 1,
    documentId: "box14hswkxrtlv5a2xsmrkb1",
    name: "Viettel",
    ready_statuses: [],
    alias: "viettel",
    domain: "https://api-vinvoice.viettel.vn",
    domain_api:
      "https://api-vinvoice.viettel.vn/services/vinvoiceapplication/api/V1ToV2",
  },
  {
    id: 2,
    documentId: "cr2902wnwq1cpve14xy3zlsn",
    name: "BKAV - ehoadon",
    alias: "bkav",
    domain: "https://demo.ehoadon.vn",
    domain_api: "https://wsdemo.ehoadon.vn/WSPublicEhoadon.asmx/ExecCommand",
    statuses: [
      { id: "1", label: "Mới tạo" },
      { id: "2", label: "Đã phát hành" },
      { id: "3", label: "Đã hủy" },
      { id: "5", label: "Chờ thay thế" },
      { id: "6", label: "Thay thế" },
      { id: "7", label: "Chờ điều chỉnh" },
      { id: "8", label: "Điều chỉnh" },
      { id: "9", label: "Bị thay thế" },
      { id: "10", label: "Bị điều chỉnh" },
      { id: "11", label: "Trống (Đã cấp số, Chờ ký)" },
      { id: "12", label: "Không sử dụng" },
      { id: "13", label: "Chờ huỷ" },
      { id: "14", label: "Chờ điều chỉnh chiết khấu" },
      { id: "15", label: "Điều chỉnh chiết khấu" },
    ],
    draft_statuses: ["1"],
    ready_statuses: ["2"], // trạng thái đã sẵn sàng để tải + gửi khách
  },
];
