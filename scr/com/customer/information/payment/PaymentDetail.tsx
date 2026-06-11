import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { IconChevronRight, IconX } from "@tabler/icons-react";
import React, { useMemo } from "react";
import { ReceiptData } from "@/types/define.d";
import { IconReceiptShoping } from "@/com/icons/duotone";
import { formatCurrency } from "@/lib/format";
import dayjs from "dayjs";
import { ButtonCustom } from "@/com/shared/ButtonCustom";
import RefundModal from "./RefundModal";
import { useCustomerPayment } from "@/hook/useCustomerPayment";


const PaymentModalDemo: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    receipts: receiptData,
    treatments: treatmentData,
    payment,
    promotion,
  } = useCustomerPayment({
    enabled: isOpen,
  });

  const handleOpenChange = (open: boolean) => {
    if (open) {
      onOpen();
    } else {
      onClose();
    }
  };

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
    console.log(rc);
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

  return (
    <>
      <ButtonCustom
        onClick={() => handleOpenChange(true)}
        styleType="light"
        label="Xem tất cả"
        className="font-semibold max-w-40"
        endContent={<IconChevronRight size={18} />}
      />
      <Modal
        isOpen={isOpen}
        size="4xl"
        onOpenChange={handleOpenChange}
        hideCloseButton
        className="max-w-[800px]"
        scrollBehavior="outside"
      >
        <ModalContent>
          <ModalHeader className="h-13 border-b-[0.5px] border-gray-400 text-base font-bold flex items-center justify-between pl-7 pr-3 ">
            <p className="text-base font-bold text-foreground">
              Chi tiết thanh toán
            </p>
            <button
              onClick={() => {
                handleOpenChange(false);
              }}
              className="w-7 h-7 rounded-full bg-gray-300  hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <IconX className="w-4 h-4 text-gray-700" />
            </button>
          </ModalHeader>
          <ModalBody className="flex flex-col items-center px-7 pt-7 pb-10 gap-9">
            {/* <PaymentHistory /> */}
            <div className="w-full flex flex-col table-divider-bottom pb-12">
              <div className="flex items-center justify-between pb-5">
                <h1 className="font-bold text-xl">Lịch sử thanh toán</h1>
                <RefundModal />
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
                  className=""
                  classNames={{
                    wrapper: "p-0 rounded-xl border-1 border-zinc-200",
                    table: "px-0 rounded-none table-fixed ",
                    th: "px-2 py-2 sm:px-4 table-header text-gray-700 shadow-none rounded-none",
                    td: "px-2 py-2 sm:px-4  table-content",
                  }}
                >
                  <TableHeader>
                    <TableColumn width="5%" align="center" className={` px-2`}>
                      #
                    </TableColumn>
                    <TableColumn width="20%" align="center" className={``}>
                      <div className="flex flex-col">
                        <p>Mã phiếu &</p>
                        <p>Ngày tạo</p>
                      </div>
                    </TableColumn>
                    <TableColumn
                      width="20%"
                      align="center"
                      className={`hidden xs:table-cell`}
                    >
                      <div className="flex flex-col">
                        <p>Chi nhánh &</p>
                        <p>Người tạo</p>
                      </div>
                    </TableColumn>
                    <TableColumn
                      width="35%"
                      align="center"
                      className={`hidden md:table-cell`}
                    >
                      <p>Nội dung</p>
                    </TableColumn>
                    <TableColumn width="25%" align="end" className={``}>
                      <p className="text-center">Số tiền</p>
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
                          <p>{item.ReceiptCode}</p>
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
                          <p
                            className={` ${
                              item.id === "" ? " !font-bold" : ""
                            } `}
                          >
                            {formatCurrency(item.Amount, true)}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

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
                  th: "px-2 sm:px-4 table-content text-gray-700 font-medium shadow-none rounded-none",
                  td: "px-2 sm:px-4 py-2 table-content",
                }}
              >
                <TableHeader>
                  <TableColumn width="5%" align="center">
                    #
                  </TableColumn>
                  <TableColumn width="35%" align="start">
                    Dịch vụ
                  </TableColumn>
                  <TableColumn
                    width="10%"
                    align="center"
                    className="hidden xs:table-cell"
                  >
                    Tiến độ
                  </TableColumn>
                  <TableColumn width="20%" align="end">
                    Tổng tiền
                  </TableColumn>
                  <TableColumn
                    width="20%"
                    align="end"
                    className="hidden md:table-cell"
                  >
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
                        <p
                          className={` ${item.id === "" ? "font-bold " : ""} `}
                        >
                          {formatCurrency(item.Payment, true)}
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p
                          className={` ${item.id === "" ? "font-bold " : ""} `}
                        >
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
              <h1 className="items-center font-bold text-xl">
                Thông tin tài khoản
              </h1>
              <div className="table-simple">
                <div className="">
                  <p className="line-clamp-2">
                    {" "}
                    Tổng tiền phải thanh toán theo điều trị
                  </p>
                  <p className="font-bold min-w-28 text-right">
                    {payment
                      ? formatCurrency(payment.TotalServicePaymentAmount, true)
                      : 0}
                  </p>
                </div>
                <div className="">
                  <p className="line-clamp-2">
                    Tổng tiền phải thanh toán theo đơn hàng
                  </p>
                  <p className="font-bold min-w-28 text-right">
                    {payment
                      ? formatCurrency(payment.TotalORPaymentAmount, true)
                      : 0}
                  </p>
                </div>
                <div className="">
                  <p className="line-clamp-1">Tổng tiền đã thu</p>
                  <p className="font-bold min-w-28 text-right">
                    {payment ? formatCurrency(payment.TotalPaid, true) : 0}
                  </p>
                </div>
                <div className="">
                  <p className="line-clamp-1">Phải thu</p>
                  <p className="text-blue-600 text-right">
                    {payment
                      ? formatCurrency(payment.TotalPaymentRequired, true)
                      : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* <PaymentPromotion /> */}
            <div className="w-full flex flex-col gap-6">
              <h1 className="items-center font-bold text-xl">Khuyến mãi</h1>
              <div className="table-simple">
                <div className="">
                  <p>Tiền Khuyến Mãi</p>
                  <p className="font-bold">
                    {formatCurrency(
                      promotion?.TotalPromotionAccount ?? 0,
                      true,
                    )}
                  </p>
                </div>
                <div className="">
                  <p>Đã sử dụng</p>
                  <p className="font-bold">
                    {formatCurrency(
                      promotion?.TotalPromotionBalance ?? 0,
                      true,
                    )}
                  </p>
                </div>
                <div className="">
                  <p>Giảm giá dịch vụ</p>
                  <p className="font-bold">
                    {formatCurrency(
                      promotion?.TotalPromotionPayment ?? 0,
                      true,
                    )}
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
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PaymentModalDemo;
