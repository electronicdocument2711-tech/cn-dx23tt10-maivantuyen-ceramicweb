import AdminShell from "@/com/ceramic/AdminShell";
import { categories } from "@/lib/ceramic/data";

export default function AdminCategoriesPage() {
  return (
    <AdminShell>
      <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg bg-white p-5">
            <h2 className="font-bold">{category.name}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {category.description}
            </p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-full border px-3 py-1 text-sm">
                Sửa
              </button>
              <button className="rounded-full border px-3 py-1 text-sm text-red-600">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
