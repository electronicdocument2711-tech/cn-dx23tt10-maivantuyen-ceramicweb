"use client";

import { useAppContext } from "@/context/AppContext";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";

interface PlanActionButtonProps {
  planName: string;
  isCurrentPlan: boolean;
  isFree: boolean;
  isLoading: boolean;
  onPress: () => void;
}

export default function PlanActionButton({
  planName,
  isCurrentPlan,
  isFree,
  isLoading,
  onPress,
}: PlanActionButtonProps) {
  const normalizedPlanName = planName.trim().toLowerCase();
  const isChainPlan = normalizedPlanName === "chain";
  const [noSubcribed, setNoSubscribed] = useState(false);

  const { me } = useAppContext();

  useEffect(() => {
    if (me?.user_info?.subscriber == null) {
      setNoSubscribed(true);
    }
  }, [me]);

  const buttonText = (() => {
    if (isFree) {
      return noSubcribed
        ? "Đăng ký"
        : isCurrentPlan
          ? "Gói hiện tại"
          : "Chuyển sang miễn phí";
    }

    if (isCurrentPlan) {
      return "Gói hiện tại";
    }

    if (isChainPlan) {
      return "Liên hệ";
    }

    return `Nâng cấp`;
  })();

  const baseClassName = "rounded-2xl text-base font-semibold mt-6";
  const freeClassName =
    "border-2 border-[#006CE6] bg-white text-[#006CE6] hover:bg-[#F5FAFF]";
  const paidClassName = "border-0 bg-[#006CE6] text-white";
  const currentPlanClassName = "opacity-60";

  return (
    <Button
      size="lg"
      disabled={isCurrentPlan}
      variant={isFree ? "bordered" : "solid"}
      color={isFree ? "default" : "primary"}
      isLoading={isLoading}
      className={`${baseClassName} ${isFree ? freeClassName : paidClassName} ${
        isCurrentPlan ? currentPlanClassName : ""
      }`}
      onPress={() => {
        if (isCurrentPlan) {
          return;
        }

        onPress();
      }}
    >
      {buttonText}
    </Button>
  );
}
