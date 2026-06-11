// Mock data for development and testing

import { Doctor } from "./types";

import { v4 as uuidv4 } from "uuid";

export const mockUsers: any[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://via.placeholder.com/150",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://via.placeholder.com/150",
    createdAt: new Date("2023-01-02"),
    updatedAt: new Date("2023-01-02"),
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: "doctor-1",
    name: "BS. Nguyễn Văn A",
    specialty: "Răng hàm mặt",
    avatar: "/UserAvatar.png",
    color: "#3b82f6", // Blue
  },
  {
    id: "doctor-2",
    name: "BS. Trần Thị B",
    specialty: "Nha khoa thẩm mỹ",
    avatar: "/UserAvatar.png",
    color: "#10b981", // Green
  },
  {
    id: "doctor-3",
    name: "BS. Lê Văn C",
    specialty: "Chỉnh nha",
    avatar: "/UserAvatar.png",
    color: "#f59e0b", // Orange
  },
  {
    id: "doctor-4",
    name: "BS. Phạm Thị D",
    specialty: "Nội nha",
    avatar: "/UserAvatar.png",
    color: "#8b5cf6", // Purple
  },
];

// Customer Type Definition
export type Customer = {
  id: string;
  customer: { id: string; name: string };
  status: { id: number; label: string };
  type: { id: number; label: string };
  date: string;
  fromTime: string;
  toTime: string;
  notes: string;
  doctor: {
    id: number;
    name: string;
    avatar: string;
  };
  branch: {
    id: number;
    name: string;
  };
  gender: "Nam" | "Nữ";
  age: number;
  email: string;
  phone: string;
};

export const mockNewAppointments: Customer[] = Array.from({ length: 50 }).map(
  (_, i) => ({
    id: uuidv4(),
    customer: {
      id: `KH${String(i + 1).padStart(9, "0")}`,
      name: [
        "Nguyễn Văn Nam",
        "Trần Thị Hoa",
        "Lê Hoàng Giang",
        "Phạm Minh Khang",
        "Đỗ Thị Lan",
        "Vũ Văn Nam",
        "Hoàng Thị Oanh",
        "Bùi Minh Phúc",
        "Ngô Thị Quỳnh",
        "Đinh Văn Sơn",
      ][i % 10],
    },
    status: {
      id: (i % 3) + 1,
      label: ["Chưa đến", "Đã đến", "Hủy hẹn"][i % 3],
    },
    type: {
      id: (i % 3) + 1,
      label: ["Điều trị", "Tái khám", "Tư vấn"][i % 3],
    },
    date: "2025-11-07",
    fromTime: "09:00",
    toTime: "10:00",
    notes: [
      "Nam cần khám răng định kỳ",
      "Chị Hoa cần tư vấn làm trắng răng",
      "Hẹn bác Hùng tư vấn làm răng sứ thẩm mỹ",
      "Chủ nhật này, chị Hoa sẽ đến khám răng định kỳ. Răng có hơi ố vàng, cần tư vấn thêm về dịch vụ làm trắng răng. Hãy sắp xếp cho chị bạn nhân viên thân thiện, cởi mở, tử tế, tinh tế, nói chuyện nhẹ nhàng",
      "Anh cần hàm răng trắng buốt tê tái con gà máy",
      "Bích cần niềng răng cho bớt hô",
    ][i % 10],
    doctor: {
      id: (i % 3) + 1, // ← Thay đổi: 1, 2, 3 luân phiên
      name: ["BS. Hùng Lê", "BS. Minh Phạm", "BS. Thảo Vũ"][i % 3],
      avatar: "/UserAvatar.png",
    },
    branch: {
      id: 1,
      name: ["123 Nguyễn Trãi", "456 Trần Hưng Đạo", "789 Lê Lợi"][i % 3],
    },

    gender: i % 2 === 0 ? "Nam" : "Nữ",
    age: 20 + (i % 50),
    email: `customer${i + 1}@example.com`,
    phone: `090${String(i).padStart(7, "0")}`,
  })
);

