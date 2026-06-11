"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  // useDisclosure,
} from "@heroui/react";
import React, { useMemo, useState } from "react";
import { ReceiptData } from "@/types/define.d";
import { IconReceiptShoping } from "@/com/icons/duotone";
import { formatCurrency } from "@/lib/format";
import dayjs from "dayjs";
import RefundModal from "@/com/customer/information/payment/RefundModal";
import { useCustomerPayment } from "@/hook/useCustomerPayment";
import { IconPlus } from "@tabler/icons-react";
import { ButtonCustom } from "@/com/shared";
import ModalCreateReceipt from "@/com/customer/information/payment/ModalCreateReceipt";
import { useCustomerContext } from "@/context/CustomerContext";
import { ModalDetailReceipt } from "@/com/widget/TableReceipt";

const FinancialPage: React.FC = () => {
  const { customer } = useCustomerContext();
  const {
    receipts: receiptData,
    treatments: treatmentData,
    refetch,
    isLoading,
    summaryPayment,
  } = useCustomerPayment({
    enabled: true,
  });

  const receipts: ReceiptData[] = useMemo(() => {
    const list = Array.isArray(receiptData?.ListReceipt)
      ? receiptData!.ListReceipt
      : [];
    const receiptWithKey = list.map((item, idx) => ({
      ...item,
      id: idx + 1,
    }));
    const rc = [
      {
        ReceiptId: "",
        ReceiptCode: "",
        TypeName: "",
        AddedAt: "",
        CreatedBy: "",
        BranchCode: "",
        Amount: receiptData?.TotalAmount ?? "0",
        PaymentMethodName: "",
        Note: "",
        id: "",
      },
      ...receiptWithKey,
    ];
    return rc;
  }, [receiptData]);

  const treatments = useMemo(() => {
    if (!treatmentData || treatmentData?.TreatmentAll?.length === 0) return [];
    const treatmentWithKey =
      treatmentData?.TreatmentAll?.map((item, idx) => ({
        ...item,
        id: idx + 1,
      })) ?? [];

    return [
      {
        TotalPercentageCompleted: "",
        Payment: treatmentData.TotalAmount,
        Revenue: treatmentData.Revenue,
        ServiceName: "",
        id: "",
      },
      ...treatmentWithKey,
    ];
  }, [treatmentData]);

  const [isOpenCreateReceipt, setIsOpenCreateReceipt] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(
    null,
  );

  return (
    <div className="flex flex-col items-center gap-9 px-6">
      {/* <PaymentHistory /> */}
      <div className="w-full flex flex-col table-divider-bottom pb-12">
        <div className="flex items-center justify-between pb-5">
          <h1 className="font-bold text-xl">Lịch sử thanh toán</h1>

          <div className="flex items-center justify-between gap-2">
            <ButtonCustom
              styleType="primary"
              isDisabled={isLoading}
              label="Tạo phiếu thu"
              onClick={() => setIsOpenCreateReceipt(true)}
              startContent={<IconPlus size={20} className="shrink-0" />}
              className="max-w-44"
            />
            <RefundModal
              receipts={receiptData?.ListReceipt ?? []}
              onSucess={() => refetch()}
            />
          </div>
          <ModalCreateReceipt
            isOpen={isOpenCreateReceipt}
            onOpenChange={setIsOpenCreateReceipt}
            createReceiptSuccess={() => {
              refetch();
              setIsOpenCreateReceipt(false);
            }}
            unpaidAmount={summaryPayment?.UnpaidAmount ?? 0}
          />
        </div>

        {receipts?.length === 0 ? (
          <div className="border-[0.5px] border-zinc-200 rounded-2xl">
            <div className="h-40 flex flex-col items-center justify-center gap-4">
              <IconReceiptShoping size={50} />
              <p className="font-bold text-lg">Chưa có phiếu cọc</p>
            </div>
          </div>
        ) : (
          <Table
            aria-labelledby="treatment-proccess"
            rowHeight={44}
            shadow="none"
            radius="none"
            classNames={{
              wrapper: "p-0 rounded-xl border-1 border-zinc-200",
              table: "px-0 rounded-none table-fixed ",
              th: "p-2 sm:px-4 whitespace-normal text-gray-700 text-sm",
              td: "p-2 sm:px-4 table-content",
            }}
          >
            <TableHeader>
              <TableColumn width="5%" align="center">
                #
              </TableColumn>
              <TableColumn>Mã phiếu & Ngày tạo</TableColumn>
              <TableColumn className="hidden xs:table-cell">
                Chi nhánh & Người tạo
              </TableColumn>
              <TableColumn className="hidden md:table-cell">
                Nội dung
              </TableColumn>
              <TableColumn width="25%" align="end">
                Số tiền
              </TableColumn>
            </TableHeader>
            <TableBody
              items={receipts}
              emptyContent="Không có dịch vụ điều trị"
            >
              {(item) => (
                <TableRow key={`row-${item.id}`}>
                  <TableCell className={``}>{item.id}</TableCell>
                  <TableCell className={``}>
                    {item.ReceiptId ? (
                      <Tooltip content="Xem chi tiết" delay={500}>
                        <button
                          type="button"
                          className="hover:text-primary hover:underline"
                          onClick={() => setSelectedReceipt(item)}
                        >
                          {item?.ReceiptCode}
                        </button>
                      </Tooltip>
                    ) : (
                      <p>{item.ReceiptCode}</p>
                    )}
                    <p className={`font-medium text-sm text-gray-700`}>
                      {item.AddedAt
                        ? dayjs(Number(item.AddedAt) * 1000).format(
                            "DD/MM/YYYY",
                          )
                        : ""}
                    </p>
                  </TableCell>
                  <TableCell className={`hidden xs:table-cell`}>
                    <div className="flex flex-col">
                      <p>{item.BranchCode}</p>
                      <p>{item.CreatedBy}</p>
                    </div>
                  </TableCell>
                  <TableCell
                    className={` ${
                      item.id === "" ? "font-bold text-lg" : ""
                    } hidden md:table-cell `}
                  >
                    <p className="text-left line-clamp-2">{item.Note}</p>
                  </TableCell>
                  <TableCell className={` `}>
                    <p className={` ${item.id === "" ? " font-bold!" : ""} `}>
                      {formatCurrency(item.Amount, true)}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <ModalDetailReceipt
        id={selectedReceipt?.ReceiptId}
        customerId={customer?.CustomerId}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* <TreatMentProgress /> */}
      <div className="w-full flex flex-col table-divider-bottom pb-12">
        <h1 id="treatment-proccess" className="font-bold text-xl">
          Tiến độ điều trị
        </h1>
        <Table
          aria-labelledby="treatment-proccess"
          rowHeight={44}
          shadow="none"
          radius="none"
          className="my-4"
          classNames={{
            wrapper: "p-0 rounded-xl border-1 border-zinc-200",
            table: "px-0 rounded-none table-fixed ",
            th: "px-2 sm:px-4 text-sm text-gray-700",
            td: "p-2 sm:px-4",
          }}
        >
          <TableHeader>
            <TableColumn width="5%" align="center">
              #
            </TableColumn>
            <TableColumn align="start">Dịch vụ</TableColumn>
            <TableColumn
              width="10%"
              align="center"
              className="hidden xs:table-cell"
            >
              Tiến độ
            </TableColumn>
            <TableColumn align="end">Tổng tiền</TableColumn>
            <TableColumn align="end" className="hidden md:table-cell">
              Doanh thu
            </TableColumn>
          </TableHeader>
          <TableBody
            items={treatments}
            emptyContent="Không có dịch vụ điều trị"
          >
            {(item) => (
              <TableRow key={`row-${item.id}`}>
                <TableCell className={``}>
                  <p>{item.id}</p>
                </TableCell>
                <TableCell>
                  <p>{item.ServiceName}</p>
                </TableCell>
                <TableCell className="hidden xs:table-cell">
                  <p>
                    {item.TotalPercentageCompleted &&
                    item.TotalPercentageCompleted !== ""
                      ? `${item.TotalPercentageCompleted}%`
                      : ""}
                  </p>
                </TableCell>
                <TableCell>
                  <p className={` ${item.id === "" ? "font-bold " : ""} `}>
                    {formatCurrency(item.Payment, true)}
                  </p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <p className={` ${item.id === "" ? "font-bold " : ""} `}>
                    {formatCurrency(item.Revenue, true)}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* <PaymentInfo /> */}
      <div className="w-full flex flex-col gap-6 table-divider-bottom pb-12">
        <h1 className="items-center font-bold text-xl">Thông tin tài khoản</h1>
        <div className="table-simple">
          <div className="">
            <p className="line-clamp-2"> Tổng tiền phải thanh toán</p>
            <p className="font-bold min-w-28 text-right">
              {summaryPayment
                ? formatCurrency(summaryPayment?.TotalAmount, true)
                : 0}
            </p>
          </div>
          <div className="">
            <p className="line-clamp-2">Tổng tiền đã thu</p>
            <p className="font-bold min-w-28 text-right">
              {summaryPayment
                ? formatCurrency(summaryPayment?.PaidAmount, true)
                : 0}
            </p>
          </div>

          <div className="">
            <p className="line-clamp-1">Phải thu</p>
            <p className="text-blue-600 text-right">
              {summaryPayment
                ? formatCurrency(summaryPayment?.UnpaidAmount, true)
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* <PaymentPromotion /> */}
      {/* <div className="w-full flex flex-col gap-6">
        <h1 className="items-center font-bold text-xl">Khuyến mãi</h1>
        <div className="table-simple">
          <div className="">
            <p>Tiền Khuyến Mãi</p>
            <p className="font-bold">
              {formatCurrency(promotion?.TotalPromotionAccount ?? 0, true)}
            </p>
          </div>
          <div className="">
            <p>Đã sử dụng</p>
            <p className="font-bold">
              {formatCurrency(promotion?.TotalPromotionBalance ?? 0, true)}
            </p>
          </div>
          <div className="">
            <p>Giảm giá dịch vụ</p>
            <p className="font-bold">
              {formatCurrency(promotion?.TotalPromotionPayment ?? 0, true)}
            </p>
          </div>
          <div className="">
            <p>Hết hạn</p>
            <p className="font-bold">
              {formatCurrency(
                promotion?.TotalPromotionExpiredDebitVoucher ?? 0,
                true,
              )}
            </p>
          </div>
          <div className="">
            <p className="table-header">Còn lại</p>
            <p className="table-header">
              {formatCurrency(promotion?.TotalAccount ?? 0, true)}
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default FinancialPage;
