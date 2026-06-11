import { saas } from "@/lib/saas";
import { NextResponse } from "next/server";

const FREE_PLAN_ID = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userInfoId } = body;

    if (!userInfoId) {
      return NextResponse.json(
        { message: "Thiếu userInfoId" },
        { status: 400 },
      );
    }

    const now = new Date();
    const subRes = await saas.get(
      `/api/subscribers?filters[user_info][id][$eq]=${userInfoId}&populate=subscription`,
    );

    const subscriber = subRes.data?.data?.[0];

    if (!subscriber) {
      const userInfoRes = await saas.get(
        `/api/user-infos?filters[id][$eq]=${userInfoId}`,
      );
      const userName = userInfoRes.data?.data?.[0]?.name || "New User";

      const freeSub = await saas.post(`/api/subscriptions`, {
        data: { plan: FREE_PLAN_ID, start_at: now, cancelled_at: null },
      });

      await saas.post(`/api/subscribers`, {
        data: {
          user_info: userInfoId,
          name: userName,
          subscription: freeSub.data.data.id,
        },
      });

      return NextResponse.json({
        message: "Đăng ký gói miễn phí thành công",
      });
    }

    const subscription = subscriber.subscription;

    if (subscription?.documentId) {
      await saas.put(`/api/subscriptions/${subscription.documentId}`, {
        data: {
          renewed_at: now,
          cancelled_at: null,
          plan: FREE_PLAN_ID,
          start_at: now,
          end_at: null,
        },
      });
    } else {
      await saas.post(`/api/subscriptions`, {
        data: {
          subscriber: subscriber.documentId,
          plan: FREE_PLAN_ID,
          start_at: now,
          end_at: null,
          cancelled_at: null,
        },
      });
    }

    return NextResponse.json({
      message: "Đăng ký gói miễn phí thành công",
    });
  } catch (err: any) {
    console.error("Start free API error:", err?.response?.data || err);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: 500 },
    );
  }
}
