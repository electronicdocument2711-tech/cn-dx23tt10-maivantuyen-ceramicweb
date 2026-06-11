import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";

type ServiceRow = Record<string, string | number | boolean | null>;

type ProcessStepsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  serviceCode: string;
  rows: ServiceRow[] | undefined;
  onCellChange: (
    rowIndex: number,
    column: string,
    value: string | boolean,
  ) => void;
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
const taxOptions = ["KCT", "0%", "5%", "10%"];
const selectColumnOptions: Record<string, string[]> = {
  "Doanh thu công ty loại": percentOptions,
  "Doanh thu phòng khám loại": percentOptions,
  "Thu nhập BS Tư vấn loại": percentOptions,
  "Thu nhập BS Điều trị loại": percentOptions,
  "Thu nhập BS HTCM loại": percentOptions,
  "Thu nhập điều dưỡng loại": percentOptions,
  Thuế: taxOptions,
};
const checkboxColumns = new Set(["Dịch vụ nhạy cảm"]);

export const ProcessStepsModal = ({
  isOpen,
  onClose,
  serviceCode,
  rows,
  onCellChange,
}: ProcessStepsModalProps) => {
  const columns = rows?.[0] ? Object.keys(rows[0]) : [];

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="5xl"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Danh sách tiến trình
            </ModalHeader>
            <ModalBody>
              <div className="text-sm text-slate-600">
                Mã dịch vụ: {serviceCode}
              </div>

              {!rows || rows.length === 0 ? (
                <div className="text-slate-500">
                  Chưa có dữ liệu tiến trình cho dịch vụ này.
                </div>
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
                        <tr
                          key={rowIndex}
                          className="odd:bg-white even:bg-slate-50"
                        >
                          {columns.map((col) => {
                            const normalizedCol = col.trim();
                            const cellValue =
                              row[col] === null || row[col] === undefined
                                ? ""
                                : String(row[col]);

                            const selectOptions =
                              selectColumnOptions[normalizedCol];
                            const isCheckbox =
                              checkboxColumns.has(normalizedCol);
                            const isNumber = numberColumns.has(normalizedCol);

                            return (
                              <td
                                key={`${rowIndex}-${col}`}
                                className="px-3 py-2 border-b border-slate-200 whitespace-nowrap"
                              >
                                {isCheckbox ? (
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={
                                      cellValue === "true" || cellValue === "1"
                                    }
                                    onChange={(e) =>
                                      onCellChange(
                                        rowIndex,
                                        col,
                                        e.target.checked,
                                      )
                                    }
                                  />
                                ) : selectOptions ? (
                                  <select
                                    className="w-full bg-transparent outline-none focus:ring-2 focus:ring-blue-200 rounded px-1"
                                    value={cellValue}
                                    onChange={(e) =>
                                      onCellChange(
                                        rowIndex,
                                        col,
                                        e.target.value,
                                      )
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
                                      onCellChange(
                                        rowIndex,
                                        col,
                                        e.target.value,
                                      )
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
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
