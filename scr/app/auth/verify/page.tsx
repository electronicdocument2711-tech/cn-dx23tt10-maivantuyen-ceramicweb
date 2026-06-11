"use client";
import React, { Suspense, useEffect } from "react";
import { IconLogo } from "@/com/icons/regular";
import { addToast, Button, Checkbox, Input, Spinner } from "@heroui/react";
import { IconCheck, IconEye, IconEyeOff, IconX } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { IconCheckFilled } from "@/com/icons/outline";

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get("token");

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmit, setIsSubmit] = React.useState(false);
  const [isShow, setIsShow] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const enoughChar = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]+/.test(password);

  const [data, setData] = React.useState<{
    isValidToken: boolean;
    isActivated: boolean;
    businessName: string;
    ownerName: string;
    userName: string;
    email: string;
    position: string;
  }>({
    isValidToken: false,
    isActivated: false,
    businessName: "",
    ownerName: "",
    userName: "",
    email: "",
    position: "",
  });

  const handleSubmit = async () => {
    try {
      if (acceptTerms === false) return;
      setIsSubmit(true);
      const res = await rest.post(`/auth/verify`, {
        token,
        password,
      });
      const data = res.data;
      if (!data) throw new Error("Verify failed");
      addToast({
        title: "Thành công",
        description: "Kích hoạt tài khoản thành công",
        color: "success",
      });
      setData(data);
      // router.push("/auth/signin");
    } catch (error) {
      setData({
        isValidToken: false,
        isActivated: false,
        businessName: "",
        ownerName: "",
        userName: "",
        email: "",
        position: "",
      });
      addToast({
        title: "Thất bại",
        description: getErrorMessage(error, "Internal Server Error"),
        color: "danger",
      });
    } finally {
      setIsSubmit(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    const verify = async () => {
      try {
        setIsLoading(true);
        const res = await rest.get(`/auth/verify?token=${token}`);
        const data = res.data;
        if (!data)
          addToast({
            title: "Thất bại",
            description: "Token invalid",
            color: "danger",
          });
        if (isMounted) setData(data);
      } catch (error) {
        setData({
          isValidToken: false,
          isActivated: false,
          businessName: "",
          ownerName: "",
          userName: "",
          email: "",
          position: "",
        });
        addToast({
          title: "Thất bại",
          description: getErrorMessage(error, "Internal Server Error"),
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };
    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="flex flex-col min-h-screen">
      {isLoading || !data ? (
        <div className=" w-full max-w-7xl mx-auto min-h-screen flex items-center justify-center">
          <Spinner color="default" />
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto">
          {data?.isValidToken ? (
            <div>
              {data?.isActivated ? (
                <div className="flex flex-col items-center justify-center h-screen max-w-md mx-auto rounded-2xl p-6 gap-8">
                  <IconCheckFilled className="text-center" />
                  <h1 className=" text-[28px] font-bold text-center leading-[1.4] tracking-[-0.02rem]">
                    Great job 🎉
                    <br /> Your email is verified!
                  </h1>
                  <Button
                    size="lg"
                    radius="lg"
                    className="w-full max-w-36 h-12 text-lg font-semibold"
                    color="primary"
                    onPress={() => {
                      window.location.href = "/auth/signin";
                    }}
                  >
                    Tiếp tục
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex min-h-20 items-center">
                    <IconLogo size={48} className="mx-auto" />
                  </div>
                  <div>
                    <div className="flex flex-col min-h-20 items-center pb-10">
                      <h1 className="mx-auto font-bold text-4xl lg:max-w-5xl text-center px-10 py-4">
                        Tham gia vào{" "}
                        <span className="text-blue-700">
                          {data?.businessName}
                        </span>{" "}
                        trên DentalX
                      </h1>
                      <p className="mx-auto text-large font-medium">
                        DentalX là nền tảng quản lý nha khoa hiện đại & số hóa
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col max-w-md mx-auto rounded-2xl p-6 gap-4">
                    <p className="text-start font-medium pb-4">
                      Chào <span className="font-medium">{data?.userName}</span>
                      , bạn được{" "}
                      <span className="font-medium">{data?.ownerName}</span> mời
                      tham gia{" "}
                      <span className="font-bold">{data?.businessName}</span>{" "}
                      với chức vụ{" "}
                      <span className="font-bold">{data?.position}</span>. Hãy
                      tạo mật khẩu để đăng nhập DentalX nhé!
                    </p>
                    <Input
                      disabled
                      size="lg"
                      type="text"
                      value={data?.email}
                      label="Email đăng nhập"
                      labelPlacement="outside-top"
                      placeholder="Nhập tài khoản"
                      // className="px-4"
                      classNames={{ input: "text-xl" }}
                    />
                    <Input
                      size="lg"
                      type={isShow ? "text" : "password"}
                      value={password}
                      onChange={(value) => setPassword(value.target.value)}
                      label="Tạo mật khẩu"
                      labelPlacement="outside-top"
                      placeholder="Nhập mật khẩu"
                      // className="px-4"
                      classNames={{ input: "text-xl" }}
                      endContent={
                        <button
                          type="button"
                          onClick={() => setIsShow(!isShow)}
                          className="text-gray-600"
                        >
                          {isShow ? (
                            <IconEyeOff size={32} />
                          ) : (
                            <IconEye size={32} />
                          )}
                        </button>
                      }
                    />
                    <div>
                      <div className="flex items-start">
                        {enoughChar ? (
                          <IconCheck
                            color="green"
                            className="min-w-6 min-h-6"
                          />
                        ) : (
                          <IconX color="gray" className="min-w-6 min-h-6" />
                        )}
                        <p
                          className={`ml-2  ${
                            enoughChar ? "text-green-600" : "text-gray-600"
                          }`}
                        >
                          Chứa ít nhất 8 ký tự
                        </p>
                      </div>
                      <div className="flex items-start pb-2">
                        {hasSpecialChar ? (
                          <IconCheck
                            color="green"
                            className="min-w-6 min-h-6"
                          />
                        ) : (
                          <IconX color="gray" className="min-w-6 min-h-6" />
                        )}
                        <p
                          className={`ml-2  ${
                            hasSpecialChar ? "text-green-600" : "text-gray-600"
                          }`}
                        >
                          Bao gồm chữ hoa, chữ thường, ít nhất một chữ số và một
                          ký tự đặc biệt
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      isSelected={acceptTerms}
                      onValueChange={(e) => setAcceptTerms(e)}
                      className="pb-4"
                    >
                      Chấp nhận{" "}
                      <a
                        href="#"
                        className=" underline decoration-dotted decoration-2 underline-offset-2 text-blue-600"
                      >
                        điều khoản sử dụng
                      </a>
                    </Checkbox>
                    <Button
                      isLoading={isSubmit}
                      size="lg"
                      color={"primary"}
                      className="w-full max-w-sm text-lg font-semibold"
                      isDisabled={
                        !enoughChar || !hasSpecialChar || !acceptTerms
                      }
                      onPress={handleSubmit}
                    >
                      Tạo tài khoản
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex min-h-20 items-center">
                <IconLogo size={48} className="mx-auto" />
              </div>
              <div className="flex flex-col max-w-md mx-auto rounded-2xl p-6 gap-4">
                <p className="text-start font-medium pb-4">
                  Liên kết hết hạn hoặc không tồn tại, vui lòng liên hệ quản trị
                  viên!!!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center">
          <Spinner color="default" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
