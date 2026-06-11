/* eslint-disable @typescript-eslint/no-unused-expressions */
import { IconChevronLeft } from "@/com/icons/outline";
import {
  addToast,
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  SharedSelection,
  useDisclosure,
} from "@heroui/react";
import React, { useMemo, useState } from "react";
import { ButtonCustom } from "@/com/shared/ButtonCustom";
import { IconReceiptRefund, IconX } from "@tabler/icons-react";
import { TextAreaCustom } from "@/com/shared";
import { useAppContext } from "@/context";
import rest from "../../../../lib/rest";
import { useCustomerContext } from "../../../../context/CustomerContext";
import { BANKS } from "../../../../data/bank";

export default function RefundModal({
  receipts = [],
  onSucess,
}: {
  receipts?: any[];
  onSucess?: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleOnOpenchange = (open: boolean) => {
    open ? onOpen() : onClose();
  };

  const { branches, branch } = useAppContext();
  const { customer } = useCustomerContext();

  // const [couponCode, setCoupomCode] = useState("");
  const [currentBranch, seCurrentBranch] = useState(branch?.BranchId ?? "");
  const [selectedReceipt, setSelectedReceipt] = useState<SharedSelection>(
    new Set([]),
  );
  const [refunTotal, setRefunTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [note, setNote] = useState("");
  const [bankId, setBankId] = useState<string | null>("");

  const [submiting, setSubmitting] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const payload = {
        customer_id: customer?.CustomerId ?? "",
        papers: Array.from(selectedReceipt),
        branch_id: currentBranch,
        amount: refunTotal,
        payment_method: paymentMethod === "cash" ? 1 : 2,
        note: note,
        ...(paymentMethod === "bank-transfer"
          ? {
              bank_id: bankId,
            }
          : []),
      };

      const res = await rest.post(`/refund`, payload);
      if (res?.status != 200) throw new Error("Tạo phiếu hoàn tiền thất bại");

      onSucess?.();
      addToast({
        title: "Thành công",
        description: "Tạo phiếu hoàn tiền thành công",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Thất bại",
        description:
          (error as any)?.message || "Đã có lỗi xảy ra, vui lòng thử lại",
        color: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const [searchBankValue, setSearchBankValue] = useState("");
  const filteredBanks = useMemo(() => {
    if (!searchBankValue) return BANKS;

    return BANKS.filter((bank) =>
      bank.NameVi.toLowerCase().includes(searchBankValue.toLowerCase()),
    );
  }, [searchBankValue]);

  return (
    <>
      <ButtonCustom
        onClick={() => handleOnOpenchange(true)}
        isDisabled={receipts.length === 0}
        styleType="primary"
        label="Hoàn tiền"
        startContent={<IconReceiptRefund size={20} color="white" />}
        className="bg-red-500 hover:bg-red-400 max-w-36"
      />
      <Modal
        isOpen={isOpen}
        onOpenChange={handleOnOpenchange}
        size="lg"
        hideCloseButton
        placement="top"
      >
        <ModalContent>
          <ModalHeader className="h-13 border-b-[0.5px] border-gray-400 text-base font-bold flex items-center justify-between pl-7 pr-3">
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                isIconOnly
                variant="bordered"
                radius="lg"
                onPress={() => handleOnOpenchange(false)}
              >
                <IconChevronLeft />
              </Button>
              <p className="text-base font-bold text-foreground">
                Tạo phiếu hoàn tiền
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-gray-300  hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <IconX className="w-4 h-4 text-gray-700" />
            </button>
          </ModalHeader>
          <ModalBody className="flex flex-col px-7 pt-4 pb-7 border-b border-gray-400 gap-4">
            <form
              id="creat-refun-form"
              className="flex flex-col gap-6"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col sm:flex-row  items-start justify-center gap-3">
                <Input
                  label="Mã phiếu"
                  placeholder="Được tạo tự động"
                  radius="lg"
                  labelPlacement="outside-top"
                  isReadOnly
                  // variant="bordered"
                  classNames={{
                    inputWrapper: "min-h-12",
                    label: "text-base font-bold",
                  }}
                />

                <Input
                  label="Loại phiếu"
                  labelPlacement="outside-top"
                  isReadOnly
                  placeholder="Phiếu chi"
                  radius="lg"
                  classNames={{
                    inputWrapper: "min-h-12",
                    label: "text-base font-bold",
                  }}
                />
              </div>

              <Select
                label="Giấy tờ liên quan"
                variant="bordered"
                labelPlacement="outside"
                placeholder="Chọn giấy tờ"
                selectionMode="multiple"
                radius="lg"
                listboxProps={{
                  itemClasses: {
                    title: "font-medium text-base",
                    base: " rounded-xl ",
                  },
                }}
                classNames={{
                  trigger: "min-h-13 font-medium text-base",
                  value: "font-medium text-base",
                  label: "text-base font-bold pb-2",
                }}
                selectedKeys={selectedReceipt}
                onSelectionChange={setSelectedReceipt}
              >
                {receipts?.map((item: any) => (
                  <SelectItem key={item.ReceiptId}>
                    {item.ReceiptCode}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Chi nhánh"
                variant="bordered"
                labelPlacement="outside"
                placeholder="Chọn chi nhánh"
                isRequired
                radius="lg"
                listboxProps={{
                  itemClasses: {
                    title: "font-medium text-base",
                    base: " rounded-xl ",
                  },
                }}
                classNames={{
                  trigger: "min-h-13 font-medium text-base",
                  value: "font-medium text-base",
                  label: "text-base font-bold pb-2",
                }}
                selectedKeys={currentBranch ? [currentBranch] : []}
                onChange={(val) => seCurrentBranch(val.target.value)}
                validate={(value) => {
                  if (!value) return "Chi nhánh không được để trống.";
                  return true;
                }}
              >
                {branches?.map((item: any) => (
                  <SelectItem key={item.BranchId}>{item.Name}</SelectItem>
                ))}
              </Select>

              <Input
                label="Số tiền"
                placeholder="Nhập số tiền"
                radius="lg"
                labelPlacement="outside-top"
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-right",
                  inputWrapper: "min-h-12",
                  label: "text-base font-bold",
                }}
                validate={(value) => {
                  if (!value) return "Số tiền không được để trống.";
                  if (Number(value) <= 0) return "Số tiền phải lớn hơn 0.";
                  return true;
                }}
                value={refunTotal.toString()}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setRefunTotal(value ? value : 0);
                }}
              />

              <Select
                label="Phương thức thanh toán"
                variant="bordered"
                placeholder="Chọn phương thức"
                labelPlacement="outside"
                isRequired
                radius="lg"
                itemProp="min-h-13 font-medium text-base"
                listboxProps={{
                  itemClasses: {
                    title: "font-medium text-base",
                    base: " rounded-xl ",
                  },
                }}
                classNames={{
                  trigger: "min-h-13 font-medium text-base",
                  value: "font-medium text-base",
                  label: "text-base font-bold pb-2",
                }}
                validate={(value) => {
                  if (!value)
                    return "Phải chọn phương thức thanh toán trước khi hoàn tiền.";
                  return true;
                }}
                selectedKeys={paymentMethod ? [paymentMethod] : []}
                onChange={(val) => setPaymentMethod(val.target.value)}
              >
                <SelectItem key="cash">Tiền mặt</SelectItem>
                {/* <SelectItem key="credit-card">Thẻ tín dụng</SelectItem> */}
                <SelectItem key="bank-transfer">
                  Chuyển khoản ngân hàng
                </SelectItem>
              </Select>

              {/* Select Bank */}
              {paymentMethod === "bank-transfer" && (
                <Autocomplete
                  items={filteredBanks?.map((item) => ({
                    label: item?.NameVi,
                    value: item?.BankId?.toString(),
                  }))}
                  variant="bordered"
                  radius="lg"
                  inputProps={{
                    classNames: {
                      input: "font-medium text-base",
                      inputWrapper: "h-13",
                      label: "text-base font-bold",
                    },
                  }}
                  isClearable={false}
                  label="Ngân hàng"
                  labelPlacement="outside-top"
                  placeholder="Chọn ngân hàng"
                  isRequired
                  onInputChange={setSearchBankValue}
                  // onOpenChange={(_isOpen) => setSearchBankValue("")}
                  validate={(value) => {
                    if (!value) return "Phải chọn ngân hàng hoàn tiền.";
                    return true;
                  }}
                  selectedKey={bankId ? bankId : ""}
                  onSelectionChange={(key) =>
                    setBankId(key ? key.toString() : null)
                  }
                >
                  {(item) => (
                    <AutocompleteItem key={item.value}>
                      {item.label}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}

              <TextAreaCustom
                label="Nội dung"
                placeholder="Nhập nội dung"
                maxLength={255}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </form>
          </ModalBody>

          <ModalFooter>
            <ButtonCustom
              styleType="primary"
              form={"creat-refun-form"}
              type="submit"
              label="Lưu"
              className="h-11 w-full"
              isDisabled={submiting}
            />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
