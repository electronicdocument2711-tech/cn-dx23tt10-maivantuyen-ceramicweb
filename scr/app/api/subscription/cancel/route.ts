import { NextResponse } from "next/server";
import { saas } from "@/lib/saas";

const FREE_PLAN_ID = 5;

const authHeader = {
  Authorization: `Bearer ${process.env.STRAPI_IPN_TOKEN}`,
};

export async function POST(request: Request) {
  try {
    // =========================================================
    // 1. PARSE BODY
    // =========================================================
    const body = await request.json();
    const { userInfoId } = body;

    if (!userInfoId) {
      return NextResponse.json(
        { message: "Thiếu userInfoId" },
        { status: 400 },
      );
    }

    // =========================================================
    // 2. LẤY SUBSCRIBER + SUBSCRIPTION
    // =========================================================
    const subRes = await saas.get(
      `/api/subscribers?filters[user_info][id][$eq]=${userInfoId}&populate=subscription`,
      { headers: authHeader },
    );

    const subscriber = subRes.data?.data?.[0];

    if (!subscriber) {
      return NextResponse.json(
        { message: `Không tìm thấy subscriber` },
        { status: 404 },
      );
    }

    const subscription = subscriber.subscription;

    if (!subscription) {
      return NextResponse.json(
        { message: "Không có subscription active" },
        { status: 404 },
      );
    }

    const subDocumentId = subscription.documentId;
    const cancelledAt = subscription?.cancelled_at;

    // =========================================================
    // 3. CHECK ĐÃ HỦY CHƯA (IDEMPOTENT)
    // =========================================================
    if (cancelledAt) {
      return NextResponse.json({
        message: "Gói đã được hủy trước đó",
      });
    }

    if (!subDocumentId) {
      return NextResponse.json(
        { message: "Subscription không hợp lệ (thiếu documentId)" },
        { status: 422 },
      );
    }

    const now = new Date();

    // =========================================================
    // 4. UPDATE cancelled_at + down-grade về Free plan
    // =========================================================
    await saas.put(
      `/api/subscriptions/${subDocumentId}`,
      {
        data: {
          cancelled_at: now,
          plan: FREE_PLAN_ID,
        },
      },
      { headers: authHeader },
    );

    // =========================================================
    // 5. CREATE TRANSACTION (log huỷ)
    // =========================================================
    await saas.post(
      `/api/transactions`,
      {
        data: {
          payment: "Subscription Cancel",
          description: "Huỷ gói đăng ký",
          gateway: "system",
          user_info: userInfoId,
          full_amount: 0,
          tax_amount: 0,
          payment_status: "cancelled",
          currency: "vnd",
        },
      },
      { headers: authHeader },
    );

    // =========================================================
    // DONE
    // =========================================================
    return NextResponse.json({
      code: "00",
      message: "Huỷ gói thành công, đã chuyển về Free plan",
      data: {
        subscriberId: subscriber.id,
        oldSubscriptionId: subDocumentId,
        newSubscriptionId: null,
      },
    });
  } catch (err: any) {
    console.error("❌ Cancel API error:", err?.response?.data || err);

    return NextResponse.json(
      { message: "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: 500 },
    );
  }
}
