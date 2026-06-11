"use client";

import React, { useEffect, useState } from "react";
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
  useDisclosure,
} from "@heroui/react";
import { IconDotsVertical, IconPlus } from "@/com/icons/outline";
import rest from "@/lib/rest";
import { prop } from "remeda";
import RoomCreateModal from "@/com/clinic/RoomCreateModal";
import { BranchSaas } from "@/types/define.d";

type RoomItem = {
  id: string;
  Name: string;
  Type: string;
  BranchId?: string;
  RoomTypeId?: string;
};

type RoomModalMode = "create" | "edit";

const LIMIT = 20;

export default function RoomPage() {
  const [roomData, setRoomData] = useState<RoomItem[]>([]);
  const [branches, setBranches] = useState<BranchSaas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lmstart, setLmstart] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [modalMode, setModalMode] = useState<RoomModalMode>("create");
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchClinic = async (start = lmstart) => {
    setIsLoading(true);
    try {
      const res = await rest.get(`/clinic?limit=${LIMIT}&lmstart=${start}`);
      const data = prop(res, "data", "module", "views", 0, "data");

      const totalFromView = Number(
        prop(res, "data", "module", "views", 0, "total") ??
          prop(res, "data", "module", "views", 0, "TotalRow") ??
          prop(res, "data", "module", "views", 0, "count") ??
          (Array.isArray(data) && data.length > 0
            ? (data[0] as Record<string, unknown>).TotalRow
            : 0),
      );

      setTotalItems(Number.isFinite(totalFromView) ? totalFromView : 0);

      const mappedRooms: RoomItem[] = data.map(
        (item: Record<string, unknown>, index: number) => ({
          id:
            String(item.RoomId ?? `room-${start + index}`) ||
            `room-${start + index}`,
          Name: String(item.Name) || "-",
          Type: String(item.Type) || "-",
          BranchId: String(item.BranchId ?? ""),
          RoomTypeId: String(item.RoomTypeId ?? ""),
        }),
      );

      setRoomData(mappedRooms);
    } catch {
      setRoomData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchClinic(lmstart);
  }, [lmstart]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await rest.get("/branch");

        if (res.status === 200 || res.status === 201) {
          setBranches(Array.isArray(res.data.data) ? res.data.data : []);
        }
      } catch {
        setBranches([]);
      }
    };

    void fetchBranches();
  }, []);

  const handleSubmitRoom = async (payload: {
    roomId?: string;
    name: string;
    branchId: string;
    roomType: string;
  }) => {
    try {
      const formData = new FormData();
      if (payload.roomId) {
        formData.append("RoomId", payload.roomId);
      }
      formData.append("Name", payload.name);
      formData.append("BranchId", payload.branchId);
      formData.append("RoomTypeId", payload.roomType);

      const res = await rest.post("/clinic", formData);
      if (res.status === 200 || res.status === 201) {
        if (lmstart === 0) {
          void fetchClinic(0);
        } else {
          setLmstart(0);
        }
        addToast({
          color: "success",
          description:
            modalMode === "edit"
              ? `Cập nhật thành công: ${payload.name}`
              : `Tạo phòng thành công: ${payload.name}`,
        });
      }
    } catch {
      addToast({
        color: "danger",
        description:
          modalMode === "edit"
            ? `Cập nhật phòng thất bại: ${payload.name}`
            : `Tạo phòng thất bại: ${payload.name}`,
      });
    }
  };

  const handleEditRoom = (room: RoomItem) => {
    setEditingRoom(room);
    setModalMode("edit");
    onOpen();
  };

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setModalMode("create");
    onOpen();
  };

  const handleCloseModal = () => {
    setEditingRoom(null);
    setModalMode("create");
    onClose();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Phòng</h1>

        <Button color="primary" className="pr-6" onPress={handleOpenCreate}>
          <IconPlus size={20} />
          Thêm mới
        </Button>
      </div>

      <Table
        aria-label="Danh sách phòng khám"
        shadow="none"
        classNames={{
          wrapper: "p-0 rounded-none",
          table: "p-0",
          th: "text-sm text-gray-700 font-medium",
        }}
      >
        <TableHeader>
          <TableColumn className="w-16">#</TableColumn>
          <TableColumn className="font-bold">Tên phòng khám</TableColumn>
          <TableColumn className="font-bold">Loại</TableColumn>
          <TableColumn className="w-16 text-center">Tuỳ chỉnh</TableColumn>
        </TableHeader>

        <TableBody
          emptyContent={isLoading ? "Đang tải..." : "Không có dữ liệu"}
        >
          {roomData.map((room, index) => (
            <TableRow key={room.id}>
              <TableCell>{lmstart + index + 1}</TableCell>
              <TableCell>{room.Name}</TableCell>
              <TableCell>{room.Type}</TableCell>
              <TableCell className="text-center">
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <IconDotsVertical size={16} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Room actions">
                    <DropdownItem
                      key="edit"
                      onPress={() => handleEditRoom(room)}
                    >
                      Chỉnh sửa
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalItems > LIMIT && (
        <div className="flex justify-center mt-4">
          <Pagination
            total={Math.ceil(totalItems / LIMIT)}
            page={Math.floor(lmstart / LIMIT) + 1}
            onChange={(page) => setLmstart((page - 1) * LIMIT)}
            showControls
            radius="full"
          />
        </div>
      )}

      <RoomCreateModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        branches={branches}
        mode={modalMode}
        initialData={
          modalMode === "edit" && editingRoom
            ? {
                roomId: editingRoom.id,
                name: editingRoom.Name,
                branchId: editingRoom.BranchId || "",
                roomType: editingRoom.Type || "",
              }
            : null
        }
        onSubmit={handleSubmitRoom}
      />
    </>
  );
}
