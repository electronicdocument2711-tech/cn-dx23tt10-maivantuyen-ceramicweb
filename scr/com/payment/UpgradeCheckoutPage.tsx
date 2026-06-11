"use client";

import NewHeader from "@/com/upgrade/Header";
import PlanFooter from "@/com/upgrade/PlanFooter";
import { useAppContext } from "@/context";
import { usePayment } from "@/hook/usePayment";
import { formatCurrency } from "@/lib/format";
import rest from "@/lib/rest";
import {
  getUpgradePlanIntervalLabel,
  getUpgradePlanLabel,
  type UpgradePlan,
} from "@/lib/upgradePlan";
import { addToast, Alert, Button, Card, Spinner } from "@heroui/react";
import {
  IconArrowLeft,
  IconBuildingBank,
  IconCopy,
  IconCreditCardPay,
  IconHeadset,
  IconQrcode,
  IconShieldCheck,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";

const SUCCESS_REDIRECT_SECONDS = 5;

type PaymentResultCode = "200" | "400" | "500";

function getPaymentAlert(result: string | null, countdown: number) {
  switch (result) {
    case "200":
      return {
        color: "success" as const,
        title: "Thanh toán thành công",
        description: `Giao dịch của bạn đã được ghi nhận thành công. Trang sẽ tự động chuyển về trang chủ sau ${countdown} giây.`,
      };
    case "400":
      return {
        color: "danger" as const,
        title: "Thanh toán không thành công",
        description:
          "Giao dịch chưa được hoàn tất hoặc đã bị hủy. Vui lòng kiểm tra lại thông tin và thử lại phương thức thanh toán phù hợp.",
      };
    case "500":
      return {
        color: "danger" as const,
        title: "Không thể xác minh giao dịch",
        description:
          "Hệ thống chưa nhận đủ thông tin để xác nhận kết quả thanh toán. Vui lòng quay lại trang nâng cấp hoặc liên hệ hỗ trợ nếu cần kiểm tra thêm.",
      };
    default:
      return null;
  }
}

export default function UpgradeCheckoutPage() {
  const { me } = useAppContext();
  const { createPayment, isLoading: isCreatingPayment } = usePayment();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const result = searchParams.get("result");
  const [selectedPlan, setSelectedPlan] = useState<UpgradePlan | null>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [redirectCountdown, setRedirectCountdown] = useState(
    SUCCESS_REDIRECT_SECONDS,
  );

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        setSelectedPlan(null);
        setIsLoadingPlan(false);
        return;
      }

      try {
        setIsLoadingPlan(true);
        const response = await rest.get("/plan");
        const fetchedPlans = response.data?.plans as UpgradePlan[] | undefined;

        if (!Array.isArray(fetchedPlans)) {
          setSelectedPlan(null);
          return;
        }

        const matchedPlan =
          fetchedPlans.find((plan) => String(plan.id) === planId) ?? null;
        setSelectedPlan(matchedPlan);
      } catch (error) {
        console.error("Error fetching checkout plan:", error);
        setSelectedPlan(null);
      } finally {
        setIsLoadingPlan(false);
      }
    };

    fetchPlan();
  }, [planId]);

  useEffect(() => {
    if (result !== "200") {
      setRedirectCountdown(SUCCESS_REDIRECT_SECONDS);
      return;
    }

    setRedirectCountdown(SUCCESS_REDIRECT_SECONDS);

    const intervalId = window.setInterval(() => {
      setRedirectCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          router.replace("/");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [result, router]);

  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        const response = await rest.get("/bank-config");
        const bankInfo = response?.data?.data || null;
        console.log("🚀 ~ fetchBankInfo ~ bankInfo:", bankInfo);
        setBankInfo(bankInfo);
      } catch (error: any) {
        console.log("🚀 ~ fetchBankInfo ~ error:", error);
      }
    };

    fetchBankInfo();
  }, []);

  const isInvalidPlan =
    !isLoadingPlan && (!selectedPlan || selectedPlan.product.name === "Free");
  const paymentResult =
    result === "200" || result === "400" || result === "500"
      ? (result as PaymentResultCode)
      : null;
  const paymentAlert = getPaymentAlert(paymentResult, redirectCountdown);
  const isPaymentSuccessful = paymentResult === "200";
  const planLabel = selectedPlan
    ? getUpgradePlanLabel(selectedPlan.product.name)
    : "";
  const planInterval = selectedPlan
    ? getUpgradePlanIntervalLabel(selectedPlan.months_per_interval)
    : "";
  const planPrice = selectedPlan?.product_pricings[0]?.price ?? 0;
  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      addToast({
        title: `Đã sao chép ${label}`,
        color: "success",
      });
    } catch (error) {
      console.error(`Copy ${label} failed:`, error);
      addToast({
        title: `Không thể sao chép ${label.toLowerCase()}`,
        color: "danger",
      });
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      return;
    }

    const normalizedPlanId = Number(selectedPlan.id);
    const userInfoId = me?.user_info?.id;

    if (!Number.isFinite(normalizedPlanId) || !userInfoId) {
      addToast({
        title: "Không thể khởi tạo thanh toán lúc này",
        color: "danger",
      });
      return;
    }

    try {
      await createPayment({
        userInfoId,
        planId: normalizedPlanId,
        description: `Thanh toán gói ${selectedPlan.product.name}`,
      });
    } catch (_error) {
      addToast({
        title: "Khởi tạo thanh toán thất bại",
        color: "danger",
      });
    }
  };

  const addContent = `U${me?.user_info?.id}P${planId}T${dayjs().format("YYYYMMDDHHmmss")}`;

  const renderQRCode = useMemo(() => {
    if (!bankInfo) {
      return null;
    }

    return (
      <Image
        src={`https://img.vietqr.io/image/${bankInfo?.bin}-${bankInfo?.account_number}-qr_only.jpg?amount=${planPrice}&addInfo=${encodeURIComponent(addContent)}&accountName=${encodeURIComponent(bankInfo?.account_name)}`}
        alt="QR thanh toán"
        width={640}
        height={640}
        className="w-full"
      />
    );
  }, [addContent, bankInfo, planPrice]);

  return (
    <>
      <NewHeader />
      <main className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 rounded-[32px] border border-[#E2EAF5] bg-white px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F3A78] transition-opacity hover:opacity-80"
            >
              <IconArrowLeft size={18} />
              Quay lại bảng giá
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-[#11315B] sm:text-3xl">
              Xác nhận thanh toán
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#CFE0FF] bg-[#F5F9FF] px-4 py-2 text-sm font-semibold text-[#1557D6]">
            <IconShieldCheck size={18} />
            Thanh toán an toàn
          </div>
        </section>

        {paymentAlert ? (
          <Alert
            color={paymentAlert.color}
            title={paymentAlert.title}
            description={paymentAlert.description}
            className="rounded-[28px] border shadow-none"
          />
        ) : null}

        {isLoadingPlan ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[32px] border border-[#E2EAF5] bg-white">
            <Spinner color="primary" size="lg" />
            <p className="text-base font-medium text-[#4C6078]">
              Đang tải thông tin gói thanh toán...
            </p>
          </div>
        ) : isInvalidPlan ? (
          <Card className="rounded-[32px] border border-[#E2EAF5] px-6 py-12 shadow-none">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <div className="rounded-full bg-[#EEF5FF] p-4 text-[#1557D6]">
                <IconShieldCheck size={32} />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-[#11315B]">
                Không tìm thấy gói thanh toán phù hợp
              </h2>
              <p className="mt-3 text-base leading-7 text-[#4C6078]">
                Liên kết này có thể đã thiếu thông tin hoặc gói bạn chọn không
                cần thanh toán trực tuyến. Vui lòng quay lại bảng giá để chọn
                lại gói phù hợp.
              </p>
              <Button
                as={Link}
                href="/upgrade"
                color="primary"
                size="lg"
                className="mt-6 rounded-2xl bg-[#006CE6] px-8 text-base font-semibold text-white"
              >
                Quay lại trang nâng cấp
              </Button>
            </div>
          </Card>
        ) : selectedPlan ? (
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              <Card className="rounded-[32px] border border-[#DCE9FA] bg-white p-6 shadow-[0_20px_60px_rgba(9,51,123,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5A7DB4]">
                      Gói đã chọn
                    </p>
                    <h2 className="mt-3 text-3xl font-bold text-[#11315B]">
                      {planLabel}
                    </h2>
                    <p className="mt-3 text-base leading-7 text-[#4C6078]">
                      {selectedPlan.product.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-[#F6FAFF] p-5">
                    <p className="text-sm font-medium text-[#67809E]">
                      Giá thanh toán
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[#0F3A78]">
                      {formatCurrency(planPrice)}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-[#F6FAFF] p-5">
                    <p className="text-sm font-medium text-[#67809E]">
                      Chu kỳ thanh toán
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[#0F3A78]">
                      {planInterval}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[32px] border border-[#DCE9FA] bg-white p-6 shadow-[0_20px_60px_rgba(9,51,123,0.08)]">
                <div className="flex flex-col gap-4">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF5FF] px-4 py-2 text-sm font-semibold text-[#1557D6]">
                      <IconCreditCardPay size={18} />
                      Thanh toán tự động
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-[#11315B]">
                      Thanh toán qua Momo, thẻ tín dụng, thẻ ATM,...
                    </h3>
                    <p className="mt-3 text-base leading-7 text-[#4C6078]">
                      Hoàn tất giao dịch nhanh chóng và chuyển thẳng sang cổng
                      thanh toán điện tử an toàn để kích hoạt gói.
                    </p>
                  </div>

                  <Button
                    color="primary"
                    size="lg"
                    isDisabled={isPaymentSuccessful}
                    isLoading={isCreatingPayment}
                    className="rounded-2xl bg-[#006CE6] px-8 text-base font-semibold text-white"
                    onPress={handlePayment}
                  >
                    {isPaymentSuccessful
                      ? "Đã thanh toán thành công"
                      : "Thanh toán ngay"}
                  </Button>
                </div>
              </Card>

              <Card className="rounded-[32px] border border-[#E2EAF5] bg-[#0F3A78] p-6 text-white shadow-[0_18px_48px_rgba(15,58,120,0.18)]">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <IconHeadset size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      Cần hỗ trợ hóa đơn hoặc tư vấn nhanh?
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/80">
                      Bộ phận chăm sóc khách hàng có thể hỗ trợ xác nhận giao
                      dịch, xuất hóa đơn và hướng dẫn kích hoạt gói cho phòng
                      khám.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href="tel:0909123456"
                        className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0F3A78] transition-opacity hover:opacity-90"
                      >
                        0909 581 165
                      </a>
                      <a
                        href="mailto:hello@dentalx.vn"
                        className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                      >
                        hello@dentalx.vn
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="overflow-hidden rounded-[32px] border border-[#DCE9FA] bg-white p-0 shadow-[0_20px_60px_rgba(9,51,123,0.08)]">
                <div className="border-b border-[#E8F0FB] bg-[linear-gradient(135deg,_#F7FBFF,_#EEF5FF)] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-3 text-[#1557D6] shadow-sm">
                      <IconQrcode size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#11315B]">
                        Chuyển khoản trực tiếp
                      </h3>
                      <p className="mt-1 text-sm text-[#5A708B]">
                        Quét QR hoặc dùng đúng thông tin bên dưới để đối soát
                        nhanh hơn.
                      </p>
                    </div>
                  </div>
                </div>

                {bankInfo ? (
                  <div className="space-y-5 p-6">
                    <div className="rounded-[28px] bg-[#F7FAFF] p-4 w-full max-w-80 mx-auto">
                      {renderQRCode}
                    </div>

                    <div className="space-y-4">
                      <InfoItem
                        label="Số tài khoản"
                        value={bankInfo?.account_number}
                        onCopy={() =>
                          handleCopy(bankInfo?.account_number, "số tài khoản")
                        }
                      />
                      <InfoItem
                        label="Chủ tài khoản"
                        value={bankInfo?.account_name}
                      />
                      <InfoItem
                        label="Ngân hàng"
                        value={bankInfo?.bank_name}
                        icon={<IconBuildingBank size={18} className="mt-0.5" />}
                      />
                      <InfoItem label="Chi nhánh" value={bankInfo?.bank_cn} />
                    </div>

                    <div className="rounded-[24px] border border-[#DCE9FA] bg-[#F8FBFF] p-5">
                      <p className="text-sm font-medium text-[#67809E]">
                        Nội dung chuyển khoản
                      </p>
                      <p className="mt-2 text-lg font-bold text-[#11315B]">
                        {addContent}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          size="md"
                          variant="bordered"
                          startContent={<IconCopy size={18} />}
                          className="rounded-2xl border-[#C5D9F8] bg-white font-semibold text-[#0F3A78]"
                          onPress={() =>
                            handleCopy(addContent, "nội dung chuyển khoản")
                          }
                        >
                          Sao chép nội dung
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-[#F1E4BC] bg-[#FFFBEF] p-5 text-sm leading-7 text-[#6F5A1A]">
                      Vui lòng giữ đúng nội dung chuyển khoản để kế toán đối
                      soát giao dịch nhanh và chính xác.
                    </div>
                  </div>
                ) : null}
              </Card>
            </div>
          </div>
        ) : null}
      </main>
      <PlanFooter />
    </>
  );
}

function InfoItem({
  label,
  value,
  icon,
  onCopy,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  onCopy?: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-[#E4EDF8] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#67809E]">{label}</p>
          <div className="mt-2 flex items-start gap-2">
            {icon ? (
              <span className="mt-0.5 shrink-0 text-[#5A7DB4]">{icon}</span>
            ) : null}
            <p className="text-base font-semibold leading-7 text-[#11315B]">
              {value}
            </p>
          </div>
        </div>

        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            className="rounded-xl bg-[#EEF5FF] p-2 text-[#1557D6] transition-opacity hover:opacity-80"
            aria-label={`Sao chép ${label}`}
          >
            <IconCopy size={18} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
