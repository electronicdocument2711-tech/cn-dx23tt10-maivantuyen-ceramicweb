import { Button, Card, CardBody } from "@heroui/react";
import { useState } from "react";
import { ProcessStepsModal } from "./ProcessStepsModal";

type ServiceRow = Record<string, string | number | boolean | null>;

type StepThreeConfirmCardProps = {
  fileName: string | null;
  rows: ServiceRow[];
  processRowsByIndex: Record<number, ServiceRow[]>;
  processFileNameByIndex: Record<number, string | null>;
  isSubmitting?: boolean;
  onProcessCellChange: (
    parentRowIndex: number,
    rowIndex: number,
    column: string,
    value: string | boolean,
  ) => void;
  onBack: () => void;
  onConfirm: () => void;
};

export const StepThreeConfirmCard = ({
  fileName,
  rows,
  processRowsByIndex,
  processFileNameByIndex,
  isSubmitting = false,
  onProcessCellChange,
  onBack,
  onConfirm,
}: StepThreeConfirmCardProps) => {
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const columns = rows[0] ? Object.keys(rows[0]) : [];
  const selectedProcessRows =
    selectedRowIndex !== null
      ? processRowsByIndex[selectedRowIndex]
      : undefined;

  const openProcessModal = (rowIndex: number) => {
    setSelectedRowIndex(rowIndex);
    setIsProcessModalOpen(true);
  };

  return (
    <Card shadow="sm">
      <CardBody className="p-6 space-y-6">
        <div className="text-lg font-semibold">Xác nhận & tải lên</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="text-sm text-slate-500">Tệp</div>
            <div className="font-semibold text-slate-800">
              {fileName ?? "Chưa có"}
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="text-sm text-slate-500">Tổng dòng</div>
            <div className="font-semibold text-slate-800">{rows.length}</div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="text-slate-500">Không có dữ liệu để xác nhận.</div>
        ) : (
          <div className="space-y-2">
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
                        const isProcessColumn = normalizedCol === "Tiến trình";
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
                                ""
                              )
                            ) : row[col] === null || row[col] === undefined ? (
                              ""
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="light" onPress={onBack} isDisabled={isSubmitting}>
            Quay lại
          </Button>
          <Button
            color="primary"
            isDisabled={rows.length === 0 || isSubmitting}
            isLoading={isSubmitting}
            onPress={() => onConfirm()}
          >
            Xác nhận
          </Button>
        </div>

        <ProcessStepsModal
          isOpen={isProcessModalOpen}
          onClose={() => setIsProcessModalOpen(false)}
          serviceCode={String(rows[selectedRowIndex ?? 0]?.["Mã dịch vụ"] ?? "")}
          rows={selectedProcessRows}
          onCellChange={(rowIndex, column, value) =>
            onProcessCellChange(selectedRowIndex ?? 0, rowIndex, column, value)
          }
        />
      </CardBody>
    </Card>
  );
};
