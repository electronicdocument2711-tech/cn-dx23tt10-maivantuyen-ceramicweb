import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, withAuth } from "@/lib/response";
import { cms } from "@/lib/cms";
import { clean, toFormData } from "@/lib/utils";
import dayjs from "@/lib/dayjs";
import { prop } from "remeda";

import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);

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

    url = "/pos/dentalx/report?_lay=revenue&_renderer=module";
    res = await cms.post(url, toFormData(params));

    if (res.status !== 200 || !res.data?.module)
      throwError("Lỗi khi danh sách phiếu thu", 500);

    const source = res.data?.module?.data || [];
    const items: { label: string; fullLabel: string; value: number }[] = [];

    // format lại dữ liệu trả về theo yêu cầu của chart
    if (by === "day") {
      // array of 7 recent days, label is "DD/MM", fullLabel is "DD/MM/YYYY"
      for (let i = 6; i >= 0; i--) {
        const day = toDate.subtract(i, "day");
        items.push({
          label: day.format("DD/MM"),
          fullLabel: `Ngày ${day.format("DD/MM/YYYY")}`,
          value:
            source.find((s: any) => s.TimeSlot === day.format("DD/MM/YYYY"))
              ?.Revenue || 0,
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
          value:
            source.find(
              (s: any) =>
                s.TimeSlot === `W${weekStart.week()}-${weekStart.year()}`,
            )?.Revenue || 0,
        });
      }
    } else {
      // array of 6 recent months, label is "MM/YYYY", fullLabel is "Tháng MM/YYYY"
      for (let i = 5; i >= 0; i--) {
        const month = toDate.subtract(i, "month");
        items.push({
          label: month.format("MM/YYYY"),
          fullLabel: `Tháng ${month.format("MM/YYYY")}`,
          value:
            source.find((s: any) => s.TimeSlot === month.format("MM/YYYY"))
              ?.Revenue || 0,
        });
      }
    }

    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
