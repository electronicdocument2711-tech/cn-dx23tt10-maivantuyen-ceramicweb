"use client";
import React, { useEffect, useState } from "react";

import {
  Button,
  Input,
  Form,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  addToast,
  Select,
  SelectItem,
} from "@heroui/react";
import { IconPlus, IconX } from "@tabler/icons-react";

import { useForm } from "react-hook-form";
import rest from "@/lib/rest";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getErrorMessage } from "@/lib/utils";
dayjs.extend(customParseFormat);

interface CreateSetupButtonProps {
  onRefresh?: () => void;
}

const CreateSetupButton = ({ onRefresh }: CreateSetupButtonProps) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [currentStep, setCurrentStep] = useState("1");
  const [loading, setLoading] = useState(false);

  const [configs, setConfigs] = useState<any[] | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState("");

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoadingConfig(true);
        const params = { state: "1" };
        const res = await rest.get("/einvoice-config", { params });

        setConfigs(res.data.data || []);
      } catch (err) {
        setConfigs([]);
        addToast({
          title: "Thất bại",
          description: getErrorMessage(err, "Lấy trạng thái hóa đơn thất bại"),
          color: "warning",
        });
      } finally {
        setLoadingConfig(false);
      }
    };

    if (isOpen && configs === null) fetchConfigs();
  }, [isOpen, configs]);

  useEffect(() => {}, [selectedConfig]);

  const stepNumbers = [
    { step: "1", name: "Chọn kết nối" },
    { step: "2", name: "Thông tin xuất hoá đơn" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
  } = useForm({ mode: "onSubmit" });

  const onSubmit = async (data: any) => {
    if (loading) return;

    try {
      setLoading(true);

      // Map form data to API structure
      const params = {
        data: {
          company_name: data.companyName,
          company_address: data.companyAddress,
          fax: data.fax,
          phone: data.phone,
          bank_number: data.bankAccount,
          bank_name: data.bankName,
          tax_number: data.taxCode,
          email_address: data.email,
          vat_template: data.vatTemplate,
          vat_serial: data.vatSerial,
          effective_date: dayjs(data.effectiveDate, "DD/MM/YYYY").format(
            "YYYY-MM-DD",
          ),
          state: true,
        },
      };

      const res = await rest.post("/clinic-invoice-config", params);

      if (res.status !== 200 && res.status !== 201)
        throw new Error("Không lưu được cấu hình");

      addToast({
        title: "Tạo thiết lập hoá đơn thành công",
        description: "Bạn đã tạo thiết lập hoá đơn.",
        color: "success",
      });

      reset();
      setCurrentStep("1");
      onClose();

      if (onRefresh) onRefresh();

      // router.refresh();
    } catch {
      addToast({
        title: "Tạo thiết lập hoá đơn thất bại",
        description: "Xin vui lòng kiểm tra lại thông tin đã cung cấp",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onPress={onOpen} color="primary" className="pr-5">
        <IconPlus size={20} className="shrink-0" />{" "}
        <span className="font-semibold">Thêm chủ thể</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="outside"
        hideCloseButton
        classNames={{
          base: "my-auto text-left overflow-y-auto",
          header: "py-2",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between items-center border-b-1 border-slate-200">
                <h2 className="text-lg font-bold">Tạo thiết lập hoá đơn</h2>
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  onPress={onClose}
                  className="bg-slate-100 w-8 h-8 min-w-0"
                >
                  <IconX size={18} />
                </Button>
              </ModalHeader>

              <Form
                onSubmit={handleSubmit(onSubmit)}
                className="flex-none gap-0 items-stretch"
              >
                <ModalBody className="p-0 pt-5 pb-9">
                  <div className="px-5 flex items-center w-full justify-center gap-2">
                    {stepNumbers.map((s) => (
                      <Button
                        key={s.step}
                        radius="full"
                        size="sm"
                        className={`px-3 py-1 min-w-8 text-base font-semibold ${currentStep === s.step ? "text-blue-500 border border-blue-200 bg-sky-50" : currentStep > s.step ? "text-white bg-blue-600" : "text-slate-500 bg-gray-300"}`}
                        onPress={() => setCurrentStep(s.step)}
                      >
                        {s.step} {currentStep === s.step ? s.name : ""}
                      </Button>
                    ))}
                  </div>

                  <div className="px-5 pt-5">
                    {currentStep === "1" && (
                      <>
                        <Select
                          aria-label="Dental Select"
                          placeholder="Xuất theo"
                          isLoading={loadingConfig}
                          onSelectionChange={(keys) => {
                            const item = Array.from(keys)[0] as string;
                            setSelectedConfig(item);
                          }}
                          variant="bordered"
                          fullWidth={false}
                          classNames={{
                            base: "mb-6",
                            trigger: "border-default-400 bg-white",
                            innerWrapper: "text-blue-800",
                            value: "font-bold",
                          }}
                        >
                          <>
                            {configs?.map((i) => (
                              <SelectItem key={i.id}>
                                {`${i.einvoice_provider?.name} | ${i.FormNo} - ${i.Serial}`}
                              </SelectItem>
                            ))}
                          </>
                        </Select>
                        {selectedConfig && (
                          <div className="flex flex-col gap-4">
                            <Input
                              label="Mẫu số (Form No.)"
                              labelPlacement="outside-top"
                              variant="bordered"
                              {...register("vatTemplate")}
                              // readOnly
                              defaultValue={
                                configs?.find((i) => i.id == selectedConfig)
                                  ?.FormNo
                              }
                              classNames={{
                                label: "font-semibold",
                                inputWrapper: "!bg-slate-100",
                              }}
                            />
                            <Input
                              label="Ký hiệu (Serial)"
                              labelPlacement="outside-top"
                              variant="bordered"
                              {...register("vatSerial")}
                              // readOnly
                              defaultValue={
                                configs?.find((i) => i.id == selectedConfig)
                                  ?.Serial
                              }
                              classNames={{
                                label: "font-semibold",
                                inputWrapper: "!bg-slate-100",
                              }}
                            />
                            <Input
                              label="Ngày hiệu lực (DD/MM/YYYY)"
                              labelPlacement="outside-top"
                              variant="bordered"
                              {...register("effectiveDate")}
                              // readOnly
                              defaultValue={dayjs(
                                configs?.find((i) => i.id == selectedConfig)
                                  ?.IssuedDate,
                              ).format("DD/MM/YYYY")}
                              classNames={{
                                label: "font-semibold",
                                inputWrapper: "!bg-slate-100",
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {currentStep === "2" && (
                      <>
                        <Input
                          label={
                            <span>
                              Chủ thể xuất hóa đơn{" "}
                              <span className="text-red-500">*</span>
                            </span>
                          }
                          labelPlacement="outside-top"
                          placeholder="Nhập chính xác như trên giấy tờ pháp lý"
                          variant="bordered"
                          {...register("companyName", {
                            required: "Vui lòng nhập tên chủ thể",
                          })}
                          isInvalid={!!errors.companyName}
                          errorMessage={errors.companyName?.message as string}
                          classNames={{ label: "font-semibold" }}
                        />

                        <Input
                          label={
                            <span>
                              Mã số thuế <span className="text-red-500">*</span>
                            </span>
                          }
                          labelPlacement="outside-top"
                          placeholder="Nhập mã số thuế"
                          {...register("taxCode", {
                            required: "Vui lòng nhập mã số thuế",
                          })}
                          isInvalid={!!errors.taxCode}
                          errorMessage={errors.taxCode?.message as string}
                          variant="bordered"
                          className="pt-6"
                          classNames={{ label: "font-bold" }}
                        />

                        <Input
                          label={
                            <span>
                              Địa chỉ <span className="text-red-500">*</span>
                            </span>
                          }
                          labelPlacement="outside-top"
                          placeholder="Nhập địa chỉ"
                          variant="bordered"
                          {...register("companyAddress", {
                            required: "Vui lòng nhập địa chỉ",
                          })}
                          isInvalid={!!errors.companyAddress}
                          errorMessage={
                            errors.companyAddress?.message as string
                          }
                          className="pt-6"
                          classNames={{ label: "font-bold" }}
                        />

                        <Input
                          label={
                            <span>
                              Email <span className="text-red-500">*</span>
                            </span>
                          }
                          labelPlacement="outside-top"
                          placeholder="Nhập email"
                          variant="bordered"
                          {...register("email", {
                            required: "Vui lòng nhập email",
                            pattern: {
                              value:
                                /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
                              message: "Email không hợp lệ",
                            },
                          })}
                          isInvalid={!!errors.email}
                          errorMessage={errors.email?.message as string}
                          className="pt-6"
                          classNames={{ label: "font-bold" }}
                        />
                        <div className="flex gap-6">
                          <Input
                            label="Số điện thoại"
                            labelPlacement="outside-top"
                            placeholder="Nhập số điện thoại"
                            variant="bordered"
                            {...register("phone", {
                              pattern: {
                                value: /^[0-9\-\s\(\)]+$/,
                                message:
                                  "Số điện thoại chỉ chứa số, dấu -, khoảng trắng và ()",
                              },
                            })}
                            isInvalid={!!errors.phone}
                            errorMessage={errors.phone?.message as string}
                            className="pt-6"
                            classNames={{
                              label: "font-bold",
                            }}
                          />
                          <Input
                            label="Số fax"
                            labelPlacement="outside-top"
                            placeholder="Nhập số fax"
                            variant="bordered"
                            className="py-6"
                            {...register("fax")}
                            classNames={{ label: "font-bold" }}
                          />
                        </div>

                        <hr className="border-slate-200" />
                        <div className="flex gap-6">
                          <Input
                            label="Số tài khoản"
                            labelPlacement="outside-top"
                            placeholder="Nhập số tài khoản"
                            variant="bordered"
                            {...register("bankAccount")}
                            isInvalid={!!errors.bankAccount}
                            errorMessage={errors.bankAccount?.message as string}
                            className="pt-6"
                            classNames={{ label: "font-bold" }}
                          />

                          <Input
                            label="Tên ngân hàng"
                            labelPlacement="outside-top"
                            placeholder="Nhập tên ngân hàng"
                            variant="bordered"
                            {...register("bankName")}
                            isInvalid={!!errors.bankName}
                            errorMessage={errors.bankName?.message as string}
                            className="pt-6"
                            classNames={{ label: "font-bold" }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </ModalBody>
              </Form>

              <ModalFooter className="justify-between border-t border-slate-200">
                {currentStep === "1" && (
                  <Button
                    color="primary"
                    isDisabled={!selectedConfig}
                    className="w-full font-semibold disabled:bg-gray-600"
                    onPress={() => {
                      setCurrentStep((prev) => (Number(prev) + 1).toString());
                    }}
                  >
                    Tiếp tục
                  </Button>
                )}

                {currentStep === "2" && (
                  <>
                    <Button
                      variant="bordered"
                      className="w-full font-semibold"
                      onPress={() => {
                        setCurrentStep((prev) => (Number(prev) - 1).toString());
                      }}
                    >
                      Quay lại
                    </Button>
                    <Button
                      color="primary"
                      className="w-full font-semibold"
                      isLoading={loading}
                      onPress={async () => {
                        const isValid = await trigger([
                          "companyName",
                          "companyAddress",
                          "phone",
                          "bankAccount",
                          "bankName",
                          "taxCode",
                          "email",
                          "effectiveDate",
                        ]);

                        if (!isValid) return;

                        handleSubmit(onSubmit)();
                      }}
                    >
                      Lưu thiết lập
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateSetupButton;
