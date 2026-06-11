import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/shop", label: "Cửa hàng" },
  { href: "/cart", label: "Giỏ hàng" },
  { href: "/account", label: "Tài khoản" },
  { href: "/blog", label: "Tin tức" },
  { href: "/admin", label: "Admin" },
];

export default function CeramicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f3ed] text-[#2f261f]">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#f7f3ed]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#254f45] text-sm font-bold text-white">
              G
            </span>
            <span>
              <span className="block text-base font-bold">Gốm Sứ Vòng Đời</span>
              <span className="block text-xs text-stone-500">
                Đồ gốm sứ qua sử dụng tuyển chọn
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-stone-600 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <p className="font-semibold text-stone-900">Gốm Sứ Vòng Đời</p>
            <p className="mt-2">
              Mua bán đồ gốm sứ qua sử dụng, kiểm tình trạng rõ ràng, đóng gói
              cẩn thận.
            </p>
          </div>
          <div>
            <p className="font-semibold text-stone-900">Hỗ trợ</p>
            <p className="mt-2">Đổi trả khi sản phẩm sai mô tả.</p>
            <p>Giao hàng toàn quốc.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-900">Quản trị</p>
            <Link href="/admin" className="mt-2 inline-block hover:underline">
              Dashboard quản lý
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
