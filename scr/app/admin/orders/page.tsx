import AdminShell from "@/com/ceramic/AdminShell";
import { formatCurrency, sampleOrders } from "@/lib/ceramic/data";
import Link from "next/link";

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
      <div className="mt-6 overflow-hidden rounded-lg bg-white">
        {sampleOrders.map((order) => (
          <div
            key={order.code}
            className="grid gap-3 border-b p-4 text-sm last:border-b-0 md:grid-cols-6"
          >
            <strong>{order.code}</strong>
            <span>{order.customer}</span>
            <span>{order.status}</span>
            <span>{order.payment}</span>
            <span>{formatCurrency(order.total)}</span>
            <Link
              href={`/admin/orders/${order.code}`}
              className="font-semibold text-[#254f45]"
            >
              Chi tiết
            </Link>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
