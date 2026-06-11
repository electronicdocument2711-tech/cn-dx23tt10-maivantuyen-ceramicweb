import Link from "next/link";
import type { ReactNode } from "react";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Quản lý SP" },
  { href: "/admin/orders", label: "Quản lý ĐH" },
  { href: "/admin/customers", label: "Quản lý KH" },
  { href: "/admin/reports/revenue", label: "Thống kê DT" },
  { href: "/admin/reports/inventory", label: "Thống kê kho" },
  { href: "/admin/categories", label: "Quản lý DM" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-5">
          <Link href="/" className="text-lg font-bold text-[#254f45]">
            Gốm Sứ Admin
          </Link>
          <nav className="mt-8 flex flex-col gap-1">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