export const mockAppointments = [
  {
    id: "1",
    title: "Khám răng định kỳ",
    patientName: "Nguyễn Văn Nam",
    status: "scheduled", // lịch hẹn
    start: new Date(new Date().setHours(9, 0, 0)),
    end: new Date(new Date().setHours(10, 0, 0)),
    resourceId: "doctor-1",
    code: "KH000000",
    notes: "Nam cần khám răng định kỳ",
    phone: "0909090909",
    local: "KDL.TMTL",
    avatar: "/UserAvatar.png",
  },
  {
    id: "2",
    title: "Nhổ răng khôn",
    patientName: "Trần Thị Hoa",
    status: "arrived", // đã đến
    start: new Date(new Date().setHours(10, 30, 0)),
    end: new Date(new Date().setHours(11, 30, 0)),
    resourceId: "doctor-1",
    code: "KH000001",
    local: "KDL.TMTL",
    notes:
      "Chủ nhật này, chị Hoa sẽ đến khám răng định kỳ. Răng có hơi ố vàng, cần tư vấn thêm về dịch vụ làm trắng răng. Hãy sắp xếp cho chị bạn nhân viên thân thiện, cởi mở, tử tế, tinh tế, nói chuyện nhẹ nhàng",
    phone: "0919191919",
    avatar: "/UserAvatar.png",
  },
  {
    id: "3",
    title: "Tẩy trắng răng",
    patientName: "Phạm Minh Khang",
    status: "pending", // chưa đến
    start: new Date(new Date().setHours(9, 0, 0)),
    end: new Date(new Date().setHours(10, 30, 0)),
    resourceId: "doctor-2",
    code: "KH000002",
    local: "KDL.TMTL",
    notes: "Anh cần hàm răng trắng buốt tê tái con gà máy",
    phone: "0939393939",
    avatar: "/UserAvatar.png",
  },
  {
    id: "4",
    title: "Niềng răng",
    patientName: "Lê Ngọc Bích",
    status: "cancelled", // huỷ hẹn
    start: new Date(new Date().setHours(14, 0, 0)),
    end: new Date(new Date().setHours(15, 30, 0)),
    resourceId: "doctor-3",
    local: "KDL.TMTL",
    notes: "Bích cần niềng răng cho bớt hô",
    phone: "0968686868",
    avatar: "/UserAvatar.png",
  },
  {
    id: "5",
    title: "Điều trị tủy răng",
    patientName: "Đỗ Hải Đăng",
    status: "scheduled",
    start: new Date(new Date().setHours(11, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0)),
    resourceId: "doctor-4",
    code: "KH000003",
    local: "KDL.TMTL",
    notes: "Đăng cần nhổ răng vì nhứt răng",
    phone: "0977777777",
    avatar: "/UserAvatar.png",
  },
  // Chưa gán bác sĩ
  {
    id: "6",
    title: "Tư vấn lần đầu",
    patientName: "Vũ Thảo My",
    status: "pending",
    start: new Date(new Date().setHours(13, 0, 0)),
    end: new Date(new Date().setHours(13, 30, 0)),
    resourceId: "doctor-4",
    code: "KH000004",
    local: "KDL.TMTL",
    notes: "My đến mà không có hẹn, đặt lịch",
    phone: "0988888888",
    avatar: "/UserAvatar.png",
  },
  {
    id: "7",
    title: "Tư vấn lần đầu",
    patientName: "Vũ Thảo My",
    status: "pending",
    start: new Date(new Date().setHours(13, 0, 0)),
    end: new Date(new Date().setHours(13, 30, 0)),
    resourceId: "doctor-4",
    code: "KH000004",
    local: "KDL.TMTL",
    notes: "My đến mà không có hẹn, đặt lịch",
    phone: "0988888888",
    avatar: "/UserAvatar.png",
  },
  {
    id: "8",
    title: "Tư vấn lần đầu",
    patientName: "Vũ Thảo My",
    status: "pending",
    start: new Date(new Date().setHours(13, 0, 0)),
    end: new Date(new Date().setHours(13, 30, 0)),
    resourceId: "doctor-4",
    code: "KH000004",
    local: "KDL.TMTL",
    notes: "My đến mà không có hẹn, đặt lịch",
    phone: "0988888888",
    avatar: "/UserAvatar.png",
  },
  {
    id: "9",
    title: "Tư vấn lần đầu",
    patientName: "Vũ Thảo My",
    status: "pending",
    start: new Date(new Date().setHours(13, 0, 0)),
    end: new Date(new Date().setHours(13, 30, 0)),
    resourceId: "doctor-4",
    code: "KH000004",
    local: "KDL.TMTL",
    notes: "My đến mà không có hẹn, đặt lịch",
    phone: "0988888888",
    avatar: "/UserAvatar.png",
  },
  {
    id: "10",
    title: "Tư vấn lần đầu",
    patientName: "Vũ Thảo My",
    status: "pending",
    start: new Date(new Date().setHours(13, 0, 0)),
    end: new Date(new Date().setHours(13, 30, 0)),
    // resourceId: undefined
    code: "KH000004",
    local: "KDL.TMTL",
    notes: "My đến mà không có hẹn, đặt lịch",
    phone: "0988888888",
    avatar: "/UserAvatar.png",
  },
  {
    id: "11",
    title: "Điều trị tủy răng",
    patientName: "Đỗ Hải Đăng",
    status: "scheduled",
    start: new Date(new Date().setHours(11, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0)),
    resourceId: "doctor-4",
    code: "KH000003",
    local: "KDL.TMTL",
    notes: "Đăng cần nhổ răng vì nhứt răng",
    phone: "0977777777",
    avatar: "/UserAvatar.png",
  },
  {
    id: "12",
    title: "Điều trị tủy răng",
    patientName: "Đỗ Hải Đăng",
    status: "scheduled",
    start: new Date(new Date().setHours(11, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0)),
    resourceId: "doctor-4",
    code: "KH000003",
    local: "KDL.TMTL",
    notes: "Đăng cần nhổ răng vì nhứt răng",
    phone: "0977777777",
    avatar: "/UserAvatar.png",
  },
  {
    id: "13",
    title: "Điều trị tủy răng",
    patientName: "Đỗ Hải Đăng",
    status: "scheduled",
    start: new Date(new Date().setHours(11, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0)),
    resourceId: "doctor-4",
    code: "KH000003",
    local: "KDL.TMTL",
    notes: "Đăng cần nhổ răng vì nhứt răng",
    phone: "0977777777",
    avatar: "/UserAvatar.png",
  },
  {
    id: "14",
    title: "Điều trị tủy răng",
    patientName: "Đỗ Hải Đăng",
    status: "scheduled",
    start: new Date(new Date().setHours(11, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0)),
    resourceId: "doctor-4",
    code: "KH000003",
    local: "KDL.TMTL",
    notes: "Đăng cần nhổ răng vì nhứt răng",
    phone: "0977777777",
    avatar: "/UserAvatar.png",
  },
  {
    id: "15",
    title: "Điều trị tủy răng",
    patientName: "Đỗ Hải Đăng",
    status: "scheduled",
    start: new Date(new Date().setHours(11, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0)),
    resourceId: "doctor-4",
    code: "KH000003",
    local: "KDL.TMTL",
    notes: "Đăng cần nhổ răng vì nhứt răng",
    phone: "0977777777",
    avatar: "/UserAvatar.png",
  },
  {
    id: "16",
    title: "Điều trị tủy răng",
    patientName: "Đỗ Hải Đăng",
    status: "scheduled",
    start: new Date(new Date().setHours(11, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0)),
    resourceId: "doctor-4",
    code: "KH000003",
    local: "KDL.TMTL",
    notes: "Đăng cần nhổ răng vì nhứt răng",
    phone: "0977777777",
    avatar: "/UserAvatar.png",
  },
];

