export const userRoles: {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  nb_users: number;
}[] = [
  {
    id: 5,
    documentId: "d8rhyni4grlibqfrxukg5s5d",
    name: "Authenticated",
    description: "Default role given to authenticated user.",
    type: "authenticated",
    createdAt: "2025-10-15T03:29:20.255Z",
    updatedAt: "2025-12-29T03:47:11.174Z",
    publishedAt: "2025-10-15T03:29:20.256Z",
    nb_users: 34,
  },
  {
    id: 6,
    documentId: "eqrvg6aq2kkddteqpfoxb7qd",
    name: "Public",
    description: "Default role given to unauthenticated user.",
    type: "public",
    createdAt: "2025-10-15T03:29:20.264Z",
    updatedAt: "2025-12-26T10:47:49.274Z",
    publishedAt: "2025-10-15T03:29:20.264Z",
    nb_users: 0,
  },
];

export const roleDisplayCalendar = [2, 4]; // Bác sĩ và Trợ lý (Tư vấn) sẽ có thể được chọn để filter trên lịch hẹn

export const DEFAULT_BUSINESS_ROLE = "bwjci9mxdi5qchfhs1msh1ce"; // Role Bác Sĩ

export const businessRoles: {
  id: number;
  documentId: string;
  name: string;
  ordering: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}[] = [
  // * Bỏ role quản lý phòng khám, role mặc định sẽ là bác sĩ
  // {
  //   id: 1,
  //   documentId: "n35ilxcf6dfg6sievid4o9nz",
  //   name: "Quản lý phòng khám",
  //   ordering: 0,
  //   createdAt: "2025-12-24T12:10:11.227Z",
  //   updatedAt: "2025-12-24T12:10:11.227Z",
  //   publishedAt: "2025-12-24T12:10:11.221Z",
  // },
  {
    id: 2,
    documentId: "bwjci9mxdi5qchfhs1msh1ce",
    name: "Bác sĩ",
    ordering: 5,
    createdAt: "2025-12-24T12:10:23.077Z",
    updatedAt: "2025-12-24T12:10:23.077Z",
    publishedAt: "2025-12-24T12:10:23.074Z",
  },
  {
    id: 3,
    documentId: "lpgmj2zbnj6ono5btj0mf0o0",
    name: "Y tá (Phụ tá)",
    ordering: 10,
    createdAt: "2025-12-24T12:10:48.975Z",
    updatedAt: "2025-12-24T12:10:48.975Z",
    publishedAt: "2025-12-24T12:10:48.972Z",
  },
  {
    id: 4,
    documentId: "w56mg863iofybvdgj8myqldr",
    name: "Trợ lý (Tư vấn)",
    ordering: 15,
    createdAt: "2025-12-24T12:12:01.492Z",
    updatedAt: "2025-12-24T12:12:01.492Z",
    publishedAt: "2025-12-24T12:12:01.489Z",
  },
];
