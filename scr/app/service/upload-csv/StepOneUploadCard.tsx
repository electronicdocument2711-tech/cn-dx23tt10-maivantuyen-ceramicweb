import {
  Button,
  Card,
  CardBody,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import {
  IconCloudUpload,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconInfoCircle,
} from "@tabler/icons-react";

type FileType = "csv" | "xls" | "xlsx" | null;

type StepOneUploadCardProps = {
  data: {
    fileName: string | null;
    fileType: FileType;
    fileSize: number | null;
    rowsCount: number;
    loading: boolean;
  };
  actions: {
    onDownloadTemplate: () => void;
    onFileChange: (file: File) => void;
    onRemoveFile: () => void;
    onNext: () => void;
  };
};

export const StepOneUploadCard = ({
  data,
  actions,
}: StepOneUploadCardProps) => (
  <Card shadow="sm">
    <CardBody className="p-8 space-y-2">
      <div className="text-slate-700 text-lg font-medium flex items-center gap-2">
        Nhập tệp CSV có thông tin dịch vụ của bạn.
        <Popover placement="right">
          <PopoverTrigger>
            <button type="button" className="text-blue-600 hover:text-blue-700">
              <IconInfoCircle size={24} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-w-xs text-sm text-slate-600">
            Tải file mẫu về và chỉnh sửa dữ liệu hoặc tải lên file của bạn.
          </PopoverContent>
        </Popover>
      </div>

      <button
        type="button"
        onClick={actions.onDownloadTemplate}
        className="text-blue-600 text-md font-semibold hover:underline w-fit"
      >
        Tải xuống mẫu tệp CSV
      </button>

      <label className="cursor-pointer block">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            actions.onFileChange(file);
          }}
        />

        <div className="border-2 hover:bg-blue-50 hover:border-blue-300 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <IconCloudUpload size={48} className="text-blue-400" />
          <div className="mt-4 text-slate-600">
            Dán, thả hoặc{" "}
            <span className="text-blue-600 font-semibold hover:underline">
              Tải lên
            </span>{" "}
            tệp CSV/XLSX/XLS của bạn
          </div>
        </div>
      </label>

      {data.fileName && (
        <div className="border border-gray-300 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gray-100 flex items-center justify-center">
              {data.fileType === "csv" && (
                <IconFileTypeCsv size={30} className="text-green-600" />
              )}

              {(data.fileType === "xls" || data.fileType === "xlsx") && (
                <IconFileTypeXls size={30} className="text-green-600" />
              )}
            </div>

            <div>
              <div className="font-medium text-slate-800">{data.fileName}</div>
              <div className="text-sm text-slate-500">
                {(data.fileSize! / 1024).toFixed(2)} KB · Thành công ·{" "}
                {data.rowsCount} dòng
              </div>
            </div>
          </div>

          <button
            className="text-slate-400 hover:text-slate-600 text-xl"
            onClick={actions.onRemoveFile}
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          color="primary"
          className="px-10"
          isDisabled={data.rowsCount === 0 || data.loading}
          onPress={actions.onNext}
        >
          Tiếp tục
        </Button>
      </div>
    </CardBody>
  </Card>
);
