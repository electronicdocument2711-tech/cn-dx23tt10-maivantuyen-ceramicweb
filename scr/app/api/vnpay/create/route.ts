import { NextResponse } from "next/server";
import crypto from "crypto";
import dayjs from "@/lib/dayjs";
import qs from "qs";
import { sortObject } from "@/lib/payment_server";
import { saas } from "@/lib/saas";

export async function POST(request: Request) {
  try {
    const createDate = dayjs().tz("Asia/Ho_Chi_Minh").format("YYYYMMDDHHmmss");

    const { orderNo } = await request.json();
    const match = orderNo.match(/USER(\d+)_PLAN(\d+)_/);
    if (!match) {
      throw new Error("Invalid orderNo format");
    }

    const userInfoId = Number(match[1]);
    const planId = Number(match[2]);
    console.log("🚀 ~ planId:", planId);

    // =========================================================
    // 1. GET PLAN (lấy giá chuẩn)
    // =========================================================
    const planRes = await saas.get("/api/plans", {
      params: {
        filters: { id: { $eq: planId } },
        populate: {
          product: {
            populate: {
              product_features: true,
            },
          },
          product_pricings: true,
        },
      },
    });

    const plan = planRes.data?.data?.[0];

    if (!plan) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    const amount = plan.product_pricings?.[0]?.price || 0;
 
    // =========================================================
    // 2. GENERATE txn_ref
    // =========================================================
    const txnRef = `USER${userInfoId}_PLAN${planId}_${Date.now()}`;

    // =========================================================
    // 3. CREATE TRANSACTION (PENDING)
    // =========================================================
    await saas.post("/api/transactions", {
      data: {
        txn_ref: txnRef,
        user_info: userInfoId,
        full_amount: amount,
        payment_status: "pending",
        currency: "vnd",
      },
    });

    // =========================================================
    // 4. BUILD VNPAY PARAMS
    // =========================================================
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE || "";
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || "";
    const vnp_Url = process.env.VNPAY_PAYMENT_ONLINE_API_URL || "";
    const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL || "";

    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddr =
      forwarded?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    let vnp_Params: Record<string, any> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toán ${txnRef}`,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });

    const signed = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;

    const paymentUrl =
      vnp_Url + "?" + qs.stringify(vnp_Params, { encode: false });
    console.log("🚀 ~ paymentUrl:", paymentUrl)

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    console.error("CREATE PAYMENT ERROR:", error);
    return NextResponse.json(
      { message: "Create payment failed" },
      { status: 500 },
    );
  }
}
