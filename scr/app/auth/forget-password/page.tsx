"use client";
import { Input } from "@heroui/input";
import { addToast, Button, Form, Link } from "@heroui/react";
import Header from "@/com/Header";
import { FormEvent, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { isValidEmail } from "@/lib";
import { useConfirm } from "@/com/ConfirmProvider";
import rest from "@/lib/rest";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const { confirm } = useConfirm();
  const abortRef = useRef<AbortController | null>(null);
  const [email, setEmail] = useState<string>();
  const [submiting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    await rest
      .post("/auth/forget-password", { email })
      .then(() => {
        addToast({
          title: "Thành công",
          description:
            "Đã gửi yêu cầu quên mật khẩu thành công, vui lòng kiểm tra email của bạn để tiếp tục",
          color: "success",
        });
        router.push("/auth/signin");
      })
      .catch((error) => {
        addToast({
          title: "Thất bại",
          description: getErrorMessage(error, "Đã có lỗi xảy ra"),
          color: "warning",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleForgetEmail = async () => {
    await confirm({
      title: "Quên email cá nhân?",
      message:
        "Nếu không nhớ email cá nhân vui lòng liên hệ phòng Nhân sự để được hỗ trợ.",
      hideCancel: true,
    });
  };

  return (
    <>
      <Header />
      <main>
        <section className="container max-w-90 mx-auto pt-4">
          <h1 className="flex flex-col text-2xl text-center font-bold">
            Quên mật khẩu
          </h1>

          <div className="w-full pt-6 flex flex-col gap-6">
            <Form
              id="forget-password-form"
              onSubmit={handleSubmit}
              className=""
            >
              <Input
                isRequired
                validate={(value) => {
                  if (!value) return "Không được để trống";
                  if (!isValidEmail(value)) return "Email không hợp lệ";
                  return true;
                }}
                // label="Email"
                labelPlacement="outside"
                placeholder="Vui lòng nhập email cá nhân"
                variant="faded"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                size="lg"
                autoComplete="email"
              />
            </Form>

            <div className="w-full flex flex-col items-center justify-center gap-4">
              <Button
                color="primary"
                size="lg"
                type="submit"
                form="forget-password-form"
                className="w-full"
                isLoading={submiting}
              >
                <span className="font-medium text-base">Lấy lại mật khẩu</span>
              </Button>
              <div className="flex mx-auto justify-center gap-2">
                <button onClick={handleForgetEmail}>
                  <span className="font-medium text-default-500 cursor-pointer">
                    Quên mail cá nhân?
                  </span>
                </button>
                <Link href="/auth/signin">
                  <span className="font-medium text-default-500 ">
                    Đăng nhập
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
