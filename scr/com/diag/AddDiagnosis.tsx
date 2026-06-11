import {
  Autocomplete,
  Button,
  AutocompleteItem,
  Checkbox,
} from "@heroui/react";
import { IconAlertTriangleFilled, IconSearch } from "@tabler/icons-react";

import { useMemo, useRef, useState } from "react";
import {
  getTeethLabels,
  lowerItems,
  lowerJuniorItems,
  upperItems,
  upperJuniorItems,
} from "./teethItems";
import {
  CustomerDiagnosisData,
  DiagnoseConfig,
  TeethType,
} from "@/types/define.d";
import { removeVietnameseTones } from "@/lib/format";
import { useConfirm } from "../ConfirmProvider";
import { filter, indexBy, unique } from "remeda";

const mergeTeeths = (oldTeeth: string[], newTeeth: string[]) => {
  const combined = unique([...oldTeeth, ...newTeeth]);
  const groupIds = ["1-2", "5-6", "3-4", "7-8"];

  const result = filter(combined, (t) => {
    if (groupIds.includes(t)) return true; // ✅ giữ group ids

    if (
      (combined.includes("1-2") || combined.includes("5-6")) &&
      [...upperItems, ...upperJuniorItems].includes(t)
    )
      return false;

    if (
      (combined.includes("3-4") || combined.includes("7-8")) &&
      [...lowerItems, ...lowerJuniorItems].includes(t)
    )
      return false;

    return true;
  });
  return result;
};

export default function AddDiagnosis({
  data,
  addDiagnosis,
  configs,
  selectedTeeths,
  teethType,
}: {
  data?: CustomerDiagnosisData[];
  addDiagnosis: (diagnose: CustomerDiagnosisData[]) => void;
  configs: DiagnoseConfig[];
  selectedTeeths: string[];
  teethType: TeethType;
}) {
  const { confirm } = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedDiagnose, setSelectedDiagnose] = useState<string[]>([]);

  const filterDiagnose = useMemo(() => {
    const q = removeVietnameseTones(query);
    if (!q) return configs;
    return configs.filter((d: any) =>
      removeVietnameseTones(d.Name).includes(q),
    );
  }, [configs, query]);

  const toggleSelect = (id: string) => {
    setSelectedDiagnose((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAddDiagnose = async (): Promise<boolean> => {
    if (selectedDiagnose.length === 0) {
      await confirm({
        message: "Vui lòng chọn ít nhất một chẩn đoán trước khi thêm",
        type: "warning",
      });
      return false;
    }
    if (!selectedTeeths || (selectedTeeths && selectedTeeths.length === 0)) {
      await confirm({
        message: "Vui lòng chọn vị trí răng áp dụng cho chẩn đoán",
        type: "warning",
      });
      setSelectedDiagnose([]);
      return false;
    }

    const currentDiagnosisDict = indexBy(data || [], (d) => d.id);

    const updatedDict = selectedDiagnose.reduce((acc, diagId) => {
      const existing = acc[diagId];

      if (existing) {
        return {
          ...acc,
          [diagId]: {
            ...existing,
            selectedTeeths: mergeTeeths(
              existing.selectedTeeths,
              selectedTeeths,
            ),
          },
        };
      } else {
        return {
          ...acc,
          [diagId]: {
            id: diagId,
            teethType: teethType || "adult",
            selectedTeeths: mergeTeeths([], selectedTeeths),
          },
        };
      }
    }, currentDiagnosisDict);

    addDiagnosis(Object.values(updatedDict));
    setSelectedDiagnose([]);
    return true;
  };

  return (
    <Autocomplete
      aria-label="search diagnosis"
      isVirtualized={false}
      selectedKey={null}
      selectorIcon={null}
      ref={inputRef}
      inputValue={query}
      defaultFilter={() => true}
      onInputChange={setQuery}
      onSelectionChange={(key) => {
        if (!key) return;
        toggleSelect(key ? key.toString() : "");
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }}
      radius="full"
      placeholder="Chẩn đoán ICD10"
      itemHeight={64}
      maxListboxHeight={410}
      classNames={{
        selectorButton: "hidden",
        base: "w-full",
        listboxWrapper:
          "overflow-visible [&_li[data-focus='true']:not(:hover)]:bg-transparent",
      }}
      startContent={<IconSearch size={20} className="w-6 h-6 text-slate-500" />}
      scrollShadowProps={{ isEnabled: false, hideScrollBar: false }}
      popoverProps={{ placement: "bottom", shouldCloseOnScroll: false }}
      listboxProps={{
        hideSelectedIcon: true,
        classNames: {
          base: "flex flex-col ",
          list: "overflow-y-auto max-h-[300px] ",
        },
        emptyContent: (
          <div className="p-4 text-center text-gray-500">
            Không tìm thấy chẩn đoán phù hợp với răng đã chọn
          </div>
        ),
        bottomContent: (
          <div className="py-2 px-4 flex items-center justify-between border-t border-default-300">
            <div>
              {selectedTeeths.length > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-base">Vị trí</span>
                  <div className="flex gap-1 flex-wrap">
                    {getTeethLabels(selectedTeeths).map((label, idx) => (
                      <div
                        key={idx}
                        className="rounded-md bg-primary-200 font-semibold text-xs py-1 px-1.5"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-1 px-2 rounded-md bg-red-50 border border-red-100 flex items-center gap-2 text-red-700">
                  <IconAlertTriangleFilled size="18" />
                  Chưa chọn vị trí chẩn đoán
                </div>
              )}
            </div>
            <Button
              color="primary"
              onMouseDown={async (e) => {
                e.preventDefault();
                if (await handleAddDiagnose()) inputRef.current?.blur();
              }}
              disabled={
                selectedDiagnose.length === 0 ||
                (selectedTeeths && selectedTeeths.length === 0)
              }
              className="font-bold px-4 disabled:opacity-60 disabled:cursor-default disabled:pointer-events-none"
            >
              Thêm chẩn đoán
            </Button>
          </div>
        ),
      }}
    >
      {filterDiagnose.map((item: any) => (
        <AutocompleteItem
          key={item.DiagnosisId}
          textValue={item.Name}
          className={`relative w-full data-[focus=true]:bg-transparent data-[focus=true]:text-inherit data-[hover=true]:bg-transparent`}
          classNames={{
            base: "py-0",
            title: " w-full flex items-center justify-between gap-10",
          }}
        >
          <div
            className={`relative rounded-xl w-full flex items-center gap-4 p-2 hover:bg-default-50 cursor-pointer ${selectedDiagnose.includes(item.DiagnosisId) ? "bg-default-200" : ""}`}
          >
            <div className="flex gap-3 items-center flex-1 text-base">
              <Checkbox
                isReadOnly
                isSelected={selectedDiagnose.includes(item.DiagnosisId)}
                className="w-full pointer-events-none"
                classNames={{
                  base: "w-full !bg-transparent",
                  label: "w-full flex items-center",
                  wrapper: "group-data-[hover=true]:before:bg-transparent",
                }}
              />
              <p className="font-medium">{item.Name}</p>
              {item.ICD10Code && (
                <div
                  className={`font-medium text-sm bg-green-50 px-1.5 py-0.5 rounded-md border border-green-300`}
                >
                  {item.ICD10Code}
                </div>
              )}
            </div>
            {selectedTeeths && selectedDiagnose.includes(item.DiagnosisId) && (
              <div className="flex gap-1 flex-wrap">
                {getTeethLabels(selectedTeeths).map((label, idx) => (
                  <div
                    key={idx}
                    className="rounded-md bg-primary-200 font-semibold text-xs py-1 px-1.5"
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
