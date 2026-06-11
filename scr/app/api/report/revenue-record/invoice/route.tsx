import { handleError } from "@/lib/response";
import { clean } from "@/lib/utils";
import { NextResponse, NextRequest } from "next/server";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // load locale
import { AnyCaaRecord } from "dns";
// set langage to vietnamese
dayjs.locale("vi");

/**
 * Trả về danh sách các hóa đơn xuất trong khoảng thời gian theo ngày, tuần hoặc tháng, tùy theo tham số `by` trong query string. Mặc định là ngày.
 * @param req
 * @returns
 */
export async function GET(req: NextRequest) {
  try {
    let { by } = await clean(req);
    if (!["day", "week", "month"].includes(by)) by = "day";

    // toDate is now, fromDate is 7 days ago if by=day, 6 weeks ago if by=week, 6 months ago if by=month
    const toDate = dayjs().endOf("day");
    let fromDate = toDate.startOf("day");

    // format dữ liệu trả về cho chart, gồm label (ngày/tháng/tuần), fullLabel (ngày/tháng/tuần đầy đủ) và revenue (doanh thu)
    const items: AnyCaaRecord[] = [];

    // 7 ngày gần nhất nếu by=day, 6 tuần gần nhất nếu by=week, 6 tháng gần nhất nếu by=month
    if (by === "week") {
      fromDate = toDate.startOf("week");
    } else {
      fromDate = toDate.startOf("month");
    }

    console.log("formDate", fromDate);

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
