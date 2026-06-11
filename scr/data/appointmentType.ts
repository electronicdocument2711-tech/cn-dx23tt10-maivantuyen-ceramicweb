export const AppointmentTypeOptions = [
  {
    AppointmentLabelId: 3,
    Name: "Tư vấn",
    Color: "4BAF50",
    Ordering: 0,
    ClientGroupId: 1,
  },
  {
    AppointmentLabelId: 6,
    Name: "Điều trị",
    Color: "F44336",
    Ordering: 1,
    ClientGroupId: 1,
  },
  {
    AppointmentLabelId: 9,
    Name: "Tái khám",
    Color: "FF9800",
    Ordering: 2,
    ClientGroupId: 1,
  },
];

export const AppointmentStatus = [
  {
    AppointmentStatusId: 41,
    Name: "Đã tiếp nhận",
    Ordering: 4,
    Sorting: 10,
    Description: null,
    Label: "Tiếp nhận khách hàng",
    ConfirmMessage: "Bạn có muốn tiếp nhận Khách hàng không?",
  },
  // {
  //   AppointmentStatusId: 44,
  //   Name: "Đang tư vấn",
  //   Ordering: 4,
  //   Sorting: 10,
  //   Description: null,
  //   Label: "Tư vấn",
  //   ConfirmMessage:
  //     "Thông tin khách hàng sẽ được chuyển đến bác sỹ để bắt đầu việc khám chữa bệnh. Bạn có muốn tiếp tục không?",
  // },
  // {
  //   AppointmentStatusId: 45,
  //   Name: "Đang điều trị",
  //   Ordering: 4,
  //   Sorting: 10,
  //   Description: null,
  //   Label: "Điều trị",
  //   ConfirmMessage:
  //     "Thời gian sẽ bắt đầu được tính sau khi bạn nhấn nút [Điều trị]. Bạn có muốn tiếp tục không?",
  // },
  // {
  //   AppointmentStatusId: 46,
  //   Name: "Đang chụp X quang",
  //   Ordering: 4,
  //   Sorting: 10,
  //   Description: null,
  //   Label: "Chụp X quang",
  //   ConfirmMessage:
  //     "Bạn có muốn chuyển Khách hàng đến phòng chụp X-Quang không?",
  // },
  // {
  //   AppointmentStatusId: 31,
  //   Name: "Đã chuyển đến bác sĩ",
  //   Ordering: 3,
  //   Sorting: 20,
  //   Description: null,
  //   Label: "Chuyển đến bác sĩ",
  //   ConfirmMessage:
  //     "Thông tin khách hàng sẽ được chuyển đến bác sỹ để bắt đầu việc khám chữa bệnh. Bạn có muốn tiếp tục không?",
  // },
  {
    AppointmentStatusId: 21,
    Name: "Đã checkin",
    Ordering: 2,
    Sorting: 30,
    Description: null,
    Label: "CheckIn",
    ConfirmMessage:
      'Bạn không thể hoàn tác sau khi nhấn nút "Check-In". Bạn có muốn tiếp tục không?',
  },
  // {
  //   AppointmentStatusId: 51,
  //   Name: "Đã chuyển đến lễ tân",
  //   Ordering: 5,
  //   Sorting: 40,
  //   Description: null,
  //   Label: "Chuyển đến lễ tân",
  //   ConfirmMessage:
  //     "Bạn đã hoàn thành việc khám chữa bệnh và muốn chuyển thông tin đến Lễ tân?",
  // },
  {
    AppointmentStatusId: 61,
    Name: "Đã thanh toán",
    Ordering: 6,
    Sorting: 50,
    Description: null,
    Label: "Thanh toán",
    ConfirmMessage:
      "Bạn có muốn đổi trạng thái lịch hẹn sang trạng thái 'Đã thanh toán' không?\r\n",
  },
  {
    AppointmentStatusId: 11,
    Name: "Chưa đến",
    Ordering: 1,
    Sorting: 60,
    Description: null,
    Label: "Chưa đến",
    ConfirmMessage: "",
  },
  {
    AppointmentStatusId: 71,
    Name: "Đã checkout",
    Ordering: 7,
    Sorting: 70,
    Description: null,
    Label: "Checkout",
    ConfirmMessage:
      'Bạn không thể hoàn tác sau khi nhấn nút "Check-Out". Bạn có muốn tiếp tục không?',
  },
  {
    AppointmentStatusId: 1,
    Name: "Đã huỷ hẹn",
    Ordering: 20,
    Sorting: 80,
    Description: null,
    Label: "Huỷ hẹn",
    ConfirmMessage:
      'Bạn không thể hoàn tác sau khi nhấn nút "Huỷ hẹn". Bạn có muốn tiếp tục không?\n',
  },
];


export type CalendarStatusKey = "all" | "arrived" | "pending" | "cancelled";

const PENDING_LABEL = "Chưa đến";
const CANCELLED_LABEL = "Huỷ hẹn";

const pendingStatusIds = AppointmentStatus.filter(
  (status) => status.Label === PENDING_LABEL,
).map((status) => status.AppointmentStatusId);

const cancelledStatusIds = AppointmentStatus.filter(
  (status) => status.Label === CANCELLED_LABEL,
).map((status) => status.AppointmentStatusId);

const arrivedStatusIds = AppointmentStatus.filter(
  (status) =>
    status.Label !== PENDING_LABEL && status.Label !== CANCELLED_LABEL,
).map((status) => status.AppointmentStatusId);

export const CalendarStatusSummary: Array<{
  key: CalendarStatusKey;
  label: string;
  bgColor: string;
}> = [
  { key: "all", label: "Lịch hẹn", bgColor: "bg-blue-300" },
  { key: "arrived", label: "Đã đến", bgColor: "bg-green-500" },
  { key: "pending", label: "Chưa đến", bgColor: "bg-orange-500" },
  { key: "cancelled", label: "Huỷ hẹn", bgColor: "bg-red-500" },
];

export const CalendarStatusIdsByKey: Record<CalendarStatusKey, number[]> = {
  all: [],
  arrived: arrivedStatusIds,
  pending: pendingStatusIds,
  cancelled: cancelledStatusIds,
};


//alway select and show 3 option default
export const appointmentStatusCompact = [
  {
    AppointmentStatusId: 21,
    Name: "Đã đến",
    Ordering: 2,
    Sorting: 30,
    Description: null,
    Label: "CheckIn",
    ConfirmMessage:
      'Bạn không thể hoàn tác sau khi nhấn nút "Check-In". Bạn có muốn tiếp tục không?',
  },
  {
    AppointmentStatusId: 11,
    Name: "Chưa đến",
    Ordering: 1,
    Sorting: 60,
    Description: null,
    Label: "",
    ConfirmMessage: "",
  },
  {
    AppointmentStatusId: 1,
    Name: "Đã hủy hẹn",
    Ordering: 20,
    Sorting: 80,
    Description: null,
    Label: "Huỷ hẹn",
    ConfirmMessage:
      'Bạn không thể hoàn tác sau khi nhấn nút "Huỷ hẹn". Bạn có muốn tiếp tục không?\n',
  },
];
