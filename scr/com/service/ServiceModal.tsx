"use client";

import { BasicInfoSection } from "@/com/service/BasicInfoSection";
import { StepSection } from "@/com/service/StepSection";
import rest from "@/lib/rest";
import {
  INITIAL_BASIC_INFO,
  INITIAL_STEP_DATA,
  percentValues,
  SERVICE_GROUP_LIMIT,
} from "@/lib/serviceConstants";
import type {
  BasicInfoData,
  ServiceDetailV2,
  ServiceGroupItem,
  StepData,
} from "@/types/service";
import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { prop } from "remeda";
import { useEffect, useMemo, useState, type UIEvent } from "react";
import { IconX } from "@tabler/icons-react";

type ServiceModalMode = "create" | "edit";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: ServiceModalMode;
  editingServiceDetail?: ServiceDetailV2 | null;
  onSuccess?: () => void;
}

type BasicInfoFieldKey =
  | "serviceName"
  | "serviceCode"
  | "servicePrice"
  | "tax"
  | "serviceGroupId";

const REQUIRED_FIELD_MESSAGE = "Thông tin bắt buộc";

const revenueTypeMap: Record<number, string> = {
  1: "Số tiền",
  2: "Phần trăm",
};

function parseTaxValue(isTax: boolean, value?: string | number | null): number {
  if (isNaN(Number(value))) return -1;

  const num = Number(value);

  if (num > 0) {
    return num;
  }

  if (isTax) {
    return 0;
  }

  return -1;
}

function parseServiceStatus(value: string | number | null | undefined): number {
  const parsed = Number(value);
  return parsed === 0 ? 0 : 1;
}

