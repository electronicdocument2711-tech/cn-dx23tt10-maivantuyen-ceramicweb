import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, withAuth } from "@/lib/response";
import { cms } from "@/lib/cms";
import { clean, toFormData } from "@/lib/utils";
import dayjs from "@/lib/dayjs";
import { prop } from "remeda";

import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);

/**
 * Hiệu suất lịch hẹn. Trả về bộ combo dữ liệu lịch hẹn bao gồm tiến trình của
 * 3 bước: lịch hẹn - khách hàng đến - khách hàng thanh toán, tương ứng với số lượng lịch hẹn, số lượng khách hàng đến và
 * số lượng khách hàng thanh toán trong ngày, tuần, tháng hoặc 6 tháng gần nhất.
 * @param req
 * @returns
 */
export async function GET(req: NextRequest) {
  try {
    const tokenData = await withAuth(req);
    if (!tokenData) throwError("Unauthorized", 401);

    const authorize = await cms.get("/authen/authorize");
    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId)
      throw new Error("Phòng khám không hợp lệ", { cause: 400 });

    // branch: id của branch hoặc all để lấy tất cả
    let url = `/hr/branch?_act=getBranchsWithPagination&&limit=-1`;
    let res = await cms.get(url);

    if (res.status !== 200) throwError("Lỗi khi lấy danh sách chi nhánh", 500);

    const branches = (res.data?.module?.views?.[0]?.data || []).map(
      (b: any) => b.BranchId,
    );

    let { by } = await clean(req);
    if (!["day", "week", "month"].includes(by)) by = "day";

    // toDate is now, fromDate is 7 days ago if by=day, 6 weeks ago if by=week, 6 months ago if by=month
    const toDate = dayjs().endOf("day");
    let fromDate = null;

    // 7 ngày gần nhất nếu by=day, 6 tuần gần nhất nếu by=week, 6 tháng gần nhất nếu by=month
    if (by === "day") fromDate = toDate.subtract(6, "day").startOf("day");
    else if (by === "week")
      fromDate = toDate.subtract(5, "week").startOf("week");
    else fromDate = toDate.subtract(5, "month").startOf("month");

    const params = {
      by,
      branches,
      from: fromDate.format("YYYY-MM-DD 00:00:01"),
      to: toDate.format("YYYY-MM-DD HH:mm:ss"),
    };

    url = "/pos/dentalx/report?_lay=appointment&_renderer=module";
    res = await cms.post(url, toFormData(params));

    if (res.status !== 200 || !res.data?.module)
      throwError("Lỗi khi danh sách phiếu thu", 500);

    const source = res.data?.module?.data || [];

    const items: {
      label: string;
      fullLabel: string;
      appointment: number;
      checkin: number;
      payment: number;
    }[] = [];

    // format lại dữ liệu trả về theo yêu cầu của chart
    if (by === "day") {
      // array of 7 recent days, label is "DD/MM", fullLabel is "DD/MM/YYYY"
      for (let i = 6; i >= 0; i--) {
        const day = toDate.subtract(i, "day");
        items.push({
          label: day.format("DD/MM"),
          fullLabel: `Ngày ${day.format("DD/MM/YYYY")}`,
          appointment:
            source.find((s: any) => s.TimeSlot === day.format("DD/MM/YYYY"))
              ?.appointment || 0,
          checkin:
            source.find((s: any) => s.TimeSlot === day.format("DD/MM/YYYY"))
              ?.checkin || 0,
          payment:
            source.find((s: any) => s.TimeSlot === day.format("DD/MM/YYYY"))
              ?.payment || 0,
        });
      }
    } else if (by === "week") {
      // array of 6 recent weeks, label is "Tuần X", fullLabel is "Tuần X (DD/MM/YYYY - DD/MM/YYYY)"
      for (let i = 5; i >= 0; i--) {
        const weekStart = toDate.subtract(i, "week").startOf("week");
        const weekEnd = toDate.subtract(i, "week").endOf("week");

        items.push({
          label: `W${weekStart.week()} ${weekStart.year()}`,
          fullLabel: `Tuần ${weekStart.format("DD/MM/YYYY")} - ${weekEnd.format("DD/MM/YYYY")})`,
          appointment:
            source.find(
              (s: any) =>
                s.TimeSlot === `W${weekStart.week()}-${weekStart.year()}`,
            )?.appointment || 0,
          checkin:
            source.find(
              (s: any) =>
                s.TimeSlot === `W${weekStart.week()}-${weekStart.year()}`,
            )?.checkin || 0,
          payment:
            source.find(
              (s: any) =>
                s.TimeSlot === `W${weekStart.week()}-${weekStart.year()}`,
            )?.payment || 0,
        });
      }
    } else {
      // array of 6 recent months, label is "MM/YYYY", fullLabel is "Tháng MM/YYYY"
      for (let i = 5; i >= 0; i--) {
        const month = toDate.subtract(i, "month");
        items.push({
          label: month.format("MM/YYYY"),
          fullLabel: `Tháng ${month.format("MM/YYYY")}`,
          appointment:
            source.find((s: any) => s.TimeSlot === month.format("MM/YYYY"))
              ?.appointment || 0,
          checkin:
            source.find((s: any) => s.TimeSlot === month.format("MM/YYYY"))
              ?.checkin || 0,
          payment:
            source.find((s: any) => s.TimeSlot === month.format("MM/YYYY"))
              ?.payment || 0,
        });
      }
    }

    return NextResponse.json({ data: items }, { status: 200 });

    // // format dữ liệu trả về cho chart, gồm label (ngày/tháng/tuần), fullLabel (ngày/tháng/tuần đầy đủ) và appointment (số lượng lịch hẹn)
    // let items: {
    //   label: string;
    //   fullLabel: string;
    //   appointment: number;
    //   checkin: number;
    //   payment: number;
    // }[] = [];

    // // 7 ngày gần nhất nếu by=day, 6 tuần gần nhất nếu by=week, 6 tháng gần nhất nếu by=month
    // if (by === "day") {
    //   fromDate = toDate.subtract(6, "day").startOf("day");

    //   // 7 last recents day with revenue, using dayjs to format date
    //   items = Array.from({ length: 7 }, (_, i) => {
    //     const date = dayjs().subtract(6 - i, "day");

    //     return {
    //       label: date.format("DD/MM").toString(),
    //       fullLabel: `${date.format("dddd, DD [tháng] MM/YYYY").toString()}`,
    //       appointment: 0, // số lượng lịch hẹn theo ngày
    //       checkin: 0, // số lượng khách hàng đến theo ngày
    //       payment: 0, // số lượng khách hàng thanh toán theo ngày
    //     };
    //   });
    // } else if (by === "week") {
    //   fromDate = toDate.subtract(5, "week").startOf("week");

    //   // 6 last recents week with appointment, using dayjs to format date
    //   items = Array.from({ length: 6 }, (_, i) => {
    //     const startOfWeek = dayjs()
    //       .subtract(7 * (6 - i), "day")
    //       .startOf("week");
    //     const endOfWeek = startOfWeek.endOf("week");
    //     return {
    //       label: `${startOfWeek.format("DD/MM")}-${endOfWeek.format("DD/MM")}`,
    //       fullLabel: `Tuần từ ${startOfWeek.format("DD/MM")}-${endOfWeek.format("DD/MM/YYYY")}`,
    //       appointment: 0, // số lượng lịch hẹn theo tuần
    //       checkin: 0, // số lượng khách hàng đến theo tuần
    //       payment: 0, // số lượng khách hàng thanh toán theo tuần
    //     };
    //   });
    // } else {
    //   fromDate = toDate.subtract(5, "month").startOf("month");

    //   // 6 last recents month with appointment, using dayjs to format date
    //   items = Array.from({ length: 6 }, (_, i) => {
    //     const date = dayjs().subtract(5 - i, "month");
    //     return {
    //       label: date.format("MM/YYYY").toString(),
    //       fullLabel: `${date.format("MMMM/YYYY").toString()}`,
    //       appointment: 0, // số lượng lịch hẹn theo tháng
    //       checkin: 0, // số lượng khách hàng đến theo tháng
    //       payment: 0, // số lượng khách hàng thanh toán theo tháng
    //     };
    //   });
    // }

    // return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
