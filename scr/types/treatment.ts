export type SectionKey =
  | "admission"
  | "progress"
  | "course"
  | "treatmentNote"
  | "dischargeNote";

export type OpenSectionsState = Record<SectionKey, boolean>;

export interface SectionDefinition {
  key: SectionKey;
  title: string;
  placeholder?: string;
}

export const ADMISSION_OPTIONS = [
  "Bệnh tỉnh, tiếp xúc tốt",
  "Da niêm hồng",
  "Nhập Mạch & Huyết áp",
  "Tim đều, rõ",
  "Phổi trong, không ran",
];

export const COURSE_OPTIONS = [
  "Bệnh tỉnh, tiếp xúc tốt",
  "Da niêm hồng",
  "Nhập Mạch & Huyết áp",
  "Tim đều, rõ",
  "Phổi trong, không ran",
];

export const TREATMENT_NOTE_OPTIONS = [
  "Hỗ trợ bác sĩ ghi phiếu tư vấn",
  "Hướng dẫn bệnh nhân xét nghiệm",
  "Hướng dẫn bệnh nhân chụp phim",
  "Đưa bệnh nhân/khách hàng vào phòng thủ thuật",
  "Mắc monitoring theo dõi sinh hiệu liên tục",
  "Gây tê tại chỗ bằng",
  "Gây tê vùng bằng",
];

export const TREATMENT_NOTE_FOLLOW_UP_OPTION =
  "Cho bệnh nhân súc miệng bằng dung dịch";

export const DISCHARGE_NOTE_OPTIONS = [
  "Cho bệnh nhân ra về",
  "Hướng dẫn vệ sinh răng miệng",
  "Uống thuốc theo toa",
  "Tái khám định kỳ mỗi",
  "Hẹn ngày",
];

export const INITIAL_OPEN_SECTIONS: OpenSectionsState = {
  admission: true,
  progress: true,
  course: true,
  treatmentNote: false,
  dischargeNote: false,
};

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    key: "admission",
    title: "Tình trạng vào viện",
  },
  {
    key: "progress",
    title: "Tiến trình điều trị",
    placeholder: "Nội dung sẽ triển khai ở bước tiếp theo.",
  },
  {
    key: "course",
    title: "Diễn biến bệnh",
    placeholder: "Nội dung sẽ triển khai ở bước tiếp theo.",
  },
  {
    key: "treatmentNote",
    title: "Ghi chú điều trị (Y lệnh điều trị)",
    placeholder: "Nội dung sẽ triển khai ở bước tiếp theo.",
  },
  {
    key: "dischargeNote",
    title: "Ghi chú ra viện (Y lệnh ra viện)",
    placeholder: "Nội dung sẽ triển khai ở bước tiếp theo.",
  },
];