const getInitialStepMap = (): Record<number, StepData> => ({
  1: INITIAL_STEP_DATA,
});

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  mode = "create",
  editingServiceDetail,
  onSuccess,
}) => {
  const isEditMode = mode === "edit";

  const [isSaving, setIsSaving] = useState(false);
  const [steps, setSteps] = useState<number[]>([1]);
  const [hasTreatmentSteps, setHasTreatmentSteps] = useState(false);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroupItem[]>([]);
  const [lmstart, setLmstart] = useState(0);
  const [isLoadingServiceGroups, setIsLoadingServiceGroups] = useState(false);
  const [hasMoreServiceGroups, setHasMoreServiceGroups] = useState(true);

  const [basicInfo, setBasicInfo] = useState<BasicInfoData>(INITIAL_BASIC_INFO);
  const [basicInfoErrors, setBasicInfoErrors] = useState<
    Partial<Record<BasicInfoFieldKey, string>>
  >({});
  const [stepDataByStep, setStepDataByStep] =
    useState<Record<number, StepData>>(getInitialStepMap());

  const resetFormState = () => {
    setSteps([1]);
    setHasTreatmentSteps(false);
    setBasicInfo(INITIAL_BASIC_INFO);
    setBasicInfoErrors({});
    setStepDataByStep(getInitialStepMap());
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    resetFormState();

    if (!isEditMode || !editingServiceDetail) {
      return;
    }

    const stepList = editingServiceDetail.MedicalProcedure ?? [];

    const priceFromDetail = Number(
      editingServiceDetail.Service_SalePrice ?? editingServiceDetail.SalePrice,
    );
    const normalizedPrice = Number.isFinite(priceFromDetail)
      ? priceFromDetail
      : 0;

    const selectedServiceGroupId = String(
      editingServiceDetail.ServiceGroupId ?? "",
    );
    const selectedServiceGroupName =
      editingServiceDetail.ServiceGroup_NameVi || "Nhóm dịch vụ hiện tại";

    if (selectedServiceGroupId) {
      setServiceGroups((prev) => {
        const exists = prev.some(
          (group) => group.ServiceGroupId === selectedServiceGroupId,
        );
        if (exists) return prev;

        return [
          {
            ServiceGroupId: selectedServiceGroupId,
            NameVi: selectedServiceGroupName,
          },
          ...prev,
        ];
      });
    }

    setBasicInfo((prev) => {
      return {
        ...prev,
        serviceName: editingServiceDetail.Name || "",
        serviceCode: editingServiceDetail.ServiceCode || "",
        servicePrice: normalizedPrice,
        tax: parseTaxValue(
          Boolean(Number(editingServiceDetail?.IsTax || 0)),
          editingServiceDetail.Service_Tax ?? -1,
        ),
        serviceGroupId: selectedServiceGroupId,
        serviceStatus: parseServiceStatus(editingServiceDetail.State),
        serviceType: Number(editingServiceDetail.ServiceType) === 2 ? 2 : 1,
        notes: editingServiceDetail.Description || "",
      };
    });

    if (stepList.length === 0) {
      setHasTreatmentSteps(false);
      return;
    }

    setHasTreatmentSteps(true);

    const nextSteps = stepList.map((_, index) => index + 1);
    const nextStepDataByStep: Record<number, StepData> = {};

    stepList.forEach((step, index) => {
      const stepId = index + 1;
      nextStepDataByStep[stepId] = {
        stepName: step.ProgressName || "",
        treatmentPercent: Number(step.CompletedPrecentage) || 0,
        daysToNextStep: Number(step.MinimumDaysToNextStep) || 0,
        companyRevenueType:
          revenueTypeMap[Number(step.KIMRevenueType)] || "Phần trăm",
        companyRevenueValue: Number(step.KIMRevenueValue) || 0,
        clinicRevenueType:
          revenueTypeMap[Number(step.ClinicRevenueType)] || "Phần trăm",
        clinicRevenueValue: Number(step.ClinicRevenueValue) || 0,
        doctorConsultantIncomeType:
          revenueTypeMap[Number(step.ConsultingDoctorRevenueType)] || "Số tiền",
        doctorConsultantIncomeValue:
          Number(step.ConsultingDoctorRevenueValue) || 0,
        doctorTreatmentIncomeType:
          revenueTypeMap[Number(step.TreatmentDoctorRevenueType)] || "Số tiền",
        doctorTreatmentIncomeValue:
          Number(step.TreatmentDoctorRevenueValue) || 0,
        doctorHTCMIncomeType:
          revenueTypeMap[Number(step.AdvisorDoctorRevenueType)] || "Số tiền",
        doctorHTCMIncomeValue: Number(step.AdvisorDoctorRevenueValue) || 0,
        nurseIncomeType:
          revenueTypeMap[Number(step.NursingDoctorRevenueType)] || "Số tiền",
        nurseIncomeValue: Number(step.NursingDoctorRevenueValue) || 0,
      };
    });

    setSteps(nextSteps);
    setStepDataByStep(nextStepDataByStep);
  }, [isOpen, isEditMode, editingServiceDetail]);

  const fetchServiceGroups = async (start: number, append = false) => {
    if (isLoadingServiceGroups) return;
    setIsLoadingServiceGroups(true);
    try {
      const res = await rest.get(
        `/category/service?lmstart=${start}&limit=${SERVICE_GROUP_LIMIT}`,
      );
      const data = prop(res, "data", "module", "views", 0, "data");
      const list = Array.isArray(data) ? (data as ServiceGroupItem[]) : [];

      setServiceGroups((prev) => (append ? [...prev, ...list] : list));
      setHasMoreServiceGroups(list.length >= SERVICE_GROUP_LIMIT);
      setLmstart(start);
    } catch {
      setHasMoreServiceGroups(false);
    } finally {
      setIsLoadingServiceGroups(false);
    }
  };

  const handleOpenServiceGroups = () => {
    if (serviceGroups.length === 0) {
      void fetchServiceGroups(0, false);
    }
  };

  const handleLoadMoreServiceGroups = (event: UIEvent<HTMLElement>) => {
    if (!hasMoreServiceGroups || isLoadingServiceGroups) return;

    const target = event.currentTarget;
    const isBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 16;

    if (isBottom) {
      void fetchServiceGroups(lmstart + SERVICE_GROUP_LIMIT, true);
    }
  };

  const addStep = () => {
    setSteps((prev) => {
      const nextStepId = prev.length ? Math.max(...prev) + 1 : 1;
      setStepDataByStep((current) => ({
        ...current,
        [nextStepId]: INITIAL_STEP_DATA,
      }));
      return [...prev, nextStepId];
    });
  };

  const removeStep = (id: number) => {
    setSteps((prev) => {
      if (prev.length <= 1) return prev;
      setStepDataByStep((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return prev.filter((s) => s !== id);
    });
  };

  const handleBasicInfoChange = (data: Partial<BasicInfoData>) => {
    setBasicInfo((prev) => ({ ...prev, ...data }));

    const keys = Object.keys(data) as BasicInfoFieldKey[];
    if (keys.length === 0) return;

    setBasicInfoErrors((prev) => {
      const next = { ...prev };
      keys.forEach((key) => {
        delete next[key];
      });
      return next;
    });
  };

  const handleStepDataChange = (stepId: number, data: Partial<StepData>) => {
    setStepDataByStep((prev) => ({
      ...prev,
      [stepId]: { ...prev[stepId], ...data },
    }));
  };

  const treatmentSteps = useMemo(
    () =>
      hasTreatmentSteps ? steps.map((stepId) => stepDataByStep[stepId]) : [],
    [hasTreatmentSteps, steps, stepDataByStep],
  );

  const validateRequiredFields = () => {
    const nextBasicInfoErrors: Partial<Record<BasicInfoFieldKey, string>> = {};
    const missingFields: string[] = [];

    if (!basicInfo.serviceName?.trim()) {
      missingFields.push("Tên dịch vụ");
      nextBasicInfoErrors.serviceName = REQUIRED_FIELD_MESSAGE;
    }

    if (!basicInfo.serviceCode?.trim()) {
      missingFields.push("Mã dịch vụ");
      nextBasicInfoErrors.serviceCode = REQUIRED_FIELD_MESSAGE;
    }

    if (
      !Number.isFinite(basicInfo.servicePrice) ||
      basicInfo.servicePrice <= 0
    ) {
      missingFields.push("Giá dịch vụ");
      nextBasicInfoErrors.servicePrice = REQUIRED_FIELD_MESSAGE;
    }

    if (!Number.isFinite(basicInfo?.tax)) {
      missingFields.push("Thuế");
      nextBasicInfoErrors.tax = REQUIRED_FIELD_MESSAGE;
    }

    if (!basicInfo.serviceGroupId?.trim()) {
      missingFields.push("Nhóm dịch vụ");
      nextBasicInfoErrors.serviceGroupId = REQUIRED_FIELD_MESSAGE;
    }

    setBasicInfoErrors(nextBasicInfoErrors);

    if (hasTreatmentSteps && treatmentSteps.length > 0) {
      treatmentSteps.forEach((step, index) => {
        if (!step.stepName?.trim()) {
          missingFields.push(`Tên bước tiến trình (Bước ${index + 1})`);
        }
      });
    }

    if (missingFields.length > 0) {
      addToast({
        description: `Vui lòng nhập đầy đủ các trường bắt buộc: ${missingFields.join(", ")}`,
        color: "danger",
      });
      return false;
    }

    return true;
  };

  const buildFormData = () => {
    const formData = new FormData();

    formData.append("Service[ServiceName]", basicInfo.serviceName);
    formData.append("Service[HISServiceCode]", basicInfo.serviceCode);
    formData.append("Service[SalePrice]", String(basicInfo.servicePrice));

    formData.append("Service[ServiceGroupId]", basicInfo.serviceGroupId);
    formData.append("Service[ServiceType]", String(basicInfo.serviceType));
    formData.append("Service[Description]", basicInfo.notes);

    if (Number.isFinite(basicInfo?.tax)) {
      formData.append("Service[Tax]", String(basicInfo.tax));
    }

    if (isEditMode && editingServiceDetail?.ServiceId) {
      formData.append(
        "Service[ServiceId]",
        String(editingServiceDetail.ServiceId),
      );
      formData.append(
        "Service[State]",
        String(
          basicInfo.serviceStatus ??
            parseServiceStatus(editingServiceDetail.State),
        ),
      );
    }

    formData.append(
      "MedicalProcedure[MedicalProcedureName]",
      basicInfo.serviceName,
    );

    if (hasTreatmentSteps && treatmentSteps.length > 0) {
      treatmentSteps.forEach((step, index) => {
        const prefix = `MedicalProcedure[MedicalProcedure][${index}]`;
        formData.append(`${prefix}[ProgressName]`, step.stepName);
        formData.append(
          `${prefix}[CompletedPrecentage]`,
          String(step.treatmentPercent),
        );
        formData.append(
          `${prefix}[MinimumDaysToNextStep]`,
          String(step.daysToNextStep),
        );
        formData.append(`${prefix}[IsApprovedNeeded]`, "0");
        // //////////////////

        formData.append(
          `${prefix}[KIMRevenueType]`,
          String(percentValues[step.companyRevenueType] || 2),
        );
        formData.append(
          `${prefix}[KIMRevenueValue]`,
          String(step.companyRevenueValue),
        );
        formData.append(
          `${prefix}[ClinicRevenueType]`,
          String(percentValues[step.clinicRevenueType] || 2),
        );
        formData.append(
          `${prefix}[ClinicRevenueValue]`,
          String(step.clinicRevenueValue),
        );
        formData.append(
          `${prefix}[ConsultingDoctorRevenueType]`,
          String(percentValues[step.doctorConsultantIncomeType] || 1),
        );
        formData.append(
          `${prefix}[ConsultingDoctorRevenueValue]`,
          String(step.doctorConsultantIncomeValue),
        );
        formData.append(
          `${prefix}[TreatmentDoctorRevenueType]`,
          String(percentValues[step.doctorTreatmentIncomeType] || 1),
        );
        formData.append(
          `${prefix}[TreatmentDoctorRevenueValue]`,
          String(step.doctorTreatmentIncomeValue),
        );
        formData.append(
          `${prefix}[AdvisorDoctorRevenueType]`,
          String(percentValues[step.doctorHTCMIncomeType] || 1),
        );
        formData.append(
          `${prefix}[AdvisorDoctorRevenueValue]`,
          String(step.doctorHTCMIncomeValue),
        );
        formData.append(
          `${prefix}[NursingDoctorRevenueType]`,
          String(percentValues[step.nurseIncomeType] || 1),
        );
        formData.append(
          `${prefix}[NursingDoctorRevenueValue]`,
          String(step.nurseIncomeValue),
        );
      });
    }

    return formData;
  };

  const handleSave = async () => {
    if (!validateRequiredFields()) return;

    setIsSaving(true);
    try {
      const formData = buildFormData();
      const res = await rest.post("/service", formData);

      if ((res.status === 200 || res.status === 201) && res?.data?.success) {
        addToast({
          description: isEditMode
            ? "Cập nhật dịch vụ thành công"
            : "Tạo mới dịch vụ thành công",
          color: "success",
        });
        onSuccess?.();
        onClose();
      } else {
        throw new Error(`Lỗi không xác định: ${res?.status} - ${res?.message}`);
      }
    } catch (error) {
      addToast({
        description: isEditMode
          ? "Cập nhật dịch vụ thất bại"
          : "Tạo mới dịch vụ thất bại",
        color: "danger",
      });
      console.error("Error saving service:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      size="5xl"
      // scrollBehavior="inside"
      placement="top"
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="rounded-t-2xl bg-[#f1f5f9] flex items-center justify-between">
          {isEditMode ? "Điều chỉnh dịch vụ" : "Tạo mới dịch vụ"}
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
        <ModalBody className="py-5 space-y-6">
          <BasicInfoSection
            isEditMode={isEditMode}
            hasTreatmentSteps={hasTreatmentSteps}
            basicData={basicInfo}
            fieldErrors={basicInfoErrors}
            onToggleTreatmentSteps={setHasTreatmentSteps}
            serviceGroups={serviceGroups}
            onOpenServiceGroups={handleOpenServiceGroups}
            onLoadMoreServiceGroups={handleLoadMoreServiceGroups}
            onBasicDataChange={handleBasicInfoChange}
          />

          {hasTreatmentSteps ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Tạo tiến trình điều trị</h2>
              <div className="space-y-8">
                {steps.map((stepId, index) => (
                  <StepSection
                    key={stepId}
                    index={index}
                    showRemove={steps.length > 1}
                    stepData={stepDataByStep[stepId] || INITIAL_STEP_DATA}
                    onStepDataChange={(data) =>
                      handleStepDataChange(stepId, data)
                    }
                    onRemove={() => removeStep(stepId)}
                  />
                ))}
              </div>

              <Button
                className="bg-blue-600 text-white w-fit"
                radius="sm"
                onPress={addStep}
              >
                Thêm bước
              </Button>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter className="items-center justify-center border-t border-t-gray-400">
          <Button variant="light" onPress={onClose} isDisabled={isSaving}>
            Hủy
          </Button>
          <Button color="primary" onPress={handleSave} isLoading={isSaving}>
            Lưu
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ServiceModal;
