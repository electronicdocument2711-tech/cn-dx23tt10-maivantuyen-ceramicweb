import CeramicShell from "@/com/ceramic/CeramicShell";
import Link from "next/link";

export default function AccountPage() {
  return (
    <CeramicShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Tài khoản</h1>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            ["Hồ sơ cá nhân", "Cập nhật tên, email, số điện thoại."],
            ["Địa chỉ", "Quản lý địa chỉ nhận hàng mặc định."],
            ["Lịch sử đơn hàng", "Theo dõi mã đơn và trạng thái."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-lg border bg-white p-5">
              <h2 className="font-bold">{title}</h2>
              <p className="mt-2 text-sm text-stone-600">{description}</p>
            </div>
          ))}
        </div>
        <Link
          href="/account/orders"
          className="mt-6 inline-block rounded-full bg-[#254f45] px-5 py-3 text-sm font-semibold text-white"
        >
          Xem đơn hàng
        </Link>
      </section>
    </CeramicShell>
  );
}
