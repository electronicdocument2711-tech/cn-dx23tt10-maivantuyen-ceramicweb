import { useAppContext } from "@/context";
import rest from "@/lib/rest";
import { Checkbox, Select, SelectItem, Spinner, Textarea } from "@heroui/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { prop } from "remeda";
import {
  buildQuantity,
  getChairTotalCount,
  normalizeId,
  readFirstString,
} from "./treatmentProgressUtils";
import dayjs from "dayjs";
import SelectField from "./SelectField";
import { SelectOption } from "./ValidateForm";

export interface TreatmentProcedureProgressPayload {
  RowKey?: string;
  OrderDetailId: string;
  ProcedureProgressId?: string;
  InitialProcedureProgressId?: string;
  HasUserSelectedProgress?: boolean;
  DoctorId?: string;
  DoctorAssistantId?: string;
}

export interface TreatmentProgressPayload {
  DentalChairId: string;
  Room: "TREATMENT" | "SURGERY";
  TreatmentProcedureProgress: TreatmentProcedureProgressPayload[];
}

interface ServiceRow {
  rowKey: string;
  orderDetailId: string;
  name: string;
  position: string;
  schedule: string;
  quantity: string;
  progressOptions: SelectOption[];
  currentProgressId?: string;
  selectedProgressKey?: string;
}

interface ServiceSelection {
  selectedProgressKey: string;
  doctorId: string;
  doctorAssistantId: string;
  hasTouchedProgress: boolean;
  hasTouchedDoctor: boolean;
  hasTouchedDoctorAssistant: boolean;
}

interface ChairOption {
  id: string;
  code: string;
}

interface TreatmentProgressSectionErrors {
  dentalChairId?: string;
  noProgressData?: string;
  progressByOrderDetailId?: Record<string, string>;
  doctorByOrderDetailId?: Record<string, string>;
}

const TEXTAREA_WRAPPER_CLASS =
  "rounded-2xl bg-[#F3F3F4] !border-transparent !shadow-none data-[hover=true]:!border-transparent data-[hover=true]:!shadow-none group-data-[hover=true]:!border-transparent group-data-[hover=true]:!shadow-none group-data-[focus=true]:!border-transparent group-data-[focus=true]:!shadow-none group-data-[focus-visible=true]:!border-transparent group-data-[focus-visible=true]:!ring-0";
const CHAIR_LIMIT = 20;
const readCurrentProgressId = (service: Record<string, unknown>): string => {
  return normalizeId(
    readFirstString(service, [
      "CurrentProgressId",
      "ProcedureProgressId",
      "CurrentProcedureProgressId",
      "TreatmentProcedureProgressId",
    ]),
  );
};

// Mappers
const mapProgressOptions = (
  service: Record<string, unknown>,
): {
  options: SelectOption[];
  selectedProgressKey?: string;
} => {
  const raw = service["TreatmentProcedureProcess"];
  // Normalize: API có thể trả về array hoặc object với numeric keys
  let processList: Record<string, unknown>[] = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : raw && typeof raw === "object"
      ? (Object.values(raw) as Record<string, unknown>[])
      : [];

  processList = processList.sort((a, b) => {
    const idA = Number(readFirstString(a, ["ProcedureProgressId", "Id", "id"]));
    const idB = Number(readFirstString(b, ["ProcedureProgressId", "Id", "id"]));
    return idA - idB;
  });

  const options = processList
    .map((process, index) => {
      const procedureProgressId = normalizeId(
        readFirstString(process, ["ProcedureProgressId"]),
      );
      const fallbackKey = normalizeId(readFirstString(process, ["Id", "id"]));
      const key = procedureProgressId || fallbackKey || `progress-${index}`;

      return {
        key,
        id: procedureProgressId || key,
        label:
          readFirstString(process, ["ProgressName", "Name", "name"]) ||
          `Bước ${index + 1}`,
      };
    })
    .filter((option) => option.label.trim() !== "");

  const currentProgressId = readCurrentProgressId(service);

  return {
    options,
    // Chỉ set default khi CurrentProgressId có giá trị (không null)
    selectedProgressKey: currentProgressId
      ? options.find((option) => option.id === currentProgressId)?.key
      : undefined,
  };
};

