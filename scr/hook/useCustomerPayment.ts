import { useEffect, useState } from "react";
import { useCustomerContext } from "@/context/CustomerContext";
import {
  PaymentPromotionData,
  PaymentData,
  TreatmentTotal,
  ReceiptTotal,
} from "@/types/define.d";
import rest from "@/lib/rest";

export function useCustomerPayment({ enabled = true }: { enabled?: boolean }) {
  const { customer } = useCustomerContext();

  const [receipts, setReceipts] = useState<ReceiptTotal | null>(null);
  const [treatments, setTreatments] = useState<TreatmentTotal | null>(null);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [summaryPayment, setSummaryPayment] = useState<any>(null);
  const [promotion, setPromotion] = useState<PaymentPromotionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refetch = () => setRefreshKey(refreshKey + 1);

  useEffect(() => {
    if (!enabled) return;
    if (!customer?.CustomerId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        await Promise.all([
          rest
            .get(`/customer/${customer.CustomerId}/payment`)
            .then((data) => setPayment(data.data)),
          rest
            .get(`/customer/${customer.CustomerId}/promotion`)
            .then((data) => setPromotion(data.data)),
          rest
            .get(`/customer/${customer.CustomerId}/receipt`)
            .then((data) => setReceipts(data.data)),
          rest
            .get(`/customer/${customer.CustomerId}/treatment`)
            .then((data) => setTreatments(data.data)),
          rest
            .get(`/customer/${customer?.CustomerId}/summary-payment`)
            .then((data) => {
              setSummaryPayment(data?.data);
            }),
        ]);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customer?.CustomerId, refreshKey, enabled]);

  return {
    receipts,
    treatments,
    payment,
    promotion,
    refetch,
    isLoading,
    summaryPayment,
  };
}
