import React, { useEffect, useMemo, useState } from "react";
import { IconPaymentOutline } from "@/com/icons/outline";
import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure,
} from "@heroui/react";
import { IconX } from "@tabler/icons-react";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { useCustomerContext } from "@/context/CustomerContext";

interface BillingFormProps {
  type: "personal" | "company";
  data: any;
  getLoading?: boolean;
  onChange: (field: string, value: string) => void;
}

const BillingForm = ({
  type,
  data,
  getLoading,
  onChange,
}: BillingFormProps) => {
  const personalFields = [
    { key: "fullName", label: "Họ tên", placeholder: "Nhập họ tên" },
    { key: "address", label: "Địa chỉ", placeholder: "Nhập địa chỉ" },
    { key: "taxCode", label: "Mã số thuế", placeholder: "Nhập mã số thuế" },
    {
      key: "citizenId",
      label: "Căn cước công dân",
      placeholder: "Nhập căn cước công dân",
      optional: true,
    },
    {
      key: "email",
      label: "Email nhận hoá đơn",
      placeholder: "Nhập email nhận hoá đơn",
    },
  ];

  const companyFields = [
    {
      key: "companyName",
      label: "Tên công ty",
      placeholder: "Nhập tên công ty",
    },
    {
      key: "address",
      label: "Địa chỉ công ty",
      placeholder: "Nhập địa chỉ công ty",
    },
    {
      key: "taxCode",
      label: "Mã số thuế công ty",
      placeholder: "Nhập mã số thuế công ty",
    },
    {
      key: "citizenId",
      label: "Căn cước công dân",
      placeholder: "Nhập căn cước công dân đại diện công ty",
      optional: true,
    },
    {
      key: "email",
      label: "Email nhận hoá đơn",
      placeholder: "Nhập email đại diện công ty",
    },
  ];

  const fields = type === "personal" ? personalFields : companyFields;

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => (
        <Input
          key={field.key}
          isRequired={field.key !== "citizenId"}
          label={
            field.optional ? (
              <div>
                <span>{field.label} </span>
                <span className="font-light">(optional)</span>
              </div>
            ) : (
              field.label
            )
          }
          validate={(value) => {
            if (field.key === "email") {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                return "Vui lòng nhập địa chỉ email hợp lệ";
              }
            }
          }}
          labelPlacement="outside-top"
          variant="bordered"
          placeholder={field.placeholder}
          value={getLoading ? "Đang tải..." : data[field.key] || ""}
          onValueChange={(value) => onChange(field.key, value)}
        />
      ))}
    </div>
  );
};

interface ExportBillingInfoButtonProps {
  customerId: string;
}

const ExportBillingInfoButton = ({
  customerId,
}: ExportBillingInfoButtonProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedTab, setSelectedTab] = useState<"personal" | "company">(
    "personal",
  );

  const [getLoading, setGetLoading] = useState(false);
  const [submitedLoading, setSubmitedLoading] = useState(false);

  const [recipientDocumentId, setRecipientDocumentId] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    taxCode: "",
    citizenId: "",
    email: "",
    companyName: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (key: string | number) => {
    const newTab = key as "personal" | "company";

    if (newTab === "personal") {
      setFormData((prev) => ({
        ...prev,
        companyName: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        fullName: "",
      }));
    }

    setSelectedTab(newTab);
  };

  const isFormValid = useMemo(() => {
    if (selectedTab === "personal") {
      return (
        formData.fullName.trim() !== "" &&
        formData.address.trim() !== "" &&
        formData.taxCode.trim() !== "" &&
        formData.email.trim() !== ""
      );
    } else {
      return (
        formData.companyName.trim() !== "" &&
        formData.address.trim() !== "" &&
        formData.taxCode.trim() !== "" &&
        formData.email.trim() !== ""
      );
    }
  }, [formData, selectedTab]);
  // ----------------------------------------------------
  const { customer } = useCustomerContext();

  const customerCode = customer?.CustomerCode;

  const handleSubmit = async () => {
    try {
      setSubmitedLoading(true);

      const body = {
        fullName: formData.fullName,
        companyName: formData.companyName,
        address: formData.address,
        taxCode: formData.taxCode,
        citizenId: formData.citizenId,
        email: formData.email,
        customerId,
        customerCode,
      };

      const res = recipientDocumentId
        ? await rest.put(`/einvoice-recipient/${recipientDocumentId}`, body)
        : await rest.post("/einvoice-recipient", body);

      if (res.status !== 200)
        throw new Error("Lưu Thông tin xuất hoá đơn thất bại.");
      addToast({
        title: "Thành công",
        description: "Lưu Thông tin xuất hoá đơn thành công",
        color: "success",
      });

      onOpenChange();
    } catch (err) {
      addToast({
        title: "Thất bại",
        description: getErrorMessage(
          err,
          "Lưu Thông tin xuất hoá đơn thất bại, kiểm tra lại",
        ),
        color: "warning",
      });
    } finally {
      setSubmitedLoading(false);
    }
  };
  // ----------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    const fetchRecipient = async () => {
      try {
        setGetLoading(true);

        const res = await rest.get("/einvoice-recipient", {
          params: { customerId },
        });

        const data = res?.data?.[0];

        if (!data) return;

        if (data.customer_name)
          setFormData({
            fullName: data.customer_name || "",
            companyName: data.company_name || "",
            address: data.address || "",
            taxCode: data.tax_number || "",
            citizenId: data.citizen_id || "",
            email: data.email || "",
          });

        if (data?.company_name) {
          setSelectedTab("company");
        } else {
          setSelectedTab("personal");
        }

        setRecipientDocumentId(data?.documentId || null);
      } catch {
      } finally {
        setGetLoading(false);
      }
    };

    fetchRecipient();
  }, [isOpen, customerId]);

  return (
    <>
      <Button
        variant="bordered"
        startContent={<IconPaymentOutline size={20} />}
        className="font-medium text-base border-default-300 border"
        onPress={onOpen}
      >
        Thông tin xuất hoá đơn
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="lg"
        hideCloseButton
      >
        <ModalContent>
          {(onClose: any) => (
            <>
              <ModalHeader className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Thông tin xuất hoá đơn</h2>

                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="w-7 h-7 rounded-full bg-gray-300  hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <IconX className="w-4 h-4 text-gray-700" />
                </button>
              </ModalHeader>

              <ModalBody className="pt-5 pb-4 border-t-2 border-slate-200">
                <Tabs
                  aria-label="Payment Type"
                  radius="full"
                  classNames={{ tabList: "w-full" }}
                  selectedKey={selectedTab}
                  onSelectionChange={handleTabChange}
                >
                  <Tab
                    key="personal"
                    className="text-base font-semibold"
                    title="Hóa đơn cá nhân"
                  />

                  <Tab
                    key="company"
                    className="text-base font-semibold"
                    title="Hóa đơn công ty"
                  />
                </Tabs>

                <BillingForm
                  type={selectedTab}
                  data={formData}
                  getLoading={getLoading}
                  onChange={handleInputChange}
                />
              </ModalBody>
              <ModalFooter className="border-t-2 border-slate-200">
                <Button
                  color="primary"
                  isLoading={submitedLoading}
                  className="w-full"
                  isDisabled={!isFormValid}
                  onPress={handleSubmit}
                >
                  Lưu
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ExportBillingInfoButton;
