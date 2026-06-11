import { NextRequest, NextResponse } from "next/server";
import { validToken } from "@/lib/auth";
import { cms } from "@/lib/cms";
import { prop } from "remeda";
import { saas } from "@/lib/saas";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customer_id: string }> },
) {
  try {
    const { customer_id } = await params;

    if (!(await validToken(req)))
      throw new Error("Chưa xác thực", { cause: 401 });

    const authorize = await cms.get("/authen/authorize");

    if (!prop(authorize, ...["data", "module", "code"]))
      throw new Error("Chưa đăng nhập", { cause: 401 });

    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId)
      throw new Error("Phòng khám không hợp lệ", { cause: 400 });

    const searchParams = req.nextUrl.searchParams;

    const page = searchParams?.get("page") || "1";
    const pageSize = searchParams?.get("limit") || "12";
    const search = searchParams?.get("search") || "";
    const status = searchParams?.get("status") || "";
    const dateFrom = searchParams?.get("dateFrom") || "";
    const dateTo = searchParams?.get("dateTo") || "";

    const res = await saas.get("/api/einvoices", {
      params: {
        filters: {
          customer_id: { $eq: customer_id },
          ...(status && {
            $or: [
              { einvoice_status: { id: { $eq: status } } },
              { einvoice_tax_status: { id: { $eq: status } } },
              { request_status: { $eq: status } },
            ],
          }),
          ...(dateFrom &&
            dateTo && {
              createdAt: {
                $gte: dateFrom,
                $lte: dateTo,
              },
            }),
          ...(search && {
            $or: [
              { e_invoice_number: { $containsi: search } },
              { issuer_symbol: { $containsi: search } },
            ],
          }),
        },
        populate: {
          einvoice_status: { fields: ["id", "name", "provider_status_id"] },
          einvoice_provider: { fields: ["id", "name"] },
          user_created: { populate: { user_info: true } },
          einvoice_items: true,
        },
        sort: ["createdAt:desc"],
        pagination: {
          page: parseInt(page, 10),
          pageSize: parseInt(pageSize, 10),
          withCount: true,
        },
      },
    });

    if (res.status !== 200)
      throw new Error("lấy thông tin hoá đơn khách hàng thất bại", {
        cause: 502,
      });

    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}
