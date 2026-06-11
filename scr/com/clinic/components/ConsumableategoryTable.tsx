import React, { useMemo, useState } from 'react';

import { Consumable } from '@/types/define.d';
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
} from '@heroui/react';
import { IconDotsVertical, IconEdit, IconTrash } from '@/com/icons/outline';

interface TableProps {
  consumables: Consumable[];
  onDeleteConsumable: (id: number) => void;
}

function StatusBadge({ status }: { status: Consumable['status'] }) {
  const isActive = status === 'active';

  return (
    <Chip
      size="lg"
      variant="flat"
      // color={status === "active" ? "success" : "warning"}
      className="rounded-md px-3 py-1"
      classNames={{
        base: isActive
          ? 'bg-emerald-100 text-green-700'
          : 'bg-rose-50 text-red-600',
        content: 'font-semibold',
      }}
    >
      {status === 'active' ? 'Đang sử dụng' : 'Ngừng sử dụng'}
    </Chip>
  );
}

export default function ConsumableCategoryTable({
  consumables,
  onDeleteConsumable,
}: TableProps) {
  const [searchTerm, _setSearchTerm] = useState('');
  const [sortDescriptor, setSortDescriptor] = useState<any>({});

  // Display Rooms
  const displayedConsumables = useMemo(() => {
    const arr = [...consumables];
    if (!sortDescriptor.column) return arr;

    // Sorting Logic
    arr.sort((a, b) => {
      let aValue = a[sortDescriptor.column as keyof Consumable];
      let bValue = b[sortDescriptor.column as keyof Consumable];

      if (aValue === undefined || bValue === undefined) return 0;

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortDescriptor.direction === 'ascending') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return arr;
  }, [consumables, searchTerm, sortDescriptor]);

  return (
    <>
      <Table
        aria-label="Service table"
        shadow="none"
        radius="none"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        classNames={{
          wrapper: 'p-0 rounded-none',
          table: 'p-0',
          th: 'text-sm text-gray-700 font-medium',
        }}
      >
        <TableHeader>
          <TableColumn key="id" className="w-12">
            #
          </TableColumn>

          <TableColumn key="tool" className="font-bold" allowsSorting>
            Nhóm vật tư
          </TableColumn>

          <TableColumn key="category" allowsSorting>
            Mô tả
          </TableColumn>

          <TableColumn key="count" allowsSorting>
            Tình trạng
          </TableColumn>

          <TableColumn key="action" className="w-12" allowsSorting>
            {''}
          </TableColumn>
        </TableHeader>

        <TableBody emptyContent="Không có dữ liệu">
          {displayedConsumables.map((consumable, uid) => (
            <TableRow
              key={uid}
              className="border-b border-slate-300 hover:bg-gray-50"
            >
              <TableCell>{uid + 1}</TableCell>
              <TableCell className="font-bold">{consumable.name}</TableCell>
              <TableCell>{consumable.disc}</TableCell>
              <TableCell>
                <StatusBadge status={consumable.status} />
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
                      onPress={() => onDeleteConsumable(uid)}
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
