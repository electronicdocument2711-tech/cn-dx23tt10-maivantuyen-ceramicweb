import AdminShell from "@/com/ceramic/AdminShell";

export default function AdminProductNewPage() {
  return (
    <AdminShell>
      <h1 className="text-3xl font-bold">Form sản phẩm</h1>
      <div className="mt-6 grid max-w-3xl gap-4 rounded-lg bg-white p-5">
        <input
          className="h-11 rounded-lg border px-3"
          placeholder="Tên sản phẩm"
        />
        <input className="h-11 rounded-lg border px-3" placeholder="SKU" />
        <input className="h-11 rounded-lg border px-3" placeholder="Giá bán" />
        <textarea
          className="min-h-28 rounded-lg border p-3"
          placeholder="Mô tả"
        />
        <button className="w-fit rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          Lưu sản phẩm
        </button>
      </div>
    </AdminShell>
  );
}
