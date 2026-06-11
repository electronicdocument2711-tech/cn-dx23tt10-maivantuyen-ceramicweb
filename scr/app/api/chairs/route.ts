import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, withAuth } from "@/lib/response";
import { saas } from "@/lib/saas";
import { withOwnerPermission } from "@/lib/saasHelper";
import { REGEX } from "../../../const/global";
import { cms } from "@/lib/cms";
import { prop } from "remeda";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";
    const lmstart = searchParams.get("lmstart") || "0";

    const res = await cms.post(
      `/pos/dentalChair?_lay=getChairList&limit=${limit}&lmstart=${lmstart}`,
    );

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const chairId = formData.get("DentalChairId") as string | null;
    const chairCode = formData.get("DentalChairCode") as string;
    const branchId = formData.get("BranchId") as string;

    let roomId: string | null = null;

    if (!chairId) {
      // Create mode: auto-create a room named after the chair code
      const roomFormData = new FormData();
      roomFormData.append("Name", chairCode);
      roomFormData.append("BranchId", branchId);
      roomFormData.append("RoomTypeId", "1");

      const roomRes = await cms.post("/pos/room?_act=saveRoomV2", roomFormData);

      const roomCode = prop(roomRes, ...["data", "module", "code"]) || false;

      if (!roomCode) {
        const messages = prop(roomRes, ...["data", "messages"]) || [];
        if (Array.isArray(messages) && messages.length > 0) {
          throwError(
            messages?.map((item) => item?.mes)?.join("\n") ||
              "Đã có lỗi xảy ra",
            500,
          );
        }
        throwError("Đã có lỗi xảy ra", 500);
      }

      roomId = prop(roomRes, ...["data", "module", "data", "RoomId"]);
    } else {
      // Edit mode: fetch current chair to reuse its existing RoomId
      const chairListRes = await cms.post(
        `/pos/dentalChair?_lay=getChairList&limit=1&lmstart=0&DentalChairId=${chairId}`,
      );
      const chairs = chairListRes.data?.module?.views?.[0]?.data;
      if (Array.isArray(chairs) && chairs.length > 0) {
        roomId = String((chairs[0] as Record<string, unknown>).RoomId ?? "");
      }
    }

    if (roomId) {
      formData.append("RoomId", roomId);
    }

    const res = await cms.post("/pos/dentalChair?_act=save", formData);
    const code = prop(res, ...["data", "module", "code"]) || false;
    if (!code) {
      const messages = prop(res, ...["data", "messages"]) || [];
      if (Array.isArray(messages) && messages.length > 0) {
        throwError(
          messages?.map((item) => item?.mes)?.join("\n") || "Đã có lỗi xảy ra",
          500,
        );
      }
      throwError("Đã có lỗi xảy ra", 500);
    }

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function PUT(req: NextRequest) {
  try {
    const tokenData = await withAuth(req);
    const { id, code, note, branchId } = await req.json();
    if (!id || !code || !branchId) throwError("Missing required fields", 400);

    if (!REGEX.CHAIR_CODE.test(code)) {
      throwError(
        "Mã ghế chỉ được chứa chữ cái, số, dấu chấm và dấu gạch ngang",
        400,
      );
    }
    const businessPermission = await withOwnerPermission(tokenData.id);
    if (!businessPermission.isBusinessOwner) {
      throwError("Bạn không có quyền thực hiện tác vụ này", 403);
    }

    const branch = await saas.get(`/api/branches`);
    const branchData = branch.data.data;
    if (branch.status !== 200 || !branchData) {
      throwError("Danh sách chi nhánh không hợp lệ", 400);
    }

    if (!branchData.find((b: any) => b.documentId === branchId)) {
      throwError("Chi nhánh không hợp lệ", 400);
    }

    const chairs = await saas.get(`/api/chairs`);
    const chairsData = chairs.data.data;
    if (chairs.status !== 200 || !chairsData) {
      throwError("Chair data error", 500);
    }
    const chairToEdit = chairsData.find((c: any) => c.documentId === id);
    if (!chairToEdit) {
      throwError("Ghế không tồn tại", 404);
    }

    const existingChairs = await saas.get(`/api/chairs`, {
      params: {
        filters: {
          code: {
            $eq: code,
          },
          branch: {
            id: {
              $eq: branchId,
            },
          },
          id: {
            $ne: chairToEdit.id,
          },
        },
      },
    });
    const existingChairsData = existingChairs.data.data;
    if (existingChairs.status !== 200 || !existingChairsData) {
      throwError("Kiểm tra mã ghế thất bại", 500);
    }
    if (existingChairsData.length > 0) {
      throwError("Mã ghế đã tồn tại trong chi nhánh này", 400);
    }

    const data = {
      data: {
        code,
        note,
        branch: branchId,
      },
    };
    const editChair = await saas.put(`/api/chairs/${id}`, data);
    const editChairData = editChair.data.data;
    if (editChair.status !== 200 || !editChairData) {
      throwError("Cập nhật ghế thất bại", 500);
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const tokenData = await withAuth(req);

    const { id } = await req.json();
    if (!id || !REGEX.DOCUMENT_ID.test(id)) {
      throwError("Id không hợp lệ", 400);
    }

    const businessPermission = await withOwnerPermission(tokenData.id);
    if (!businessPermission.isBusinessOwner) {
      throwError("Bạn không có quyền thực hiện tác vụ này", 403);
    }

    const chairs = await saas.get(`/api/chairs`);
    const chairsData = chairs.data.data;
    if (chairs.status !== 200 || !chairsData) {
      throwError("Chair data error", 500);
    }
    const chairToDelete = chairsData.find((c: any) => c.documentId === id);
    if (!chairToDelete) {
      throwError("Chair-code không tồn tại", 404);
    }

    const deleteChair = await saas.delete(`/api/chairs/${id}`);
    if (deleteChair.status !== 204) {
      throwError("Xóa ghế thất bại", 500);
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
