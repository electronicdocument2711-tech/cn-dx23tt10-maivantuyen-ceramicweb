"use client";

import rest from "@/lib/rest";
import { addToast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface VNPayResponse {
  data: {
    paymentUrl?: string;
  };
}

interface StartFreeResponse {
  message?: string;
}

export const usePayment = () => {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  const createPayment = async ({
    amount,
    userInfoId,
    planId,
    description,
  }: {
    amount?: number;
    userInfoId?: number;
    planId?: number;
    description?: string;
  }) => {
    setLoading(true);
    try {
      const orderNo = `USER${userInfoId}_PLAN${planId}_${Date.now()}`;
      const res = await rest.post<VNPayResponse>("/vnpay/create", {
        orderNo,
        amount,
        description: description || `Thanh toán đơn hàng ${orderNo}`,
      });
      const { paymentUrl } = res?.data;
      if (!paymentUrl) {
        throw new Error(
          "Không nhận được đường dẫn thanh toán hợp lệ từ VNPAY.",
        );
      }
      router.push(paymentUrl);
      return paymentUrl;
    } catch (err: any) {
      console.error("VNPay error:", err);
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startFree = async ({ userInfoId }: { userInfoId?: number }) => {
    setLoading(true);
    try {
      const res = await rest.post<StartFreeResponse>(
        "/subscription/start-free",
        {
          userInfoId,
        },
      );
      router.push('/');
      addToast({
        title: "Đăng ký gói miễn phí thành công!",
        color: "success",
      });
      return res;
    } catch (err: any) {
      console.error("Start free error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { isLoading, createPayment, startFree };
};
