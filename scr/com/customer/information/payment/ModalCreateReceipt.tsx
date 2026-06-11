"use client";

import { ButtonCustom } from "@/com/shared";
import { useAppContext } from "@/context";
import { useCustomerContext } from "@/context/CustomerContext";
import { BANKS } from "@/data/bank";
import rest from "@/lib/rest";
import { ReceiptData } from "@/types/define.d";
import {
  addToast,
  Autocomplete,
  AutocompleteItem,
  AutocompleteProps,
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { IconDownload, IconMap, IconX } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { prop } from "remeda";
import * as Yup from "yup";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import dayjs from "dayjs";
import { formatCurrency, numberToWordsVi } from "@/lib/format";
import clsx from "clsx";

const formSchema = Yup.object()
  .shape({
    branch: Yup.mixed().required("Chi nhánh là bắt buộc"),
    note: Yup.string(),
    date: Yup.date().required("Ngày thu là bắt buộc"),
    checkCash: Yup.boolean(),
    cashAmount: Yup.number().when("checkCash", {
      is: true,
      then: (schema) =>
        schema
          .typeError("Số tiền phải là một số")
          .positive("Số tiền phải lớn hơn 0")
          .required("Số tiền là bắt buộc khi chọn thanh toán bằng tiền mặt"),
      otherwise: (schema) => schema.notRequired(),
    }),
    checkCard: Yup.boolean(),
    cardAmount: Yup.number().when("checkCard", {
      is: true,
      then: (schema) =>
        schema
          .typeError("Số tiền phải là một số")
          .positive("Số tiền phải lớn hơn 0")
          .required("Số tiền là bắt buộc khi chọn thanh toán bằng cà thẻ"),
      otherwise: (schema) => schema.notRequired(),
    }),
    cardBank: Yup.string().when("checkCard", {
      is: true,
      then: (schema) =>
        schema.required(
          "Ngân hàng là bắt buộc khi chọn thanh toán bằng cà thẻ",
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
    cardMcc: Yup.string().when("checkCard", {
      is: true,
      then: (schema) =>
        schema.required("Mã MCC là bắt buộc khi chọn thanh toán bằng cà thẻ"),
      otherwise: (schema) => schema.notRequired(),
    }),
    checkTransfer: Yup.boolean(),
    transferAmount: Yup.number().when("checkTransfer", {
      is: true,
      then: (schema) =>
        schema
          .typeError("Số tiền phải là một số")
          .positive("Số tiền phải lớn hơn 0")
          .required(
            "Số tiền là bắt buộc khi chọn thanh toán bằng chuyển khoản",
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
    transferBank: Yup.string().when("checkTransfer", {
      is: true,
      then: (schema) =>
        schema.required(
          "Ngân hàng là bắt buộc khi chọn thanh toán bằng chuyển khoản",
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
    totalAmount: Yup.number()
      .positive("Tổng số tiền phải lớn hơn 0")
      .required("Tổng số tiền là bắt buộc"),
  })
  .test(
    "at-least-one-payment",
    "Vui lòng chọn ít nhất một phương thức thanh toán",
    function (values) {
      const {
        checkCash,
        checkCard,
        checkTransfer,
        totalAmount,
        cashAmount,
        cardAmount,
        transferAmount,
      } = values;

      if (!checkCash && !checkCard && !checkTransfer) {
        return this.createError({
          path: "atLeastOne",
          message: "Bạn phải chọn ít nhất một phương thức thanh toán",
        });
      }

      const sumAmount =
        (checkCash ? cashAmount || 0 : 0) +
        (checkCard ? cardAmount || 0 : 0) +
        (checkTransfer ? transferAmount || 0 : 0);

      if (sumAmount < totalAmount) {
        return this.createError({
          path: "atLeastOne",
          message: `Tổng số tiền từ các phương thức thanh toán phải lớn hơn hoặc bằng tổng số tiền thu (${formatCurrency(totalAmount, true, false)})`,
        });
      }

      return true;
    },
  );

interface ModalCreateReceiptProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  createReceiptSuccess?: () => void;
  unpaidAmount?: number;
  mode?: "create" | "view";
  receipt?: ReceiptData;
}
const ModalCreateReceipt: React.FC<ModalCreateReceiptProps> = ({
  isOpen = false,
  onOpenChange,
  createReceiptSuccess,
  unpaidAmount,
  mode = "create",
  receipt,
}) => {
  const isInitCheck = useRef(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { branches, branch } = useAppContext();

  const branchOptions = useMemo(() => {
    return branches?.map((item) => ({
      label: item.Name,
      value: String(item.BranchId),
    }));
  }, [branches]);

  const {
    handleSubmit,
    control,
    reset,
    formState,
    register,
    setValue: _setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(formSchema),
    reValidateMode: "onChange",
    defaultValues: {
      checkCash: false,
      cashAmount: 0,

      checkCard: false,
      cardAmount: 0,
      cardBank: "",
      cardMcc: "",

      checkTransfer: false,
      transferAmount: 0,
      transferBank: "",

      date: new Date(),
      totalAmount: 0,

      branch: undefined,
      note: "",
    },
  });

  const checkCash = useWatch({ control, name: "checkCash" });
  const checkCard = useWatch({ control, name: "checkCard" });
  const checkTransfer = useWatch({ control, name: "checkTransfer" });

  const cashAmount = useWatch({ control, name: "cashAmount" });
  const cardAmount = useWatch({ control, name: "cardAmount" });
  const transferAmount = useWatch({ control, name: "transferAmount" });
  const totalAmount = useWatch({ control, name: "totalAmount" });

  const cardBank = useWatch({ control, name: "cardBank" });
  const transferBank = useWatch({ control, name: "transferBank" });

  const cashInputRef = useRef<HTMLInputElement>(null);
  const cardInputRef = useRef<HTMLInputElement>(null);
  const transferInputRef = useRef<HTMLInputElement>(null);

  const note = useWatch({ control, name: "note" });

  const { customer } = useCustomerContext();

  /**
   * function
   * ====================================================================
   */

  const handleCreateReceipt = async (
    data: Yup.InferType<typeof formSchema>,
  ) => {
    try {
      setSubmitLoading(true);

      const payload = {
        BranchId: parseInt((data?.branch as any)?.value, 10),
        Receipt: [
          ...(data?.checkCash
            ? [
                {
                  PaymentMethodId: 1,
                  Amount: data?.cashAmount,
                },
              ]
            : []),

          ...(data?.checkCard
            ? [
                {
                  PaymentMethodId: 3,
                  Amount: data?.cardAmount,
                  BankId: data?.cardBank,
                },
              ]
            : []),

          ...(data?.checkTransfer
            ? [
                {
                  PaymentMethodId: 2,
                  Amount: data?.transferAmount,
                  BankId: data?.transferBank,
                },
              ]
            : []),
        ],
        ReceiptDate: dayjs(data?.date).format("YYYY-MM-DD"),
        MccCode: data?.cardMcc,
        Note: data?.note,
      };

      const res = await rest.post(
        `/customer/${customer?.CustomerId}/receipt`,
        payload,
      );

      if (res?.status === 200) {
        addToast({
          title: "Thành công",
          description: "Tạo phiếu thu thành công",
          color: "success",
        });

        createReceiptSuccess?.();
      } else {
        throw new Error("Tạo phiếu thu thất bại, vui lòng thử lại");
      }
    } catch (error) {
      addToast({
        title: "Thất bại",
        description:
          (error as any)?.message || "Đã có lỗi xảy ra, vui lòng thử lại",
        color: "danger",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const confirmProcess = () => {
    setIsConfirm(true);
  };

  const handleDownloadReceiptPdf = async () => {
    const branch = getValues("branch");

    const branchInfo: any = branches?.find(
      (b) => String(b?.BranchId) === (branch as any)?.value,
    );

    const branchName = branchInfo?.Name ?? "";
    const branchAddress = [
      branchInfo?.Address,
      branchInfo?.District,
      branchInfo?.Province,
    ]
      ?.filter(Boolean)
      .join(", ");

    const date = getValues("date");
    const d = dayjs(date);
    const day = d.format("DD");
    const month = d.format("MM");
    const year = d.format("YYYY");

    const customerName = customer?.FullName ?? "";
    const customerAddress = [
      customer?.Address,
      [customer?.LabelDistrict, customer?.District].filter(Boolean).join(" "),
      [customer?.LabelProvince, customer?.Province].filter(Boolean).join(" "),
    ]
      ?.filter(Boolean)
      .join(", ");

    const note = getValues("note") ?? "";
    const cashAmount = getValues("cashAmount") ?? 0;
    const amountFormatted = formatCurrency(cashAmount, false, false);
    const amountInWords = numberToWordsVi(cashAmount);

    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;left:-9999px;top:0;z-index:-1;background:white;";

    el.innerHTML = `
      <div style="
        width:210mm;
        height:140mm;
        overflow:hidden;
        padding:10mm;
        box-sizing:border-box;
        position:relative;
        background:white;
        font-family:Georgia,'Times New Roman',Times,serif;
        font-size:13px;
        color:#000;
      ">
        <!-- Top left: branch info -->
        <div style="position:absolute;top:10mm;left:10mm;max-width:70mm;">
          <div style="font-weight:bold;font-size:14px;text-transform:uppercase;margin-bottom:4px;">
            ${branchName}
          </div>
          <div style="font-size:11px;font-style:italic;">
            ${branchAddress}
          </div>
        </div>

        <!-- Top right: form reference -->
        <div style="position:absolute;top:10mm;right:10mm;text-align:center;max-width:80mm;">
          <div style="font-size:13px;font-weight:bold;">Mẫu số 01 - TT</div>
          <div style="font-size:10px;font-style:italic;margin-top:3px;">
            (Kèm theo Thông tư số 99/2025/TT-BTC ngày 27 tháng 10 năm 2025 của Bộ trưởng Bộ Tài chính)
          </div>
        </div>

        <!-- Top right below: no -->
        <div style="position:absolute;top:33mm;right:10mm;font-size:16px;font-weight:700;text-align:left;max-width:80mm;min-width:50mm;border-bottom:1px solid #9ca3af;padding-bottom:1mm;">
          Số:
        </div>

        <!-- Title -->
        <div style="text-align:center;margin-top:18mm;">
          <div style="font-size:22px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
            Phiếu Thu
          </div>
          <div style="font-size:12px;font-style:italic;margin-top:4px;">
            Ngày <strong>${day}</strong> tháng <strong>${month}</strong> năm <strong>${year}</strong>
          </div>
        </div>

        <!-- Content -->
        <div style="margin-top:8mm;display:flex;flex-direction:column;gap:6px;">
          <div style="display:flex;border-bottom:1px dotted #9ca3af;padding-bottom:4px;">
            <span style="white-space:nowrap;">Họ và tên người nộp tiền:</span>
            <span style="padding-left:6px;font-weight:600;">${customerName}</span>
          </div>
          <div style="display:flex;border-bottom:1px dotted #9ca3af;padding-bottom:4px;">
            <span style="white-space:nowrap;">Địa chỉ:</span>
            <span style="padding-left:6px;font-weight:700;">${customerAddress}</span>
          </div>
          <div style="display:flex;border-bottom:1px dotted #9ca3af;padding-bottom:4px;">
            <span style="white-space:nowrap;">Lý do nộp:</span>
            <span style="padding-left:6px;font-weight:700;">${note}</span>
          </div>
          <div style="display:flex;border-bottom:1px dotted #9ca3af;padding-bottom:4px;">
            <span style="white-space:nowrap;">Số tiền:</span>
            <span style="padding-left:6px;font-weight:700;min-width:40mm;">${amountFormatted} VNĐ</span>
            <span style="margin-left:12px;">(Viết bằng chữ):</span>
            <span style="padding-left:6px;font-weight:700;">${amountInWords}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 2fr;border-bottom:1px dotted #9ca3af;padding-bottom:4px;">
            <div><span style="white-space:nowrap;">Kèm theo:</span></div>
            <div><span style="margin-left:12px;">Chứng từ gốc:</span></div>
          </div>
        </div>

        <!-- Signatures -->
        <div style="margin-top:10mm;display:grid;grid-template-columns:1fr 1fr;text-align:center;font-size:13px;font-weight:bold;">
          <div>
            <div>Người nộp tiền</div>
            <div style="font-size:10px;font-weight:normal;font-style:italic;margin-top:3px;">(Ký, họ tên)</div>
          </div>
          <div>
            <div>Người thu tiền</div>
            <div style="font-size:10px;font-weight:normal;font-style:italic;margin-top:3px;">(Ký, họ tên)</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(el);

    const html2pdf = (await import("html2pdf.js")).default;

    try {
      await html2pdf()
        .set({
          margin: 0,
          image: { type: "jpeg", quality: 1 },
          jsPDF: { unit: "mm", format: "a5", orientation: "landscape" },
        })
        .from(el.firstElementChild as HTMLElement)
        .save(
          `phieu-thu-${customer?.CustomerCode}-${d.format("DDMMYYYY")}.pdf`,
        );
    } finally {
      document.body.removeChild(el);
    }
  };

  /**
   * useEffect
   * ====================================================================
   */

  // init default value for checked method
  // useEffect(() => {
  //   if ((checkCard || checkCash || checkTransfer) && !isInitCheck.current) {
  //     if (checkCash) {
  //       _setValue("cashAmount", unpaidAmount || 0);
  //     } else if (checkCard) {
  //       _setValue("cardAmount", unpaidAmount || 0);
  //     } else if (checkTransfer) {
  //       _setValue("transferAmount", unpaidAmount || 0);
  //     }
  //     isInitCheck.current = true;
  //   }
  // }, [checkCash, checkCard, checkTransfer]);

  useEffect(() => {
    if (!isOpen) return;

    if (branch?.BranchId) {
      reset((defaultValue) => ({
        ...defaultValue,
        branch: {
          label: branch.Name,
          value: String(branch.BranchId),
        },
      }));
      return;
    }

    if (!customer?.CustomerId) return;

    const fetchActiveBranch = async () => {
      try {
        const response = await rest.get(
          `/customer/${customer?.CustomerId}/branch`,
        );

        reset((defaultValue) => ({
          ...defaultValue,
          branch: {
            label: prop(response, ...["data", "data", "Name"]),
            value: prop(response, ...["data", "data", "BranchId"]),
          },
        }));
      } catch {
        // DO NOTHING
      }
    };
    fetchActiveBranch();
  }, [isOpen, customer?.CustomerId, branch?.BranchId, branch?.Name, reset]);

  useEffect(() => {
    if (!isOpen) {
      reset({
        checkCash: false,
        cashAmount: 0,

        checkCard: false,
        cardAmount: 0,
        cardBank: "",
        cardMcc: "",

        checkTransfer: false,
        transferAmount: 0,
        transferBank: "",

        date: new Date(),
        totalAmount: 0,

        branch: undefined,
        note: "",
      });

      setIsConfirm(false);
      isInitCheck.current = false;
      return;
    }

    if (unpaidAmount && !isNaN(unpaidAmount)) {
      reset((defaultValue) => ({
        ...defaultValue,
        totalAmount: unpaidAmount,
      }));
    }
  }, [isOpen, unpaidAmount]);

  /**
   * render view
   * ====================================================================
   */
  const renderViewBody = () => {
    if (!receipt) return null;

    return (
      <div>
        <div className="flex flex-col gap-2 outline-gray-100 outline-1 rounded-2xl font-medium text-large mb-6">
          <div className="flex items-center justify-between p-4">
            <div>
              <p>{receipt.PaymentMethodName || "Thanh toán"}</p>
              {receipt.BranchCode && (
                <p className="text-small text-gray-700">{receipt.BranchCode}</p>
              )}
            </div>
            <span className="flex gap-1">
              <p className="text-gray-700">₫</p>
              {formatCurrency(receipt.Amount, true, false)}
            </span>
          </div>
        </div>
        {receipt.Note ? (
          <Textarea
            readOnly
            label="Ghi chú"
            value={receipt.Note}
            labelPlacement="outside-top"
            placeholder="Ghi chú"
            variant="bordered"
            radius="lg"
            classNames={{
              label: "font-bold text-base pb-3",
              input: "text-base",
              inputWrapper:
                "opacity-100 w-full min-h-12 data-[hover=true]:border-default-500 px-4 py-2",
            }}
          />
        ) : null}
      </div>
    );
  };

  const renderModalBody = () => {
    if (mode === "view") return renderViewBody();

    if (isConfirm) {
      return (
        <div>
          {checkCash && (cashAmount || 0) > 0 && (
            <div className="flex justify-end mb-3">
              <Button
                color="default"
                size="sm"
                startContent={<IconDownload size={16} />}
                variant="bordered"
                className="bg-default-100"
                onPress={handleDownloadReceiptPdf}
              >
                Tải phiếu thu tiền mặt PDF
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-2 outline-gray-100 outline-1 rounded-2xl font-medium text-large mb-6">
            {[
              {
                PaymentMethodId: 1,
                Amount: checkCash ? cashAmount : undefined,
                Label: "Tiền mặt",
              },
              {
                PaymentMethodId: 3,
                Amount: checkCard ? cardAmount : undefined,
                Label: "Cà thẻ",
                BankId: checkCard ? cardBank : undefined,
              },
              {
                PaymentMethodId: 2,
                Amount: checkTransfer ? transferAmount : undefined,
                BankId: checkTransfer ? transferBank : undefined,
                Label: "Chuyển khoản",
              },
            ].map((item, idx) => (
              <div
                key={item?.PaymentMethodId}
                className={`flex items-center justify-between  ${
                  idx !== 0 ? "border-t  border-gray-100" : ""
                }   py-2 px-4`}
              >
                <div>
                  <p>{item?.Label}</p>
                  {item?.BankId && (
                    <p className="text-small text-gray-700 ">
                      {
                        BANKS.find((b) => String(b?.BankId) === item.BankId)
                          ?.NameVi
                      }
                    </p>
                  )}
                </div>
                <span className="flex gap-1">
                  <p className="text-gray-700">₫</p>
                  {formatCurrency(item.Amount, true, false)}
                </span>
              </div>
            ))}
          </div>
          <Textarea
            readOnly
            label="Ghi chú"
            value={note}
            labelPlacement="outside-top"
            placeholder="Ghi chú"
            variant="bordered"
            radius="lg"
            classNames={{
              label: "font-bold text-base pb-3",
              input: "text-base",
              inputWrapper:
                "opacity-100 w-full min-h-12 data-[hover=true]:border-default-500 px-4 py-2",
            }}
          />
        </div>
      );
    }

    return (
      <div>
        <div className="w-full flex items-center justify-between gap-5 pb-5 mb-5 border-b border-b-gray-300">
          <div className="flex gap-5 items-center min-w-0">
            <Avatar
              radius="full"
              className="text-3xl font-bold"
              size="lg"
              isBordered
              fallback={customer?.FullName?.charAt(0)}
              name={customer?.FullName}
            />
            <div className="min-w-0">
              <h3 className="text-base font-bold mb-1 truncate">
                {customer?.FullName}
              </h3>
              {customer?.FullName && (
                <div className="flex items-center text-base gap-2 text-gray-700 font-semibold">
                  {customer?.CustomerCode}
                </div>
              )}
            </div>
          </div>

          <div className="min-w-[190px] rounded-2xl bg-primary-50 p-1 text-center">
            <p className="text-sm font-bold text-primary-900">Tiền phải thu</p>
            <div className="mt-1 rounded-xl bg-white px-3 py-2 flex items-center gap-1 justify-center">
              <span className="text-[#7C92A7] text-base font-bold">₫</span>
              <span className="text-primary text-base font-bold leading-none text-center">
                {formatCurrency(totalAmount || unpaidAmount || 0, false, false)}
              </span>
            </div>
          </div>
        </div>

        <form
          id="creat-receipt-form"
          onSubmit={handleSubmit(confirmProcess)}
          className="flex flex-col gap-6"
        >
          <div className="grid grid-cols-2 gap-6">
            <Controller
              control={control}
              name="branch"
              render={({ field, fieldState }) => (
                <Select
                  size="lg"
                  variant="bordered"
                  startContent={
                    <IconMap size={24} className="text-default-500" />
                  }
                  label="Chi nhánh"
                  labelPlacement="outside-top"
                  className="shadow-none"
                  placeholder="Chọn chi nhánh"
                  isInvalid={fieldState?.invalid}
                  errorMessage={fieldState?.error?.message}
                  selectedKeys={[(field.value as any)?.value]}
                  onSelectionChange={(value) => {
                    const branch = branchOptions.find(
                      (b) => b?.value === value?.currentKey,
                    );
                    field?.onChange(branch);
                  }}
                  classNames={{
                    label: "font-bold text-base",
                  }}
                >
                  {branchOptions.map((b) => (
                    <SelectItem key={b?.value}>{b?.label}</SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              control={control}
              name="date"
              render={({ field, fieldState: _fieldState }) => {
                return (
                  <DatePicker
                    aria-label="date-picker"
                    showMonthAndYearPickers
                    variant="bordered"
                    radius="lg"
                    size="lg"
                    maxValue={parseDate(dayjs().format("YYYY-MM-DD"))}
                    onChange={(date) => {
                      field.onChange(date?.toDate(getLocalTimeZone()));
                    }}
                    value={parseDate(dayjs(field?.value).format("YYYY-MM-DD"))}
                    classNames={{
                      base: "",
                      inputWrapper: "h-12 hover:border-default-300 ",
                      input: " text-base font-medium ml-1",
                      label: "font-bold text-base",
                    }}
                    label="Ngày phiếu thu"
                    labelPlacement="outside-top"
                  />
                );
              }}
            />
          </div>

          <div className="flex flex-col">
            <p className="font-bold text-base mb-3">Phương thức thanh toán</p>
            <div className="flex flex-col border border-default-200 rounded-3xl overflow-hidden divide-y divide-default-200">
              <div className="grid grid-cols-2 gap-6 items-start p-2 pl-4">
                <Controller
                  control={control}
                  name="checkCash"
                  render={({ field }) => (
                    <Checkbox
                      color="primary"
                      classNames={{
                        base: "h-13 my-0 shrink-0",
                        label: "font-medium text-base",
                      }}
                      isSelected={field?.value}
                      onValueChange={(isSelect) => {
                        const values = getValues();
                        const noMethodSelected =
                          !values?.checkCash &&
                          !values?.checkCard &&
                          !values?.checkTransfer;

                        if (isSelect && noMethodSelected) {
                          _setValue("cashAmount", Number(unpaidAmount) || 0);
                        } else if (!isSelect) {
                          _setValue("cashAmount", 0);
                        }

                        field.onChange(isSelect);
                        if (isSelect && cashInputRef.current) {
                          cashInputRef.current.focus();
                        }
                      }}
                    >
                      Tiền mặt
                    </Checkbox>
                  )}
                />
                <div
                  className={clsx(
                    !checkCash && "opacity-0 pointer-events-none",
                  )}
                >
                  <Controller
                    control={control}
                    name="cashAmount"
                    render={({ field, fieldState }) => (
                      <NumberInput
                        ref={cashInputRef}
                        onFocus={() => {
                          if (cashInputRef.current) {
                            cashInputRef.current.select();
                          }
                        }}
                        startContent={<p className="text-gray-700 pl-3">₫</p>}
                        classNames={{
                          input: `font-medium text-base ml-1 text-right`,
                          base: "w-full",
                          inputWrapper:
                            "opacity-100 w-full h-12 data-[hover=true]:border-default-500",
                        }}
                        isInvalid={fieldState?.invalid}
                        errorMessage={fieldState?.error?.message}
                        variant="bordered"
                        radius="lg"
                        placeholder="0"
                        value={field?.value}
                        onValueChange={field?.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 items-start p-2 pl-4">
                <Controller
                  control={control}
                  name="checkCard"
                  render={({ field }) => (
                    <Checkbox
                      color="primary"
                      classNames={{
                        base: "h-13 my-0 shrink-0",
                        label: "font-medium text-base",
                      }}
                      isSelected={field?.value}
                      onValueChange={(isSelect) => {
                        const values = getValues();
                        const noMethodSelected =
                          !values?.checkCash &&
                          !values?.checkCard &&
                          !values?.checkTransfer;

                        if (isSelect && noMethodSelected) {
                          _setValue("cardAmount", Number(unpaidAmount) || 0);
                        } else if (!isSelect) {
                          _setValue("cardAmount", 0);
                          _setValue("cardBank", "");
                          _setValue("cardMcc", "");
                        }

                        field.onChange(isSelect);
                        if (isSelect && cardInputRef.current) {
                          cardInputRef.current.focus();
                        }
                      }}
                    >
                      Cà thẻ
                    </Checkbox>
                  )}
                />

                <div
                  className={clsx(
                    !checkCard && "opacity-0 pointer-events-none",
                  )}
                >
                  <div className="flex flex-col gap-4">
                    <Controller
                      control={control}
                      name="cardAmount"
                      render={({ field, fieldState }) => (
                        <NumberInput
                          startContent={<p className="text-gray-700 pl-3">₫</p>}
                          classNames={{
                            input: `font-medium text-base ml-1 text-right`,
                            base: "w-full",
                            inputWrapper:
                              "opacity-100 w-full h-12 data-[hover=true]:border-default-500",
                          }}
                          variant="bordered"
                          radius="lg"
                          placeholder="0"
                          ref={cardInputRef}
                          onFocus={() => {
                            if (cardInputRef.current) {
                              cardInputRef.current.select();
                            }
                          }}
                          value={field?.value}
                          onValueChange={field?.onChange}
                          isInvalid={fieldState?.invalid}
                          errorMessage={fieldState?.error?.message}
                        />
                      )}
                    />

                    {checkCard && (
                      <>
                        <Controller
                          control={control}
                          name="cardBank"
                          render={({ field, fieldState }) => (
                            <BankSelector
                              isInvalid={fieldState?.invalid}
                              errorMessage={fieldState?.error?.message}
                              selectedKey={field?.value}
                              onSelectionChange={(key) => field?.onChange(key)}
                            />
                          )}
                        />

                        <Controller
                          control={control}
                          name="cardMcc"
                          render={({ field, fieldState }) => (
                            <Input
                              type="text"
                              variant="bordered"
                              radius="lg"
                              placeholder="#MCC668698#"
                              classNames={{
                                base: "w-full",
                                input: "text-right font-medium text-base",
                                inputWrapper: "h-13",
                              }}
                              startContent={
                                <p className="text-gray-600 px-0">MCC</p>
                              }
                              value={field?.value}
                              onChange={field?.onChange}
                              isInvalid={fieldState?.invalid}
                              errorMessage={fieldState?.error?.message}
                            />
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 items-start p-2 pl-4">
                <Controller
                  control={control}
                  name="checkTransfer"
                  render={({ field }) => (
                    <Checkbox
                      color="primary"
                      classNames={{
                        base: "h-13 my-0 shrink-0",
                        label: "font-medium text-base",
                      }}
                      isSelected={field?.value}
                      onValueChange={(isSelect) => {
                        const values = getValues();
                        const noMethodSelected =
                          !values?.checkCash &&
                          !values?.checkCard &&
                          !values?.checkTransfer;

                        if (isSelect && noMethodSelected) {
                          _setValue(
                            "transferAmount",
                            Number(unpaidAmount) || 0,
                          );
                        } else if (!isSelect) {
                          _setValue("transferAmount", 0);
                          _setValue("transferBank", "");
                        }

                        field.onChange(isSelect);
                        if (isSelect && transferInputRef.current) {
                          transferInputRef.current.focus();
                        }
                      }}
                    >
                      Chuyển khoản
                    </Checkbox>
                  )}
                />

                <div
                  className={clsx(
                    "flex flex-col gap-4",
                    !checkTransfer && "opacity-0 pointer-events-none",
                  )}
                >
                  <Controller
                    control={control}
                    name="transferAmount"
                    render={({ field, fieldState }) => (
                      <NumberInput
                        startContent={<p className="text-gray-700 pl-3">₫</p>}
                        classNames={{
                          input: `font-medium text-base ml-1 text-right`,
                          base: "w-full",
                          inputWrapper:
                            "opacity-100 w-full h-12 data-[hover=true]:border-default-500",
                        }}
                        variant="bordered"
                        radius="lg"
                        placeholder="0"
                        value={field?.value}
                        onValueChange={field?.onChange}
                        ref={transferInputRef}
                        onFocus={() => {
                          if (transferInputRef.current) {
                            transferInputRef.current.select();
                          }
                        }}
                        isInvalid={fieldState?.invalid}
                        errorMessage={fieldState?.error?.message}
                      />
                    )}
                  />

                  {checkTransfer && (
                    <Controller
                      control={control}
                      name="transferBank"
                      render={({ field, fieldState }) => (
                        <BankSelector
                          isInvalid={fieldState?.invalid}
                          errorMessage={fieldState?.error?.message}
                          selectedKey={field?.value}
                          onSelectionChange={(key) => field?.onChange(key)}
                        />
                      )}
                    />
                  )}
                </div>
              </div>
            </div>

            {(formState?.errors as any)?.atLeastOne &&
              (formState?.errors as any)?.atLeastOne?.message && (
                <span className="text-danger text-xs mt-2">
                  {(formState?.errors as any)?.atLeastOne?.message}
                </span>
              )}
          </div>

          <Controller
            control={control}
            name="totalAmount"
            render={({ field }) => (
              <input
                type="hidden"
                value={field?.value || 0}
                onChange={(e) => field?.onChange(Number(e.target.value))}
              />
            )}
          />

          <Textarea
            label={
              <span className="font-bold text-base flex items-center gap-2">
                Nội dung{" "}
                <span className="text-sm text-gray-600 font-normal">
                  (Không bắt buộc)
                </span>
              </span>
            }
            placeholder="Viết nội dung"
            variant="bordered"
            labelPlacement="outside-top"
            radius="lg"
            minRows={2}
            classNames={{
              label: "font-bold text-base pb-3",
              input: "text-base",
              inputWrapper:
                "opacity-100 w-full min-h-12 data-[hover=true]:border-default-500 px-4 py-2",
            }}
            {...register("note")}
          />
        </form>
      </div>
    );
  };

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      placement="top"
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between gap-4 py-2 pr-3">
          <div className="flex items-center gap-3">
            <div className="text-base font-bold">
              {mode === "view"
                ? "Chi tiết phiếu thu"
                : isConfirm
                  ? "Xác nhận phiếu thu"
                  : "Tạo phiếu thu"}
            </div>
          </div>

          <Button
            isIconOnly
            variant="light"
            radius="full"
            size="sm"
            onPress={() => onOpenChange?.(false)}
            className="rounded-full flex items-center justify-center bg-[#F1F3F6]"
          >
            <IconX size={20} className="text-default-600" />
          </Button>
        </ModalHeader>
        <Divider />
        <ModalBody className={`px-7 pt-5 pb-9`}>{renderModalBody()}</ModalBody>
        <Divider />
        <ModalFooter
          className={` px-7 py-4 min-h-11 flex flex-col @sm:flex-row w-full items-center justify-center gap-3`}
        >
          {mode === "view" ? (
            <div className="w-full">
              <Button
                size="lg"
                color="default"
                variant="bordered"
                onPress={() => onOpenChange?.(false)}
                className="w-full text-large font-bold"
              >
                Đóng
              </Button>
            </div>
          ) : !isConfirm ? (
            <div className="w-full">
              <ButtonCustom
                styleType="primary"
                isLoading={submitLoading}
                form="creat-receipt-form"
                type="submit"
                label="Tiếp tục"
                className="h-11 w-full"
              />
            </div>
          ) : (
            <div className="w-full flex gap-2">
              <Button
                size="lg"
                color="default"
                variant="bordered"
                onPress={() => setIsConfirm(false)}
                className="flex-1 text-large font-bold"
                disabled={submitLoading}
              >
                Quay lại
              </Button>
              <Button
                isLoading={submitLoading}
                size="lg"
                color="primary"
                disabled={submitLoading}
                onPress={() => handleSubmit(handleCreateReceipt)()}
                className="flex-1 text-large font-bold"
              >
                Xác nhận
              </Button>
            </div>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalCreateReceipt;

type BankSelectorProps = Partial<AutocompleteProps<any>>;

const BankSelector: React.FC<BankSelectorProps> = ({ ...props }) => {
  const [searchInputValue, setSearchInputValue] = useState("");

  const filteredBanks = useMemo(() => {
    if (!searchInputValue) return BANKS;

    return BANKS.filter((bank) =>
      bank.NameVi.toLowerCase().includes(searchInputValue.toLowerCase()),
    );
  }, [searchInputValue]);

  return (
    <Autocomplete
      {...props}
      items={filteredBanks?.map((item) => ({
        label: item?.NameVi,
        value: item?.BankId?.toString(),
      }))}
      variant="bordered"
      radius="lg"
      inputProps={{
        classNames: {
          input: "font-medium text-base text-right",
          inputWrapper: "h-13",
        },
      }}
      isClearable={false}
      placeholder="Ngân hàng"
      onInputChange={setSearchInputValue}
      onOpenChange={(_isOpen) => setSearchInputValue("")}
    >
      {(item) => (
        <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
      )}
    </Autocomplete>
  );
};
