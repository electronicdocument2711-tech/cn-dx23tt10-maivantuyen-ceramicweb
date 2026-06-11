"use client";

import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  addToast,
  Pagination,
} from "@heroui/react";
import { IconDotsVertical, IconSend2, IconX } from "@tabler/icons-react";
import dayjs from "@/lib/dayjs";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { UI_META } from "@/const/ui";
import { useConfirm } from "../../ConfirmProvider";

const PAGE_SIZE = 20;

export type PendingStaft = {
  id: string;
  email: string;
  inviteTime: string;
  name: string;
  phone: string;
  title: string;
};

interface PendingDoctorsTableProps {
  refreshSignal?: number;
}

export function PendingStaffList({ refreshSignal }: PendingDoctorsTableProps) {
  const abortRef = useRef<AbortController | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [data, setData] = useState<PendingStaft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateSignal, setUpdateSignal] = useState(1);

  const { confirm } = useConfirm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const res = await rest.get("/auth/invite", {
          signal: abortRef.current.signal,
          params: { page: currentPage, pageSize: PAGE_SIZE },
        });
        if (res.status !== 200)
          throw new Error("Lỗi khi lấy danh sách lời mời");

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
    fetchData();
  }, [currentPage, refreshSignal, updateSignal]);

  const reInvite = async (id: string) => {
    try {
      const res = await rest.patch("/auth/invite", { id });
      if (res.status !== 200) throw new Error("Lỗi khi gửi lời mời");
      console.log(res.data);
      addToast({
        title: "Thành công",
        description: "Gửi lời mời thành công",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: getErrorMessage(error, "Lỗi khi gửi lời mời"),
        color: "danger",
      });
    }
  };

  const removeInvite = async (id: string) => {
    if (await confirm({ message: "Xác nhận xóa lời mời ?", type: "warning" })) {
      try {
        const data = { id };
        setData((prev) => prev?.filter((d) => d.id !== id));
        await rest.delete(`/auth/invite`, { data });

        setUpdateSignal((prev) => prev + 1);
        addToast({
          title: "Thành công",
          description: "Xóa lời mời thành công",
          color: "success",
        });

        return data;
      } catch (error) {
        addToast({
          title: "Thất bại",
          description: getErrorMessage(error, "Xóa lời mời thất bại"),
          color: "danger",
        });
      }
    }
  };

  return (
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
            Tên
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
        <TableBody emptyContent="Không có nhân sự nào đang chờ xác nhận">
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
            data?.map((doctor, idx) => (
              <TableRow
                key={doctor.id}
                className="border-b border-slate-300 hover:bg-gray-50"
              >
                <TableCell className="font-semibold">{idx + 1}</TableCell>

                <TableCell className="font-semibold text-blue-600">
                  {doctor.name}
                  <div className="font-normal text-blue-400">
                    {doctor.title}
                  </div>
                </TableCell>

                <TableCell className="font-semibold">
                  {doctor.email}
                  <div className="font-normal text-blue-400">
                    Đã gửi {dayjs(doctor.inviteTime).fromNow()}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">{doctor.phone}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <IconDotsVertical size={16} />
                        </Button>
                      </DropdownTrigger>

                      <DropdownMenu aria-label="Doctor actions">
                        <DropdownItem
                          key="resend"
                          color="primary"
                          startContent={<IconSend2 size={16} />}
                          onPress={() => reInvite(doctor.id ?? "")}
                        >
                          Gửi lại
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          color="danger"
                          startContent={<IconX size={16} />}
                          onPress={() => removeInvite(doctor.id ?? "")}
                        >
                          Xóa lời mời
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
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
  );
}
