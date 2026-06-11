import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { handleError, throwError, withAuth } from "@/lib/response";
import { clean } from "@/lib/utils";
import dayjs from "@/lib/dayjs";
import { saas } from "@/lib/saas";
import { prop } from "remeda";

export async function GET(req: NextRequest) {
  try {
    const tokenData = await withAuth(req);
    if (!tokenData) throwError("Unauthorized", 401);

    const { range, branch, page } = await clean(req);
    const by =
      !range || !["day", "week", "month"].includes(range) ? "day" : range;

    const authorize = await cms.get("/authen/authorize");
    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId)
      throw new Error("Phòng khám không hợp lệ", { cause: 400 });

    // branch: id của branch hoặc all để lấy tất cả
    const url = `/hr/branch?_act=getBranchsWithPagination&&limit=-1`;
    let res = await cms.get(url);

    if (res.status !== 200) throwError("Lỗi khi lấy danh sách chi nhánh", 500);

    const branches = res.data?.module?.views?.[0]?.data || [];

    // lấy mảng ids các chi nhánh
    const branchIds =
      branch === "all"
        ? branches.map((b: any) => b.BranchId)
        : branches
            .filter((b: any) => b.BranchId == branch)
            .map((b: any) => b.BranchId);

    const today = dayjs();
    const toTime = today.format("YYYY-MM-DD HH:mm:ss");
    const fromTime = today.startOf(by).format("YYYY-MM-DD 00:00:01");

    const params = {
      filters: {
        business: clientGroupId,
        branch_id: { $in: branchIds },
        createdAt: { $gte: fromTime, $lte: toTime },
      },
      populate: {
        einvoice_status: { fields: ["id", "name", "provider_status_id"] },
        einvoice_provider: { fields: ["id", "name"] },
        user_created: {
          fields: ["id", "username"],
          populate: { user_info: { fields: ["email", "name"] } },
        },
        einvoice_items: true,
      },
      sort: ["createdAt:desc"],
      pagination: {
        page: parseInt(page, 10) || 1,
        pageSize: 10,
        withCount: true,
      },
    };
    // truy vấn các hóa đơn
    res = await saas.get("/api/einvoices", { params });

    if (res.status !== 200 || !res?.data)
      throwError("Lỗi khi lấy danh sách hóa đơn", 500);

    return NextResponse.json(res?.data || [], { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
