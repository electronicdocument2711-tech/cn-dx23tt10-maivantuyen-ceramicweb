"use client";

import { useState } from "react";

import Papa from "papaparse";
import * as XLSX from "xlsx";
import { StepOneUploadCard } from "./StepOneUploadCard";
import { StepsHeader } from "./StepsHeader";
import { StepThreeConfirmCard } from "./StepThreeConfirmCard";
import { StepTwoEditor } from "./StepTwoEditor";

/* ======== TYPES ============= */

type Step = 1 | 2 | 3;
type FileType = "csv" | "xls" | "xlsx" | null;
type ServiceRow = Record<string, string | number | boolean | null>;

export default function UploadCSVPage() {
  const [step, setStep] = useState<Step>(1);
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [processRowsByIndex, setProcessRowsByIndex] = useState<
    Record<number, ServiceRow[]>
  >({});
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [processFileNameByIndex, setProcessFileNameByIndex] = useState<
    Record<number, string | null>
  >({});
  const [processFileSizeByIndex, setProcessFileSizeByIndex] = useState<
    Record<number, number | null>
  >({});
  const [loading, setLoading] = useState(false);

  /* ==== MAP ROW =============== */

  const normalizeHeader = (key: string) => key.replace(/^\uFEFF/, "").trim();

  const mapRow = (row: any): ServiceRow => {
    const normalized: ServiceRow = {};

    Object.entries(row ?? {}).forEach(([key, value]) => {
      const normalizedKey = normalizeHeader(String(key));

      if (typeof value === "string") {
        normalized[normalizedKey] = value.trim();
        return;
      }

      if (value === undefined || value === null) {
        normalized[normalizedKey] = null;
        return;
      }

      normalized[normalizedKey] = value as number | boolean;
    });

    return normalized;
  };

  const hasAnyValue = (row: ServiceRow) =>
    Object.values(row).some(
      (value) => value !== null && value !== undefined && value !== "",
    );

  /* ==== PARSE FILE =============== */
  const parseFile = async (file: File) => {
    setLoading(true);

    try {
      if (file.name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result: any) => {
            const parsedRows = result.data.map(mapRow).filter(hasAnyValue);
            setRows(parsedRows);
            setLoading(false);
            setStep(2);
          },
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet);
          const parsedRows = json.map(mapRow).filter(hasAnyValue);
          setRows(parsedRows);
          setLoading(false);
          setStep(2);
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleMainFileChange = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") setFileType("csv");
    else if (ext === "xls") setFileType("xls");
    else if (ext === "xlsx") setFileType("xlsx");
    else setFileType(null);

    setFileName(file.name);
    setFileSize(file.size);
    parseFile(file);
  };

  const removeFile = () => {
    setFileName(null);
    setFileSize(null);
    setFileType(null);
    setRows([]);
    setSelectedRowIndex(null);
    setProcessRowsByIndex({});
    setProcessFileNameByIndex({});
    setProcessFileSizeByIndex({});
    setStep(1);
  };

  const downloadCsvTemplate = () => {
    const csvContent =
      "Mã dịch vụ,Tên dịch vụ,Giá dịch vụ,Thuế,Nhóm dịch vụ,Ghi chú,Tiến trình\n";

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "dich_vu_template.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const downloadProcessTemplate = () => {
    const csvContent =
      "Tên bước,Phần trăm điều trị,Số ngày đến bước tiếp theo,Doanh thu công ty loại,Doanh thu công ty giá trị,Doanh thu phòng khám loại,Doanh thu phòng khám giá trị,Thu nhập BS Tư vấn loại,Thu nhập BS Tư vấn giá trị,Thu nhập BS Điều trị loại,Thu nhập BS Điều trị giá trị,Thu nhập BS HTCM loại,Thu nhập BS HTCM giá trị,Thu nhập điều dưỡng loại,Thu nhập điều dưỡng giá trị\n";

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "tien_trinh_template.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const updateCell = (
    rowIndex: number,
    column: string,
    value: string | boolean,
  ) => {
    setRows((prev) =>
      prev.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              [column]: value === "" ? null : value,
            }
          : row,
      ),
    );
  };

  const updateProcessCell = (
    parentRowIndex: number,
    rowIndex: number,
    column: string,
    value: string | boolean,
  ) => {
    setProcessRowsByIndex((prev) => {
      const rowsForParent = prev[parentRowIndex] ?? [];
      return {
        ...prev,
        [parentRowIndex]: rowsForParent.map((row, index) =>
          index === rowIndex
            ? {
                ...row,
                [column]: value === "" ? null : value,
              }
            : row,
        ),
      };
    });
  };

  const parseProcessFile = async (file: File, rowIndex: number) => {
    setLoading(true);

    try {
      if (file.name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result: any) => {
            setProcessRowsByIndex((prev) => ({
              ...prev,
              [rowIndex]: result.data.map(mapRow),
            }));
            setLoading(false);
          },
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet);
          setProcessRowsByIndex((prev) => ({
            ...prev,
            [rowIndex]: json.map(mapRow),
          }));
          setLoading(false);
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleProcessFileUpload = (rowIndex: number, file: File) => {
    setSelectedRowIndex(rowIndex);
    setProcessFileNameByIndex((prev) => ({
      ...prev,
      [rowIndex]: file.name,
    }));
    setProcessFileSizeByIndex((prev) => ({
      ...prev,
      [rowIndex]: file.size,
    }));
    parseProcessFile(file, rowIndex);
  };

  const selectProcessRow = (rowIndex: number) => {
    setSelectedRowIndex(rowIndex);
  };

  const handleConfirm = () => {   


  }
  /* ===== RENDER ========== */

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      <StepsHeader step={step} />
      {/* =====================
          STEP 1
      ===================== */}
      {step === 1 && (
        <StepOneUploadCard
          data={{
            fileName,
            fileType,
            fileSize,
            rowsCount: rows.length,
            loading,
          }}
          actions={{
            onDownloadTemplate: downloadCsvTemplate,
            onFileChange: handleMainFileChange,
            onRemoveFile: removeFile,
            onNext: () => setStep(2),
          }}
        />
      )}
      {/* =====================
          STEP 2
      ===================== */}
      {step === 2 && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={downloadProcessTemplate}
            className="text-blue-600 font-semibold hover:underline w-fit"
          >
            Tải xuống mẫu tệp CSV tiến trình.
          </button>
          <StepTwoEditor
            rows={rows}
            processRowsByIndex={processRowsByIndex}
            selectedRowIndex={selectedRowIndex}
            processFileNameByIndex={processFileNameByIndex}
            processFileSizeByIndex={processFileSizeByIndex}
            onCellChange={updateCell}
            onProcessCellChange={updateProcessCell}
            onProcessFileUpload={handleProcessFileUpload}
            onSelectProcessRow={selectProcessRow}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        </div>
      )}

      {/* =====================
          STEP 3
      ===================== */}
      {step === 3 && (
        <StepThreeConfirmCard
          fileName={fileName}
          rows={rows}
          processRowsByIndex={processRowsByIndex}
          processFileNameByIndex={processFileNameByIndex}
          onProcessCellChange={updateProcessCell}
          onBack={() => setStep(2)}
          onConfirm={() => handleConfirm()}
        />
      )}
    </section>
  );
}
