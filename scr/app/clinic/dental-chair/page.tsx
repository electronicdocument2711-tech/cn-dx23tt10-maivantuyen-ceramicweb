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
  // Table,
  // TableBody,
  // TableCell,
  // TableColumn,
  // TableHeader,
  // TableRow,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { IconEdit, IconPlus } from "@/com/icons/outline";
import rest from "@/lib/rest";
import { prop } from "remeda";
import DentalChairCreateModal from "@/com/clinic/DentalChairCreateModal";
import { IconDotsVertical } from "@tabler/icons-react";
import { useAppContext } from "@/context";
// import { useConfirm } from "@/com/ConfirmProvider";

type ChairItem = {
  id: string;
  chairCode: string;
  createdDate: string;
  state: string;
  branchId?: string;
};

type ChairModalMode = "create" | "edit";

const LIMIT = 20;
const ALL_BRANCHES_KEY = "all";

export default function RoomPage() {
  const { branch, branches } = useAppContext();

  const [chairData, setChairData] = useState<ChairItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lmstart, setLmstart] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [modalMode, setModalMode] = useState<ChairModalMode>("create");
  const [editingChair, setEditingChair] = useState<ChairItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const { confirm } = useConfirm();

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branch?.BranchId || "",
  );

  const visibleChairData = selectedBranchId
    ? chairData.filter(
        (chair) => String(chair.branchId) === String(selectedBranchId),
      )
    : chairData;

  const fetchChairs = async (start = lmstart) => {
    setIsLoading(true);
    try {
      const res = await rest.get(`/chairs?limit=${LIMIT}&lmstart=${start}`);

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

      const mappedData: ChairItem[] = data.map(
        (item: Record<string, unknown>, index: number) => ({
          id: String(item.DentalChairId ?? `chair-${start + index}`),
          chairCode: String(item.DentalChairCode ?? "-"),
          createdDate: String(item.CreatedDate ?? "-"),
          state: String(item.State ?? "-"),
          branchId: String(item.BranchId ?? ""),
        }),
      );

      setChairData(mappedData);
    } catch {
      setChairData([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchChairs(lmstart);
  }, [lmstart]);

  const handleSubmitChair = async (payload: {
    chairId?: string;
    chairCode: string;
    branchId: string;
    state?: string;
  }) => {
    try {
      const formData = new FormData();
      if (payload.chairId) {
        formData.append("DentalChairId", payload.chairId);
      }
      formData.append("DentalChairCode", payload.chairCode);
      formData.append("BranchId", payload.branchId);
      formData.append("State", payload?.state ?? "1");

      const res = await rest.post("/chairs", formData);
      if (res.status === 200 || res.status === 201) {
        if (lmstart === 0) {
          void fetchChairs(0);
        } else {
          setLmstart(0);
        }
        addToast({
          color: "success",
          description:
            modalMode === "edit"
              ? `Cập nhật ghế thành công: ${payload.chairCode}`
              : `Tạo ghế thành công: ${payload.chairCode}`,
        });
      }
    } catch {
      addToast({
        color: "danger",
        description:
          modalMode === "edit"
            ? `Cập nhật ghế thất bại: ${payload.chairCode}`
            : `Tạo ghế thất bại: ${payload.chairCode}`,
      });
    }
  };

  const handleEditChair = (chair: ChairItem) => {
    setEditingChair(chair);
    setModalMode("edit");
    onOpen();
  };

  const handleOpenCreate = () => {
    setEditingChair(null);
    setModalMode("create");
    onOpen();
  };

  const handleCloseModal = () => {
    setEditingChair(null);
    setModalMode("create");
    onClose();
  };

  // const handleToggleChairState = async (chairData: any) => {
  //   try {
  //     await handleSubmitChair({
  //       chairId: chairData.id,
  //       chairCode: chairData.chairCode,
  //       branchId: chairData.branchId || "",
  //       state: chairData.state === "1" ? "2" : "1",
  //     });

  //     addToast({
  //       color: "success",
  //       description: `Đã chuyển trạng thái ghế ${chairData?.chairCode} thành ${parseInt(chairData?.state, 10) > 1 ? "chưa sử dụng" : "đang sử dụng"}`,
  //     });

  //     setChairData((prev) =>
  //       prev.map((chair) =>
  //         chair.id === chairData.id
  //           ? { ...chair, state: chair.state === "1" ? "2" : "1" }
  //           : chair,
  //       ),
  //     );
  //   } catch {
  //     addToast({
  //       color: "danger",
  //       description: `Chuyển trạng thái ghế ${chairData.chairCode} thất bại`,
  //     });
  //   }
  // };

  // const requestInActiveChair = async (chairData: any) => {
  //   try {
  //     const currentState = parseInt(chairData?.state, 10);

  //     await confirm({
  //       message:
  //         currentState === 1
  //           ? "Bạn có chắc muốn chuyển trạng thái ghế này thành chưa sử dụng?"
  //           : "Bạn có chắc muốn chuyển trạng thái ghế này thành đang sử dụng?",
  //       type: "warning",
  //       handler: () => handleToggleChairState(chairData),
  //     });
  //   } catch {}
  // };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Phòng/Ghế nha</h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            aria-label="Lọc theo chi nhánh"
            className="w-full sm:w-64"
            selectedKeys={[selectedBranchId || ALL_BRANCHES_KEY]}
            placeholder="Tất cả chi nhánh"
            onSelectionChange={(keys) => {
              const selectedKey = String(
                Array.from(keys)[0] || ALL_BRANCHES_KEY,
              );

              setSelectedBranchId(
                selectedKey === ALL_BRANCHES_KEY ? "" : selectedKey,
              );
            }}
          >
            <>
              <SelectItem key={ALL_BRANCHES_KEY}>Tất cả</SelectItem>

              {branches.map((branchItem) => (
                <SelectItem key={branchItem.BranchId}>
                  {branchItem.Name || "-"}
                </SelectItem>
              ))}
            </>
          </Select>

          <Button color="primary" className="pr-6" onPress={handleOpenCreate}>
            <IconPlus size={20} />
            Thêm mới
          </Button>
        </div>
      </div>

      <div
        aria-label="Danh sách ghế nha"
        // shadow="none"
        // classNames={{
        //   wrapper: "p-0 rounded-none",
        //   table: "p-0",
        //   th: "text-sm text-gray-700 font-medium",
        // }}
      >
        {/* <TableHeader>
          <TableColumn className="w-16">#</TableColumn>
          <TableColumn>Mã phòng/ghế nha</TableColumn>
          <TableColumn>Ngày tạo</TableColumn>
          <TableColumn className="w-16 text-center">Tuỳ chỉnh</TableColumn>
        </TableHeader> */}

        {/* <TableBody
          emptyContent={isLoading ? "Đang tải..." : "Không có dữ liệu"}
        >
          {chairData.map((chair, index) => (
            <TableRow key={chair.id}>
              <TableCell>{lmstart + index + 1}</TableCell>
              <TableCell>{chair.chairCode}</TableCell>
              <TableCell>{chair.createdDate}</TableCell>
              <TableCell className="text-center">
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <IconDotsVertical size={16} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Room actions">
                    <DropdownItem
                      key="edit"
                      onPress={() => handleEditChair(chair)}
                      startContent={<IconEdit size={18} />}
                    >
                      Chỉnh sửa
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody> */}
        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            Đang tải...
          </div>
        ) : visibleChairData.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            Không có dữ liệu
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 xl:grid-cols-2">
            {visibleChairData.map((chair) => {
              const getBranchName = (branchId?: string) => {
                const matchedBranch = branches.find(
                  (branchItem) =>
                    String(branchItem.BranchId) === String(branchId),
                );

                return matchedBranch?.Name || "-";
              };
              return (
                <div
                  key={chair.id}
                  className="rounded-2xl bg-white p-4 border border-slate-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="mt-1 text-base font-semibold text-blue-600">
                        {chair.chairCode}
                      </h2>
                    </div>

                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <IconDotsVertical size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Room actions">
                        <DropdownItem
                          key="edit"
                          onPress={() => handleEditChair(chair)}
                          startContent={<IconEdit size={18} />}
                        >
                          Chỉnh sửa
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="0">Chi nhánh</span>
                      <span className="text-right font-bold text-gray-800">
                        {getBranchName(chair.branchId)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

      <DentalChairCreateModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        initialData={
          modalMode === "edit" && editingChair
            ? {
                chairId: editingChair.id,
                chairCode: editingChair.chairCode,
                branchId: editingChair.branchId || "",
              }
            : {
                branchId: branch?.BranchId || undefined,
              }
        }
        onSubmit={handleSubmitChair}
      />
    </>
  );
}
