import AdminShell from "@/com/ceramic/AdminShell";
import { formatCurrency, sampleOrders } from "@/lib/ceramic/data";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = sampleOrders.find((item) => item.code === id);

  return (
    <AdminShell>
      <h1 className="text-3xl font-bold">Chi tiết đơn hàng</h1>
      <div className="mt-6 rounded-lg bg-white p-5">
        <p className="font-bold">{order?.code ?? id}</p>
        <p className="mt-2 text-sm text-slate-600">
          Khách hàng: {order?.customer ?? "Khách lẻ"}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Trạng thái: {order?.status ?? "Chờ xác nhận"}
        </p>
        <p className="mt-2 text-xl font-black text-[#254f45]">
          {formatCurrency(order?.total ?? 0)}
        </p>
      </div>
    </AdminShell>
  );
}
