"use client";

import { useAppContext } from "@/context";
import { usePayment } from "@/hook/usePayment";
import { formatCurrency } from "@/lib/format";
import rest from "@/lib/rest";
import {
  getUpgradePlanKey,
  getUpgradePlanLabel,
  type UpgradePlan,
} from "@/lib/upgradePlan";
import { addToast, Card, Tab, Tabs } from "@heroui/react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PlanFeatures from "@/com/upgrade/PlanFeatures";
import NewHeader from "@/com/upgrade/Header";
import PlanActionButton from "@/com/upgrade/PlanActionButton";
import PlanFaq from "@/com/upgrade/PlanFaq";
import PlanFooter from "@/com/upgrade/PlanFooter";

const PlantTab = [
  {
    type: "monthly",
    title: "Hàng tháng",
  },
  {
    type: "yearly",
    title: "Hàng năm",
  },
];

type Plant = UpgradePlan;

type PackageType = "monthly" | "yearly";

const parsePlanFeatures = (features: Plant["product"]["features"]) => {
  const featureList = Array.isArray(features)
    ? features
    : typeof features === "string"
      ? features.split("\n")
      : [];

  return featureList
    .map((feature) => {
      const normalizedFeature = feature.trim();
      if (!normalizedFeature) {
        return null;
      }

      const symbol = normalizedFeature[0];
      const label =
        symbol === "+" || symbol === "-"
          ? normalizedFeature.slice(1).trim()
          : normalizedFeature;

      return {
        label,
        isNegative: symbol === "-",
        highlightKhong: /^Không\b/.test(label),
      };
    })
    .filter(
      (feature): feature is NonNullable<typeof feature> => feature !== null,
    );
};

