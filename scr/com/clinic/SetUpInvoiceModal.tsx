import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  addToast,
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import {
  IconChevronLeft,
  IconEyeOff,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import rest from "@/lib/rest";
import { IconEye } from "../icons/outline";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";

interface Props {
  onSuccess?: () => void;
}

const SetUpInvoiceModal = ({ onSuccess }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectItem, setSelectItem] = useState<string | null>(null);

  const [size, setSize] = useState<"md" | "2xl">("md");

  useEffect(() => {
    setSize(currentStep === 1 ? "2xl" : "md");
  }, [currentStep]);

  const [accountRows, setAccountRows] = useState({
    id: 1,
    name: "",
    password: "",
    isVisible: false,
    guiid: "",
  });

  const [invoiceRows, setInvoiceRows] = useState({
    id: 1,
    formNo: "",
    serial: "",
    effectiveDate: "",
  });

  const { register } = useForm({ mode: "onSubmit" });

  const togglePasswordVisibility = () => {
    setAccountRows((prev) => ({
      ...prev,
      isVisible: !prev.isVisible,
    }));
  };

  const [stateSelected, setStateSelected] = useState(false);
  const [, setDomain] = useState("");
  const [, setDomainApi] = useState("");
  const [apiRetry, setApiRetry] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isFormValid = useMemo(() => {
    const isAccountValid =
      accountRows.name.trim() !== "" &&
      accountRows.password.trim() !== "" &&
      accountRows.guiid.trim() !== "";

    const isInvoiceValid =
      invoiceRows.formNo.trim() !== "" &&
      invoiceRows.serial.trim() !== "" &&
      invoiceRows.effectiveDate.trim() !== "";

    return isAccountValid && isInvoiceValid;
  }, [accountRows, invoiceRows]);

  // Hàm reset tất cả state về giá trị ban đầu
  const resetAllStates = useCallback(() => {
    setCurrentStep(0);
    setSelectItem(null);
    setAccountRows({
      id: 1,
      name: "",
      password: "",
      isVisible: false,
      guiid: "",
    });
    setInvoiceRows({
      id: 1,
      formNo: "",
      serial: "",
      effectiveDate: "",
    });
    setStateSelected(false);
    setDomain("");
    setDomainApi("");
    setApiRetry("");
    setSize("md");
  }, []);

  // Custom onClose handler
  const handleClose = useCallback(() => {
    resetAllStates();
  }, [resetAllStates]);

  useEffect(() => {
    const fetchInvoiceProvider = async () => {
      try {
        setLoading(true);

        const res = await rest.get("/einvoice-provider");

        setProviders(res?.data);
      } catch (err: any) {
        setError(err?.message || "Đã có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceProvider();
  }, []);

  const handleSubmit = async () => {
    try {
      const state = stateSelected;
      const envoiceProvider = selectedProvider?.documentId;
      const api_between_retry = Number(apiRetry);

      const account = {
        name: accountRows.name,
        password: accountRows.password,
        guiid: accountRows.guiid,
      };

      const invoice = {
        formNo: invoiceRows.formNo,
        serial: invoiceRows.serial,
        effectiveDate: invoiceRows.effectiveDate,
      };

      const res = await rest.post("/einvoice-config", {
        state,
        envoiceProvider,
        api_between_retry,
        account,
        invoice,
      });

      if (res.status === 200) {
        addToast({
          title: "Lưu cấu hình thành công",
          description: "Bạn đã lưu cấu hình tích hợp hoá đơn thành công.",
          color: "success",
        });
        onClose();
        setCurrentStep(0);
        setSelectItem(null);
        onSuccess?.();
      } else {
        throw new Error("Lưu cấu hình thất bại.");
      }
    } catch (err: any) {
      addToast({
        title: "Thất bại",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Lưu cấu hình thất bại",
        color: "danger",
      });
    }
  };

  const selectedProvider = providers.find((item) => item?.name === selectItem);

  useEffect(() => {
    if (selectedProvider) {
      setDomain(selectedProvider.domain || "");
      setDomainApi(selectedProvider.domain_api || "");
    }
  }, [selectedProvider]);

  return (
    <>
      <Button
        color="primary"
        startContent={<IconPlus size={22} />}
        onPress={() => onOpen()}
        className="font-semibold"
      >
        Thêm kết nối
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          handleClose();
          onClose();
          onSuccess?.();
        }}
        hideCloseButton
        size={size}
        placement="top"
      >
        {currentStep === 0 && (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex justify-between items-center py-2">
                  <h2 className="text-xl font-bold">
                    Đơn vị cung cấp hóa đơn điện tử
                  </h2>
                  <Button
                    isIconOnly
                    variant="light"
                    radius="full"
                    onPress={() => {
                      onClose();
                      onSuccess?.();
                    }}
                    className="bg-slate-50 w-8 h-8 min-w-0"
                  >
                    <IconX size={18} />
                  </Button>
                </ModalHeader>
                <ModalBody className="border-t border-slate-200">
                  <Select
                    label=""
                    placeholder={
                      loading
                        ? "Đang tải đơn vị cung cấp..."
                        : "Chọn đơn vị cung cấp hoá đơn"
                    }
                    selectedKeys={selectItem ? [selectItem] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      setSelectItem(selectedKey);
                    }}
                    variant="bordered"
                    isLoading={loading}
                    isDisabled={loading || !!error}
                    labelPlacement="outside-top"
                    className="mt-4 mb-9"
                  >
                    {providers?.map((item) => (
                      <SelectItem key={item?.name}>{item?.name}</SelectItem>
                    ))}
                  </Select>
                </ModalBody>
                <ModalFooter className="pt-0">
                  <Button
                    color="primary"
                    className="w-full font-semibold"
                    isDisabled={!selectItem}
                    onPress={() => {
                      setCurrentStep(1);
                    }}
                  >
                    Tiếp tục
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        )}

        {currentStep === 1 && (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex justify-between items-center py-2">
                  <div className="flex gap-3 items-center">
                    <Button
                      isIconOnly
                      variant="bordered"
                      className="border-slate-300 bg-white shadow-sm"
                      onPress={() => {
                        setCurrentStep(0);
                        setSize("md");
                      }}
                    >
                      <IconChevronLeft />
                    </Button>
                    <h2 className="text-xl font-bold">
                      Thêm kểt nối với {selectItem}
                    </h2>
                  </div>

                  <Button
                    isIconOnly
                    variant="light"
                    radius="full"
                    onPress={() => {
                      onClose();
                      setSize("md");
                      setCurrentStep(0);
                      setSelectItem(null);
                      onSuccess?.();
                    }}
                    className="bg-slate-50"
                  >
                    <IconX size={20} />
                  </Button>
                </ModalHeader>

                <ModalBody className="border-t-2 border-slate-200 flex flex-col gap-6 pt-4 pb-13">
                  <div
                    className={`w-full rounded-xl p-4 ${stateSelected ? "bg-blue-50" : "bg-slate-100"}  flex gap-2`}
                  >
                    <Switch
                      color="success"
                      isSelected={stateSelected}
                      onValueChange={setStateSelected}
                    />

                    <p
                      className={`${stateSelected ? "text-blue-500" : ""} font-bold`}
                    >
                      {stateSelected ? "Đã kết nối" : "Ngắt kết nối"}
                    </p>
                  </div>

                  <div className="w-full flex flex-col gap-4">
                    <h1 className="text-lg font-bold">
                      Tài khoản kết nối hóa đơn điện tử
                    </h1>

                    <div className="w-full rounded-2xl overflow-hidden border border-slate-300">
                      <Table
                        aria-label="Policy table"
                        shadow="none"
                        radius="none"
                        className="min-w-full"
                        classNames={{
                          wrapper: "p-0 rounded-none",
                          table: "p-0",
                        }}
                      >
                        <TableHeader>
                          <TableColumn
                            key="channel"
                            className="w-5/14 text-base text-slate-500"
                          >
                            Username
                          </TableColumn>
                          <TableColumn
                            key="policy"
                            className="text-base text-slate-500 w-2/7"
                          >
                            Mật khẩu
                          </TableColumn>

                          <TableColumn
                            key="room"
                            className="w-5/14 text-base text-slate-500"
                          >
                            GUIID
                          </TableColumn>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="test-base font-semibold">
                              <Input
                                variant="bordered"
                                placeholder="Nhập username"
                                value={accountRows.name}
                                onValueChange={(value) => {
                                  setAccountRows((prev) => ({
                                    ...prev,
                                    name: value,
                                  }));
                                }}
                              />
                            </TableCell>

                            <TableCell className="test-base font-semibold">
                              <Input
                                variant="bordered"
                                placeholder="Nhập mật khẩu"
                                type={
                                  accountRows.isVisible ? "text" : "password"
                                }
                                value={accountRows.password}
                                onValueChange={(value) => {
                                  setAccountRows((prev) => ({
                                    ...prev,
                                    password: value,
                                  }));
                                }}
                                endContent={
                                  <div
                                    onClick={() => togglePasswordVisibility()}
                                    className="border-none p-0 hover:cursor-pointer"
                                  >
                                    {accountRows.isVisible ? (
                                      <IconEyeOff size={20} color="gray" />
                                    ) : (
                                      <IconEye size={20} color="gray" />
                                    )}
                                  </div>
                                }
                              />
                            </TableCell>

                            <TableCell className="test-base font-semibold">
                              <Input
                                variant="bordered"
                                placeholder="Nhập GUIID"
                                value={accountRows.guiid}
                                onValueChange={(value) => {
                                  setAccountRows((prev) => ({
                                    ...prev,
                                    guiid: value,
                                  }));
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-4">
                    <h1 className="text-lg font-bold">
                      Thông tin xuất hóa đơn
                    </h1>

                    <div className="w-full rounded-2xl overflow-hidden border border-slate-300">
                      <Table
                        aria-label="Policy table"
                        shadow="none"
                        radius="none"
                        className="min-w-full"
                        classNames={{
                          wrapper: "p-0 rounded-none",
                          table: "p-0",
                        }}
                      >
                        <TableHeader>
                          <TableColumn
                            key="channel"
                            className="w-5/14 text-base text-slate-500"
                          >
                            Mẫu số (Form No)
                          </TableColumn>
                          <TableColumn
                            key="policy"
                            className="text-base text-slate-500 w-2/7"
                          >
                            Ký hiệu (Serial)
                          </TableColumn>

                          <TableColumn
                            key="room"
                            className="w-5/14 text-base text-slate-500"
                          >
                            Ngày hiệu lực
                          </TableColumn>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="test-base font-semibold">
                              <Input
                                variant="bordered"
                                placeholder="(Từ cơ quan thuế)"
                                value={invoiceRows.formNo}
                                onValueChange={(value) => {
                                  setInvoiceRows((prev) => ({
                                    ...prev,
                                    formNo: value,
                                  }));
                                }}
                              />
                            </TableCell>

                            <TableCell className="test-base font-semibold">
                              <Input
                                {...register("vatSerial", {
                                  required:
                                    "Vui lòng nhập Ký hiệu (từ cơ quan thuế)",
                                })}
                                value={invoiceRows.serial}
                                onValueChange={(value) => {
                                  setInvoiceRows((prev) => ({
                                    ...prev,
                                    serial: value,
                                  }));
                                }}
                                labelPlacement="outside-top"
                                placeholder="(Từ cơ quan thuế)"
                                variant="bordered"
                                classNames={{
                                  label: "font-bold",
                                }}
                              />
                            </TableCell>

                            <TableCell className="test-base font-semibold">
                              <DatePicker
                                showMonthAndYearPickers
                                onChange={(date) => {
                                  if (date) {
                                    const formattedDate = dayjs(
                                      new Date(
                                        date.year,
                                        date.month - 1,
                                        date.day,
                                      ),
                                    ).format("YYYY-MM-DD");

                                    setInvoiceRows((prev) => ({
                                      ...prev,
                                      effectiveDate: formattedDate,
                                    }));
                                  } else {
                                    setInvoiceRows((prev) => ({
                                      ...prev,
                                      effectiveDate: "",
                                    }));
                                  }
                                }}
                                variant="bordered"
                                classNames={{
                                  base: "",
                                  inputWrapper:
                                    "h-12 hover:border-default-500 ",
                                  input: " text-base font-medium ml-1",
                                  segment:
                                    "font-semilight text-slate-400 data-[editable=true]:data-[placeholder=true]:text-slate-400",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter className="pt-0">
                  <Button
                    className="w-full  font-bold text-base"
                    color="primary"
                    isDisabled={!isFormValid}
                    onPress={() => handleSubmit()}
                  >
                    Lưu
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        )}
      </Modal>
    </>
  );
};

export default SetUpInvoiceModal;
