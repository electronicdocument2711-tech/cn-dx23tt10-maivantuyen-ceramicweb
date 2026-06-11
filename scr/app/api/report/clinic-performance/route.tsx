import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, withAuth } from "@/lib/response";
import { cms } from "@/lib/cms";
import { clean, toFormData } from "@/lib/utils";
import dayjs from "@/lib/dayjs";
import { prop } from "remeda";

/**
 * Danh sách năng xuất theo từng chi nhánh. Các chỉ số quan tâm gồm
 * - Doanh thu: tổng doanh thu của chi nhánh trong khoảng thời gian
 * - Số lượng khách hàng: tổng số khách hàng đã sử dụng dịch vụ tại chi nhánh trong khoảng thời gian
 * - Số lượng lịch hẹn: tổng số lịch hẹn đã được đặt tại chi nhánh trong khoảng thời gian
 * - Doanh thu trung bình trên mỗi khách hàng: doanh thu chia cho số lượng khách hàng
 * - Doanh thu trung bình trên mỗi lịch hẹn: doanh thu chia cho số lượng lịch hẹn
 *
 * Khoảng thời gian có thể là ngày, tuần hoặc tháng, tùy theo tham số `by` trong query string. Mặc định là ngày.
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
    if (!["day", "week", "month", "6month"].includes(by)) by = "day";

    // toDate is now, fromDate is 7 days ago if by=day, 6 weeks ago if by=week, 6 months ago if by=month
    const toDate = dayjs().endOf("day");
    let fromDate = null;

    // 7 ngày gần nhất nếu by=day, 6 tuần gần nhất nếu by=week, 6 tháng gần nhất nếu by=month
    if (by === "day") {
      fromDate = toDate; // chỉ khác về thời gian bắt đầu là 00:00:01, thời gian kết thúc vẫn là now
    } else if (by === "week") {
      fromDate = toDate.startOf("week");
    } else if (by === "month") {
      fromDate = toDate.startOf("month");
    } else {
      fromDate = toDate.subtract(6, "month").startOf("month");
    }

    const data = {
      branches,
      from: fromDate.format("YYYY-MM-DD 00:00:01"),
      to: toDate.format("YYYY-MM-DD HH:mm:ss"),
    };

    url = "/pos/dentalx/report?_lay=branch&_renderer=module";
    res = await cms.post(url, toFormData(data));

    if (res.status !== 200 || !res.data?.module)
      throwError("Lỗi khi danh sách phiếu thu", 500);

    return NextResponse.json(
      { data: res.data?.module?.items },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
