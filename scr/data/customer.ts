// Customer Type Definition
export type Customer = {
  id: string;
  name: string;
  customerCode: string;
  gender: "Nam" | "Nữ";
  age: number;
  email: string;
  phone: string;
  // invId: string;
  // status: "active" | "inactive";
  // address?: string;
};

// Mock Customer Data
export const initialCustomers: Customer[] = Array.from({ length: 50 }).map(
  (_, i) => ({
    id: `${i + 1}`,
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
    customerCode: `KH${String(i + 1).padStart(9, "0")}`,
    gender: i % 2 === 0 ? "Nam" : "Nữ",
    age: 20 + (i % 50),
    email: `customer${i + 1}@example.com`,
    phone: `090${String(i).padStart(7, "0")}`,
    // invId: i % 3 === 0 ? `INV${String(i + 1).padStart(6, "0")}` : "Chưa có",
    // status: i % 7 === 0 ? "inactive" : "active",
    // address: `Địa chỉ ${i + 1}, Quận ${(i % 12) + 1}, TP.HCM`,
  }),
);

export const CUSTOMER_NOTE_CATEGORIES = [
  {
    CustomerNoteCategoryId: 7,
    Name: "Chăm sóc Khách hàng",
    State: 1,
    Ordering: 0,
    AddedAt: 1542968169,
    AddedBy: 2,
    EditedAt: 1542968169,
    EditedBy: 2,
  },
  {
    CustomerNoteCategoryId: 8,
    Name: "Thông thường",
    State: 1,
    Ordering: 0,
    AddedAt: 1543226642,
    AddedBy: 2,
    EditedAt: 1543226642,
    EditedBy: 2,
  },
  {
    CustomerNoteCategoryId: 10,
    Name: "Không đủ sức khỏe",
    State: 1,
    Ordering: 0,
    AddedAt: 1543226642,
    AddedBy: 2,
    EditedAt: 1543226642,
    EditedBy: 2,
  },
  {
    CustomerNoteCategoryId: 11,
    Name: "Khác",
    State: 1,
    Ordering: 0,
    AddedAt: 1542968169,
    AddedBy: 2,
    EditedAt: 1542968169,
    EditedBy: 2,
  },
  {
    CustomerNoteCategoryId: 870,
    Name: "Tư vấn",
    State: 1,
    Ordering: 0,
    AddedAt: 1542968169,
    AddedBy: 2,
    EditedAt: 1542968169,
    EditedBy: 2,
  },
  {
    CustomerNoteCategoryId: 871,
    Name: "Ghi chú bác sỹ",
    State: 1,
    Ordering: 2,
    AddedAt: 1544646864,
    AddedBy: 2266,
    EditedAt: 1544646864,
    EditedBy: 2266,
  },
  {
    CustomerNoteCategoryId: 872,
    Name: "Đánh giá",
    State: 1,
    Ordering: 0,
    AddedAt: 1572886800,
    AddedBy: 2,
    EditedAt: 1572886800,
    EditedBy: 2,
  },
];
