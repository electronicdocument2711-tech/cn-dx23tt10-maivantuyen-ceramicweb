import CeramicShell from "@/com/ceramic/CeramicShell";
import Link from "next/link";

export default function CheckoutPage() {
  return (
    <CeramicShell>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Thanh toán</h1>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h2 className="font-bold">Địa chỉ giao hàng</h2>
            <div className="mt-4 grid gap-3">
              <input
                className="h-11 rounded-lg border px-3"
                placeholder="Họ tên"
              />
              <input
                className="h-11 rounded-lg border px-3"
                placeholder="Số điện thoại"
              />
              <input
                className="h-11 rounded-lg border px-3"
                placeholder="Địa chỉ"
              />
            </div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h2 className="font-bold">Phương thức thanh toán</h2>
            <label className="mt-4 flex gap-3 rounded-lg border p-3 text-sm">
              <input type="radio" defaultChecked />
              Thanh toán khi nhận hàng
            </label>
            <label className="mt-3 flex gap-3 rounded-lg border p-3 text-sm">
              <input type="radio" />
              Chuyển khoản ngân hàng
            </label>
            <Link
              href="/checkout/success"
              className="mt-5 block rounded-full bg-[#254f45] px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Xác nhận đơn hàng
            </Link>
          </div>
        </div>
      </section>
    </CeramicShell>
  );
}
