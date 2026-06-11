import CeramicShell from "@/com/ceramic/CeramicShell";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <CeramicShell>
      <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#254f45]">
            Xác nhận ĐH
          </p>
          <h1 className="mt-3 text-3xl font-bold">Đơn hàng đã được ghi nhận</h1>
          <p className="mt-3 text-stone-600">
            Mã đơn GS260604-019 đang ở trạng thái chờ xác nhận.
          </p>
          <Link
            href="/account/orders"
            className="mt-6 inline-block rounded-full bg-[#254f45] px-5 py-3 text-sm font-semibold text-white"
          >
            Xem lịch sử đơn hàng
          </Link>
        </div>
      </section>
    </CeramicShell>
  );
}
