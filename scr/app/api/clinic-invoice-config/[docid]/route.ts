import { saas } from "@/lib/saas";
import { validToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";
import { cms } from "@/lib/cms";
import { clean } from "@/lib/utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ docid: string }> },
) {
  try {
    const { docid } = await params;

    if (!docid) throw new Error("Truy vấn không hợp lệ", { cause: 400 });

    if (!(await validToken(request)))
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

    //TODO: check if current request is from the owner

    const res = await saas.delete(`/api/clinic-invoice-configs/${docid}`);
    if (res.status !== 204)
      throw new Error("Xóa không thành công", { cause: 400 });

    return NextResponse.json({ documentId: docid }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ docid: string }> },
) {
  try {
    const { docid } = await params;
    if (!docid) throw new Error("Truy vấn không hợp lệ", { cause: 400 });

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

    //TODO: check if current request is from the owner

    const { state } = await clean(req);

    const res = await saas.put(`/api/clinic-invoice-configs/${docid}`, {
      data: { state },
    });

    if (res.status !== 200)
      throw new Error("Cập nhật không thành công", { cause: 400 });

    return NextResponse.json({ documentId: docid }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
