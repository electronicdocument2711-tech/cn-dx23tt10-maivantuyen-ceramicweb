import { redirect, RedirectType } from "next/navigation";

function getPlanIdFromTxnRef(txnRef: string): string | null {
  const match = txnRef.match(/_PLAN(\d+)_/);
  return match?.[1] ?? null;
}

export default async function VNPayReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { vnp_TxnRef, vnp_ResponseCode } = await searchParams;
  const txnRef = Array.isArray(vnp_TxnRef) ? vnp_TxnRef[0] : vnp_TxnRef;

  if (!txnRef) {
    return redirect(
      `/upgrade/checkout?engage=true&result=500`,
      RedirectType.replace,
    );
  }

  const planId = getPlanIdFromTxnRef(txnRef);
  const query = new URLSearchParams({
    engage: "true",
    result: vnp_ResponseCode === "00" ? "200" : "400",
  });

  if (planId) {
    query.set("planId", planId);
  }

  redirect(`/upgrade/checkout?${query.toString()}`, RedirectType.replace);
}
