import AdminShell from "@/com/ceramic/AdminShell";
import { formatCurrency, products } from "@/lib/ceramic/data";
import Link from "next/link";

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Thêm sản phẩm
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg bg-white">
        {products.map((product) => (
          <div
            key={product.id}
            className="grid gap-3 border-b p-4 text-sm last:border-b-0 md:grid-cols-[1.5fr_1fr_1fr_120px]"
          >
            <strong>{product.name}</strong>
            <span>{product.sku}</span>
            <span>{formatCurrency(product.price)}</span>
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="font-semibold text-[#254f45]"
            >
              Sửa
            </Link>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
