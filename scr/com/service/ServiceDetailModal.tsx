import { formatCurrency } from "@/lib/format";
import type { ServiceDetailV2 } from "@/types/service";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { IconX } from "@tabler/icons-react";
import { useMemo } from "react";

type ServiceDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedServiceDetail: ServiceDetailV2 | null;
};

const STEP_TABLE_HEADERS = [
  "#",
  "Tên bước điều trị",
  "Phần trăm điều trị",
  "Số ngày dến bước tiếp theo",
  // "Doanh thu NKK",
  // "Doanh thu PK",
  // "Thu nhập BSTV",
  // "Thu nhập BSDT",
  // "Thu nhập BSHTCM",
  // "Thu nhập DD",
  // "Phải xác nhận",
];

const toPercentText = (value?: number) => `${value ?? 0}%`;

export const ServiceDetailModal = ({
  isOpen,
  onClose,
  selectedServiceDetail,
}: ServiceDetailModalProps) => {
  const treatmentSteps = selectedServiceDetail?.MedicalProcedure ?? [];

  const modalTitle = selectedServiceDetail?.Name || "-";
  const serviceCode = selectedServiceDetail?.ServiceCode || "-";
  const servicePrice = formatCurrency(
    Number(selectedServiceDetail?.Service_SalePrice ?? 0),
  );

  const serviceTax = useMemo<string>(() => {
    if (
      selectedServiceDetail?.Service_Tax === undefined ||
      selectedServiceDetail?.Service_Tax === null
    ) {
      return "-";
    }

    if (
      isFinite(Number(selectedServiceDetail.Service_Tax)) &&
      Number(selectedServiceDetail?.Service_Tax) > 0
    ) {
      return `${selectedServiceDetail?.Service_Tax}%`;
    }

    if (Number(selectedServiceDetail?.IsTax) === 1) {
      return `${selectedServiceDetail?.Service_Tax}%`;
    }

    return "KCT";
  }, [selectedServiceDetail]);

  const serviceCategory = selectedServiceDetail?.ServiceGroup_NameVi || "-";
  const serviceDescription = selectedServiceDetail?.Description || "";
  const serviceStatusText =
    selectedServiceDetail?.State === "1" ? "Đang sử dụng" : "Ngừng sử dụng";
  const isActiveStatus = selectedServiceDetail?.State === "1";
  const serviceType =
    selectedServiceDetail?.ServiceType === "1" ? "Tổng Quát" : "Chỉnh Nha";

  const summaryItems = [
    { label: "Mã dịch vụ", value: serviceCode },
    { label: "Giá bán", value: servicePrice },
    { label: "Thuế", value: serviceTax },
    { label: "Nhóm dịch vụ", value: serviceCategory },
    { label: "Loại", value: serviceType },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between text-xl bg-[#F1F4F7] rounded-t-2xl">
          <span>Chi tiết dịch vụ</span>
          <Button
            isIconOnly
            variant="light"
            radius="full"
            className="min-w-0 size-8 text-[#29467A]"
            onPress={onClose}
            aria-label="Đóng"
          >
            <IconX size={24} />
          </Button>
        </ModalHeader>
        <ModalBody className="py-5">
          <h2 className="text-xl font-medium  mb-2">{modalTitle}</h2>

          <div className="grid grid-cols-2 gap-3">
            {summaryItems.map((item) => (
              <p key={item.label}>
                <strong>{item.label}:</strong> {item.value}
              </p>
            ))}
            <p className="col-span-2">
              <strong>Ghi chú:</strong> {serviceDescription}
            </p>
          </div>

          <div className="mt-2">
            <p className=" items-center flex gap-2">
              <strong>Trạng thái:</strong>{" "}
              <span
                className={`inline-block rounded-md px-4 py-1 font-medium ${
                  isActiveStatus
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {serviceStatusText}
              </span>
            </p>
          </div>

          {treatmentSteps.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 rounded-md mt-4">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    {STEP_TABLE_HEADERS.map((header) => (
                      <th key={header} className="border border-gray-200 p-2">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {treatmentSteps.map((step, stepIndex) => (
                    <tr key={`${step.ProgressName || "step"}-${stepIndex}`}>
                      <td className="border border-gray-200 p-2">
                        {stepIndex + 1}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {step.ProgressName || "-"}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {toPercentText(step.CompletedPrecentage)}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {step.MinimumDaysToNextStep ?? 0}
                      </td>
                      {/* <td className="border border-gray-200 p-2">
                        {toPercentText(step.KIMRevenueValue)}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {toPercentText(step.ClinicRevenueValue)}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {step.ConsultingDoctorRevenueValue ?? 0}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {step.TreatmentDoctorRevenueValue ?? 0}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {step.AdvisorDoctorRevenueValue ?? 0}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {step.NursingDoctorRevenueValue ?? 0}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {step.IsApprovedNeeded === 1 ? "Có" : "Không"}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-gray-600">
              Dịch vụ này không có bước điều trị.
            </p>
          )}

          <div className="flex justify-center py-2">
            <Button color="danger" onPress={onClose}>
              TRỞ LẠI
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
