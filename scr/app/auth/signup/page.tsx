import CeramicShell from "@/com/ceramic/CeramicShell";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <CeramicShell>
      <section className="mx-auto max-w-md px-4 py-14">
        <div className="rounded-lg border bg-white p-6">
          <h1 className="text-2xl font-bold">Đăng ký</h1>
          <div className="mt-5 grid gap-3">
            <input className="h-11 rounded-lg border px-3" placeholder="Họ tên" />
            <input className="h-11 rounded-lg border px-3" placeholder="Email" />
            <input
              className="h-11 rounded-lg border px-3"
              placeholder="Mật khẩu"
              type="password"
            />
            <Link
              href="/account"
              className="rounded-full bg-[#254f45] px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Tạo tài khoản
            </Link>
          </div>
        </div>
      </section>
    </CeramicShell>
  );
}
