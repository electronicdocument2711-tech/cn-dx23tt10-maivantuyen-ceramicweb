import AdminShell from "@/com/ceramic/AdminShell";
import { formatCurrency, sampleOrders } from "@/lib/ceramic/data";

export default function AdminRevenueReportPage() {
  const total = sampleOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <AdminShell>
      <h1 className="text-3xl font-bold">Thống kê doanh thu</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {["Ngày", "Tháng", "Năm"].map((period, index) => (
          <div key={period} className="rounded-lg bg-white p-5">
            <p className="text-sm text-slate-500">
              Theo {period.toLowerCase()}
            </p>
            <p className="mt-2 text-2xl font-black">
              {formatCurrency(total * (index + 1))}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 h-64 rounded-lg bg-white p-5">
        <div className="flex h-full items-end gap-3">
          {[38, 62, 48, 80, 58, 92, 70].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t bg-[#254f45]"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
