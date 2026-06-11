import React, { useEffect, useState } from "react";

import { Service } from "@/types/define.d";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { prop } from "remeda";
import ServiceCategoryModal from "@/com/clinic/components/ServiceCategoryModal";
import ConfirmDeleteModal from "@/com/clinic/components/ConfirmDeleteModal";
import { saveServiceCategory } from "@/lib/serviceCategory";
import rest from "@/lib/rest";

const LIMIT = 20;

const isSuccessStatus = (status: number) => status === 200 || status === 201;

type ServiceCategoryTableProps = {
  refreshKey?: number;
};

export default function ServiceCategoryTable({
  refreshKey = 0,
}: ServiceCategoryTableProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [lmstart, setLmstart] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchServices = async () => {
      try {
        const res = await rest.get(
          `/category/service?lmstart=${lmstart}&limit=${LIMIT}`,
        );

        if (!isActive) return;
        const data = prop(res, "data", "module", "views", 0, "data");

        setServices(
          isSuccessStatus(res.status) && Array.isArray(data) ? data : [],
        );
      } catch {
        if (!isActive) return;
        setServices([]);
        addToast({
          color: "danger",
          title: "Lấy danh sách nhóm dịch vụ thất bại",
        });
      }
    };

    void fetchServices();

    return () => {
      isActive = false;
    };
  }, [lmstart, refreshKey, reloadKey]);

  const handlePrev = () => {
    setLmstart((prev) => Math.max(0, prev - LIMIT));
  };

  const handleNext = () => {
    setLmstart((prev) => prev + LIMIT);
  };

  const canPaginate = services.length >= LIMIT;

  const editingName =
    services.find((service) => service.ServiceGroupId === editingIndex)
      ?.NameVi ?? "";

  const handleOpenEdit = (id: string) => {
    setEditingIndex(id);
    onOpen();
  };

  const handleEditSubmit = async (name: string) => {
    if (editingIndex === null) return;
    try {
      const res = await saveServiceCategory({
        name,
        serviceGroupId: editingIndex,
      });
      if (res.status === 200 || res.status === 201) {
        setServices((prev) =>
          prev.map((service) =>
            service.ServiceGroupId === editingIndex
              ? { ...service, NameVi: name }
              : service
          )
        );
        addToast({
          color: "success",
          title: "Cập nhật nhóm dịch vụ thành công",
        });
      }
    } catch {
      addToast({ color: "danger", title: "Cập nhật nhóm dịch vụ thất bại" });
    } finally {
      onClose();
      setEditingIndex(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await rest.put(`/category/service`, { id });
      if (res.status === 200 && res.status === 201) {
        setServices((prev) =>
          prev.filter((service) => service.ServiceGroupId !== id),
        );
        addToast({ color: "success", title: "Xóa nhóm dịch vụ thành công" });
        setReloadKey((prev) => prev + 1);
      }
    } catch {
      addToast({ color: "danger", title: "Xóa nhóm dịch vụ thất bại" });
    }
  };

  const handleOpenDelete = (id: string, name: string) => {
    setDeletingId(id);
    setDeletingName(name);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await handleDelete(deletingId);
    onDeleteClose();
    setDeletingId(null);
    setDeletingName("");
  };

  return (
    <>
      {/* <Card> */}
      <Table
        aria-label="Service table"
        shadow="none"
        radius="none"
        classNames={{
          wrapper: "p-0 rounded-none",
          table: "p-0",
          th: "text-sm text-gray-700 font-medium",
        }}
      >
        <TableHeader>
          <TableColumn key="id" className="w-12">
            #
          </TableColumn>

          <TableColumn key="name" className="font-bold">
            Nhóm dịch vụ
          </TableColumn>

          <TableColumn key="action" className="w-12">
            {""}
          </TableColumn>
        </TableHeader>

        <TableBody emptyContent="Không có dữ liệu">
          {services.map((service, uid) => (
            <TableRow
              key={uid}
              className="border-b border-slate-300 hover:bg-gray-50"
            >
              <TableCell className="font-bold">{uid + 1}</TableCell>
              <TableCell className="font-bold">{service.NameVi}</TableCell>

              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <IconDotsVertical size={16} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Branch actions">
                    <DropdownItem
                      key="edit"
                      startContent={<IconEdit size={16} />}
                      onPress={() => handleOpenEdit(service.ServiceGroupId)}
                    >
                      Chỉnh sửa
                    </DropdownItem>

                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<IconTrash size={16} />}
                      onPress={() =>
                        handleOpenDelete(service.ServiceGroupId, service.NameVi)
                      }
                    >
                      Xóa
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/***** * Pagination * ******/}

      {canPaginate && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <div className="text-sm text-gray-600">Đang xem từ {lmstart + 1}</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="light"
              onPress={handlePrev}
              isDisabled={lmstart === 0}
            >
              Trước
            </Button>
            <Button
              size="sm"
              variant="light"
              onPress={handleNext}
              isDisabled={services.length < LIMIT}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
      {/* </Card> */}

      {/***** * Modal edit name  * ******/}

      <ServiceCategoryModal
        isOpen={isOpen}
        onClose={onClose}
        title="Chỉnh sửa"
        initialValue={editingName}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title={deletingName}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
