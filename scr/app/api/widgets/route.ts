import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { handleError } from "@/lib/response";
import { MULTIPART_HEADERS } from "@/const/api";

export async function POST(req: NextRequest) {
  try {
    const { CurrentWorkProfilePositionId, CurrentStaffId, CurrentBranchId } =
      await req.json();
    if (!CurrentWorkProfilePositionId || !CurrentStaffId || !CurrentBranchId)
      return NextResponse.json(
        { message: `Kiểm tra lại payload` },
        { status: 400 }
      );

    const data = {
      _widgets: [
        "FilterAppointment",
        "CustomerRelationship",
        "ListBranch",
        "CustomerNoteCategory",
      ],
      PermissionCode: "customer-management",
      CurrentWorkProfilePositionId,
      CurrentStaffId,
      CurrentBranchId,
    };

    const res = await cms.post("/pos/customer", data, MULTIPART_HEADERS);

    const widgets = res.data?.widgets;
    if (!widgets)
      return NextResponse.json({ message: `widgets null` }, { status: 404 });

    return NextResponse.json(widgets, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
