import CeramicShell from "@/com/ceramic/CeramicShell";
import { formatCurrency, products } from "@/lib/ceramic/data";
import Link from "next/link";

export default function CartPage() {
  const cartItems = products.slice(0, 2);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <CeramicShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Giỏ hàng</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-[96px_1fr_auto]"
              >
                <div className="aspect-square rounded bg-stone-200" />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{item.sku}</p>
                  <p className="mt-3 text-sm">Số lượng: 1</p>
                </div>
                <p className="font-bold text-[#254f45]">
                  {formatCurrency(item.price)}
                </p>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5">
            <h2 className="font-bold">Tóm tắt đơn</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(35000)}</span>
            </div>
            <div className="mt-4 flex justify-between border-t pt-4 font-bold">
              <span>Tổng</span>
              <span>{formatCurrency(subtotal + 35000)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-5 block rounded-full bg-[#254f45] px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Thanh toán
            </Link>
          </aside>
        </div>
      </section>
    </CeramicShell>
  );
}
