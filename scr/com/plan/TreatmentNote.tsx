import { Checkbox, Textarea } from "@heroui/react";
import React, { useState } from "react";

interface componentProps {
  onUpdate?: () => void;
}

const options = [
  { title: "Hỗ trợ bác sĩ ghi phiếu tư vấn" },
  { title: "Hướng dẫn bệnh nhân xét nghiệm" },
  { title: "Hướng dẫn bệnh nhân chụp phim" },
  { title: "Đưa bệnh nhân, khách hàng vào phòng thủ thuật" },
  { title: "Mắc monitoring theo dõi sinh hiệu liên tục" },
  { title: "Gây tê tại chỗ bằng" },
  { title: "Gây tê vùng bằng" },
];

export default function TreatmentNote({ onUpdate }: componentProps) {
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});
  const [note, setNote] = useState("Nhập ghi chú");
  const [applied, setApplied] = useState(false);

  const handleCheckboxChange = (idx: number, isSelected: boolean) => {
    setCheckedMap((prev) => ({ ...prev, [idx]: isSelected }));
    onUpdate?.(); //Gọi Callback
  };

  const handleDNoteChange = (value: string) => {
    setNote(value);
    onUpdate?.();
  };

  const handleApplyChange = (checked: boolean) => {
    setApplied(checked);
    onUpdate?.();
  };

  return (
    <div className="px-3 mb-6">
      <div className="border border-gray-500 rounded-3xl overflow-hidden">
        {options.map((opt, idx) => (
          <div
            key={idx}
            className={`p-4 hover:bg-gray-200 ${
              idx === options.length - 1 ? "" : "border-b"
            } border-gray-500`}
          >
            <Checkbox
              isSelected={checkedMap[idx] ?? false}
              onValueChange={(isSelected) =>
                handleCheckboxChange(idx, isSelected)
              }
            >
              <span className="ml-2 text-blue-800 font-medium">
                {opt.title}
              </span>
            </Checkbox>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <h2 className="text-base font-semibold">Khác</h2>

        <Textarea
          value={note}
          onChange={(e) => handleDNoteChange(e.target.value)}
          className="mt-3"
          minRows={2}
          classNames={{
            inputWrapper: "p-0 m-0 rounded-2xl",
            input: "my-3 mx-4 text-base",
          }}
        />
      </div>

      <div className="mt-12 border border-gray-500 rounded-3xl overflow-hidden">
        <div className={`p-4 hover:bg-gray-200 border-gray-500`}>
          <Checkbox
            isSelected={applied}
            onValueChange={(isSelected) => handleApplyChange(isSelected)}
          >
            <span className="ml-2 text-blue-800 font-medium">
              Cho bệnh nhân súc miệng bằng dung dịch
            </span>
          </Checkbox>
        </div>
      </div>
    </div>
  );
}
