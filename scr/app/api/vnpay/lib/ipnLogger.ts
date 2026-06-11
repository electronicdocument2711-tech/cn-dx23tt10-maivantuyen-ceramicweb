import { saas } from "@/lib/saas";

const authHeader = {
  Authorization: `Bearer ${process.env.STRAPI_IPN_TOKEN}`,
};

export async function logIPN({
  ip,
  vnp_Params,
  checksumValid,
}: {
  ip: string;
  vnp_Params: Record<string, string>;
  checksumValid: boolean;
}) {
  try {
    await saas.post(
      "/api/ipn-logs",
      {
        data: {
          ip,
          txn_ref: vnp_Params["vnp_TxnRef"],
          response_code: vnp_Params["vnp_ResponseCode"],
          amount: Number(vnp_Params["vnp_Amount"]) / 100,
          payload: vnp_Params,
          checksum_valid: checksumValid,
          status_log:
            vnp_Params["vnp_ResponseCode"] === "00"
              ? "success"
              : "failed",
        },
      },
      { headers: authHeader }
    );
  } catch (err) {
    console.error("❌ LOG IPN FAILED:", err);
  }
}