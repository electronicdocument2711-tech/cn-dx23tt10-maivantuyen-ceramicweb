import { handleError } from "@/lib/response";
import { clean } from "@/lib/utils";
import { NextResponse, NextRequest } from "next/server";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // load locale
import { cms } from "@/lib/cms";
import { prop } from "remeda";
import { saas } from "@/lib/saas";
// set langage to vietnamese
dayjs.locale("vi");

/**
 * Danh sách năng xuất theo từng bác sĩ. Các chỉ số quan tâm gồm
 * - Doanh thu: tổng doanh thu của bác sĩ trong khoảng thời gian
 * - Số lượng khách hàng: tổng số khách hàng đã sử dụng dịch vụ tại bác sĩ trong khoảng thời gian
 * - Số lượng lịch hẹn: tổng số lịch hẹn đã được đặt tại bác sĩ trong khoảng thời gian
 * - Doanh thu trung bình trên mỗi khách hàng: doanh thu chia cho số lượng khách hàng
 * - Doanh thu trung bình trên mỗi lịch hẹn: doanh thu chia cho số lượng lịch hẹn
 *
 * Khoảng thời gian có thể là ngày, tuần hoặc tháng, tùy theo tham số `by` trong query string. Mặc định là ngày.
 * @param req
 * @returns
 */
export async function GET(req: NextRequest) {
  try {
    let { by } = await clean(req);
    if (!["day", "week", "month", "6month"].includes(by)) by = "day";

    // toDate is now, fromDate is 7 days ago if by=day, 6 weeks ago if by=week, 6 months ago if by=month
    const toDate = dayjs().endOf("day");
    let fromDate = null;

    // 7 ngày gần nhất nếu by=day, 6 tuần gần nhất nếu by=week, 6 tháng gần nhất nếu by=month
    if (by === "day") {
      fromDate = toDate.startOf("day"); // chỉ khác về thời gian bắt đầu là 00:00:01, thời gian kết thúc vẫn là now
    } else if (by === "week") {
      fromDate = toDate.startOf("week");
    } else if (by === "month") {
      fromDate = toDate.startOf("month");
    } else {
      fromDate = toDate.subtract(6, "month").startOf("month");
    }

    const fd = new FormData();
    fd.append("from", fromDate.unix().toString());
    fd.append("to", toDate.unix().toString());

    const response = await cms.post("/pos/dentalx/report/doctor", fd);

    const items = prop(response, ...["data", "module", "items"]) || [];

    const doctorInfos = await saas
      .get("/api/users", {
        params: {
          filters: {
            id: {
              $in: items.map((item: any) => Number(item.StaffId)),
            },
          },
          populate: {
            user_info: {
              fields: ["name"],
            },
          },
        },
      })
      .then((res) => {
        if (res?.status !== 200) return [];
        return res?.data || [];
      });

    return NextResponse.json(
      items?.map((item: any) => {
        const doctorInfo = doctorInfos.find(
          (doc: any) => doc?.id === Number(item.StaffId),
        );

        return {
          doctor: {
            id: item.StaffId,
            name: doctorInfo?.user_info?.name || "N/A",
          },
          revenue: item?.Revenue,
          customer: item?.CustomerCount,
          appointment: item?.AppointmentCount,
        };
      }),
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
