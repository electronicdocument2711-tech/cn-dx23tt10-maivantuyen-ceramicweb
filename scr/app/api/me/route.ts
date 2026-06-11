import { validToken } from "@/lib/auth";
import { saas } from "@/lib/saas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (!(await validToken(request)))
      throw new Error("Chưa xác thực", { cause: 401 });

    const res = await saas.get("/api/users/me", {
      params: {
        fields: ["id", "email"],
        populate: {
          user_info: {
            fields: ["name", "phone", "email", "description", "intro"],
            populate: {
              business: {
                fields: ["name", "address", "email"],
                populate: { owner: { fields: ["name", "email"] } },
              },
              business_role: { fields: ["name", "ordering"] },
              subscriber: {
                fields: ["id"],
                populate: {
                  subscription: {
                    populate: {
                      plan: { fields: ["name", "months_per_interval"] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // get the current subscription of the current business
    let user = res?.data;
    if (
      user?.user_info?.business?.owner?.id &&
      user?.user_info?.business?.owner.id !== user?.user_info?.id
    ) {
      // query the subscription of the current business
      const params = {
        fields: ["id"],
        filters: { user_info: user?.user_info?.business?.owner?.id },
        populate: {
          subscription: {
            populate: { plan: { fields: ["name", "months_per_interval"] } },
          },
        },
      };

      const { data } = await saas.get(`/api/subscribers`, { params });
      if (data?.data?.[0]?.subscription)
        user = {
          ...user,
          subscription: data?.data?.[0]?.subscription,
        };
      else user["subscription"] = null;

      user["is_owner"] = false;
    } else if (user?.user_info?.business?.owner?.id) {
      user = {
        ...user,
        subscription: user?.user_info?.subscriber?.subscription,
        is_owner: true,
      };
    }

    if (res?.status !== 200)
      throw new Error("Không thể lấy thông tin người dùng", { cause: 500 });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
