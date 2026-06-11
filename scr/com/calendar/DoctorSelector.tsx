"use client";

import {
  Button,
  Checkbox,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from "@heroui/react";
import { IconChevronDown, IconUsers } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { roleDisplayCalendar } from "@/data/roles";
import { useAppContext } from "@/context/AppContext";

interface DoctorSelectorProps {
  selectedDoctorIds: Set<string>;
  toggleDoctor: (doctorId: string) => void;
}

const DoctorSelector: React.FC<DoctorSelectorProps> = ({
  selectedDoctorIds,
  toggleDoctor,
}) => {
  const { staffs, staffsLoading } = useAppContext();

  const [isDoctorPopoverOpen, setDoctorPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const calendarStaffs = useMemo(
    () =>
      staffs.filter((s) =>
        roleDisplayCalendar.includes(Number(s.business_role?.id)),
      ),
    [staffs],
  );

  const filteredStaffs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return calendarStaffs;
    return calendarStaffs.filter((s) => s.name.toLowerCase().includes(search));
  }, [calendarStaffs, searchTerm]);

  const renderContent = () => {
    if (staffsLoading)
      return (
        <div className="min-h-25 flex justify-center items-center text-gray-600 text-xs text-center">
          <Spinner size="sm" />
        </div>
      );

    if (!filteredStaffs?.length)
      return (
        <div className="min-h-25 flex justify-center items-center text-gray-600 text-xs text-center">
          Chưa có dữ liệu bác sĩ
        </div>
      );

    return (
      <div className="flex flex-col max-w-64 gap-1.5 overflow-y-auto">
        {filteredStaffs.map((s) => (
          <Checkbox
            key={s.id}
            isSelected={selectedDoctorIds.has(String(s.id))}
            onValueChange={() => toggleDoctor(String(s.id))}
            classNames={{
              base: "p-0 m-0",
              label: "p-0 m-0",
            }}
          >
            {s.name}
          </Checkbox>
        ))}
      </div>
    );
  };

  return (
    <Popover
      placement="bottom-end"
      isOpen={isDoctorPopoverOpen}
      onOpenChange={setDoctorPopoverOpen}
    >
      <PopoverTrigger>
        <Button
          variant="bordered"
          size="sm"
          className="font-medium text-base"
          startContent={<IconUsers size={18} />}
          endContent={<IconChevronDown size={18} />}
        >
          {selectedDoctorIds?.size === 0
            ? "Xem theo bác sĩ"
            : `${selectedDoctorIds?.size} bác sĩ`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <Input
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          isClearable
          onClear={() => setSearchTerm("")}
        />
        <div className="w-72 mt-4">{renderContent()}</div>
      </PopoverContent>
    </Popover>
  );
};

export default DoctorSelector;