export default function UpgradePage() {
  // ** STATES */
  const { me } = useAppContext();
  const { startFree } = usePayment();
  const router = useRouter();
  const [cancellingPlanId, setCancellingPlanId] = useState<
    number | string | null
  >(null);

  const [selectedPackage, setSelectedPackage] =
    useState<PackageType>("monthly");
  const [plans, setPlans] = useState<Plant[]>([]);
  const displayPlans = plans.filter((plan) => plan.months_per_interval === 1);

  const getPlanByInterval = (planName: string, monthsPerInterval: number) =>
    plans.find(
      (plan) =>
        plan.product.name === planName &&
        plan.months_per_interval === monthsPerInterval,
    );

  // -- ** EFFECTS */
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await rest.get("/plan");
        const fetchedPlans = response.data?.plans as Plant[] | undefined;

        if (
          (response.status === 200 || response.status === 201) &&
          Array.isArray(fetchedPlans) &&
          fetchedPlans.length > 0
        ) {
          setPlans(fetchedPlans);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };

    fetchPlans();
  }, []);

  const handleCancel = async (plan: Plant) => {
    setCancellingPlanId(plan.id ?? null);
    try {
      await rest.post("/subscription/cancel", {
        userInfoId: me?.user_info?.id,
      });
    } catch (error) {
      console.error("Huỷ gói thất bại:", error);
      addToast({
        title: "Huỷ gói thất bại",
        color: "danger",
      });
    } finally {
      setCancellingPlanId(null);
    }
  };

  const actionBtnPlan = async (plan: Plant) => {
    if (plan?.product?.name === "Chain") {
      addToast({
        title: "Vui lòng liên hệ để đăng ký gói Chain",
        color: "primary",
      });
      return;
    }

    if (plan?.product?.name === "Free") {
      startFree({ userInfoId: me?.user_info?.id });
      return;
    }

    router.push(`/upgrade/checkout?planId=${plan.id}&engage=true`);
  };

  // ** UI COMPONENTS */

  const Title = () => (
    <div className="flex flex-col items-center gap-4 mt-12">
      <h2 className="p-5 text-5xl font-bold text-default-900 whitespace-pre-line leading-snug break-words max-w-[600px]">
        Chọn gói phù hợp với phòng khám của bạn
      </h2>
      <p className="font-medium text-base text-default-700">
        Dùng miễn phí gói Starter hoặc Growth
        <br />
        trong 14 ngày, không cần thanh toán
      </p>
    </div>
  );

  //**MAIN UI */
  return (
    <>
      <NewHeader />
      <div className="flex flex-col max-w-[90rem] mx-auto text-center gap-9 pb-9">
        <Title />
        <div className="flex w-full flex-col items-center justify-center">
          <Tabs
            size="lg"
            radius="full"
            aria-label="Options"
            selectedKey={selectedPackage}
            onSelectionChange={(key) =>
              setSelectedPackage(String(key) as PackageType)
            }
            classNames={{
              tabList: "bg-gray-400 p-1 rounded-full flex gap-2",
              tab: "px-6 py-5 text-[14px] font-semibold rounded-full transition-all",
              tabContent:
                "text-[#7A8593] group-data-[selected=true]:text-default-900 ",
              cursor:
                "bg-white rounded-full shadow-md transition-all duration-300 ease-in-out",
            }}
          >
            {PlantTab.map((plan) => (
              <Tab key={plan.type} title={plan.title} />
            ))}
          </Tabs>
          <p className="text-base font-medium pt-3">
            <span className="text-[#006CE6] font-medium text-base ">
              Tặng 3 tháng
            </span>{" "}
            khi thanh toán theo năm
          </p>

          <div className="mt-8 mx-auto grid w-full px-6 gap-5 grid-cols-2 lg:grid-cols-4">
            {displayPlans.map((item, index) => {
              const isStarter = item.product.name === "Starter";
              const isFree = item.product.name === "Free";
              const yearlyPlan = getPlanByInterval(item.product.name, 12);
              const activePlan =
                selectedPackage === "yearly" && yearlyPlan ? yearlyPlan : item;

              const isCurrentPlan =
                me?.user_info?.subscriber != null &&
                me?.user_info?.subscriber?.subscription?.plan?.id ===
                  activePlan.id;

              const displayFeatures = parsePlanFeatures(
                item?.product?.features,
              );

              return (
                <Card
                  className={`h-full w-full shadow-sm min-w-60 min-h-[500px] rounded-4xl text-start ${
                    isStarter
                      ? "border-2 border-[#006CE6]"
                      : "border border-default-300"
                  }`}
                  key={getUpgradePlanKey(item, index)}
                >
                  <div className="flex h-full flex-col p-4">
                    <div className="flex items-center gap-4">
                      <h3 className="py-2 text-xl font-bold text-default-900">
                        {getUpgradePlanLabel(item.product.name)}
                      </h3>
                      <div className="h-7">
                        {isStarter && (
                          <span className="rounded-lg bg-[#006CE6] px-4 py-0.5 text-[14px] font-medium text-nowrap text-white">
                            Phổ biến
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-base h-28 text-[#53677A]">
                      {item.product?.description}
                    </p>

                    <div className="flex items-end text-nowrap">
                      {isFree ? (
                        <>
                          <p className="text-2xl font-bold">Miễn phí</p>
                          <p className="text-[14px] font-semibold">
                            {" "}
                            / (6 tháng)
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-2xl font-bold">
                            {item.product_pricings[0]?.price === 0
                              ? "Miễn phí"
                              : formatCurrency(item.product_pricings[0]?.price)}
                          </p>
                          {item.product_pricings[0]?.price !== 0 && (
                            <p className="text-[14px] font-semibold">/ tháng</p>
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-base font-medium text-[#42586D]">
                      {isFree
                        ? "Không phải lo về chi phí"
                        : selectedPackage === "monthly"
                          ? "Trả hàng tháng"
                          : `Trả hàng năm${
                              yearlyPlan?.product_pricings[0]?.price
                                ? `: ${formatCurrency(yearlyPlan.product_pricings[0].price)}`
                                : ""
                            }`}
                    </p>

                    <PlanActionButton
                      planName={activePlan.product.name}
                      isCurrentPlan={isCurrentPlan}
                      isFree={isFree}
                      isLoading={cancellingPlanId === activePlan.id}
                      onPress={() => actionBtnPlan(activePlan)}
                    />

                    <div className="mt-6 flex flex-1 flex-col gap-3">
                      {displayFeatures.map((feature, idx) => (
                        <div
                          key={`${feature.label}-${idx}`}
                          className="flex items-center gap-3"
                        >
                          {feature.isNegative ? (
                            <IconX className="text-[#8E99A7]" size={20} />
                          ) : (
                            <IconCheck
                              className="text-success shrink-0"
                              size={20}
                            />
                          )}
                          <p
                            className={`text-base ${feature.isNegative ? "text-[#8E99A7]" : "text-gray-800"}`}
                          >
                            {feature.highlightKhong ? (
                              <>
                                <strong>Không</strong>
                                {feature.label.slice("Không".length)}
                              </>
                            ) : (
                              feature.label
                            )}
                          </p>
                        </div>
                      ))}
                    </div>

                    {isCurrentPlan && (
                      <button
                        type="button"
                        disabled={cancellingPlanId === activePlan.id}
                        onClick={() => handleCancel(activePlan)}
                        className="mt-5 flex w-full items-center justify-between rounded-2xl bg-[#F1F3F6] px-5 py-3 text-left transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <span className="text-md font-medium text-[#4C6078]">
                          Bạn muốn dừng sử dụng?
                        </span>
                        <span className="text-md font-bold text-[#0E3D7A]">
                          {cancellingPlanId === activePlan.id
                            ? "Đang huỷ..."
                            : "Huỷ gói"}
                        </span>
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}

            {displayPlans.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-default-300 p-8 text-center text-default-500">
                Chưa có gói{" "}
                {selectedPackage === "monthly" ? "theo tháng" : "theo năm"}.
              </div>
            )}
          </div>
          <PlanFeatures />
          <PlanFaq />
        </div>
      </div>
      <PlanFooter />
    </>
  );
}
