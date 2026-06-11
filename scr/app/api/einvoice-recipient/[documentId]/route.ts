import { NextRequest, NextResponse } from "next/server";
import { validToken } from "@/lib/auth";
import { throwError } from "@/lib/response";
import { saas } from "@/lib/saas";

export async function PUT(req: NextRequest) {
  try {
    const tokenData = await validToken(req);
    if (!tokenData) throwError("Invalid token", 401);

    const documentId = req.nextUrl.pathname.split("/").pop();

    const body = await req.json();
    const {
      fullName,
      companyName,
      address,
      taxCode,
      citizenId,
      email,
      customerId,
    } = body;

    const res = await saas.put(`/api/einvoice-recipients/${documentId}`, {
      data: {
        customer_name: fullName,
        company_name: companyName,
        address,
        tax_number: taxCode,
        citizen_id: citizenId,
        email,
        customer_id: customerId,
      },
    });

    if (res.status !== 200 && res.status !== 201) {
      throw new Error("Cập nhật recipient config bị lỗi", {
        cause: 403,
      });
    }

    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    console.error("error: ", err);
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}