export const mockAppointmentsWithDoctor = mockAppointments.map(
  (appointment) => {
    const doctor = mockDoctors.find((d) => d.id === appointment.resourceId);
    return {
      ...appointment,
      doctorName: doctor ? doctor.name : "",
      doctorAvatar: doctor ? doctor.avatar : "",
    };
  }
);

const mockData = {
  users: mockUsers,
  doctors: mockDoctors,
  appointments: mockAppointmentsWithDoctor,
};

export const BRANCHES: readonly string[] = [
  "CMT8",
  "TRƯỜNG CHINH",
  "123 NGUYEN TRINH",
  "24 CUU LONG",
];

export const doctors = [
  { key: "1", doctor: "Bs. Thanh Bình" },
  { key: "2", doctor: "Bs. Cẩm Tú" },
  { key: "3", doctor: "Bs. Hoa" },
  { key: "4", doctor: "Bs. Huy" },
  { key: "5", doctor: "Bs. Mỹ Linh" },
  { key: "6", doctor: "Bs. Long" },
  { key: "7", doctor: "Bs. Thị Bác" },
  { key: "8", doctor: "Bs. Phụng" },
  { key: "9", doctor: "Bs. Ngọc Bích" },
];

export const technicians = [
  { key: "1", name: "KTV.Mai" },
  { key: "2", name: "KTV.Ái" },
  { key: "3", name: "KTV.Sơn" },
  { key: "4", name: "KTV.Dũng" },
  { key: "5", name: "KTV.Linh" },
  { key: "6", name: "KTV.Chi" },
];

export default mockData;
