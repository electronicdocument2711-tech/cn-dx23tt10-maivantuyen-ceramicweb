import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { saas } from "@/lib/saas";
import { validToken } from "@/lib/auth";

const queryStaffPage = async (
  businessId: string,
  page: number,
  pageSize: number
) => {
  const response = await saas.get("/api/user-infos", {
    params: {
      populate: "*",
      filters: {
        $and: [
          { users: { confirmed: true } },
          { business: { documentId: businessId } },
        ],
      },
      pagination: { page, pageSize },
    },
  });

  const status = response.status >= 200 && response.status < 300 ? true : false;
  return response.status >= 200 && response.status < 300
    ? { status, data: response.data.data, metadata: response.data.meta }
    : { status, data: [], metadata: null };
};

export async function GET(request: NextRequest) {
  try {
    const tokenData = await validToken(request);
    if (!tokenData) throwError("Invalid token", 401);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const userInfor = await saas.get("/api/users", {
      params: {
        populate: {
          user_info: {
            populate: "*",
          },
        },
        filters: { id: { $eq: tokenData?.id } },
      },
    });
    const info = userInfor.data[0].user_info;
    if (!info) throwError("User not exists of get server data error", 500);

    const staffInfor = await queryStaffPage(
      info.business.documentId,
      page,
      pageSize
    );
    if (!staffInfor.status) throwError("Get staff list error", 500);

    const staffList = [...staffInfor.data];

    const formattedStaff = staffList.map((staff: any) => {
      return {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        updatedAt: staff.updatedAt,
        business_role: staff.business_role?.name,
      };
    });
    const pagination = {
      page: staffInfor.metadata.pagination.page,
      pageSize: staffInfor.metadata.pagination.pageSize,
      pageCount: staffInfor.metadata.pagination.pageCount,
    };
    return NextResponse.json(
      { data: formattedStaff, pagination },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(...handleError(error));
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tokenData = await validToken(request);
    if (!tokenData) throwError("Invalid token", 401);

    const { id } = await request.json();
    if (!id) throwError("Staff ID is required", 400);

    const infor = await saas.get("/api/user-infos", {
      params: {
        populate: "users",
        filters: {
          id: {
            $eq: id,
          },
        },
      },
    });
    const userInfo = infor.data.data[0];
    if (!userInfo) throwError("User not exists of get server data error", 500);

    const errorList = [];
    for (const user of userInfo.users) {
      const deleteUserResponse = await saas.delete("/api/users/" + user.id);
      if (deleteUserResponse.status < 200 || deleteUserResponse.status >= 300) {
        errorList.push(`Failed to delete user with ID ${user.id}`);
      }
    }

    const deleteUserInfoResponse = await saas.delete(
      "/api/user-infos/" + userInfo.documentId
    );

    if (
      deleteUserInfoResponse.status < 200 ||
      deleteUserInfoResponse.status >= 300
    ) {
      errorList.push(
        `Failed to delete user info with ID ${userInfo.documentId}`
      );
    }

    if (errorList.length > 0)
      throwError("Delete staff errors: " + errorList.join("; "), 500);

    return NextResponse.json(
      { message: "Xóa người dùng thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(...handleError(error));
  }
}
