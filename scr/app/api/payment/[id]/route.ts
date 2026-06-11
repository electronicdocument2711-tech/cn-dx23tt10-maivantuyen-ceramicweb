import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { handleError, throwError, withAuth } from "@/lib/response";
import { toFormData } from "@/lib/utils";
import { prop } from "remeda";
export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await context.params;
    const customerId = req.nextUrl.searchParams.get("customerId");

    const tokenData = await withAuth(req);
    if (!tokenData) throwError("Unauthorized", 401);

    const authorize = await cms.get("/authen/authorize");
    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId)
      throw new Error("Phòng khám không hợp lệ", { cause: 400 });

    const data = { ReceiptId: [id], CustomerId: customerId };
    const url = `/pos/payment?_view=deposit&_lay=detailDeposit&_renderer=module`;
    const res = await cms.post(url, toFormData(data));

    if (res.status !== 200 || !res.data?.module?.views?.[0]?.data)
      throwError("Lỗi khi lấy thông tin thanh toán", 500);

    const receipt = res.data.module.views[0].data;

    // check if receipt belongs to customer
    if (receipt?.Customer?.CustomerId != customerId)
      throwError("Invalid access", 403);

    return NextResponse.json(receipt);
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
