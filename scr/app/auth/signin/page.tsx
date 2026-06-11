import CeramicShell from "@/com/ceramic/CeramicShell";
import Link from "next/link";

export default function SignInPage() {
  return (
    <CeramicShell>
      <section className="mx-auto max-w-md px-4 py-14">
        <div className="rounded-lg border bg-white p-6">
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
          <div className="mt-5 grid gap-3">
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
              Đăng nhập
            </Link>
          </div>
          <p className="mt-4 text-sm text-stone-600">
            Chưa có tài khoản?{" "}
            <Link href="/auth/signup" className="font-semibold text-[#254f45]">
              Đăng ký
            </Link>
          </p>
        </div>
      </section>
    </CeramicShell>
  );
}
