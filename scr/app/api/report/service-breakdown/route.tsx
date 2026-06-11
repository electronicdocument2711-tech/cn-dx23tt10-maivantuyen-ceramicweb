import { handleError } from "@/lib/response";
import { clean } from "@/lib/utils";
import { NextResponse, NextRequest } from "next/server";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // load locale
import { cms } from "@/lib/cms";
import { prop } from "remeda";
// set langage to vietnamese
dayjs.locale("vi");

/**
 * Hiệu suất dịch vụ trả về theo doanh thu hoặc theo số lượng lịch hẹn tương ứng
 * dịch vụ trong ngày, tuần, tháng hoặc 6 tháng gần nhất.
 * @param req
 * @returns
 */
export async function GET(req: NextRequest) {
  try {
    let { range, group } = await clean(req);
    if (!["day", "week", "month", "6month"].includes(range)) range = "day";
    if (!["revenue", "appointment"].includes(group)) group = "revenue";

    // toDate is now, fromDate is 7 days ago if range=day, 6 weeks ago if range=week, 6 months ago if range=month
    const toDate = dayjs().endOf("day");
    let fromDate = null;

    // 7 ngày gần nhất nếu range=day, 6 tuần gần nhất nếu range=week, 6 tháng gần nhất nếu range=month
    if (range === "day") {
      fromDate = toDate?.startOf("day"); // chỉ khác về thời gian bắt đầu là 00:00:01, thời gian kết thúc vẫn là now
    } else if (range === "week") {
      fromDate = toDate.startOf("week");
    } else if (range === "month") {
      fromDate = toDate.startOf("month");
    } else {
      fromDate = toDate.subtract(6, "month").startOf("month");
    }

    const fd = new FormData();
    fd.append("from", fromDate.unix().toString());
    fd.append("to", toDate.unix().toString());
    fd.append("groupBy", group);

    const response = await cms.post("/pos/dentalx/report/service", fd);

    const data = prop(response, ...["data", "module", "items"]) || [];

    return NextResponse.json(
      data?.map((item: any) => ({
        id: item?.ServiceId,
        name: item.Name,
        value: item?.Amount,
      })),
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
