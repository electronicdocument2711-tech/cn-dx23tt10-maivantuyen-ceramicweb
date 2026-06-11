import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Button,
  addToast,
  ModalFooter,
  Select,
  SelectItem,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { REGEX } from "@/const/global";
import { fetchWardbyProvince } from "@/lib/apiShared";
import { Province, Ward } from "@/types/widget";
import { UI_META } from "@/const/ui";
import { useRouter } from "next/navigation";
import { BranchForm } from "@/types/define.d";
import { provinceData } from "@/data/province";

const initBranchDraft: BranchForm = {
  id: "",
  code: "",
  name: "",
  phone: "",
  // district: "",
  province: "",
  ward: "",
  address: "",
  licenseCode: "",
  licenseName: "",
};

interface ModalBranchProps {
  branchId?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ModalBranch({
  branchId,
  isOpen,
  onOpenChange,
}: ModalBranchProps) {
  const router = useRouter();
  const [branchFormData, setBranchFormData] =
    useState<BranchForm>(initBranchDraft);

  const updateBranchFormData = (key: keyof BranchForm, value: string) => {
    setBranchFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const [loading, setLoading] = useState(false);
  const handleModalChange = (isOpen: boolean, clearData = false) => {
    if (clearData && !isOpen) setBranchFormData(initBranchDraft);
    onOpenChange(isOpen);
  };

  const handleComplete = async () => {
    if (branchId) return handleEditBranch();
    return handleAddBranch(branchFormData);
  };

  const handleAddBranch = async (branchData: BranchForm) => {
    try {
      setLoading(true);
      const res = await rest.post("/branch", {
        code: branchData.code,
        name: branchData.name,
        phone: branchData.phone,
        province: branchData.province,
        ward: branchData.ward,
        address: branchData.address,
        licenseCode: branchData.licenseCode,
        licenseName: branchData.licenseName,
      });
      if (res.status !== 201) throw new Error("Add branch failed");

      addToast({
        title: "Thành công",
        description: "Thêm chi nhánh thành công",
        color: "success",
      });

      handleModalChange(false, true);
      router.refresh();
    } catch (error: any) {
      if (error.status === 403) {
        addToast({
          title: "Thất bại",
          description: `Không đủ quyền hạn thực hiện tác vụ này`,
          color: "danger",
        });
      } else {
        const msg = getErrorMessage(error, "Thêm chi nhánh thất bại");
        addToast({
          title: "Thất bại",
          description: msg,
          color: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditBranch = async () => {
    try {
      setLoading(true);
      await rest.put(`/branch/${branchFormData.id}`, {
        id: branchFormData.id,
        code: branchFormData.code,
        name: branchFormData.name,
        phone: branchFormData.phone,
        province: branchFormData.province,
        ward: branchFormData.ward,
        address: branchFormData.address,
        licenseCode: branchFormData.licenseCode,
        licenseName: branchFormData.licenseName,
      });

      addToast({
        title: "Thành công",
        description: "Chỉnh sửa chi nhánh thành công",
        color: "success",
      });
      handleModalChange(false, true); // clear data();
      router.refresh();
    } catch (error: any) {
      if (error.status === 403) {
        addToast({
          title: "Thất bại",
          description: `Không đủ quyền hạn thực hiện tác vụ này`,
          color: "danger",
        });
      } else {
        const msg = getErrorMessage(error, "Chình sửa chi nhánh thất bại");
        addToast({
          title: "Thất bại",
          description: msg,
          color: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const [loadBranchStep, setLoadBranchStep] = useState(false);
  useEffect(() => {
    if (!branchId) return;
    setLoading(true);
    rest
      .get(`/branch/${branchId}`)
      .then((res) => {
        const branchData = res.data.data;
        setLoadBranchStep(true);
        setBranchFormData({
          id: branchData.BranchId,
          code: branchData.BranchCode,
          name: branchData.Name,
          phone: branchData.PublicPhoneNumber,
          province: branchData.ProvinceId,
          ward: branchData?.DistrictId,
          address: branchData.Address,
          licenseCode: branchData.BusinessLicenseCode,
          licenseName: branchData.BusinessLicenseName,
        });
      })
      .catch((error) => {
        addToast({
          title: "Thất bại",
          description: getErrorMessage(
            error,
            "Lấy chi tiết chi nhánh thất bại",
          ),
          color: "warning",
        });
      })
      .finally(() => setLoading(false));
  }, [branchId, isOpen]);

  const [provinceList] = useState<Partial<Province>[]>(provinceData);
  const [wardList, setWardList] = useState<Ward[]>([]);
  const [isLoadingWard, setIsLoadingWard] = useState(false);

  useEffect(() => {
    if (!branchFormData.province) return;
    fetchWardbyProvince(
      branchFormData.province,
      setWardList,
      setIsLoadingWard,
      (data) => {
        if (loadBranchStep) return setLoadBranchStep(false);
        updateBranchFormData("ward", data?.[0]?.VnWardId ?? "");
      },
    );
  }, [branchFormData.province]);

  return (
    <Modal
      size="lg"
      radius="lg"
      isOpen={isOpen}
      onOpenChange={(value) => handleModalChange(value, true)}
      isDismissable={UI_META.Modal.isDismissable}
      classNames={UI_META.Modal.classnames}
    >
      <ModalContent>
        <ModalHeader>{branchId ? "Chỉnh sửa" : "Thêm"} chi nhánh</ModalHeader>
        <ModalBody>
          <form
            id="edit-branch-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleComplete();
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-2 items-start">
              <Input
                isDisabled={loading}
                isRequired
                type="text"
                label="Mã chi nhánh"
                labelPlacement="outside-top"
                placeholder="Nhập mã chi nhánh"
                variant="bordered"
                className=""
                validate={(value) => {
                  if (!value) return "Không được để trống";
                  if (value && value.length < 3) return "Cần 3 ký tự trở lên";
                  if (value && !REGEX.BRANCH_CODE.test(value))
                    return "Phải là chữ cái, số hoặc .-_";
                }}
                errorMessage={(validation) =>
                  validation.validationErrors?.join(", ")
                }
                classNames={UI_META.Input.classNames}
                value={branchFormData.code ?? ""}
                onChange={(e) => updateBranchFormData("code", e.target.value)}
              />
              <Input
                isDisabled={loading}
                type="tel"
                label="Số điện thoại"
                labelPlacement="outside-top"
                placeholder="Nhập số điện thoại"
                variant="bordered"
                classNames={UI_META.Input.classNames}
                validate={(value) => {
                  if (value && !REGEX.PHONE.test(value))
                    return "Số điện thoại không hợp lệ, +84/0xxx-xxx-xxx";
                  return true;
                }}
                value={branchFormData.phone ?? ""}
                onChange={(e) => updateBranchFormData("phone", e.target.value)}
              />
            </div>
            <Input
              isDisabled={loading}
              isRequired
              type="text"
              label="Tên chi nhánh"
              labelPlacement="outside-top"
              placeholder="Nhập tên chi nhánh"
              variant="bordered"
              classNames={UI_META.Input.classNames}
              validate={(value) => {
                if (!value) return "Không được để trống";
                if (value && value.length < 5) return "Cần 5 ký tự trở lên";
                if (value && !REGEX.BRANCH_NAME.test(value))
                  return "Phải là chữ cái, số hoặc .-_";
              }}
              value={branchFormData.name ?? ""}
              onChange={(e) => updateBranchFormData("name", e.target.value)}
            />
            <div className="flex gap-2">
              <Select
                isDisabled={isLoadingWard || loading}
                aria-label="select province"
                label="Tỉnh/Thành phố"
                labelPlacement="outside-top"
                placeholder="Chọn Tỉnh/Thành phố"
                variant="bordered"
                itemHeight={52}
                scrollShadowProps={{
                  isEnabled: false,
                }}
                selectedKeys={[branchFormData.province]}
                onChange={(e) =>
                  updateBranchFormData("province", e.target.value)
                }
                classNames={UI_META.Select.classNames}
                listboxProps={UI_META.Select.listboxProps}
              >
                {provinceList.map((province) => (
                  <SelectItem
                    key={province.VnProvinceId}
                    textValue={`${province.LabelVi} ${province.NameVi}`}
                  >
                    {province.LabelVi} {province.NameVi}
                  </SelectItem>
                ))}
              </Select>
              <Select
                isDisabled={isLoadingWard || loading}
                isLoading={isLoadingWard}
                aria-label="select ward"
                label="Phường/Xã"
                labelPlacement="outside-top"
                placeholder="Chọn Phường/Xã"
                variant="bordered"
                itemHeight={52}
                scrollShadowProps={{
                  isEnabled: false,
                }}
                selectedKeys={[branchFormData.ward]}
                onChange={(e) => updateBranchFormData("ward", e.target.value)}
                classNames={UI_META.Select.classNames}
                listboxProps={UI_META.Select.listboxProps}
              >
                {wardList.map((ward) => (
                  <SelectItem
                    key={ward.VnWardId}
                    textValue={`${ward.NameVi}`}
                  >
                    {ward.NameVi}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Input
              label="Địa chỉ"
              labelPlacement="outside-top"
              placeholder="Nhập địa chỉ"
              variant="bordered"
              classNames={UI_META.Input.classNames}
              validate={(value) => {
                if (value && value.length < 5) return "Cần 5 ký tự trở lên";
                if (value && !REGEX.ADDRESS.test(value))
                  return "Phải là chữ cái, số hoặc .-_";
                return true;
              }}
              value={branchFormData.address ?? ""}
              onChange={(e) => updateBranchFormData("address", e.target.value)}
            />
            <Input
              label="Mã giấy phép kinh doanh"
              labelPlacement="outside-top"
              placeholder="Nhập mã giấy phép kinh doanh"
              variant="bordered"
              classNames={UI_META.Input.classNames}
              validate={(value) => {
                if (value && value.length < 3) return "Cần 3 ký tự trở lên";
                if (value && !REGEX.LICENSE_CODE.test(value))
                  return "Phải là chữ cái, số hoặc .-_";
                return true;
              }}
              value={branchFormData.licenseCode ?? ""}
              onChange={(e) =>
                updateBranchFormData("licenseCode", e.target.value)
              }
            />
            <Input
              label="Tên giấy phép kinh doanh"
              labelPlacement="outside-top"
              placeholder="Nhập tên giấy phép kinh doanh"
              variant="bordered"
              classNames={UI_META.Input.classNames}
              validate={(value) => {
                if (value && value.length < 3) return "Cần 3 ký tự trở lên";
                if (value && !REGEX.LICENSE_NAME.test(value))
                  return "Phải là chữ cái, số hoặc .-_";
                return true;
              }}
              value={branchFormData.licenseName ?? ""}
              onChange={(e) =>
                updateBranchFormData("licenseName", e.target.value)
              }
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            form="edit-branch-form"
            type="submit"
            isLoading={!!loading}
            className={UI_META.Button.primary.classnames}
          >
            Hoàn thành
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
