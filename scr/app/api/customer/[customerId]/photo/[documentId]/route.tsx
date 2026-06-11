import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, withAuth } from "@/lib/response";
import { cms } from "@/lib/cms";
import { prop } from "remeda";
import { saas } from "@/lib/saas";
import { clean } from "@/lib/utils";

export async function DELETE(
  req: NextRequest,
  context: {
    params: Promise<{ customerId: string; documentId: string }>;
  },
) {
  try {
    const { customerId, documentId } = await context.params;
    if (!customerId || customerId === "" || !documentId || documentId === "")
      throwError("params missing", 400);

    const tokenData = await withAuth(req);
    if (!tokenData) throwError("Unauthorized", 401);

    const authorize = await cms.get("/authen/authorize");
    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId)
      throw new Error("Phòng khám không hợp lệ", { cause: 400 });

    // delete photo if current user is the owner of the photo or has permission to delete
    const { status } = await saas.delete(`/api/customer-photos/${documentId}`);

    if (status !== 204) throwError("Lỗi khi xóa ảnh", status);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{ customerId: string; documentId: string }>;
  },
) {
  try {
    const { customerId, documentId } = await context.params;
    if (!customerId || customerId === "" || !documentId || documentId === "")
      throwError("params missing", 400);

    const tokenData = await withAuth(req);
    if (!tokenData) throwError("Unauthorized", 401);

    const authorize = await cms.get("/authen/authorize");
    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId)
      throw new Error("Phòng khám không hợp lệ", { cause: 400 });

    const { note } = await clean(req);

    // update photo if current user is the owner of the photo or has permission to update
    const { status, data } = await saas.put(
      `/api/customer-photos/${documentId}`,
      {
        data: { note },
      },
    );

    if (status !== 200) throwError("Lỗi khi cập nhật ảnh", status);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(...handleError(error));
  }
}
