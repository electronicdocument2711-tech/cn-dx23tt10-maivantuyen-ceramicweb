import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { cms } from "@/lib/cms";
import { prop } from "remeda";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ customerId: string }> }
) {
  try {
    //authorize
    const authRes = await cms.get("/authen/authorize");
    if (
      authRes?.status !== 200 ||
      !prop(authRes, ...["data", "module", "code"])
    )
      throwError("Chưa đăng nhập", 401);

    //validate params
    const params = await context.params;
    const customerId = parseInt(params.customerId);
    if (isNaN(customerId) || customerId <= 0)
      throwError("Mã khách hàng không hợp lệ", 400);

    const formData = new FormData();
    formData.append("CustomerId", customerId.toString());

    //using limit = -1 to get all notes with no pagination
    formData.append("limit", "-1");

    const res = await cms.post(
      "/pos/customer/CustomerNote?_lay=listCustomerNote",
      formData
    );
    const notes = res?.data?.module?.views?.[0];
    if (!notes) throwError("Đã có lỗi xảy ra", 502);

    //allways return array [] if notes.data is not array
    const notesData = Array.isArray(notes.data) ? notes.data : [];

    return NextResponse.json(notesData, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    //authorize
    const authRes = await cms.get("/authen/authorize");
    if (
      authRes?.status !== 200 ||
      !prop(authRes, ...["data", "module", "code"])
    )
      throwError("Chưa đăng nhập", 401);

    //validate params
    const { noteId, note, customerId } = await req.json();

    const idVal = parseInt(noteId);
    if (isNaN(idVal) || idVal <= 0)
      throwError("Id danh mục ghi chú không hợp lệ", 400);

    if (!note) throwError("Ghi chú không được để trống", 400);

    const customerIdVal = parseInt(customerId);
    if (isNaN(customerIdVal) || customerIdVal <= 0)
      throwError("Id khách hàng không hợp lệ", 400);

    //call api
    const formData = new FormData();
    formData.append("_renderer", "module");
    formData.append("_act", "CustomerNote.save");
    formData.append("CustomerNote[Note]", note);
    formData.append("CustomerNote[CustomerNoteCategoryId]", noteId);
    formData.append("CustomerNote[CustomerId]", customerId);

    const res = await cms.post("pos/customer", formData);
    const status = res.data;

    if (!status || !status.module.code)
      throwError("Thêm ghi chú thất bại do lỗi máy chủ", 502);

    return NextResponse.json(status, { status: 201 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