const mapServiceRows = (services: Record<string, unknown>[]): ServiceRow[] => {
  return services.map((service, index) => {
    const { options, selectedProgressKey } = mapProgressOptions(service);
    const orderDetailId = normalizeId(
      readFirstString(service, ["OrderDetailId", "orderDetailId", "Id", "id"]),
    );
    const anatomyBodyPartItem = service["AnatomyBodyPartItem"];
    const position =
      anatomyBodyPartItem && typeof anatomyBodyPartItem === "object"
        ? readFirstString(anatomyBodyPartItem as Record<string, unknown>, [
            "Name",
            "name",
          ])
        : "";

    return {
      rowKey: orderDetailId || `service-${index}`,
      orderDetailId,
      name:
        readFirstString(service, [
          "ProcedureName",
          "ServiceName",
          "MedicalProcedureName",
          "Name",
          "name",
        ]) || `Dịch vụ ${index + 1}`,
      position: position || "-",
      schedule: readFirstString(service, [
        "Schedule",
        "LatestUpdated",
        "AddedAt",
        "CreatedAt",
        "DateTime",
        "time",
      ]),
      quantity: buildQuantity(service),
      progressOptions: options,
      currentProgressId: readCurrentProgressId(service),
      selectedProgressKey,
    };
  });
};

const mapStaffOptions = (
  staffs: Array<{
    id: string | number;
    name: string;
    users?: Array<{ id: string | number }>;
  }>,
): SelectOption[] => {
  const seen = new Set<string>();
  return staffs
    .map((staff) => {
      const id = normalizeId(staff?.users?.[0]?.id);

      const label = staff?.name?.trim();
      if (!id || !label || seen.has(id)) return null;
      seen.add(id);
      return { key: id, id, label };
    })
    .filter((item): item is SelectOption => item !== null);
};

