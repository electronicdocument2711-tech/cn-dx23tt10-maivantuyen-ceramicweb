export type Customer = {
  id: string;
  name: string;
  avatar?: string;
};

export type FollowUpStatus =
  | { id: 1; label: "Chưa hoàn thành" }
  | { id: 2; label: "Hoàn thành" };

export type FollowUpType =
  | { id: 1; label: "Thông thường" }
  | { id: 2; label: "Chăm sóc khách hàng" }
  | { id: 3; label: "Không đủ sức khỏe" }
  | { id: 4; label: "Tư vấn" }
  | { id: 5; label: "Đánh giá" }
  | { id: 6; label: "Ghi chú bác sĩ" }
  | { id: 7; label: "Khác" };

export type CustomerFollowUp = {
  id: string;
  content: string;
  type: FollowUpType;
  status: FollowUpStatus;
};
