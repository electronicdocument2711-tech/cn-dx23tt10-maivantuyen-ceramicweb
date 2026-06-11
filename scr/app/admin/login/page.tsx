import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Đăng nhập Admin</h1>
        <div className="mt-5 grid gap-3">
          <input
            className="h-11 rounded-lg border px-3"
            placeholder="Email quản trị"
          />
          <input
            className="h-11 rounded-lg border px-3"
            placeholder="Mật khẩu"
            type="password"
          />
          <Link
            href="/admin"
            className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Vào dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
