import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, withAuth } from "@/lib/response";
import { cms } from "@/lib/cms";
import { clean, toFormData } from "@/lib/utils";
import dayjs from "@/lib/dayjs";
import { prop } from "remeda";

const limit = 10;

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

    const { range: by, branch, page } = await clean(req);
    let range = by;
    if (!by || !["day", "week", "month"].includes(by)) range = "day";

    // branch: id của branch hoặc all để lấy tất cả
    let url = `/hr/branch?_act=getBranchsWithPagination&&limit=-1`;
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
    const fromTime = today.startOf(range).format("YYYY-MM-DD 00:00:01");

    const data = {
      branches: branchIds,
      from: fromTime,
      to: toTime,
      limit,
      lmstart: page ? (page - 1) * limit : 0,
    };

    url = "/pos/dentalx/report?_lay=payment&_renderer=module";
    res = await cms.post(url, toFormData(data));

    if (res.status !== 200 || !res.data?.module)
      throwError("Lỗi khi danh sách phiếu thu", 500);

    return NextResponse.json(
      {
        data: res.data?.module?.items,
        meta: {
          pagination: {
            page: page || 1,
            pageCount: Math.ceil(
              (res.data?.module?.pagination?.totalRecord || 0) / limit,
            ),
            pageSize: limit,
            total: res.data?.module?.pagination?.totalRecord || 0,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
