import { sortObject } from "@/lib/payment_server";
import { saas } from "@/lib/saas";
import crypto from "crypto";
import { NextResponse } from "next/server";
import qs from "qs";
import { logIPN } from "../lib/ipnLogger";

const authHeader = {
  Authorization: `Bearer ${process.env.STRAPI_IPN_TOKEN}`,
};

// VNPay IP whitelist
const WHITELIST_IPS = [
  // sandbox
  "113.160.92.202",
  "203.205.17.226",
  "103.220.84.4",
  // production
  "113.52.45.78",
  "116.97.245.130",
  "42.118.107.252",
  "113.20.97.250",
  "203.171.19.146",
  "103.220.87.4",
  "103.220.86.4",
  "103.220.86.10",
  "103.220.87.10",
  "103.220.86.139",
  "103.220.87.139",
];

// helper unwrap Strapi v4/v5
function unwrap(item: any) {
  if (!item) return null;
  return item.attributes ? { id: item.id, ...item.attributes } : item;
}

export async function GET(request: Request) {
  try {
    // 1. CHECK IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!WHITELIST_IPS.includes(ip)) {
      return NextResponse.json({ RspCode: "99", Message: "IP not allowed" });
    }

    // 2. LẤY PARAMS
    const { searchParams } = new URL(request.url);

    const vnp_Params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      vnp_Params[key] = value;
    }

    // 3. VERIFY CHECKSUM
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const sortedParams = sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });

    const signed = crypto
      .createHmac("sha512", process.env.VNPAY_HASH_SECRET || "")
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    // Log IPN data before any validation
    logIPN({
      ip,
      vnp_Params,
      checksumValid: secureHash === signed,
    });

    if (secureHash !== signed) {
      return NextResponse.json({
        RspCode: "97",
        Message: "Checksum failed",
      });
    }

    // 4. PARSE DATA
    const txnRef = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    const amount = Number(vnp_Params["vnp_Amount"]) / 100;

    const isSuccess = responseCode === "00";

    const match = txnRef.match(/USER(\d+)_PLAN(\d+)_/);

    if (!match) {
      return NextResponse.json({
        RspCode: "01",
        Message: "Invalid txnRef",
      });
    }

    const userInfoId = Number(match[1]);
    const planId = Number(match[2]);
    const planRes = await saas.get("/api/plans", {
      params: { filters: { id: { $eq: planId } } },
    });
    if (!planRes.data?.data?.[0]) {
      return NextResponse.json({
        RspCode: "03",
        Message: "Plan not found",
      });
    }
    const plan = unwrap(planRes.data.data[0]);
    const months = plan.months_per_interval || 1;

    // 5. FIND TRANSACTION (QUAN TRỌNG NHẤT)

    const txRes = await saas.get(
      `/api/transactions?filters[txn_ref][$eq]=${txnRef}`,
      { headers: authHeader },
    );

    const existingTx = txRes.data?.data?.[0];

    if (!existingTx) {
      return NextResponse.json({
        RspCode: "01",
        Message: "Order not found",
      });
    }

    const tx = unwrap(existingTx);
    const dbAmount = Math.round(Number(tx.full_amount));

    // So sánh amount từ IPN với amount trong DB
    if (amount !== dbAmount) {
      return NextResponse.json({
        RspCode: "04",
        Message: "Invalid amount",
      });
    }

    if (tx.payment_status === "success") {
      return NextResponse.json({
        RspCode: "02",
        Message: "Order already confirmed",
      });
    }

    // 6. UPDATE TRANSACTION
    await saas.put(
      `/api/transactions/${tx.documentId}`,
      {
        data: {
          payment_status: isSuccess ? "success" : "failed",
        },
      },
      { headers: authHeader },
    );

    // 7. FAIL → STOP (KHÔNG XỬ LÝ SUB)
    if (!isSuccess) {
      return NextResponse.json({
        RspCode: "00",
        Message: "Transaction failed",
      });
    }
    // 8. XỬ LÝ SUBSCRIPTION (GIỮ NGUYÊN LOGIC CŨ)
    const subRes = await saas.get(
      `/api/subscribers?filters[user_info][id][$eq]=${userInfoId}&populate=subscription`,
    );
    let subscriber = subRes.data?.data?.[0];

    if (!subscriber) {
      const userInfoRes = await saas.get(
        `/api/user-infos?filters[id][$eq]=${userInfoId}`,
        { headers: authHeader },
      );
      const userName = userInfoRes.data?.data?.[0]?.name || "New User";

      const freeSub = await saas.post(
        `/api/subscriptions`,
        {
          data: {
            plan: process.env.FREE_PLAN_ID,
            start_at: new Date(),
          },
        },
        { headers: authHeader },
      );

      await saas.post(
        `/api/subscribers`,
        {
          data: {
            user_info: userInfoId,
            name: userName,
            subscription: freeSub.data.data.id,
          },
        },
        { headers: authHeader },
      );

      const retry = await saas.get(
        `/api/subscribers?filters[user_info][id][$eq]=${userInfoId}&populate=subscription`,
      );

      subscriber = retry.data?.data?.[0];
    }

    subscriber = unwrap(subscriber);

    // create invoice
    const invoiceRes = await saas.post(
      `/api/invoices`,
      {
        data: {
          invoice_date: new Date(),
          user_info: userInfoId,
          subscriber: subscriber.id,
          transaction: tx.id,
          amount,
          currency: "vnd",
          invoice_status: "paid",
        },
      },
      { headers: authHeader },
    );

    const existingSub = unwrap(subscriber.subscription);

    const now = new Date();
    let startDate = now;

    if (existingSub?.end_at) {
      const currentEnd = new Date(existingSub.end_at);
      startDate = currentEnd > now ? currentEnd : now;
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    if (existingSub) {
      await saas.put(
        `/api/subscriptions/${existingSub.documentId}`,
        {
          data: {
            renewed_at: now,
            plan: planId,
            start_at: startDate,
            end_at: endDate,
            invoices: [invoiceRes.data.data.documentId],
            transactions: [tx.documentId],
          },
        },
        { headers: authHeader },
      );
    } else {
      await saas.post(
        `/api/subscriptions`,
        {
          data: {
            subscriber: subscriber.documentId,
            plan: planId,
            start_at: startDate,
            end_at: endDate,
            invoices: [invoiceRes.data.data.documentId],
            transactions: [tx.documentId],
          },
        },
        { headers: authHeader },
      );
    }

    // // =========================================================
    // // DONE
    // // =========================================================
    return NextResponse.json({
      RspCode: "00",
      Message: "Confirm Success",
    });
  } catch (error) {
    console.error("🔥 IPN ERROR:", error);

    return NextResponse.json({
      RspCode: "99",
      Message: "Internal error",
    });
  }
}
