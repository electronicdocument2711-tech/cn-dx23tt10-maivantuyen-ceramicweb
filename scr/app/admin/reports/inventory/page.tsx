import AdminShell from "@/com/ceramic/AdminShell";
import { products } from "@/lib/ceramic/data";

export default function AdminInventoryReportPage() {
  return (
    <AdminShell>
      <h1 className="text-3xl font-bold">Thống kê kho</h1>
      <div className="mt-6 overflow-hidden rounded-lg bg-white">
        {products.map((product) => (
          <div
            key={product.id}
            className="grid gap-3 border-b p-4 text-sm last:border-b-0 md:grid-cols-4"
          >
            <strong>{product.name}</strong>
            <span>{product.sku}</span>
            <span>Tồn: {product.stock}</span>
            <span>Nhập gần nhất: 2026-06-01</span>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
