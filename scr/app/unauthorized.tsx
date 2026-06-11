import { logoutAction } from "./action/logout";

export default async function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="flex flex-col items-center">
        <h1 className="font-bold text-2xl">401</h1>
        <p className="text-xl">
          Phiên đăng nhập hết hạn, vui lòng đăng nhập lại
        </p>
      </div>

      <form action={logoutAction}>
        <button type="submit" className="btn btn-primary btn-sm px-4">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
