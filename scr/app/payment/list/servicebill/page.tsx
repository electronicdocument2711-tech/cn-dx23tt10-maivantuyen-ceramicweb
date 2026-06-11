"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  addToast,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Switch,
  Tab,
  Tabs,
} from "@heroui/react";
import InvoicePreviewModal, {
  type InvoicePreviewData,
} from "@/com/shared/InvoicePreviewModal";
import { useRouter, useSearchParams } from "next/navigation";
import { IconChevronLeft } from "@tabler/icons-react";
import { SelectInvoiceProvider } from "@/com/payment/SelectInvoiceProvider";
import { useDebounce } from "@/hook/useDebounce";
import { SelectInvoiceRecipient } from "@/com/payment/SelectInvoiceRecipient";
import * as yup from "yup";
import { EinvoiceServiceList } from "@/com/payment/EinvoiceServiceList";
import rest from "@/lib/rest";
import { numberToVietnameseCurrency } from "@/lib/payment_server";
import { useAppContext } from "@/context";
import { getErrorMessage } from "@/lib/utils";

function OtpTaxInput({
  length = 12,
  value,
  onChange,
  isCompanyTax = false,
  isRequired = false,
  isInvalid: isInvalidProp,
  errorMessage: errorMessageProp,
  name,
  errors,
  setErrors,
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  isCompanyTax?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  name?: string;
  errors?: Record<string, string>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const isInvalid = isInvalidProp ?? (name && errors ? !!errors[name] : false);
  const errorMessage =
    errorMessageProp ?? (name && errors ? errors[name] : undefined);
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (val: string, i: number) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    onChange?.(newOtp.join(""));
    if (val && i < length - 1) refs.current[i + 1]?.focus();
    if (name && errors?.[name] && setErrors) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleKeyDown = (e: any, i: any) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };
  useEffect(() => {
    if (!value || value.length === 0 || typeof value !== "string") return;
    const chars = value.split("");
    const newOtp = Array(length).fill("");
    chars.forEach((char, index) => {
      if (index < length) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);
  }, [value, length]);

  return (
    <div className="flex flex-col gap-2">
      <p
        className={`font-bold text-base text-foreground ${isInvalid ? "text-red-500" : ""}`}
      >
        Mã số thuế{isCompanyTax ? " công ty" : ""}
        {isRequired && <span className="text-danger ml-0.5">*</span>}
      </p>

      <div className="flex items-center">
        {otp.map((val, i) => (
          <div key={i} className="flex items-center">
            <input
              ref={(el: any) => (refs.current[i] = el)}
              value={val}
              maxLength={1}
              onFocus={(e) => e.target.select()}
              className={`w-11 h-12 focus:z-10 relative text-center border-1 focus:outline-2
                ${
                  isInvalid
                    ? "border-danger focus:outline-danger bg-danger-50"
                    : "border-default-400 focus:outline-default-500 hover:border-default-500"
                }
                ${i === 0 || i === 9 ? "rounded-l-2xl" : i === 8 || i === 11 ? "rounded-r-2xl" : ""}
              `}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
            {i === 8 && (
              <span className="text-xl text-default-400 font-bold px-3">-</span>
            )}
          </div>
        ))}
      </div>
      {isInvalid && errorMessage && (
        <span className="text-tiny text-danger">{errorMessage}</span>
      )}
    </div>
  );
}

const formatIssuedDate = () => {
  const currentDate = new Date();

  return `${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}`;
};

const ServiceBillPage = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";
  const customer = searchParams.get("customer") || "";
  const appContext = useAppContext();
  const router = useRouter();
  const [billType, setBillType] = useState<"personal" | "company">("personal");
  const [invoiceProvider, setInvoiceProvider] = useState<any>();
  const [customerCode, setCustomerCode] = useState<string>(code);
  const debouncedId = useDebounce(customerCode, 300);

  const [recipientData, setRecipientData] = useState<any>(null);
  const [invoiceDraft, setInvoiceDraft] = useState<any>({
    hasInsurance: false,
    tax_number: "",
    citizen_id: "",
    address: "",
    bank_number: "",
    bank_name: "",
    phone: "",
    email: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<InvoicePreviewData>({
    seller: { fields: [] },
    buyer: { fields: [] },
    items: [],
  });

  const validationSchema = yup.object().shape({
    invoiceProvider: yup
      .mixed()
      .required("Vui lòng chọn đơn vị cung cấp hoá đơn"),
    customerCode: yup.string().trim().required("Vui lòng nhập mã khách hàng"),
    hasInsurance: yup.boolean().default(false),
    recipientData: yup.mixed().required("Vui lòng chọn khách hàng"),
    tax_number: yup
      .string()
      .trim()
      .required("Vui lòng nhập mã số thuế")
      .length(12, "Vui lòng nhập đủ 12 số định danh / mã số thuế"),
    citizen_id: yup
      .string()
      .transform((value) => (value === "" ? null : value))
      .nullable()
      .min(12, "Số căn cước công dân phải bao gồm 12 ký tự")
      .max(12, "Số căn cước công dân phải bao gồm 12 ký tự"),
    phone: yup
      .string()
      .trim()
      .transform((value) => (value === "" ? null : value))
      .nullable()
      .matches(/^(?:0|\+84)(?:\d){2}[-. ]?(?:\d){3}[-. ]?(?:\d){4}$/, {
        message: "Số điện thoại không hợp lệ, phải dạng 0/+84 xx xxx xxxx",
      }),

    email: yup
      .string()
      .trim()
      .email("Email không hợp lệ")
      .required("Vui lòng nhập email"),
    company_name:
      billType === "company"
        ? yup.string().trim().required("Vui lòng nhập tên công ty")
        : yup.string().trim(),
    selectedRows: yup
      .array()
      .of(yup.object().required())
      .min(1, "Vui lòng chọn ít nhất một dịch vụ cần xuất hoá đơn"),
  });

  const buildPreviewData = (): InvoicePreviewData => {
    const totalAmount = selectedServices.reduce((acc, item) => {
      return Number(acc || 0) + Number(item.AmountAfterTax || 0);
    }, 0);

    return {
      createdBy: invoiceProvider?.company_name || "-",
      createdAt: new Intl.DateTimeFormat("vi-VN").format(new Date()),
      status: selectedServices.length > 0 ? "Xem trước" : "Chưa chọn dịch vụ",
      invoiceTitle: "HÓA ĐƠN GIÁ TRỊ GIA TĂNG",
      symbol: invoiceProvider?.vat_serial || "-",
      number: recipientData?.customer_code || customerCode || "-",
      issuedDate: formatIssuedDate(),
      seller: {
        fields: [
          {
            label: "Đơn vị bán hàng",
            value: invoiceProvider?.company_name || "-",
          },
          { label: "Mã số thuế", value: invoiceProvider?.tax_number || "-" },
          { label: "Địa chỉ", value: invoiceProvider?.company_address || "-" },
          { label: "Điện thoại", value: invoiceProvider?.phone || "-" },
        ],
      },
      buyer: {
        fields: [
          {
            label: "Họ tên người mua hàng",
            value:
              recipientData?.customer_name ||
              invoiceDraft?.customer_name ||
              "-",
          },
          {
            label: "Tên đơn vị",
            value:
              billType === "company"
                ? invoiceDraft?.company_name || "-"
                : "Khách lẻ",
          },
          { label: "Mã số thuế", value: invoiceDraft?.tax_number || "-" },
          {
            label: "Căn cước công dân",
            value: invoiceDraft?.citizen_id || "-",
          },
          { label: "Địa chỉ", value: invoiceDraft?.address || "-" },
          { label: "Hình thức thanh toán", value: "TM/CK" },
          {
            label: "Số tài khoản",
            value:
              invoiceDraft?.bank_number || invoiceDraft?.bank_name
                ? `${invoiceDraft?.bank_number || "-"}${invoiceDraft?.bank_name ? ` - ${invoiceDraft.bank_name}` : ""}`
                : "-",
          },
          { label: "Điện thoại", value: invoiceDraft?.phone || "-" },
          { label: "Email", value: invoiceDraft?.email || "-" },
        ],
      },
      items: selectedServices.map((item) => {
        return {
          name: item.ServiceTaxName || "-",
          unit: item.Unit || "-",
          quantity: Number(item.Quantity || 0),
          unitPrice: Number(item.ServicePrice || 0),
          amountBeforeTax: Number(item.AmountBeforeTax || 0),
          taxRate: Number(item?.IsTax) >= 1 ? item?.TaxPercent : "KCT",
          taxAmount: Number(item.TaxAmount || 0),
          totalAmount: Number(item.AmountAfterTax || 0),
        };
      }),
      totalInWords: totalAmount ? numberToVietnameseCurrency(totalAmount) : "-",
    };
  };

  const handlePreviewInvoice = () => {
    setPreviewData(buildPreviewData());
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setErrors({});
      setLoading(true);
      await validationSchema.validate(
        {
          invoiceProvider: invoiceProvider,
          customerCode: customerCode || "",
          recipientData: recipientData,
          tax_number: invoiceDraft?.tax_number || "",
          email: invoiceDraft?.email || "",
          company_name: invoiceDraft?.company_name || "",
          selectedRows: selectedServices,
          citizen_id: invoiceDraft?.citizen_id || "",
          phone: invoiceDraft?.phone || "",
        },
        { abortEarly: false },
      );

      const branchId = appContext?.branch?.BranchId;

      if (!branchId) {
        throw new Error("Vui lòng chọn chi nhánh xuất hóa đơn");
      }

      const totalAmount = selectedServices.reduce((acc, item) => {
        return parseInt(acc || 0) + parseInt(item.AmountBeforeTax || 0);
      }, 0);

      const totalAmountAfterTax = selectedServices.reduce((acc, item) => {
        return parseInt(acc || 0) + parseInt(item.AmountAfterTax || 0);
      }, 0);

      const totalTaxAmount = selectedServices.reduce((acc, item) => {
        return parseInt(acc || 0) + parseInt(item.TaxAmount || 0);
      }, 0);

      const res = await rest.post("/einvoice", {
        invoiceType: billType,
        issuer: invoiceProvider.documentId,
        issuer_name: invoiceProvider.company_name,
        issuer_address: invoiceProvider.company_address,
        issuer_tax_number: invoiceProvider.tax_number,
        customer_id: recipientData.customer_id,
        customer_name: recipientData.customer_name,
        payment_method: "TM/CK",
        total_amount: totalAmount,
        total_amount_after_tax: totalAmountAfterTax,
        total_tax_amount: totalTaxAmount,
        customer_code: recipientData.customer_code,
        issuer_symbol: invoiceProvider.vat_serial,
        invoice_form: invoiceProvider.vat_template,
        invoice_serial: invoiceProvider.vat_serial,
        is_insurance: invoiceDraft.hasInsurance,
        customer_company_name: invoiceDraft.company_name,
        customer_tax_number: invoiceDraft?.tax_number,
        customer_citizen_id: invoiceDraft.citizen_id,
        customer_address: invoiceDraft.address,
        customer_bank_number: invoiceDraft.bank_number,
        customer_bank_name: invoiceDraft.bank_name,
        customer_phone_number: invoiceDraft.phone,
        customer_email: invoiceDraft.email,
        business: appContext.business?.documentId,
        services: selectedServices,
        branch_id: appContext?.branch?.BranchId,
      });

      if (!(res.status === 200 || res.status === 201))
        throw new Error("Đã có lỗi xảy ra");

      if (customer) {
        router.push(`/customer/${customer}/payment`);
      } else {
        router.push(`/payment/list`);
      }

      addToast({
        title: "Thành công",
        description: "Tạo yêu cầu xuất hoá đơn thành công",
        color: "success",
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            newErrors[error.path] = error.message;
          }
        });
        setErrors(newErrors);
        return;
      }
      addToast({
        title: "Thất bại",
        description: getErrorMessage(err, "Đã có lỗi xảy ra"),
        color: "warning",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-7">
      <div className="flex gap-4">
        <Button
          isIconOnly
          variant="bordered"
          className="border-slate-300 bg-white shadow-sm"
          onPress={() => router.back()}
        >
          <IconChevronLeft />
        </Button>

        <h1>Tạo hoá đơn dịch vụ</h1>
      </div>

      <Card shadow="none" className="flex flex-col gap-4 mx-auto mt-4 w-full">
        <Form
          validationBehavior="aria"
          validationErrors={errors}
          className="w-4/5 mx-auto py-12 gap-6"
          onSubmit={handleSubmit}
        >
          <div className="flex w-full flex-col">
            <Tabs
              selectedKey={billType}
              onSelectionChange={(key) =>
                setBillType(key === "personal" ? "personal" : "company")
              }
              variant="underlined"
              classNames={{
                base: "flex-1 w-full  ",
                tabList: "py-1 border-b border-divider w-full",
                tab: "w-48 pt-4 pb-8",
                tabContent:
                  "text-base font-bold text-[#7A8593] group-data-[selected=true]:text-default-800",
                cursor: "h-2 rounded-t-full bg-primary-500 p-0",
              }}
            >
              <Tab key="personal" title="Hoá đơn cá nhân" />
              <Tab key="company" title="Hoá đơn công ty" />
            </Tabs>
          </div>

          <div className="w-full border-b border-slate-200 pb-22">
            <div className="w-3/5 mx-auto flex flex-col gap-6">
              <SelectInvoiceProvider
                value={invoiceProvider}
                onChange={(val: any) => {
                  setInvoiceProvider(val);
                  if (errors.invoiceProvider) {
                    setErrors((prev) => ({ ...prev, invoiceProvider: "" }));
                  }
                }}
                errorMessage={errors.invoiceProvider}
              />
              <Divider />

              <div className="flex gap-5 items-start justify-between">
                <Input
                  isRequired
                  name="customerCode"
                  className="w-3/5"
                  variant="bordered"
                  label="Mã khách hàng"
                  placeholder="Nhập mã khách hàng"
                  labelPlacement="outside-top"
                  classNames={{
                    label: "font-bold !text-base",
                    inputWrapper: "border-default-400",
                    input: "text-base !font-normal",
                  }}
                  value={customerCode ?? ""}
                  onChange={(e) => {
                    setCustomerCode(e.target.value);
                    if (errors.customerCode) {
                      setErrors((prev) => ({ ...prev, customerCode: "" }));
                    }
                  }}
                />

                <div className="w-2/5 flex flex-col gap-2">
                  <span className="text-base font-bold">Bảo hiểm</span>
                  <div className="border border-slate-300 rounded-xl">
                    <Switch
                      color="success"
                      className="text-xs font-medium px-3 py-1 text-nowrap"
                      classNames={{}}
                      value={invoiceDraft?.hasInsurance ?? false}
                      onChange={(e) =>
                        setInvoiceDraft((prev: any) => ({
                          ...prev,
                          hasInsurance: e.target.checked,
                        }))
                      }
                    >
                      Có bảo hiểm
                    </Switch>
                  </div>
                </div>
              </div>

              <SelectInvoiceRecipient
                query={debouncedId ?? ""}
                value={recipientData}
                onChange={(value) => {
                  setRecipientData(value);
                  setInvoiceDraft((prev: any) => ({
                    ...prev,
                    ...value,
                    phone: value?.phone_number,
                  }));
                  if (errors.recipientData) {
                    setErrors((prev) => ({ ...prev, recipientData: "" }));
                  }
                }}
                errorMessage={errors.recipientData}
              />

              {billType === "personal" ? (
                <>
                  <OtpTaxInput
                    isRequired
                    name="tax_number"
                    errors={errors}
                    setErrors={setErrors}
                    value={invoiceDraft?.tax_number ?? ""}
                    onChange={(value) => {
                      setInvoiceDraft((prev: any) => ({
                        ...prev,
                        tax_number: value,
                      }));
                    }}
                  />

                  <Input
                    label={
                      <div className="flex gap-2">
                        <p className="">Căn cước công dân</p>
                        <p className="font-medium">(optical)</p>
                      </div>
                    }
                    labelPlacement="outside-top"
                    placeholder="Nhập số căn cước công dân"
                    variant="bordered"
                    classNames={{
                      label: "font-bold text-base",
                      inputWrapper: "border-default-400",
                      input: "text-base !font-normal",
                    }}
                    value={invoiceDraft?.citizen_id ?? ""}
                    onChange={(e) => {
                      setInvoiceDraft((prev: any) => ({
                        ...prev,
                        citizen_id: e.target.value,
                      }));
                      if (errors.citizen_id) {
                        setErrors((prev) => ({ ...prev, citizen_id: "" }));
                      }
                    }}
                    isInvalid={!!errors.citizen_id}
                    errorMessage={errors.citizen_id ?? ""}
                  />
                </>
              ) : (
                <>
                  <Input
                    label={
                      <div className="flex gap-2">
                        <p>Căn cước công dân</p>
                        <p className="font-medium">(optical)</p>
                      </div>
                    }
                    labelPlacement="outside-top"
                    placeholder="Nhập số căn cước công dân"
                    variant="bordered"
                    classNames={{
                      label: "font-bold text-base",
                      input: "text-base !font-normal",
                      inputWrapper: "border-default-400",
                    }}
                    value={invoiceDraft?.citizen_id ?? ""}
                    onChange={(e) => {
                      setInvoiceDraft((prev: any) => ({
                        ...prev,
                        citizen_id: e.target.value,
                      }));
                      if (errors.citizen_id) {
                        setErrors((prev) => ({ ...prev, citizen_id: "" }));
                      }
                    }}
                    isInvalid={!!errors.citizen_id}
                    errorMessage={errors.citizen_id ?? ""}
                  />
                  <Input
                    isRequired={billType === "company"}
                    label="Tên công ty"
                    name="company_name"
                    labelPlacement="outside-top"
                    placeholder="Nhập tên công ty"
                    variant="bordered"
                    classNames={{
                      label: "font-bold text-base",
                      input: "text-base !font-normal",
                      inputWrapper: "border-default-400",
                    }}
                    value={invoiceDraft?.company_name ?? ""}
                    onChange={(e) => {
                      setInvoiceDraft((prev: any) => ({
                        ...prev,
                        company_name: e.target.value,
                      }));
                      if (errors.company_name) {
                        setErrors((prev) => ({ ...prev, company_name: "" }));
                      }
                    }}
                  />

                  <OtpTaxInput
                    isRequired
                    name="tax_number"
                    errors={errors}
                    setErrors={setErrors}
                    isCompanyTax
                    value={invoiceDraft?.tax_number ?? ""}
                    onChange={(value) => {
                      setInvoiceDraft((prev: any) => ({
                        ...prev,
                        tax_number: value,
                      }));
                    }}
                  />
                </>
              )}
              <Input
                label={`Địa chỉ ${billType === "company" ? "công ty" : ""}`}
                labelPlacement="outside-top"
                variant="bordered"
                placeholder={`Nhập địa chỉ ${billType === "company" ? "công ty" : ""}`}
                classNames={{
                  label: "font-bold text-base",
                  input: "text-base !font-normal",
                  inputWrapper: "border-default-400",
                }}
                value={invoiceDraft?.address ?? ""}
                onChange={(e) =>
                  setInvoiceDraft((prev: any) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
              />

              <Input
                name="paymentMethod"
                label="Hình thức thanh toán"
                labelPlacement="outside-top"
                classNames={{
                  label: "font-bold text-base",
                  input: "text-base !font-normal",
                  inputWrapper: "border-default-400",
                }}
                value={"TM/CK"}
              />

              <Input
                name="bankAccount"
                label="Số tài khoản"
                labelPlacement="outside-top"
                placeholder="Nhập số tài khoản"
                variant="bordered"
                classNames={{
                  label: "font-bold text-base",
                  input: "text-base !font-normal",
                  inputWrapper: "border-default-400",
                }}
                value={invoiceDraft?.bank_number ?? ""}
                onChange={(e) =>
                  setInvoiceDraft((prev: any) => ({
                    ...prev,
                    bank_number: e.target.value,
                  }))
                }
              />

              <Input
                name="bankName"
                label="Ngân hàng"
                labelPlacement="outside-top"
                placeholder="Nhập tên ngân hàng"
                variant="bordered"
                classNames={{
                  label: "font-bold text-base",
                  input: "text-base !font-normal",
                  inputWrapper: "border-default-400",
                }}
                value={invoiceDraft?.bank_name ?? ""}
                onChange={(e) =>
                  setInvoiceDraft((prev: any) => ({
                    ...prev,
                    bank_name: e.target.value,
                  }))
                }
              />

              <Input
                name="phone"
                label="Số điện thoại"
                labelPlacement="outside-top"
                placeholder="Nhập số điện thoại"
                variant="bordered"
                classNames={{
                  label: "font-bold text-base",
                  input: "text-base !font-normal",
                  inputWrapper: "border-default-400",
                }}
                value={invoiceDraft?.phone ?? ""}
                onChange={(e) => {
                  setInvoiceDraft((prev: any) => ({
                    ...prev,
                    phone: e.target.value,
                  }));
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                isInvalid={!!errors.phone}
                errorMessage={errors.phone ?? ""}
              />

              <Input
                isRequired
                type="email"
                name="email"
                label="Email nhận hoá đơn"
                labelPlacement="outside-top"
                placeholder="Nhập email nhận hoá đơn"
                variant="bordered"
                classNames={{
                  label: "font-bold text-base",
                  input: "text-base !font-normal",
                  inputWrapper: "border-default-400",
                }}
                value={invoiceDraft?.email ?? ""}
                onChange={(e) => {
                  setInvoiceDraft((prev: any) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
              />
            </div>
          </div>

          <EinvoiceServiceList
            customerId={invoiceDraft?.customer_id ?? ""}
            selectedSercvices={selectedServices}
            setSelecterServices={(value) => {
              setSelectedServices(value);
              if (errors.selectedRows)
                setErrors((prev) => ({ ...prev, selectedRows: "" }));
            }}
            errorMesage={errors.selectedRows}
          />

          <div className="w-full flex justify-end gap-2">
            <Button
              type="button"
              variant="bordered"
              className="font-semibold text-base px-4"
              onPress={handlePreviewInvoice}
            >
              Xem trước hoá đơn
            </Button>

            <Button
              color="primary"
              className="font-semibold text-base px-12"
              type="submit"
              isLoading={loading}
            >
              Lưu
            </Button>
          </div>
        </Form>
      </Card>

      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        data={previewData}
        showMetaHeader={false}
      />
    </section>
  );
};

export default ServiceBillPage;
