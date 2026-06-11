import React, { useState } from "react";
import { Checkbox } from "@heroui/react";

interface DischargeNoteProps {
  onUpdate?: () => void;
}

const DischargeNote = ({ onUpdate }: DischargeNoteProps) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, _setYear] = useState("");

  const [appointment, setAppointment] = useState("");

  const [checkboxes, setCheckboxes] = useState({
    consultation: false,
    hygiene: false,
    medicine: false,
    periodicCheckup: false,
    appointmentDate: false,
  });

  const handleDayChange = (e: any) => {
    const value = e.target.value.replace(/\D/g, ""); //Number only
    if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 31)) {
      setDay(value.slice(0, 2)); // 2 text limit
      onUpdate?.();
    }
  };

  const handleMonthChange = (e: any) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
      setMonth(value.slice(0, 2));
      onUpdate?.();
    }
  };

  const handleYearChange = (e: any) => {
    const value = e.target.value.replace(/\D/g, "");
    setAppointment(value.slice(0, 4));
    onUpdate?.();
  };

  const handleMonthAppointment = (e: any) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
      setAppointment(value.slice(0, 2));
      onUpdate?.();
    }
  };

  const handleCheckboxChange = (
    key: keyof typeof checkboxes,
    value: boolean
  ) => {
    setCheckboxes((prev) => ({ ...prev, [key]: value }));
    onUpdate?.();
  };

  const validateDate = () => {
    if (!day || !month || !year) return false;

    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    const DaysInMonth = new Date(y, m, 0).getDate();
    if (d > DaysInMonth) return false;

    return true;
  };

  const isValid = validateDate();

  return (
    <div className="px-3 mb-6">
      <div className="mt-6 rounded-2xl border border-gray-400">
        <div className="px-4 py-3 border-b border-gray-400">
          <Checkbox
            isSelected={checkboxes.consultation}
            onValueChange={(value) =>
              handleCheckboxChange("consultation", value)
            }
          >
            Hỗ trợ bác sĩ ghi chú tư vấn
          </Checkbox>
        </div>

        <div className="px-4 py-3 border-b border-gray-400">
          <Checkbox
            isSelected={checkboxes.hygiene}
            onValueChange={(value) => handleCheckboxChange("hygiene", value)}
          >
            Hướng dẫn vệ sinh răng miệng
          </Checkbox>
        </div>

        <div className="px-4 py-3 border-b border-gray-400">
          <Checkbox
            isSelected={checkboxes.medicine}
            onValueChange={(value) => handleCheckboxChange("medicine", value)}
          >
            Uống thuốc theo toa
          </Checkbox>
        </div>

        <div className="px-4 py-3 border-b border-gray-400">
          <Checkbox
            isSelected={checkboxes.periodicCheckup}
            onValueChange={(value) =>
              handleCheckboxChange("periodicCheckup", value)
            }
          >
            <span>Tái khám định kỳ mỗi</span>
          </Checkbox>
          <input
            type="text"
            value={appointment}
            onChange={handleMonthAppointment}
            className="w-8 mx-2 text-center border-b focus:outline-none"
          />
          <span>tháng</span>
        </div>

        <div>
          <div className="px-4 py-3">
            <Checkbox
              isSelected={checkboxes.appointmentDate}
              onValueChange={(value) =>
                handleCheckboxChange("appointmentDate", value)
              }
            >
              <div className="flex items-center">
                <span>Hẹn tái khám ngày </span>
              </div>
            </Checkbox>

            <input
              type="text"
              placeholder="DD"
              value={day}
              onChange={handleDayChange}
              className="w-8 mx-2 text-center border-b focus:outline-none"
            />
            <span>/</span>
            <input
              type="text"
              placeholder="MM"
              value={month}
              onChange={handleMonthChange}
              className="w-8 mx-2 text-center border-b focus:outline-none"
            />
            <span>/</span>
            <input
              type="text"
              placeholder="YYYY"
              value={year}
              onChange={handleYearChange}
              className="w-12 mx-2 text-center border-b focus:outline-none"
            />

            {!isValid && day && month && year && (
              <span className="pl-5 text-sm text-red-600">
                ✗ Ngày không hợp lệ
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DischargeNote;
