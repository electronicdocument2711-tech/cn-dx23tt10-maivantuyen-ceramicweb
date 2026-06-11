import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";
import { NextRequest, NextResponse } from "next/server";
import { prop, unique } from "remeda";

export async function GET(
  _: NextRequest,
  { params }: Readonly<{ params: Promise<{ Id: string }> }>,
) {
  try {
    const authorize = await cms.get("/authen/authorize");

    if (
      authorize?.status !== 200 ||
      !prop(authorize, ...["data", "module", "code"])
    ) {
      throw new Error("Chưa đăng nhập", { cause: 401 });
    }

    const { Id } = await params;
    const appointmentId = parseInt(Id, 10);

    if (isNaN(appointmentId) || appointmentId <= 0) {
      throw new Error("Id không hợp lệ", { cause: 400 });
    }

    const response = await cms.get("/pos/appointment", {
      params: {
        _lay: "getAppointmentHistories",
        appointment_id: appointmentId,
      },
    });

    let data = prop(response, ...["data", "module", "views", "0", "data"]);

    const message =
      (
        prop(response, ...["data", "messages"])?.map((item: any) =>
          prop(item, ...["mes"]),
        ) || []
      )?.join(", ") || "";

    if (!data && message) {
      throw new Error(message, { cause: 500 });
    }

    if (!data) {
      throw new Error("Không tìm thấy lịch sử cuộc hẹn", { cause: 404 });
    }

    const userIds = unique(
      data
        .filter(Boolean)
        .map((item: any) => Number.parseInt(item?.EditedBy, 10)),
    );

    let userReponses = [];

    if (userIds?.length > 0) {
      userReponses = await saas
        .get("/api/users", {
          params: {
            filters: {
              id: {
                $in: userIds,
              },
            },
            populate: {
              user_info: {
                fields: ["name"],
              },
            },
            pagination: {
              pageSize: userIds?.length,
            },
          },
          headers: {
            Authorization: `Bearer ${process.env.SYSTEM_TOKEN}`, // * using system token because this data is public and we don't want to have problem with user token expiration, but need to make sure the token has permission to access user data in strapi
          },
        })
        ?.then((res) => {
          return res?.data || [];
        });
    }

    data = data?.map(({ EditedBy, ...item }: any) => {
      const editedBy = userReponses?.find(
        (user: any) => user?.id == Number.parseInt(EditedBy, 10),
      );

      return {
        ...item,
        EditedBy: editedBy?.user_info,
      };
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
