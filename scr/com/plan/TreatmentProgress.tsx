import React, { useState } from "react";
import { IconCheck } from "@/com/icons/outline";
import { Select, SelectItem, Tab, Tabs, Textarea } from "@heroui/react";

import dayjs from "dayjs";
import "dayjs/locale/vi";
import localeData from "dayjs/plugin/localeData";
import { doctors, technicians } from "@/data/mockData";
import ProgressSelect from "./ProgressSelect";

dayjs.extend(localeData);

interface TreatmentProgressProps {
  onUpdate?: () => void;
}

const TREATMENTS = [
  { key: "tieu-phau", name: "Tiểu phẫu" },
  { key: "dieu-tri", name: "Điều trị" },
];

const SERVICE_DATA = [
  {
    name: "Trồng răng Implant",
    time: "14:49",
    date: "1/10/2025",
    amount: "0/1",
    progress: "Chọn tiến trình",
    doctor: "Chọn bác sĩ",
    technician: "Chọn KTV",
  },
  {
    name: "Cạo vôi răng",
    time: "14:49",
    date: "10/10/2025",
    amount: "0/1",
    progress: "Chọn thủ thuật",
    doctor: "Chọn bác sĩ",
    technician: "Chọn KTV",
  },
];

const TreatmentProgress = ({ onUpdate }: TreatmentProgressProps) => {
  const [selected, setSelected] = useState("tieu-phau");
  const [note, _setNote] = useState("Ghi chú điều trị");

  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState("");

  const handleFocus = () => {
    setIsFocus(true);
  };

  const handleTabChange = (key: string) => {
    setSelected(key);
    onUpdate?.();
  };

  const handleChairChange = (value: string) => {
    setValue(value);
    onUpdate?.();
  };

  const handleNoteChange = (value: string) => {
    setValue(value);
    onUpdate?.();
  };

  const formateDate = (item: any) => {
    dayjs.locale("vi");
    const dateObject = dayjs(item.date, "D/M/YYYY");
    return dateObject.format("dddd, D/M/YYYY");
  };

  return (
    <div className="mx-1 mb-6 w-full">
      <div className="flex flex-wrap items-center gap-6 mr-4">
        <Tabs
          selectedKey={selected}
          onSelectionChange={(key) => handleTabChange(key.toString())}
          size="lg"
          variant="underlined"
          aria-label="Room Tabs"
          className="flex min-w-60 gap-4"
          classNames={{ cursor: "hidden" }}
        >
          {TREATMENTS.map((treat) => (
            <Tab
              key={treat.key}
              title={
                <div
                  className={`flex items-center gap-14 px-3 py-2 rounded-full border transition-all ${
                    selected === treat.key
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <span className="font-semibold">{treat.name}</span>
                  <span
                    className={`w-5 h-5 rounded-full  flex items-center justify-center ${
                      selected === treat.key
                        ? "bg-blue-500 text-white"
                        : "border border-blue-500 text-white"
                    }`}
                  >
                    <IconCheck size={15} />
                  </span>
                </div>
              }
            ></Tab>
          ))}
        </Tabs>

        <div className="relative flex-1 min-w-48 border border-slate-200 rounded-2xl py-1">
          <Select
            aria-label="Chair Select"
            disableAnimation
            size="sm"
            variant="bordered"
            radius="lg"
            label={
              isFocus || value !== "" ? (
                ""
              ) : (
                <div className="flex gap-1">
                  <span>Chọn ghế nha</span>
                  <span className="text-red-500">*</span>
                </div>
              )
            }
            onClick={() => setIsFocus(true)}
            onFocus={handleFocus}
            onChange={(e) => {
              const insideValue = e.target.value;
              setValue(insideValue);
              insideValue === "" ? setIsFocus(false) : setIsFocus(true);
            }}
            value={value}
            onChangeCapture={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleChairChange(e.target.value)
            }
            className="w-full"
            classNames={{
              trigger: "border-none shadow-none py-0 h-8 min-h-8",
              value: "px-2",
            }}
          >
            <SelectItem key="1">Ghế nha 1</SelectItem>
            <SelectItem key="2">Ghế nha 2</SelectItem>
            <SelectItem key="3">Ghế nha 3</SelectItem>
          </Select>
        </div>
      </div>

      <div className="my-7 mx-4 border border-gray-500 bg-white rounded-2xl">
        <table>
          <thead className="">
            <tr className="">
              <th className="text-left text-gray-600 p-3 font-medium w-10 bg-gray-300 rounded-tl-2xl">
                #
              </th>
              <th className="text-left text-gray-600 font-medium w-3/12 bg-gray-300">
                Dịch vụ
              </th>
              <th className="text-left text-gray-600 font-medium w-22 bg-gray-300">
                Số lượng
              </th>
              <th className="text-left text-gray-600 font-medium w-3/12 bg-gray-300">
                Tiến trình
              </th>
              <th className="text-left text-gray-600 font-medium w-35 bg-gray-300">
                Bác sĩ
              </th>
              <th className="text-left text-gray-600 font-medium w-35 bg-gray-300 rounded-tr-2xl">
                Kỹ thuật viên
              </th>
            </tr>
          </thead>

          <tbody className="">
            {SERVICE_DATA.map((data, idx) => (
              <tr
                key={idx}
                className="border-t border-gray-500 hover:bg-gray-50"
              >
                <td className="flex items-start justify-end pt-2 pb-4 px-3 text-blue-800">
                  {idx + 1}
                </td>

                <td className="pt-2 pb-4">
                  <div className="text-blue-800 font-semibo${id}/ld mb-1">
                    {data.name}
                  </div>
                  <span className=" text-gray-600 text-sm">
                    Chốt lúc {data.time}, {formateDate(data)}
                  </span>
                </td>

                <td className="text-blue-800 pr-5 text-right">0/1</td>

                <td className="text-blue-800 pr-5">
                  <ProgressSelect progress={data.progress} />
                </td>

                <td className="text-blue-800 px-2">
                  <Select
                    variant="bordered"
                    placeholder={data.doctor}
                    classNames={{
                      value: "text-blue-800 text-base",
                    }}
                  >
                    {doctors.map((doctor, idx) => (
                      <SelectItem key={idx}>{doctor.doctor}</SelectItem>
                    ))}
                  </Select>
                </td>

                <td className="text-blue-800 px-2">
                  <Select
                    variant="bordered"
                    placeholder={data.technician}
                    classNames={{
                      value: "text-blue-800 text-base",
                    }}
                  >
                    {technicians.map((technician, idx) => (
                      <SelectItem key={idx}>{technician.name}</SelectItem>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Textarea
        radius="lg"
        value={note}
        onChange={(e) => handleNoteChange(e.target.value)}
        className="px-4"
        classNames={{
          inputWrapper: "p-0 m-0",
          input: "py-3 px-4 text-base",
        }}
      />
    </div>
  );
};
export default TreatmentProgress;
