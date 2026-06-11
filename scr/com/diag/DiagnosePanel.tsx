import React, { useMemo, useState } from "react";
import { addToast, Button, Spinner, Textarea } from "@heroui/react";
import { UI_META } from "@/const/ui";
import { DIAGNOSIS } from "@/data/diagnosis";
import { IconX } from "@tabler/icons-react";
import {
  CustomerDiagnosisData,
  DiagnoseConfig,
  TeethType,
} from "@/types/define.d";
import dayjs from "dayjs";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { getAnatomyBodyPartItemIds, getTeethLabels } from "./teethItems";
import AddDiagnosis from "./AddDiagnosis";
import { useConfirm } from "../ConfirmProvider";

export default function DiagnosePanel({
  datas,
  setData,
  selectedTeeths,
  teethType,
  diagnoseId,
  diagnostician,
  customerId,
  treatmentId,
  note,
  setNote,
  onUpdateSuccess,
  loading,
  error,
  isDirty,
}: {
  datas: CustomerDiagnosisData[];
  setData: React.Dispatch<React.SetStateAction<CustomerDiagnosisData[]>>;
  selectedTeeths: string[];
  teethType: TeethType;
  treatmentId: string | null;
  diagnoseId: string | null;
  diagnostician?: { UpdatedAt: string; UpdatedBy: string };
  customerId: string | null;
  note: string;
  setNote: React.Dispatch<React.SetStateAction<string>>;
  onUpdateSuccess: (data: CustomerDiagnosisData[], note: string) => void;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
}) {
  const { confirm } = useConfirm();
  const [submitting, setSubmitting] = useState(false);
  const [diagnoseConfigs] = useState<DiagnoseConfig[]>(DIAGNOSIS);

  const filteredDiagnoseConfigs = useMemo(() => {
    const base = [...diagnoseConfigs];
    return base.sort((a, b) =>
      a.Name.toLowerCase().localeCompare(b.Name.toLocaleLowerCase(), "vi"),
    );
  }, [diagnoseConfigs]);

  const diagnosisData = useMemo(() => {
    const base = datas.map((d) => {
      return diagnoseConfigs.find((c) => c.DiagnosisId === d.id);
    });

    return base
      .filter((d): d is DiagnoseConfig => d !== undefined)
      .sort((a, b) =>
        a.Name.toLowerCase().localeCompare(b.Name.toLocaleLowerCase(), "vi"),
      );
  }, [datas, diagnoseConfigs]);

  const deleteDiagnose = async (id: string) => {
    if (
      !(await confirm({
        message: "Bạn muốn xóa dòng chẩn đoán này?",
        type: "warning",
        hideCancel: true,
      }))
    )
      return;
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSaveDiagnose = async () => {
    try {
      console.log(diagnoseId);
      setSubmitting(true);
      if (!diagnoseId || !customerId) {
        addToast({
          title: "Thất bại",
          description:
            "Không thể lưu chẩn đoán do thông tin khách hàng hoặc điều trị không hợp lệ",
          color: "warning",
        });

        return;
      }
      if (
        !(await confirm({
          title: "Lưu chẩn đoán",
          message:
            "Bạn muốn lưu các chẩn đoán này? Yên tâm, bạn luôn có thể tiếp tục thêm mới các chẩn đoán khác.",
          type: "info",
          hideCancel: true,
        }))
      )
        return;

      const payload = {
        personId: diagnoseId,
        Note: note,
        startDate: dayjs().format("YYYY-MM-DD"),
        isAdult: teethType === "adult" ? "1" : "0",
        diagnose:
          datas.map((d) => ({
            id: d.id,
            note: null,
            anatomyBodyPartItemId:
              getAnatomyBodyPartItemIds(d.selectedTeeths) ?? [],
          })) ?? [],
      };

      const res = await rest.post(
        `/customer/${customerId}/diagnose/${treatmentId}`,
        payload,
      );

      if (res.status !== 200) throw new Error("Lỗi khi lưu chẩn đoán");

      onUpdateSuccess(datas, note);
      addToast({
        title: "Thành công",
        description: "Lưu chẩn đoán thành công",
        color: "success",
      });
    } catch (error: any) {
      //rollback UI when error
      addToast({
        title: "Thất bại",
        description: getErrorMessage(
          error,
          "Đã có lỗi xảy ra khi lưu chẩn đoán",
        ),
        color: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderContents = () => {
    if (loading) {
      return (
        <div className="min-h-15 p-4 flex items-center justify-center mb-6">
          <Spinner size="sm" color="default" />
        </div>
      );
    }
    if (!loading && error) {
      return (
        <div className="min-h-15 p-4 flex items-center justify-center mb-6">
          <p className="text-default-500 text-base">Lỗi: {error}</p>
        </div>
      );
    }
    if (!loading && datas.length === 0) {
      return (
        <div className="min-h-15 flex items-center justify-center p-4 text-center mb-6">
          <p className="text-default-500">Chưa có thông tin chẩn đoán</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col divide-y divide-default-100 border border-default-300 rounded-2xl py-2 px-4">
        {diagnosisData.map((opt) => {
          const configs = datas.find((d) => d.id === opt?.DiagnosisId);
          return (
            <div
              key={opt?.DiagnosisId}
              className="w-full flex justify-between items-center py-1.5"
            >
              {(opt?.ICD10Code || opt?.Name) && (
                <div className="flex items-center gap-3">
                  {opt?.Name && <p className=" font-medium">{opt.Name}</p>}
                  {opt?.ICD10Code && (
                    <p
                      className={`px-1.5 py-0.5 text-center font-semibold text-sm rounded-md bg-green-50 border-1 border-green-300`}
                    >
                      {opt.ICD10Code}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 flex-wrap">
                  {getTeethLabels(configs?.selectedTeeths || []).map(
                    (label, idx) => (
                      <div
                        key={idx}
                        className="rounded-md items-center justify-center bg-primary-200 font-semibold text-xs py-1 px-1.5 text-nowrap"
                      >
                        {label}
                      </div>
                    ),
                  )}
                </div>
                <button onClick={() => deleteDiagnose(configs?.id ?? "")}>
                  <IconX
                    size={26}
                    className="rounded-full p-1.5 bg-gray-100 hover:text-red-600 text-gray-600"
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <AddDiagnosis
          data={datas}
          addDiagnosis={setData}
          configs={filteredDiagnoseConfigs}
          selectedTeeths={selectedTeeths}
          teethType={teethType}
        />
        {renderContents()}
        <Textarea
          isDisabled={loading || submitting}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          radius="lg"
          variant="bordered"
          minRows={2}
          placeholder="Nhập ghi chú, chỉ định..."
          classNames={{
            input: "text-base font-medium placeholder:text-default-500",
            inputWrapper:
              "w-full border border-default-300 data-[hover=true]:border-default-500 px-3 py-3",
          }}
        />
        {diagnostician && (
          <p className="text-sm text-default-500">
            Chẩn đoán{" "}
            {dayjs.unix(parseInt(diagnostician.UpdatedAt, 10)).fromNow()} bởi{" "}
            <span className="font-semibold text-default-600">
              {diagnostician.UpdatedBy}
            </span>{" "}
          </p>
        )}
      </div>
      <div className="py-4 flex items-center justify-end border-t border-default-400">
        <Button
          isDisabled={!isDirty}
          isLoading={submitting || loading}
          color="primary"
          onPress={handleSaveDiagnose}
          className={UI_META.Button.primary.classnames + " max-w-40"}
        >
          Lưu chẩn đoán
        </Button>
      </div>
    </>
  );
}
