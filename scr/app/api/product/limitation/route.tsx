import { NextResponse, NextRequest } from "next/server";
import { handleError, throwError, withAuth } from "@/lib/response";
import { cms } from "@/lib/cms";
import { prop } from "remeda";
import { saas } from "@/lib/saas";

/**
 * lấy limitaion của product của business hiện tại
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

    let params: any = {
      populate: { owner: { fields: ["id"] } },
      filters: { id: { $eq: clientGroupId } },
    };

    let res = await saas.get("/api/businesses", { params });
    if (
      res.status !== 200 ||
      !res.data ||
      !res.data.data ||
      res.data.data.length === 0
    )
      throw new Error("Invalid response from saas");

    const bus = res.data.data[0];

    if (!bus || !bus?.owner || !bus.owner?.id)
      throw new Error("Business owner not found");

    params = {
      fields: ["id"],
      populate: {
        subscription: {
          fields: ["id"],
          populate: {
            plan: {
              fields: ["id"],
              populate: { product: { fields: ["limitation"] } },
            },
          },
        },
      },
      filters: { user_info: { id: { $eq: bus.owner.id } } },
    };
    res = await saas.get(`/api/subscribers`, { params });

    if (
      res.status !== 200 ||
      !res.data ||
      !res.data.data ||
      res.data.data.length === 0 ||
      !res?.data?.data[0]?.subscription?.plan?.product?.limitation
    )
      throw new Error("Invalid response from saas");

    return NextResponse.json(
      {
        data:
          res?.data?.data[0]?.subscription?.plan?.product?.limitation || null,
      },
      { status: res?.status || 200 },
    );
  } catch (error: any) {
    return NextResponse.json(...handleError(error));
  }
}
