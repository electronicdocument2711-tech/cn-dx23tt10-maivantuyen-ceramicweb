import CeramicShell from "@/com/ceramic/CeramicShell";
import { formatCurrency, sampleOrders } from "@/lib/ceramic/data";

export default function AccountOrdersPage() {
  return (
    <CeramicShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Lịch sử đơn hàng</h1>
        <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
          {sampleOrders.map((order) => (
            <div
              key={order.code}
              className="grid gap-3 border-b p-4 text-sm last:border-b-0 sm:grid-cols-5"
            >
              <strong>{order.code}</strong>
              <span>{order.date}</span>
              <span>{order.status}</span>
              <span>{order.payment}</span>
              <span className="font-semibold text-[#254f45]">
                {formatCurrency(order.total)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </CeramicShell>
  );
}
