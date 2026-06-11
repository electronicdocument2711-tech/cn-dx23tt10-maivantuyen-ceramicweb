import AdminShell from "@/com/ceramic/AdminShell";
import { products } from "@/lib/ceramic/data";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  return (
    <AdminShell>
      <h1 className="text-3xl font-bold">Sửa sản phẩm</h1>
      <div className="mt-6 grid max-w-3xl gap-4 rounded-lg bg-white p-5">
        <input
          className="h-11 rounded-lg border px-3"
          defaultValue={product?.name}
          placeholder="Tên sản phẩm"
        />
        <input
          className="h-11 rounded-lg border px-3"
          defaultValue={product?.sku}
          placeholder="SKU"
        />
        <input
          className="h-11 rounded-lg border px-3"
          defaultValue={product?.price}
          placeholder="Giá bán"
        />
        <textarea
          className="min-h-28 rounded-lg border p-3"
          defaultValue={product?.description}
          placeholder="Mô tả"
        />
        <button className="w-fit rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          Cập nhật
        </button>
      </div>
    </AdminShell>
  );
}
