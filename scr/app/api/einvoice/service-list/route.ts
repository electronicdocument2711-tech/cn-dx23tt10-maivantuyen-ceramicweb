import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, ValidateTokenAndAuth } from "@/lib/response";
import { cms } from "@/lib/cms";

export async function GET(req: NextRequest) {
  try {
    const searchParms = req.nextUrl.searchParams;
    const customerId = parseInt(searchParms.get("customerId") ?? "0", 10);
    if (!customerId || customerId < 1)
      throwError("Mã khách hàng không hợp lệ", 400);

    await ValidateTokenAndAuth(req);
    const formData = new FormData();
    formData.append("CustomerId", customerId.toString());
    const res = await cms.post(
      "pos/payment?_lay=listPaymentIsNotExportEInvoiceOfCustomer",
      formData,
    );
    const data = res.data?.module?.views?.[0]?.data ?? [];
    if (!data) throwError("Đã có lỗi xảy ra khi lấy dữ liệu dịch vụ", 502);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
