import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  Button,
  // PressEvent,
  addToast,
  Pagination,
  Spinner,
} from "@heroui/react";
import dayjs from "@/lib/dayjs";
import rest from "@/lib/rest";
import React from "react";
import { StaffInfo } from "@/types/define.d";
import { UI_META } from "@/const/ui";
import { getErrorMessage } from "@/lib/utils";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { useConfirm } from "../../ConfirmProvider";

interface ActiveStaffListProps {
  refreshSignal?: number;
}
export function ActiveStaffList({ refreshSignal }: ActiveStaffListProps) {
  const abortRef = useRef<AbortController | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [data, setData] = useState<StaffInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateSignal, setUpdateSignal] = useState(1);
  const { confirm } = useConfirm();

  const handleDeleteDoctor = async (id: number | undefined) => {
    if (
      !id ||
      !(await confirm({ message: "Xác nhận xóa bác sĩ ?", type: "warning" }))
    )
      return;
    setData((prev) => prev.filter((d) => d.id !== Number(id)));
    try {
      console.log(id);
      const res = await rest.delete(`/staff`, { data: { id } });
      if (res.status !== 200) throw new Error("Delete failed");

      addToast({
        title: "Thành công",
        description: "Xóa bác sĩ thành công.",
        color: "success",
      });
    } catch (error) {
      void error;
      addToast({
        title: "Thất bại",
        description: "Xóa bác sĩ thất bại. Vui lòng thử lại.",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const res = await rest.get("/staff", {
          signal: abortRef.current.signal,
          params: { page: currentPage, pageSize: 20 },
        });
        if (res.status !== 200)
          throw new Error("Lỗi khi lấy danh sách nhân sự");

        setData(res.data.data ?? []);
        setTotalPages(res.data.pagination?.pageCount ?? 1);
      } catch (error: any) {
        if (
          (error instanceof Error && error.name === "CanceledError") ||
          error.code === "ERR_CANCELED"
        )
          return;
        setError(getErrorMessage(error, "Lỗi không xác định"));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [currentPage, refreshSignal, updateSignal]);
  return (
    <>
      <div className="flex flex-col">
        <Table
          aria-label="Branch table"
          layout="fixed"
          shadow="none"
          radius="none"
          classNames={UI_META.Table.flat.classNames}
        >
          <TableHeader className="text-base!">
            <TableColumn key="id" align="center" className="w-12">
              #
            </TableColumn>
            <TableColumn key="name" align="start" width={"35%"}>
              Tên bác sĩ
            </TableColumn>
            <TableColumn key="email" align="start" width={"35%"}>
              Email
            </TableColumn>
            <TableColumn key="phone" align="start" width={"20%"}>
              Số phone
            </TableColumn>
            <TableColumn key="actions" className="w-12">
              {""}
            </TableColumn>
          </TableHeader>
          <TableBody emptyContent="Chưa có nhân sự nào">
            {loading ? (
              <TableRow className="h-[735px]">
                <TableCell colSpan={5} className="py-10 h-[735px]">
                  <div className="flex justify-center">
                    <Spinner color="default" size="sm" />
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-default-500">{error}</p>
                    <Button
                      color="primary"
                      onPress={() => setUpdateSignal((prev) => prev + 1)}
                    >
                      Thử lại
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.map((staff, idx) => (
                <TableRow
                  key={staff.id}
                  className="border-b border-slate-300 hover:bg-gray-50"
                >
                  <TableCell className="font-semibold">{idx + 1}</TableCell>
                  <TableCell className="font-semibold text-blue-600">
                    {staff.name}
                    <div className="font-normal text-blue-400">
                      {staff.business_role}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {staff.email}
                    <div className="font-normal text-blue-400">
                      Hoạt động {dayjs(staff.updatedAt).fromNow()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{staff.phone}</TableCell>

                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <IconDotsVertical size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Doctor actions">
                        <DropdownItem
                          key="edit"
                          startContent={<IconEdit size={16} />}
                        >
                          Chỉnh sửa
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          // startContent={<IconTrash size={16} />}
                          startContent={<IconTrash size={16} />}
                          onPress={() =>
                            handleDeleteDoctor(staff.id || undefined)
                          }
                        >
                          Xóa
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* hide pagination if only one page */}
        {totalPages > 1 && (
          <div className="shrink-0  p-10 flex justify-center">
            <Pagination
              variant="light"
              radius="full"
              color="default"
              page={currentPage}
              boundaries={1}
              dotsJump={5}
              siblings={1}
              total={totalPages}
              onChange={setCurrentPage}
              showControls
            />
          </div>
        )}
      </div>
    </>
  );
}
