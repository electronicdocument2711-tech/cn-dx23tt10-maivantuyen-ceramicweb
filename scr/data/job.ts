export interface Job {
  id: string;
  label: string;
}

export const jobData: Job[] = [
  { id: "student", label: "Học sinh / Sinh viên" },
  { id: "office", label: "Nhân viên văn phòng" },
  { id: "business", label: "Kinh doanh tự do / Tiểu thương" },
  { id: "housewife", label: "Nội trợ" },
  { id: "teacher", label: "Giáo viên / Giảng viên" },
  { id: "health", label: "Y tế / Chăm sóc sức khỏe" },
  { id: "it_engineer", label: "Kỹ sư / CNTT" },
  { id: "worker", label: "Công nhân / Lao động phổ thông" },
  { id: "driver", label: "Tài xế / Giao hàng" },
  { id: "service", label: "Dịch vụ / Nhà hàng / Khách sạn" },
  { id: "civil_servant", label: "Công chức / Viên chức nhà nước" },
  { id: "finance", label: "Tài chính / Ngân hàng" },
  { id: "art", label: "Nghệ thuật / Truyền thông" },
  { id: "beauty", label: "Spa / Làm đẹp / Thẩm mỹ" },
  { id: "retired", label: "Hưu trí" },
  { id: "unemployed", label: "Chưa đi làm" },
  { id: "other", label: "Khác" },
];
