import React, { useState } from "react";
import { Select, SelectItem, SharedSelection } from "@heroui/react";

export const colors = [
  {
    key: "0",
    label: "Mặc định",
    bg: "bg-white",
    border: "border-slate-200",
    text: "text-black",
  },
  {
    key: "1",
    label: "Đỏ",
    bg: "bg-rose-100",
    border: "border-rose-300",
    text: "text-yellow-800",
  },
  {
    key: "2",
    label: "Cam",
    bg: "bg-orange-100",
    border: "border-orange-300",
    text: "text-orange-800",
  },
  {
    key: "3",
    label: "Vàng",
    bg: "bg-yellow-100",
    border: "border-yellow-300",
    text: "text-yellow-800",
  },
  {
    key: "4",
    label: "xanh lá",
    bg: "bg-green-100",
    border: "border-green-300",
    text: "text-green-800",
  },
  {
    key: "5",
    label: "Xanh da trời",
    bg: "bg-sky-100",
    border: "border-sky-300",
    text: "text-sky-800",
  },
  {
    key: "6",
    label: "Xanh dương",
    bg: "bg-blue-100",
    border: "border-blue-500",
    text: "text-blue-800",
  },
  {
    key: "7",
    label: "Tím",
    bg: "bg-purple-100",
    border: "border-purple-500",
    text: "text-purple-800",
  },
];

interface ColorSelectProps {
  onColorChange?: (color: {
    key: string;
    bg: string;
    border: string;
    text: string;
  }) => void;
}

export default function ColorSelect({ onColorChange }: ColorSelectProps) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(["0"]));

  // useEffect(() => {
  // const defaultColor = colors.find((c) => c.key === "0");
  // if (defaultColor && onColorChange) {
  //   onColorChange({
  //     key: defaultColor.key,
  //     bg: defaultColor.bg,
  //     border: defaultColor.border,
  //     text: defaultColor.text,
  //   });
  // }
  // }, [onColorChange]);

  const handleSelectionChange = (keys: SharedSelection) => {
    const selectedKey = keys === "all" ? "0" : Array.from(keys as Set<string>)[0] || "0";
    setSelectedKeys(new Set([selectedKey]));

    const selectedColor = colors.find((c) => c.key === selectedKey);
    if (selectedColor && onColorChange) {
      onColorChange({
        key: selectedColor.key,
        bg: selectedColor.bg,
        border: selectedColor.border,
        text: selectedColor.text,
      });
    }
  };

  return (
    <div className="mt-2">
      <div className="text-sm mb-2">Màu sắc</div>

      <Select
        variant="bordered"
        items={colors}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        renderValue={(items) => {
          return items.map((item) => (
            <div key={item.key} className="flex gap-3 items-center">
              <div
                className={`cursor-pointer p-2 lex h-6 w-6 rounded-lg border ${item.data?.border} ${item.data?.bg}`}
              />

              <div className={`${item.data?.text}`}>{item.data?.label}</div>
            </div>
          ));
        }}
      >
        {(color) => (
          <SelectItem key={color.key}>
            <div className="flex gap-3 items-center">
              <div
                className={`cursor-pointer p-2 lex h-6 w-6 rounded-lg border ${color.border} ${color.bg}`}
              />

              <div className={`${color.text}`}>{color.label}</div>
            </div>
          </SelectItem>
        )}
      </Select>
    </div>
  );
}
