"use client";
import React, { useCallback, useMemo, useState } from "react";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import rest from "@/lib/rest";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { UI_META } from "@/const/ui";
import { useRouter } from "next/navigation";
import { useConfirm } from "../ConfirmProvider";
import ModalBranch from "./ModalBranch";

export interface Branch {
  CompanyId: string;
  Company_NameVi: string;
  Company_NameEn: string;
  BranchId: string;
  Name: string;
  BranchCode: string;
  Province: string;
  District: string;
  Ward: string;
  Phone: string;
  Address: string;
  ExcludeReport: string;
  ClientGroupId: string;
  PublicPhoneNumber: string;
}

export interface BranchDatas {
  type: string;
  name: string;
  pagination: {
    label: string;
    currentPage: number;
    totalRecord: string;
    limit: string;
  };
  data: Branch[];
}

interface BranchListProps {
  data: BranchDatas;
}
export default function BranchList({ data }: BranchListProps) {
  const { confirm } = useConfirm();
  const router = useRouter();
  const branchList = useMemo(() => {
    return data.data ?? [];
  }, [data]);

  const totalPages = useMemo(() => {
    return Math.ceil(
      parseInt(data.pagination.totalRecord || "0", 10) /
        parseInt(data.pagination.limit || "20", 10),
    );
  }, [data]);

  const handleParams = useCallback((pageVal: number) => {
    router.push(
      `/clinic/branch?limit=${data.pagination?.limit || 20}&page=${pageVal}`,
    );
  }, []);

  const handleDeleteBranch = async (branchId: string) => {
    if (
      await confirm({ message: "Xác nhận xóa chi nhánh ?", type: "warning" })
    ) {
      rest
        .delete(`/branch/${branchId}`)
        .then(() => {
          addToast({
            title: "Thành công",
            description: "Xóa chi nhánh thành công",
            color: "success",
          });
          router.refresh();
        })
        .catch((error) => {
          if (error.status === 403) {
            addToast({
              title: "Thất bại",
              description: `Không đủ quyền hạn thực hiện tác vụ này`,
              color: "danger",
            });
          } else
            addToast({
              title: "Thất bại",
              description: `Xóa chi nhánh thất bại, ${error.message}`,
              color: "danger",
            });
        });
    }
  };

  const [isOpenEditForm, setIsOpenEditForm] = useState(false);
  const [editBranch, setEditBranch] = useState<string>("");
  const handleEditBranch = (id: string) => {
    setEditBranch(id);
    setIsOpenEditForm(true);
  };

  return (
    <>
      {/* <ModalEditBranch
        data={data.data}
        branchId={editBranch}
        isOpen={isOpenEditForm}
        onOpenChange={setIsOpenEditForm}
      /> */}
      <div className="flex flex-col">
        <Table
          aria-label="Branch table"
          layout="fixed"
          shadow="none"
          radius="none"
          classNames={UI_META.Table.flat.classNames}
        >
          <TableHeader className="text-base!">
            <TableColumn key="id" width={"10%"} align="center">
              #
            </TableColumn>
            <TableColumn key="name" width={"30%"}>
              Chi nhánh
            </TableColumn>
            <TableColumn key="address" width={"30%"}>
              Địa chỉ
            </TableColumn>
            <TableColumn key="phone" width={"20%"}>
              Số điện thoại
            </TableColumn>
            <TableColumn key="actions" width={"10%"} align="center">
              {""}
            </TableColumn>
          </TableHeader>
          <TableBody emptyContent="Không có dữ liệu">
            {branchList.map((branch, uid) => (
              <TableRow key={uid}>
                <TableCell>{uid + 1}</TableCell>
                <TableCell className="font-semibold text-blue-600">
                  {branch.Name}
                </TableCell>
                <TableCell>
                  {[
                    branch.Address,
                    branch.Ward,
                    branch.District,
                    branch.Province,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </TableCell>
                <TableCell>{branch.PublicPhoneNumber}</TableCell>
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
                        onPress={() => handleEditBranch(branch.BranchId ?? "")}
                      >
                        Chỉnh sửa
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<IconTrash size={16} />}
                        onPress={() =>
                          handleDeleteBranch(branch.BranchId ?? "")
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
        {/* hide pagination if only one page */}
        {totalPages > 1 && (
          <div className="shrink-0  p-10 flex justify-center">
            <Pagination
              variant="light"
              radius="full"
              color="default"
              page={data.pagination.currentPage}
              boundaries={1}
              dotsJump={5}
              siblings={1}
              total={totalPages}
              onChange={(currentPage) => handleParams(currentPage)}
              showControls
            />
          </div>
        )}
      </div>
      <ModalBranch
        isOpen={isOpenEditForm}
        onOpenChange={setIsOpenEditForm}
        branchId={editBranch}
      />
    </>
  );
}
