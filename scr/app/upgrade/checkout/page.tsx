import UpgradeCheckoutPage from "@/com/payment/UpgradeCheckoutPage";
import { verifyJwtToken } from "@/lib/auth";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { COOKIE_KEY } from "@/const/global";

export default async function UpgradeCheckoutWrapper() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_KEY.ACCESS_TOKEN)?.value ?? null;

  if (!token || !(await verifyJwtToken(token))) {
    unauthorized();
  }

  return (
    <Suspense>
      <UpgradeCheckoutPage />
    </Suspense>
  );
}
