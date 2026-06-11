import { IconCheck } from "@/com/icons/outline";
import { IconChevronDown } from "@/com/icons/regular";
import React, { useEffect, useRef, useState } from "react";

const PROGESS_OPTIONS = ["0", "50", "100"];
const TECHNIQUE_OPTIONS = ["Thủ thuật A", "Thủ thuật B", "Thủ thuật C"];

export default function ProgressSelect(progress: any) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Nếu click vào button → không đóng dropdown
      if (buttonRef.current?.contains(target)) return;

      // Nếu click ra ngoài dropdown → đóng dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleOptionClick(value: string): void {
    // setSelectedValue(value);
    // setIsDropdownOpen(false);

    if (selectedValue === value) {
      setSelectedValue(null);
    } else {
      setSelectedValue(value);
    }

    setIsDropdownOpen(false);
  }

  return (
    <div className="relative w-full">
      <div>
        {/* Trigger */}
        <button
          ref={buttonRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex bg-white border-2 border-gray-300 rounded-2xl px-3 py-2.5 items-center justify-between hover:border-gray-600 transition-colors"
        >
          {/* Chưa chọn */}
          {selectedValue === null ? (
            <span className="ml-1 text-base font-medium text-blue-800">
              {progress.progress}
            </span>
          ) : (
            // Đã chọn
            <div className="flex items-center gap-4 flex-1">
              <span className="font-semibold text-blue-700">
                {selectedValue}
                {progress.progress === "Chọn tiến trình" ? "%" : ""}
              </span>

              {progress.progress === "Chọn tiến trình" ? (
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${selectedValue}%` }}
                  />
                </div>
              ) : (
                ""
              )}
            </div>
          )}

          <IconChevronDown
            size={18}
            className={`text-gray-600 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            {progress.progress === "Chọn tiến trình"
              ? PROGESS_OPTIONS.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleOptionClick(value)}
                    className={`w-full px-3 py-2.5 flex items-center justify-between transition-colors ${
                      selectedValue === value
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="font-semibold text-blue-700">
                        {value}%
                      </span>

                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>

                    {/* Icon check */}
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      {selectedValue === value && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <IconCheck
                            className="w-4 h-4 text-white"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </div>
                  </button>
                ))
              : TECHNIQUE_OPTIONS.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleOptionClick(value)}
                    className={`w-full px-3 py-2.5 flex items-center justify-between transition-colors ${
                      selectedValue === value
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="font-semibold text-blue-700">
                        {value}
                      </span>
                    </div>

                    {/* Icon check */}
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      {selectedValue === value && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <IconCheck
                            className="w-4 h-4 text-white"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
