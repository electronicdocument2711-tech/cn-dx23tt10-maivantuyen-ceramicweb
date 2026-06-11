import React, { useMemo, useState } from "react";

import { Customer } from "@/types/define.d";
import {
  Button,
  Chip,
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
} from "@heroui/react";
import { IconDotsVertical, IconEdit, IconTrash } from "@/com/icons/outline";

interface TableProps {
  customers: Customer[];
  onDeleteCustomer: (id: number) => void;
}

function StatusBadge({ status }: { status: Customer["Status"] }) {
  const isActive = status === "active";

  return (
    <Chip
      size="lg"
      variant="flat"
      // color={status === "active" ? "success" : "warning"}
      className="rounded-md px-3 py-1"
      classNames={{
        base: isActive
          ? "bg-emerald-100 text-green-700"
          : "bg-rose-50 text-red-600",
        content: "font-semibold",
      }}
    >
      {status === "active" ? "Đang sử dụng" : "Ngừng sử dụng"}
    </Chip>
  );
}

export default function CustomerCategoryTable({
  customers,
  onDeleteCustomer,
}: TableProps) {
  const [searchTerm, _setSearchTerm] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<any>({});

  // Display Rooms
  const displayedCustomers = useMemo(() => {
    const arr = [...customers];
    if (!sortDescriptor.column) return arr;

    // Sorting Logic
    arr.sort((a, b) => {
      let aValue = a[sortDescriptor.column as keyof Customer];
      let bValue = b[sortDescriptor.column as keyof Customer];

      if (aValue === undefined || bValue === undefined) return 0;

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (sortDescriptor.direction === "ascending") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return arr;
  }, [customers, searchTerm, sortDescriptor]);

  return (
    <>
      <Table
        aria-label="Service table"
        shadow="none"
        radius="none"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
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

          <TableColumn key="name" className="font-bold" allowsSorting>
            Nhóm khách hàng
          </TableColumn>

          <TableColumn key="disc" allowsSorting>
            Mô tả
          </TableColumn>

          <TableColumn key="status" allowsSorting>
            Tình trạng
          </TableColumn>

          <TableColumn key="action" className="w-12">
            {""}
          </TableColumn>
        </TableHeader>

        <TableBody emptyContent="Không có dữ liệu">
          {displayedCustomers.map((customer, uid) => (
            <TableRow
              key={uid}
              className="border-b border-slate-300 hover:bg-gray-50"
            >
              <TableCell>{uid + 1}</TableCell>
              <TableCell className="font-bold">{customer.FullName}</TableCell>
              <TableCell>{customer.CustomerCode}</TableCell>
              <TableCell>
                <StatusBadge status={customer.Status} />
              </TableCell>
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
                    >
                      Chinrh sửa
                    </DropdownItem>

                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<IconTrash size={16} />}
                      onPress={() => onDeleteCustomer(uid)}
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
    </>
  );
}