const TreatmentProgressSection = ({
  onChange,
  errors,
  dentalChairBooked,
}: {
  onChange?: (payload: TreatmentProgressPayload) => void;
  errors?: TreatmentProgressSectionErrors;
  dentalChairBooked: { DentalChairId: string; DentalChairCode: string } | null;
}) => {
  const params = useParams<{ id: string }>();
  const customerId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";
  const { doctors, nurses, assistants, me } = useAppContext();

  // State
  const [selectedTreatmentType, setSelectedTreatmentType] = useState<
    "dieuTri" | "tieuPhau" | null
  >("dieuTri");
  const [medicalProcedures, setMedicalProcedures] = useState<
    Record<string, unknown>[]
  >([]);
  const [proceduresLoading, setProceduresLoading] = useState(true);
  const [proceduresError, setProceduresError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [selectedChairId, setSelectedChairId] = useState("");
  const [chairOptions, setChairOptions] = useState<ChairOption[]>([]);
  const [chairLoadingState, setChairLoadingState] = useState({
    lmstart: 0,
    total: 0,
    isLoading: false,
    isLoadingMore: false,
  });
  const [serviceSelections, setServiceSelections] = useState<
    Record<string, ServiceSelection>
  >({});

  // Memoized data
  const serviceRows = useMemo(
    () =>
      medicalProcedures.length > 0 ? mapServiceRows(medicalProcedures) : [],
    [medicalProcedures],
  );
  const doctorOptions = useMemo(() => mapStaffOptions(doctors), [doctors]);
  const assistantOptions = useMemo(
    () => mapStaffOptions([...nurses, ...assistants]),
    [assistants, nurses],
  );
  const hasMoreChairs = chairOptions.length < chairLoadingState.total;

  // Helpers
  const createEmptySelection = useCallback(
    (progressKey = ""): ServiceSelection => ({
      selectedProgressKey: progressKey,
      doctorId: String(me?.id || ""),
      doctorAssistantId: "",
      hasTouchedProgress: false,
      hasTouchedDoctor: false,
      hasTouchedDoctorAssistant: false,
    }),
    [me?.id],
  );

  const updateServiceSelection = useCallback(
    (
      rowKey: string,
      field: "selectedProgressKey" | "doctorId" | "doctorAssistantId",
      value: string,
    ) => {
      const touchedByField = {
        selectedProgressKey: "hasTouchedProgress",
        doctorId: "hasTouchedDoctor",
        doctorAssistantId: "hasTouchedDoctorAssistant",
      } as const;

      setServiceSelections((prev) => {
        const currentSelection = prev[rowKey] || createEmptySelection();
        const newSelection = { ...currentSelection };

        // Cập nhật field được chọn
        newSelection[field] = value;
        newSelection[touchedByField[field]] = true;

        // ✅ THÊM: Auto-fill doctor khi progress thay đổi
        if (
          field === "selectedProgressKey" &&
          value &&
          !currentSelection.hasTouchedDoctor
        ) {
          newSelection.doctorId = String(me?.id || "");
          newSelection.hasTouchedDoctor = true;
        }

        return {
          ...prev,
          [rowKey]: newSelection,
        };

        //   ({
        //   ...prev,
        //   [rowKey]: {
        //     ...(prev[rowKey] || createEmptySelection()),
        //     [field]: value,
        //     [touchedByField[field]]: true,
        //   },
        // })
      });
    },
    [createEmptySelection, me?.id],
  );

  const buildPayload = useCallback((): TreatmentProgressPayload => {
    return {
      DentalChairId: selectedChairId.trim(),
      Room: selectedTreatmentType === "tieuPhau" ? "SURGERY" : "TREATMENT",
      TreatmentProcedureProgress: serviceRows.reduce<
        TreatmentProcedureProgressPayload[]
      >((result, service) => {
        if (!service.orderDetailId) return result;

        const selection =
          serviceSelections[service.rowKey] ||
          createEmptySelection(service.selectedProgressKey || "");
        const initialProgressKey = service.selectedProgressKey || "";
        const currentProgressKey = selection.selectedProgressKey || "";
        const progressChanged = currentProgressKey !== initialProgressKey;
        const doctorChanged =
          currentProgressKey === initialProgressKey
            ? true
            : Boolean(selection.doctorId.trim());
        const assistantChanged = Boolean(selection.doctorAssistantId.trim());

        if (!progressChanged && doctorChanged) {
          return result;
        }

        const selectedProgress = service.progressOptions.find(
          (option) => option.key === currentProgressKey,
        );
        const resolvedProgressId = currentProgressKey
          ? selectedProgress?.id || ""
          : progressChanged
            ? ""
            : service.currentProgressId || "";

        const item: TreatmentProcedureProgressPayload = {
          RowKey: service.rowKey,
          OrderDetailId: service.orderDetailId,
          ProcedureProgressId: resolvedProgressId,
          InitialProcedureProgressId: service.currentProgressId || "",
          HasUserSelectedProgress: progressChanged,
        };

        if (doctorChanged) {
          item.DoctorId = selection.doctorId.trim();
        }
        if (assistantChanged) {
          item.DoctorAssistantId = selection.doctorAssistantId.trim();
        }

        result.push(item);
        return result;
      }, []),
    };
  }, [
    selectedChairId,
    selectedTreatmentType,
    serviceRows,
    serviceSelections,
    createEmptySelection,
  ]);

  // Fetch procedures
  useEffect(() => {
    if (!customerId) {
      setProceduresLoading(false);
      setProceduresError("Không tìm thấy khách hàng");
      setMedicalProcedures([]);
      return;
    }

    let isMounted = true;

    const fetchProcedures = async () => {
      try {
        setProceduresLoading(true);
        setProceduresError(null);

        const res = await rest.get(
          `/customer/${customerId}/treatment/medicalProcedure`,
        );

        if (res.status !== 200)
          throw new Error("Lỗi khi tải danh sách tiến trình điều trị");

        const data =
          (Array.isArray(res.data) ? res.data : res.data?.data) || [];

        if (isMounted) setMedicalProcedures(data);
      } catch {
        if (isMounted) {
          setMedicalProcedures([]);
          setProceduresError("Lỗi khi tải danh sách tiến trình điều trị");
        }
      } finally {
        if (isMounted) setProceduresLoading(false);
      }
    };

    void fetchProcedures();
    return () => {
      isMounted = false;
    };
  }, [customerId]);

  // Update selected chair id
  useEffect(() => {
    if (dentalChairBooked?.DentalChairId) {
      setSelectedChairId((prev) =>
        !prev ? dentalChairBooked.DentalChairId : prev,
      );
      setChairOptions((prev) => {
        if (
          prev.some((chair) => chair.id === dentalChairBooked.DentalChairId)
        ) {
          return prev;
        }
        return [
          ...prev,
          {
            id: dentalChairBooked.DentalChairId,
            code: dentalChairBooked.DentalChairCode,
          },
        ];
      });
    }
  }, [dentalChairBooked]);

  // Fetch chairs
  const fetchChairs = useCallback(async (start = 0) => {
    const isLoadMore = start > 0;

    setChairLoadingState((prev) => ({
      ...prev,
      isLoading: !isLoadMore ? true : prev.isLoading,
      isLoadingMore: isLoadMore ? true : prev.isLoadingMore,
    }));

    try {
      const res = await rest.get(
        `/chairs?limit=${CHAIR_LIMIT}&lmstart=${start}`,
      );
      const data = prop(res, "data", "module", "views", 0, "data");
      const total = getChairTotalCount(Array.isArray(data) ? data : []);

      const mapped = (Array.isArray(data) ? data : []).map(
        (item: Record<string, unknown>, index: number) => ({
          id: String(item.DentalChairId ?? `chair-${start + index}`),
          code: String(item.DentalChairCode ?? "-"),
        }),
      );

      setChairLoadingState((prev) => ({
        ...prev,
        total,
        lmstart: start,
        isLoading: false,
        isLoadingMore: false,
      }));

      if (!isLoadMore && mapped.length === 1) {
        setSelectedChairId(mapped[0].id);
      }

      setChairOptions((prev) => {
        if (!isLoadMore) return mapped;
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...mapped.filter((item) => !seen.has(item.id))];
      });
    } catch {
      if (!isLoadMore) {
        setChairOptions([]);
        setChairLoadingState((prev) => ({ ...prev, total: 0 }));
      }
      setChairLoadingState((prev) => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
      }));
    }
  }, []);

  // Sync service selections with rows
  useEffect(() => {
    setServiceSelections((prev) =>
      serviceRows.reduce<Record<string, ServiceSelection>>((acc, service) => {
        acc[service.rowKey] =
          prev[service.rowKey] ||
          createEmptySelection(service.selectedProgressKey);
        return acc;
      }, {}),
    );
  }, [serviceRows, createEmptySelection]);

  // Emit payload changes
  useEffect(() => {
    if (onChange) {
      onChange(buildPayload());
    }
  }, [onChange, buildPayload]);

  // UI event handlers
  const handleChairSelectOpen = useCallback(
    (isOpen: boolean) => {
      if (!isOpen || chairOptions.length > 0 || chairLoadingState.isLoading)
        return;
      void fetchChairs(0);
    },
    [chairOptions.length, chairLoadingState.isLoading, fetchChairs],
  );

  const handleChairScroll = useCallback(
    (event: React.UIEvent<HTMLUListElement>) => {
      if (
        chairLoadingState.isLoading ||
        chairLoadingState.isLoadingMore ||
        !hasMoreChairs
      )
        return;

      const target = event.currentTarget;
      const distanceToBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight;

      if (distanceToBottom <= 32) {
        void fetchChairs(chairLoadingState.lmstart + CHAIR_LIMIT);
      }
    },
    [chairLoadingState, hasMoreChairs, fetchChairs],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Treatment Type & Chair Selection */}
      <div className="grid gap-4 md:grid-cols-[1fr_1fr] xl:grid-cols-[2fr_1fr] md:items-end md:gap-6">
        <div />
        <div className="space-y-3 hidden pointer-events-none">
          <p className="text-base font-bold leading-tight text-[#1E376B]">
            Buồng (Phòng)
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {["dieuTri", "tieuPhau"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setSelectedTreatmentType((prev) =>
                    prev === type ? null : (type as "dieuTri" | "tieuPhau"),
                  )
                }
                className={`flex min-w-37 items-center justify-between rounded-full border px-4 py-3 transition-colors ${
                  selectedTreatmentType === type
                    ? "border-[#1982FF] bg-[#E8F1FD]"
                    : "border-default-300 bg-white"
                }`}
              >
                <span className="text-base font-medium text-[#1E376B]">
                  {type === "dieuTri" ? "Điều trị" : "Tiểu phẫu"}
                </span>
                <Checkbox
                  radius="full"
                  isSelected={selectedTreatmentType === type}
                  onValueChange={(isSelected) =>
                    setSelectedTreatmentType(
                      isSelected ? (type as "dieuTri" | "tieuPhau") : null,
                    )
                  }
                  onClick={(e) => e.stopPropagation()}
                  aria-label={type === "dieuTri" ? "Điều trị" : "Tiểu phẫu"}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Select
            aria-label="Phòng/Ghế nha"
            placeholder="Chọn"
            variant="bordered"
            label={
              <div className="text-base font-medium">
                Phòng/Ghế nha <span className="text-danger">*</span>
              </div>
            }
            labelPlacement="outside-left"
            items={chairOptions}
            selectedKeys={selectedChairId ? [selectedChairId] : []}
            onSelectionChange={(keys) =>
              setSelectedChairId(String(Array.from(keys)[0] || ""))
            }
            onOpenChange={handleChairSelectOpen}
            listboxProps={{ onScroll: handleChairScroll }}
            classNames={{
              trigger: `rounded-2xl border-default-300 bg-white px-4 py-2 min-h-0 h-auto data-[hover=true]:border-default-300 ${
                errors?.dentalChairId ? "!border-danger" : ""
              }`,
              value: "text-base font-semibold text-[#1E376B]",
              selectorIcon: "text-[#8AA0B8]",
            }}
          >
            {(chair) => <SelectItem key={chair.id}>{chair.code}</SelectItem>}
          </Select>
          {errors?.dentalChairId && (
            <span className="mt-1 block text-xs font-medium text-danger">
              {errors.dentalChairId}
            </span>
          )}
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-2xl border border-default-300 bg-white overflow-hidden">
        {proceduresLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner size="sm" color="default" />
          </div>
        ) : proceduresError ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-4 text-center text-default-500">
            <p>{proceduresError}</p>
          </div>
        ) : serviceRows.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center px-4 text-default-500">
            Chưa có danh sách tiến trình điều trị
          </div>
        ) : (
          <>
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-default-100 text-left text-[13px] font-semibold text-[#6D8197]">
                  <th className="w-10 px-4 py-2">#</th>
                  <th className="w-[24%] px-3">Dịch vụ</th>
                  <th className="w-[8%] px-3">Vị trí</th>
                  <th className="w-[10%] px-1 text-center">Số lượng</th>
                  <th className="w-[20%] px-3">Tiến trình</th>
                  <th className="w-[20%] px-3">
                    Bác sĩ <span className="text-red-500">*</span>{" "}
                  </th>
                  <th className="w-[18%] px-3">KTV</th>
                </tr>
              </thead>
              <tbody>
                {serviceRows.map((service, index) => {
                  const selection =
                    serviceSelections[service.rowKey] ||
                    createEmptySelection(service.selectedProgressKey || "");
                  const doctorErrorKey =
                    service.orderDetailId || service.rowKey;

                  const progressError =
                    errors?.progressByOrderDetailId?.[doctorErrorKey];
                  const doctorError =
                    errors?.doctorByOrderDetailId?.[doctorErrorKey];

                  const missingProgressError =
                    selection.hasTouchedDoctor &&
                    selection.doctorId.trim() &&
                    !selection.selectedProgressKey
                      ? "Vui lòng chọn tiến trình"
                      : undefined;

                  const resolvedProgressError =
                    progressError || missingProgressError;

                  return (
                    <tr
                      key={service.rowKey}
                      className={`border-t border-default-200 ${progressError || doctorError || resolvedProgressError ? "h-22" : "h-15"}`}
                    >
                      <td className="p-2 text-base text-center font-semibold text-[#1E376B]">
                        {index + 1}
                      </td>
                      <td className="p-2">
                        <p className="text-base font-medium text-[#1E376B]">
                          {service.name}
                        </p>
                        {service.schedule && (
                          <p className="mt-1 text-[12px] font-medium text-[#6D8197]">
                            {dayjs(service.schedule).format(
                              "HH:mm - DD/MM/YYYY",
                            )}
                          </p>
                        )}
                      </td>
                      <td className="p-2">
                        <span className="inline-flex items-center justify-center rounded-lg bg-[#8FBFFA] px-3 py-2 text-[13px] font-semibold leading-none text-[#233E6F]">
                          {/* {service.position} */}
                          {service.position === "Cả hai hàm"
                            ? "CH"
                            : service.position === "Hàm trên"
                              ? "HT"
                              : service.position === "Hàm dưới"
                                ? "HD"
                                : service.position}
                        </span>
                      </td>
                      <td className="px-2 text-center text-[13px] font-semibold text-[#1E376B]">
                        {service.quantity}
                      </td>
                      <td className="px-2 align-middle">
                        <SelectField
                          placeholder="Chọn tiến trình"
                          options={service.progressOptions}
                          selectedKey={selection.selectedProgressKey}
                          size="lg"
                          error={resolvedProgressError}
                          onChange={(value) =>
                            updateServiceSelection(
                              service.rowKey,
                              "selectedProgressKey",
                              value,
                            )
                          }
                        />
                      </td>
                      <td className="px-2 align-middle">
                        <SelectField
                          placeholder="Chọn bác sĩ"
                          hideTimeLine
                          options={doctorOptions}
                          size="lg"
                          selectedKey={
                            selection.hasTouchedDoctor ? selection.doctorId : ""
                          }
                          error={doctorError}
                          onChange={(value) =>
                            updateServiceSelection(
                              service.rowKey,
                              "doctorId",
                              value,
                            )
                          }
                        />
                      </td>
                      <td className="px-2 align-middle">
                        <SelectField
                          placeholder="Chọn KTV"
                          isRightAlign={true}
                          hideTimeLine
                          options={assistantOptions}
                          selectedKey={selection.doctorAssistantId}
                          emptyMessage="Hiện chưa có KTV"
                          size="lg"
                          onChange={(value) =>
                            updateServiceSelection(
                              service.rowKey,
                              "doctorAssistantId",
                              value,
                            )
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {errors?.noProgressData && (
              <div className="border-t border-default-200 px-4 py-3">
                <p className="text-sm font-medium text-danger">
                  {errors.noProgressData}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Note */}
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Ghi chú điều trị"
        minRows={2}
        variant="bordered"
        classNames={{
          inputWrapper: TEXTAREA_WRAPPER_CLASS,
          input: "text-base placeholder:text-[#7A8593]",
        }}
      />
    </div>
  );
};

export default TreatmentProgressSection;
