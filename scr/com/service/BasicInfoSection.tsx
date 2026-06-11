import { Checkbox, Input, Select, SelectItem, Textarea } from "@heroui/react";
import { UIEvent } from "react";
import { serviceTax } from "@/data/service";
import { fieldClassNames } from "@/lib/serviceConstants";
import type { ServiceGroupItem, BasicInfoData } from "@/types/service";

type BasicInfoSectionProps = {
  isEditMode?: boolean;
  hasTreatmentSteps: boolean;
  basicData: BasicInfoData;
  fieldErrors?: Partial<
    Record<
      "serviceName" | "serviceCode" | "servicePrice" | "tax" | "serviceGroupId",
      string
    >
  >;
  onToggleTreatmentSteps: (value: boolean) => void;
  serviceGroups: ServiceGroupItem[];
  onOpenServiceGroups: () => void;
  onLoadMoreServiceGroups: (event: UIEvent<HTMLElement>) => void;
  onBasicDataChange: (data: Partial<BasicInfoData>) => void;
};

export const BasicInfoSection = ({
  isEditMode = false,
  hasTreatmentSteps,
  basicData,
  fieldErrors,
  onToggleTreatmentSteps,
  serviceGroups,
  onOpenServiceGroups,
  onLoadMoreServiceGroups,
  onBasicDataChange,
}: BasicInfoSectionProps) => {
  const formatPrice = (value: number) =>
    Number.isFinite(value) ? value.toLocaleString("en-US") : "0";

  const parsePrice = (value: string) => {
    const normalized = value.replace(/,/g, "").replace(/\D/g, "");
    return normalized ? Number(normalized) : 0;
  };

  const renderFieldError = (
    key:
      | "serviceName"
      | "serviceCode"
      | "servicePrice"
      | "tax"
      | "serviceGroupId",
  ) => (
    <p
      className={`min-h-6 pt-1 text-sm text-danger md:pl-52 ${
        fieldErrors?.[key] ? "visible" : "invisible"
      }`}
    >
      {fieldErrors?.[key] || "Thông tin bắt buộc"}
    </p>
  );

  const selectedServiceGroupKey = basicData.serviceGroupId?.trim()
    ? basicData.serviceGroupId
    : null;
  const selectedStatusKey =
    basicData.serviceStatus === 0 || basicData.serviceStatus === 1
      ? String(basicData.serviceStatus)
      : null;
  const selectedServiceTypeKey =
    basicData.serviceType === 1 || basicData.serviceType === 2
      ? String(basicData.serviceType)
      : "1";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1">
        <div>
          <Input
            isRequired
            label="Tên dịch vụ"
            labelPlacement="outside-left"
            type="text"
            size="lg"
            classNames={fieldClassNames}
            value={basicData.serviceName}
            onChange={(e) => onBasicDataChange({ serviceName: e.target.value })}
          />
          {renderFieldError("serviceName")}
        </div>

        <div>
          <Input
            isRequired
            label="Mã dịch vụ"
            labelPlacement="outside-left"
            type="text"
            size="lg"
            classNames={fieldClassNames}
            placeholder="SV000000"
            value={basicData.serviceCode}
            onChange={(e) => onBasicDataChange({ serviceCode: e.target.value })}
          />
          {renderFieldError("serviceCode")}
        </div>

        <div>
          <Input
            label="Giá dịch vụ"
            labelPlacement="outside-left"
            size="lg"
            classNames={fieldClassNames}
            isRequired
            placeholder="0"
            type="text"
            inputMode="numeric"
            value={formatPrice(basicData.servicePrice)}
            onChange={(e) => {
              onBasicDataChange({ servicePrice: parsePrice(e.target.value) });
            }}
          />
          {renderFieldError("servicePrice")}
        </div>

        <div>
          <Select
            label="Thuế"
            labelPlacement="outside-left"
            size="lg"
            isRequired
            placeholder="KCT"
            classNames={fieldClassNames}
            selectedKeys={
              !isNaN(Number(basicData?.tax)) ? [String(basicData?.tax)] : []
            }
            onSelectionChange={(keys) => {
              onBasicDataChange({
                tax: !isNaN(Number(keys.currentKey))
                  ? Number(keys.currentKey)
                  : -1,
              });
            }}
            items={serviceTax}
          >
            {(item) => <SelectItem key={item?.value}>{item?.label}</SelectItem>}
          </Select>
          {renderFieldError("tax")}
        </div>

        <div>
          <Select
            label="Nhóm dịch vụ"
            labelPlacement="outside-left"
            size="lg"
            isRequired
            placeholder="Chọn nhóm dịch vụ"
            classNames={fieldClassNames}
            selectedKeys={
              selectedServiceGroupKey ? [selectedServiceGroupKey] : []
            }
            onOpenChange={(open) => {
              if (open) onOpenServiceGroups();
            }}
            listboxProps={{
              onScroll: onLoadMoreServiceGroups,
            }}
            onChange={(e) =>
              onBasicDataChange({ serviceGroupId: e.target.value })
            }
          >
            {serviceGroups.map((group) => (
              <SelectItem key={group.ServiceGroupId}>{group.NameVi}</SelectItem>
            ))}
          </Select>
          {renderFieldError("serviceGroupId")}
        </div>

        <div>
          <Select
            label="Loại"
            labelPlacement="outside-left"
            size="lg"
            isRequired
            placeholder="Chọn loại"
            classNames={fieldClassNames}
            selectedKeys={[selectedServiceTypeKey]}
            onChange={(e) => {
              const typeValue = Number(e.target.value);
              onBasicDataChange({
                serviceType: typeValue === 2 ? 2 : 1,
              });
            }}
          >
            <SelectItem key="1">Tổng Quát</SelectItem>
            <SelectItem key="2">Chỉnh Nha</SelectItem>
          </Select>
          <div className="min-h-6" />
        </div>

        {isEditMode ? (
          <div>
            <Select
              label="Trạng thái"
              labelPlacement="outside-left"
              size="lg"
              placeholder="Chọn trạng thái"
              classNames={fieldClassNames}
              selectedKeys={selectedStatusKey ? [selectedStatusKey] : ["1"]}
              onChange={(e) => {
                const statusValue = Number(e.target.value);
                onBasicDataChange({
                  serviceStatus: statusValue === 0 ? 0 : 1,
                });
              }}
            >
              <SelectItem key="1">Đang sử dụng</SelectItem>
              <SelectItem key="0">Ngưng sử dụng</SelectItem>
            </Select>
            <div className="min-h-6" />
          </div>
        ) : null}
      </div>

      <Textarea
        label="Ghi chú"
        labelPlacement="outside-left"
        placeholder=""
        classNames={fieldClassNames}
        value={basicData.notes}
        onChange={(e) => onBasicDataChange({ notes: e.target.value })}
      />

      <Checkbox
        className="mb-2"
        isSelected={hasTreatmentSteps}
        onValueChange={onToggleTreatmentSteps}
      >
        Dịch vụ có bước điều trị
      </Checkbox>
    </div>
  );
};
