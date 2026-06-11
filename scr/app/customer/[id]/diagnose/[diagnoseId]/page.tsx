"use client";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
} from "@heroui/react";
import { IconChevronDown, IconCircleCheck } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import DiagnosePanel from "@/com/diag/DiagnosePanel";
import TeethChart from "@/com/diag/TeethChart";
import TeethChartJunior from "@/com/diag/TeethChartJunior";
import {
  CustomerDiagnosisData,
  DiagnoseDetail,
  ServiceOffer,
  TeethType,
} from "@/types/define.d";
import ServicesPanel from "@/com/diag/ServicesPanel";
import { useLeaveGuard } from "@/hook/useLeaveGuard";
import { useParams } from "next/navigation";
import { getItemIdsByAnatomyBodyPartItemId } from "@/com/diag/teethItems";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";

export default function DiagnoseDetailPage() {
  const params = useParams();
  const { id, diagnoseId } = params;
  const [personDiagnoseId, setPersonDiagnoseId] = useState<string | null>(null);

  const [selectedTab, setSelectedTab] = useState("diagnosis");

  const [teethType, setTeethType] = useState<TeethType>("adult");
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);

  const aboutDiagnoseRef = useRef<AbortController | null>(null);
  const aboutServiceRef = useRef<AbortController | null>(null);

  const [diagnose, setDiagnose] = useState<CustomerDiagnosisData[]>([]);
  const [diagnoseDraft, setDiagnoseDraft] = useState<CustomerDiagnosisData[]>(
    [],
  );

  const [loadingDiagnose, setLoadingDiagnose] = useState(true);
  const [errorDiagnose, setErrorDiagnose] = useState("");
  const [note, setNote] = useState("");
  const [noteDraft, setNoteDraft] = useState("");

  const [loadingService, setLoadingService] = useState(false);
  const [errorService, setErrorService] = useState<string | null>(null);

  const [initialServices, setInitialServices] = useState<ServiceOffer[]>([]);
  const [isServiceDirty, setIsServiceDirty] = useState(false);
  const [serviceRefreshKey, setServiceRefreshKey] = useState(0);

  const [offerServices, setOfferServices] = useState<ServiceOffer[]>([]);
  const [addedServices, setAddedServices] = useState<ServiceOffer[]>([]);
  const [removedServices, setRemovedServices] = useState<
    { OrderDetailId: string; ServiceId: string }[]
  >([]);

  const [diagnostician, setDiagnostician] = useState<{
    UpdatedAt: string;
    UpdatedBy: string;
  }>();

  // fetch diagnose details
  useEffect(() => {
    if (!diagnoseId || !id) return;
    const fetchDiagnoseDetails = async () => {
      aboutDiagnoseRef.current?.abort();
      const controller = new AbortController();
      aboutDiagnoseRef.current = controller;

      try {
        setLoadingDiagnose(true);
        setErrorDiagnose("");

        const res = await rest.get(`/customer/${id}/diagnose/${diagnoseId}`, {
          signal: controller.signal,
        });

        if (res.status !== 200)
          throw new Error("Lỗi khi tải thông tin chẩn đoán");
        const data = (res.data as DiagnoseDetail) ?? null;
        if (!data) throw new Error("Không tìm thấy thông tin chẩn đoán");
        if (controller.signal.aborted) return;

        setTeethType(data.PersonDiagnosis.IsAdult === "1" ? "adult" : "junior");
        setPersonDiagnoseId(data.PersonDiagnosis.PersonDiagnosisId);

        const newDiagnosis = data.PersonDiagnosis.PersonDiagnosisDetail?.map(
          (d: any) => {
            const teethList = d.AnatomyBodyPartItem.map(
              (item: any) => item.AnatomyBodyPartItemId,
            );
            const teethType =
              data.PersonDiagnosis.IsAdult === "1" ? "adult" : "junior";
            return {
              id: d.DiagnosisInfo.DiagnosisId,
              teethType,
              selectedTeeths:
                getItemIdsByAnatomyBodyPartItemId(teethList, d.isAdult) || [],
            };
          },
        );
        setDiagnose(newDiagnosis ?? []);
        setDiagnoseDraft(JSON.parse(JSON.stringify(newDiagnosis ?? [])));

        const diagnoseNote = data.PersonDiagnosis.Note ?? "";
        setNoteDraft(diagnoseNote);
        setNote(diagnoseNote);

        if (data.PersonDiagnosis.UpdatedAt && data.PersonDiagnosis.UpdatedBy) {
          setDiagnostician({
            UpdatedAt: data.PersonDiagnosis.UpdatedAt,
            UpdatedBy: data.PersonDiagnosis.UpdatedBy,
          });
        }
      } catch (error: any) {
        if (controller.signal.aborted) return;
        if (
          (error instanceof Error && error.name === "CanceledError") ||
          error.code === "ERR_CANCELED"
        )
          return;
        setErrorDiagnose(
          getErrorMessage(error, "Lỗi khi tải thông tin chẩn đoán"),
        );
      } finally {
        setLoadingDiagnose(false);
      }
    };
    fetchDiagnoseDetails();

    return () => {
      aboutDiagnoseRef.current?.abort();
    };
  }, [diagnoseId, id]);

  // fetch current services
  useEffect(() => {
    if (!id || !diagnoseId) return;
    const fetchServices = async () => {
      aboutServiceRef.current?.abort();
      aboutServiceRef.current = new AbortController();

      try {
        setLoadingService(true);
        setErrorService(null);

        const res = await rest.get(
          `customer/${id}/diagnose/${diagnoseId}/services`,
          {
            signal: aboutServiceRef.current.signal,
          },
        );

        setInitialServices(res.data?.data ?? []);
        setIsServiceDirty(false);
      } catch (error: any) {
        if (
          (error instanceof Error && error.name === "CanceledError") ||
          error.code === "ERR_CANCELED"
        )
          return;
        setErrorService(getErrorMessage(error, "Đã có lỗi xảy ra"));
      } finally {
        setLoadingService(false);
      }
    };

    fetchServices();
    return () => {
      aboutServiceRef.current?.abort();
    };
  }, [id, diagnoseId, serviceRefreshKey]);

  // Reset delta state whenever initialServices changes (after save + re-fetch)
  useEffect(() => {
    setOfferServices(initialServices.filter((s) => s.IsConfirmed === "0"));
    setAddedServices([]);
    setRemovedServices([]);
  }, [initialServices]);

  const isDirtyDiagnose = useMemo(() => {
    return (
      JSON.stringify(diagnose) !== JSON.stringify(diagnoseDraft) ||
      note !== noteDraft
    );
  }, [diagnose, diagnoseDraft, note, noteDraft]);

  const isDirty = useMemo(() => {
    return isDirtyDiagnose || isServiceDirty;
  }, [isDirtyDiagnose, isServiceDirty]);

  // confirm leave page for unsaved data
  useLeaveGuard(
    isDirty,
    "Hồ sơ chẩn đoán/dịch vụ chưa lưu, bạn có chắc muốn thoát ?",
    [`/customer/${id}/diagnose/${diagnoseId}`, `/customer/${id}/diagnose`],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="solid"
              className="bg-white border border-gray-400 shadow-xs !p-0.5 !px-3"
            >
              <span className="font-medium text-base">
                {teethType === "adult" ? "Răng người lớn" : "Răng trẻ em"}
              </span>
              <IconChevronDown size={20} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem
              key={"adult"}
              className={`p-2 mb-1 rounded-[10px]`}
              onClick={() => setTeethType("adult")}
            >
              <div className="flex flex-row justify-between w-full font-medium items-center">
                <p>Răng người lớn</p>
                {teethType === "adult" && (
                  <IconCircleCheck className="text-green-500" />
                )}
              </div>
            </DropdownItem>
            <DropdownItem
              key={"junior"}
              className={`p-2 mb-1 rounded-[10px]`}
              onClick={() => setTeethType("junior")}
            >
              <div className="flex flex-row justify-between w-full font-medium items-center">
                <p>Răng trẻ em</p>
                {teethType === "junior" && (
                  <IconCircleCheck className="text-green-500" />
                )}
              </div>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="w-full rounded-xl bg-default-50 py-4">
        <div className="max-w-2xl w-full mx-auto">
          {teethType === "adult" ? (
            <TeethChart onChange={(items: any) => setSelectedTeeth(items)} />
          ) : (
            <TeethChartJunior
              onChange={(items: any) => setSelectedTeeth(items)}
            />
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-8">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key ? key.toString() : "")}
          variant="underlined"
          classNames={{
            base: "w-full border-b border-gray-300 ",
            tabList: "pb-0.5",
            tab: "min-w-32 h-10",
            tabContent:
              "font-bold text-base text-[#7A8593] group-data-[selected=true]:text-default-800",
            cursor: "h-1 rounded-t-[3px] bg-primary-500",
          }}
        >
          <Tab key="diagnosis" title="Chẩn đoán" />
          <Tab key="assign" title="Chỉ định" />
          <Tab key="confirm" title="Dịch vụ điều trị" />
        </Tabs>

        {selectedTab === "diagnosis" && (
          <DiagnosePanel
            datas={diagnoseDraft}
            diagnostician={diagnostician}
            setData={setDiagnoseDraft}
            selectedTeeths={selectedTeeth}
            teethType={teethType}
            treatmentId={String(diagnoseId ?? null)}
            diagnoseId={personDiagnoseId}
            customerId={String(id ?? null)}
            note={noteDraft}
            setNote={setNoteDraft}
            onUpdateSuccess={(data, newNote) => {
              setDiagnose(data);
              setNote(newNote);
            }}
            loading={loadingDiagnose}
            error={errorDiagnose}
            isDirty={isDirtyDiagnose}
          />
        )}
        {(selectedTab === "assign" || selectedTab === "confirm") && (
          <ServicesPanel
            initialServices={initialServices}
            loading={loadingService}
            diagnoseId={String(diagnoseId ?? "")}
            customerId={String(id ?? "")}
            error={errorService}
            selectedTeeths={selectedTeeth}
            mode={selectedTab}
            onDirtyChange={setIsServiceDirty}
            onSaveSuccess={() => setServiceRefreshKey((k) => k + 1)}
            offerServices={offerServices}
            setOfferServices={setOfferServices}
            addedServices={addedServices}
            setAddedServices={setAddedServices}
            removedServices={removedServices}
            setRemovedServices={setRemovedServices}
          />
        )}
      </div>
    </div>
  );
}
