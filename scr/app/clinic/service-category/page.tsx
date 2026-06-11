"use client";

import { addToast, Button, useDisclosure } from "@heroui/react";
import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import ServiceCategoryTable from "@/com/clinic/components/ServiceCategoryTable";
import ServiceCategoryModal from "@/com/clinic/components/ServiceCategoryModal";
import { saveServiceCategory } from "@/lib/serviceCategory";

export default function ServiceCategoryPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmit = async (serviceGroupName: string) => {
    try {
      const res = await saveServiceCategory({ name: serviceGroupName });
      if (res.status === 200 || res.status === 201) {
        addToast({
          color: "success",
          title: "Thêm danh mục dịch vụ thành công",
        });
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.log("🚀 ~ error:", error)
      addToast({ color: "danger", title: "Thêm danh mục dịch vụ thất bại" });
    } finally {
      onClose();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Danh mục dịch vụ</h1>
        <Button color="primary" onPress={onOpen} className="pr-6">
          <IconPlus size={20} />
          Thêm mới
        </Button>
      </div>

      <ServiceCategoryTable refreshKey={refreshKey} />

      <ServiceCategoryModal
        isOpen={isOpen}
        onClose={onClose}
        title="Thêm mới"
        onSubmit={handleSubmit}
      />
    </>
  );
}
