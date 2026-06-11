import AdminShell from "@/com/ceramic/AdminShell";
import { formatCurrency, products, sampleOrders } from "@/lib/ceramic/data";

export default function AdminDashboardPage() {
  const revenue = sampleOrders.reduce((sum, order) => sum + order.total, 0);
  const stock = products.reduce((sum, product) => sum + product.stock, 0);

  return (
    <AdminShell>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          ["Doanh thu", formatCurrency(revenue)],
          ["Đơn hàng", String(sampleOrders.length)],
          ["Sản phẩm", String(products.length)],
          ["Tồn kho", String(stock)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg bg-white p-5">
        <h2 className="font-bold">Tổng quan hệ thống</h2>
        <p className="mt-2 text-sm text-slate-600">
          Quản lý sản phẩm, đơn hàng, khách hàng, danh mục và báo cáo kho cho
          website mua bán gốm sứ qua sử dụng.
        </p>
      </div>
    </AdminShell>
  );
}
