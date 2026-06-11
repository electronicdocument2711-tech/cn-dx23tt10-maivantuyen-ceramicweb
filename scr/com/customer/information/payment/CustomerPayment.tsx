"use client";
import { Tooltip, Spinner } from "@heroui/react";
import { IconHelpCircle } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import ModalReceiptTip from "../../ModalReceiptTip";
import { formatCurrency } from "@/lib/format";
import ModalCreateReceipt from "./ModalCreateReceipt";
import { ButtonCustom } from "@/com/shared";
import { IconChevronRight, IconPlus } from "@/com/icons/outline";
import rest from "@/lib/rest";
import { useCustomerContext } from "@/context/CustomerContext";
import Link from "next/link";

interface CustomerPaymentProps {
  customerId: string;
}

const CustomerPayment: React.FC<CustomerPaymentProps> = (
  _: CustomerPaymentProps,
) => {
  const [showReceiptTip, setShowReceiptTip] = useState(false);
  const [isFetchingSummary, setIsFetchingSummary] = useState(true);
  const [summaryPayment, setSummaryPayment] = useState<any>(null);
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  const { customer } = useCustomerContext();

  const [showModalCreateReceipt, setShowModalCreateReceipt] = useState(false);

  const handleOpenModalCreateReceipt = () => {
    setShowModalCreateReceipt(true);
  };

  const onCreateReceiptSuccess = () => {
    setShowModalCreateReceipt(false);
    setTriggerRefresh((prev) => prev + 1);
  };

  useEffect(() => {
    if (!customer?.CustomerId) return;

    const fetchSummaryPayment = async () => {
      try {
        setIsFetchingSummary(true);
        const res = await rest.get(
          `/customer/${customer?.CustomerId}/summary-payment`,
        );

        if (res?.status !== 200) {
          throw new Error("Lỗi khi lấy thông tin thanh toán tổng hợp");
        }

        setSummaryPayment(res?.data);
      } catch {
        // TODO: handle error
      } finally {
        setIsFetchingSummary(false);
      }
    };

    fetchSummaryPayment();
  }, [triggerRefresh, customer?.CustomerId]);

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-foreground text-xl font-bold">Thanh toán</h2>
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => setShowReceiptTip(true)}
            >
              <Tooltip content="Hướng dẫn thu tiền" placement="top">
                <IconHelpCircle />
              </Tooltip>
            </button>
            <ModalReceiptTip
              isOpen={showReceiptTip}
              onOpenChange={() => setShowReceiptTip(!showReceiptTip)}
            />
          </div>
          <ButtonCustom
            styleType="primary"
            isDisabled={isFetchingSummary || !summaryPayment}
            label="Tạo phiếu thu"
            onClick={handleOpenModalCreateReceipt}
            startContent={<IconPlus size={20} className="shrink-0" />}
            className="max-w-44"
          />
        </div>

        <>
          <ul className="table-simple mb-3">
            <li className="rounded-t-2xl">
              <p>Tổng tiền phải thanh toán</p>
              {isFetchingSummary ? (
                <Spinner size="sm" color="default" />
              ) : (
                <p className="font-normal">
                  {summaryPayment
                    ? formatCurrency(summaryPayment?.TotalAmount, true)
                    : 0}
                </p>
              )}
            </li>
            <li className="">
              <p>Tổng tiền đã thu</p>
              {isFetchingSummary ? (
                <Spinner size="sm" color="default" />
              ) : (
                <p>
                  {summaryPayment
                    ? formatCurrency(summaryPayment?.PaidAmount, true)
                    : 0}
                </p>
              )}
            </li>
            <li className="rounded-b-2xl table-header">
              <p className="text-base font-bold sm:!text-lg md:!text-xl">
                Phải thu
              </p>
              {isFetchingSummary ? (
                <Spinner size="sm" color="default" />
              ) : (
                <p className="text-base font-bold sm:!text-lg md:!text-xl">
                  {summaryPayment
                    ? formatCurrency(summaryPayment?.UnpaidAmount, true)
                    : 0}
                </p>
              )}
            </li>
          </ul>
          <Link
            className="py-2 px-4 w-fit rounded-xl hover:bg-sky-50 text-default-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            href={`/customer/${customer?.CustomerId}/financial`}
          >
            Xem tất cả
            <IconChevronRight size={18} />
          </Link>
        </>
      </div>
      <ModalCreateReceipt
        isOpen={showModalCreateReceipt}
        onOpenChange={setShowModalCreateReceipt}
        createReceiptSuccess={onCreateReceiptSuccess}
        unpaidAmount={summaryPayment?.UnpaidAmount || 0}
      />
    </>
  );
};

export default CustomerPayment;
