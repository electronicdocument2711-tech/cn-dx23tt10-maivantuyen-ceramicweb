import { Button } from "@heroui/react";
import { useState } from "react";
import { ProcessStepsModal } from "./ProcessStepsModal";

type ServiceRow = Record<string, string | number | boolean | null>;

type StepTwoEditorProps = {
  rows: ServiceRow[];
  processRowsByIndex: Record<number, ServiceRow[]>;
  selectedRowIndex: number | null;
  processFileNameByIndex: Record<number, string | null>;
  processFileSizeByIndex: Record<number, number | null>;
  onCellChange: (
    rowIndex: number,
    column: string,
    value: string | boolean,
  ) => void;
  onProcessCellChange: (
    parentRowIndex: number,
    rowIndex: number,
    column: string,
    value: string | boolean,
  ) => void;
  onProcessFileUpload: (rowIndex: number, file: File) => void;
  onSelectProcessRow: (rowIndex: number) => void;
  onBack: () => void;
  onNext: () => void;
};

const numberColumns = new Set([
  "Giá dịch vụ",
  "Phần trăm điều trị",
  "Số ngày đến bước tiếp theo",
  "Doanh thu công ty giá trị",
  "Doanh thu phòng khám giá trị",
  "Thu nhập BS Tư vấn giá trị",
  "Thu nhập BS Điều trị giá trị",
  "Thu nhập BS HTCM giá trị",
  "Thu nhập điều dưỡng giá trị",
]);

const percentOptions = ["Phần trăm", "Số tiền"];
const specialtyOptions = ["Thẩm mỹ"];
const positionOptions = ["Răng"];
const selectColumnOptions: Record<string, string[]> = {
  "Doanh thu công ty loại": percentOptions,
  "Doanh thu phòng khám loại": percentOptions,
  "Thu nhập BS Tư vấn loại": percentOptions,
  "Thu nhập BS Điều trị loại": percentOptions,
  "Thu nhập BS HTCM loại": percentOptions,
  "Thu nhập điều dưỡng loại": percentOptions,
  "Chuyên khoa": specialtyOptions,
  "Vị trí": positionOptions,
};
const checkboxColumns = new Set(["Dịch vụ nhạy cảm"]);

export const StepTwoEditor = ({
  rows,
  processRowsByIndex,
  selectedRowIndex,
  processFileNameByIndex,
  onCellChange,
  onProcessCellChange,
  onProcessFileUpload,
  onSelectProcessRow,
  onBack,
  onNext,
}: StepTwoEditorProps) => {

  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const columns = rows[0] ? Object.keys(rows[0]) : [];
  const selectedProcessRows =
    selectedRowIndex !== null
      ? processRowsByIndex[selectedRowIndex]
      : undefined;

  const openProcessModal = (rowIndex: number) => {
    onSelectProcessRow(rowIndex);
    setIsProcessModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Dữ liệu CSV</div>
        <div className="text-slate-600">
          Tổng dòng: <b>{rows.length}</b>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-slate-500">Không có dữ liệu để hiển thị.</div>
      ) : (
        <div className="overflow-auto border border-slate-200 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left font-semibold px-3 py-2 border-b border-slate-200 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-white even:bg-slate-50">
                  {columns.map((col) => {
                    const normalizedCol = col.trim();
                    const cellValue =
                      row[col] === null || row[col] === undefined
                        ? ""
                        : String(row[col]);

                    const isProcessColumn = normalizedCol === "Tiến trình";
                    const selectOptions = selectColumnOptions[normalizedCol];
                    const isCheckbox = checkboxColumns.has(normalizedCol);
                    const isNumber = numberColumns.has(normalizedCol);

                    return (
                      <td
                        key={`${rowIndex}-${col}`}
                        className="px-3 py-2 border-b border-slate-200 whitespace-nowrap"
                      >
                        {isProcessColumn ? (
                          processFileNameByIndex[rowIndex] ? (
                            <button
                              type="button"
                              className="text-blue-600 hover:underline"
                              onClick={() => openProcessModal(rowIndex)}
                            >
                              Xem tiến trình
                            </button>
                          ) : (
                            <label className="inline-flex items-center gap-2 cursor-pointer text-blue-600 hover:underline">
                              <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  onProcessFileUpload(rowIndex, file);
                                }}
                              />
                              Tải tiến trình
                            </label>
                          )
                        ) : isCheckbox ? (
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={cellValue === "true" || cellValue === "1"}
                            onChange={(e) =>
                              onCellChange(rowIndex, col, e.target.checked)
                            }
                          />
                        ) : selectOptions ? (
                          <select
                            className="w-full bg-transparent outline-none focus:ring-2 focus:ring-blue-200 rounded px-1"
                            value={cellValue}
                            onChange={(e) =>
                              onCellChange(rowIndex, col, e.target.value)
                            }
                          >
                            <option value="">Chọn</option>
                            {selectOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className="w-full bg-transparent outline-none focus:ring-2 focus:ring-blue-200 rounded px-1"
                            value={cellValue}
                            type={isNumber ? "number" : "text"}
                            onChange={(e) =>
                              onCellChange(rowIndex, col, e.target.value)
                            }
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProcessStepsModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        serviceCode={String(rows[selectedRowIndex ?? 0]?.["Mã dịch vụ"] ?? "")}
        rows={selectedProcessRows}
        onCellChange={(rowIndex, column, value) =>
          onProcessCellChange(selectedRowIndex ?? 0, rowIndex, column, value)
        }
      />

      <div className="flex justify-end gap-3">
        <Button variant="light" onPress={onBack}>
          Back
        </Button>
        <Button color="primary" onPress={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
