import { Checkbox, Input, Textarea } from "@heroui/react";
import React, { useState } from "react";

interface componentProps {
  onUpdate?: () => void;
}

const options = [
  { title: "Bệnh tỉnh, tiếp xúc tốt" },
  { title: "Da niêm hồng" },
  { title: "Nhập mạch và huyết áp", session: true },
  { title: "Tim đều, rõ" },
  { title: "Phổi trong, không ran" },
];

const DiseaseCourse = ({ onUpdate }: componentProps) => {
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});
  const [disc, setDisc] = useState("Nhập mô tả");
  const [diag, setDiag] = useState("Nhập chẩn đoán");

  const handleCheckboxChange = (idx: number, isSelected: boolean) => {
    setCheckedMap((prev) => ({ ...prev, [idx]: isSelected }));
    onUpdate?.(); //Gọi Callback
  };

  const handleDiscChange = (value: string) => {
    setDisc(value);
    onUpdate?.();
  };

  const handleDiagChange = (value: string) => {
    setDiag(value);
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

            {opt.session && checkedMap[idx] && (
              <div className="mx-8 mt-5 flex gap-6">
                <div>
                  <Input
                    variant="bordered"
                    placeholder="Mạch"
                    isRequired
                    className="w-48"
                    classNames={{
                      inputWrapper:
                        "p-0 m-0 overflow-hidden border-b border-gray-500 text-center",
                      input: "text-center border-b border-gray-500 mx-5",
                    }}
                    endContent={
                      <div className="flex h-full px-2 items-center justify-center border-l border-gray-500 bg-gray-100 text-slate-500">
                        lần/ph
                      </div>
                    }
                  />
                </div>

                <div>
                  <Input
                    variant="bordered"
                    className="w-48"
                    placeholder="Huyết áp"
                    isRequired
                    classNames={{
                      inputWrapper:
                        "p-0 m-0 overflow-hidden border-b border-gray-500 text-center",
                      input: "text-center border-b border-gray-500 mx-5",
                    }}
                    endContent={
                      <div className="flex h-full px-2 items-center justify-center border-l border-gray-500 bg-gray-100 text-slate-500">
                        mmHg
                      </div>
                    }
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-7">
        <h2 className="text-base font-semibold">Mô tả tình trạng răng nướu</h2>

        <Textarea
          value={disc}
          onChange={(e) => handleDiscChange(e.target.value)}
          className="mt-3"
          minRows={2}
          classNames={{
            inputWrapper: "p-0 m-0 rounded-2xl",
            input: "my-3 mx-4 text-base",
          }}
        />
      </div>

      <div className="mt-7">
        <h2 className="text-base font-semibold">
          Chẩn đoán <span className="text-red-500">*</span>
        </h2>

        <Textarea
          value={diag}
          onChange={(e) => handleDiagChange(e.target.value)}
          className="mt-3"
          minRows={2}
          classNames={{
            inputWrapper: "p-0 m-0 rounded-2xl",
            input: "my-3 mx-4 text-base",
          }}
        />
      </div>
    </div>
  );
};

export default DiseaseCourse;
