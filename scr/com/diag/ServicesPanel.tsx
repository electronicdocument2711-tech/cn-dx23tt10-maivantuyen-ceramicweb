"use client";

import React, { useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/format";
import { ServiceOffer } from "@/types/define.d";
import AddDiagnosisServices from "./AddDiagnosisServices";
import SelectServiceState from "./SelectServiceState";
import { addToast, Button, Spinner } from "@heroui/react";
import { UI_META } from "@/const/ui";
import { IconDiscountPercent } from "../icons/regular";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { filter } from "remeda";
import { LOWER_TEETH_IDS, UPPER_TEETH_IDS } from "./teethItems";
import { IconCircleCheckFilled, IconCircleDashed } from "@tabler/icons-react";
import useLocal from "@/hook/useLocal";

const getTeethLabels = (value: string) => {
  if (value === "Hàm trên") return "HT";
  if (value === "Hàm dưới") return "HD";
  if (value === "Cả hàm" || value === "Cả hai hàm") return "CH";
  return value;
};

const ListServices = ({
  serviceData,
  onDelete,
  onUpdate,
  mode,
  grouped,
}: {
  serviceData: ServiceOffer[];
  onDelete: (value: ServiceOffer) => void;
  onUpdate: (service: ServiceOffer, isConfirm: boolean) => void;
  mode: "assign" | "confirm" | "diagnosis";
  grouped: boolean;
}) => {
  // group services by ServiceId if grouped view is enabled, summing Amount, AmountBeforeTax, DiscountAmount, PaidAmount  and TaxAmount. concatenating AnatomyBodyPartItemName into arrays,

  const groupedData = useMemo(() => {
    if (!grouped) return serviceData;
    const map = new Map<
      string,
      ServiceOffer & {
        AnatomyBodyPartItemNames: string[];
        subItems?: ServiceOffer[];
      }
    >();
    serviceData.forEach((service) => {
      const key = service.ServiceId;
      const existing = map.get(key);
      if (existing) {
        existing.Amount = (
          parseInt(existing.Amount) + parseInt(service.Amount)
        ).toString();
        existing.AmountBeforeTax = (
          parseInt(existing.AmountBeforeTax) + parseInt(service.AmountBeforeTax)
        ).toString();
        existing.DiscountAmount = (
          parseInt(existing.DiscountAmount) + parseInt(service.DiscountAmount)
        ).toString();
        existing.PaidAmount = (
          parseInt(existing.PaidAmount ?? "0") +
          parseInt(service.PaidAmount ?? "0")
        ).toString();
        existing.TaxAmount = (
          parseInt(existing.TaxAmount) + parseInt(service.TaxAmount)
        ).toString();
        existing.AnatomyBodyPartItemNames.push(service.AnatomyBodyPartItemName);

        if (!existing.subItems) existing.subItems = [existing];
        existing.subItems.push(service);
      } else {
        map.set(key, {
          ...service,
          AnatomyBodyPartItemNames: [service.AnatomyBodyPartItemName],
        });
      }
    });

    // sort by alphabetical order of ServiceName within groups then return
    return Array.from(map.values()).sort((a, b) =>
      (a.ServiceName ?? "")
        .toLowerCase()
        .localeCompare((b.ServiceName ?? "").toLowerCase(), "vi"),
    );
  }, [serviceData, grouped]);

  return groupedData.map(
    (service: ServiceOffer & { subItems?: ServiceOffer[] }, index: number) => (
      <tr
        key={index}
        className="border-b-1 group border-default-400 bg-white hover:bg-gray-50 text-default-800"
      >
        <td className="sticky left-0 z-10 text-center font-medium text-sm p-0 bg-white group-hover:bg-gray-50">
          <p className="w-10 p-2">{index + 1}</p>
        </td>
        <td className="sticky left-10 z-10 min-w-50 text-left font-medium text-sm p-2 bg-white group-hover:bg-gray-50">
          {service.ServiceName}
        </td>
        <td className="sticky left-60 z-10 p-0 min-w-16 max-w-[320px] bg-white group-hover:bg-gray-50">
          <div
            className={`p-2 flex gap-0.5 flex-wrap ${grouped ? "min-w-[210px] w-full justify-start" : "justify-center"}`}
          >
            {grouped && service.subItems && service.subItems.length > 1 ? (
              service.subItems?.map((subItem, subIndex) => (
                <span
                  key={subIndex}
                  className={`${subItem.IsConfirmed == "1" ? "bg-primary-200" : "bg-stone-200"} text-center py-1 px-1.5 font-medium text-xs rounded-md`}
                >
                  {getTeethLabels(subItem.AnatomyBodyPartItemName)}
                </span>
              ))
            ) : (
              <span className="bg-primary-200 text-center py-1 px-1.5 font-medium text-xs rounded-md">
                {getTeethLabels(service.AnatomyBodyPartItemName)}
              </span>
            )}
          </div>
        </td>
        <td className="p-2 min-w-20 text-center">
          {grouped ? (
            <span>{service.subItems?.length || "1"}</span>
          ) : (
            <div className="w-fit mx-auto">
              <SelectServiceState
                data={service}
                onChangeConfirm={(isConfirm) => onUpdate(service, isConfirm)}
                onDelete={() => onDelete(service)}
                showLabel={mode !== "confirm"}
              />
            </div>
          )}
        </td>
        <td className="items-center text-right font-medium text-sm p-2">
          {formatCurrency(service.ServicePrice.toString(), true)}
        </td>
        <td className="font-medium text-right text-sm p-2 flex items-center justify-end">
          {Number(service.DiscountAmount ?? 0) > 0 ? (
            <p className="font-medium text-sm">
              {formatCurrency(service.DiscountAmount.toString(), true)}
            </p>
          ) : (
            <div className="w-18 h-7 border-1 border-default-400 rounded-md flex items-center justify-center gap-1">
              <IconDiscountPercent />
              <p className="text-xs text-foreground font-bold">Thêm</p>
            </div>
          )}
        </td>
        <td className="font-semibold text-right text-sm p-2">
          {formatCurrency(service.AmountBeforeTax.toString(), true)}
        </td>
        <td className="font-medium text-right text-sm p-2 border-l-1 border-default-400">
          <div className="flex items-center justify-between gap-1">
            <p className="w-9 text-center">
              {formatCurrency(service.TaxPercent, false, false)}
            </p>
            <p>{formatCurrency(service.TaxAmount.toString(), true)}</p>
          </div>
        </td>
        <td className="sticky right-0 z-10 min-w-32 bg-white group-hover:bg-gray-50">
          <div className="w-full border-l-1 border-default-400 min-h-[46px] p-2 flex items-center justify-end">
            <p className="text-right font-medium text-sm">
              {formatCurrency(service.Amount.toString(), true)}
            </p>
          </div>
        </td>
      </tr>
    ),
  );
};

const sortByNameAndTooth = (a: ServiceOffer, b: ServiceOffer) => {
  const nameCompare = (a.ServiceName ?? "")
    .toLowerCase()
    .localeCompare((b.ServiceName ?? "").toLowerCase(), "vi");
  if (nameCompare !== 0) return nameCompare;
  return getTeethLabels(a.AnatomyBodyPartItemName).localeCompare(
    getTeethLabels(b.AnatomyBodyPartItemName),
    "vi",
  );
};

export default function ServicesPanel({
  initialServices,
  selectedTeeths,
  diagnoseId,
  customerId,
  mode,
  loading,
  error,
  onDirtyChange,
  onSaveSuccess,
  offerServices,
  setOfferServices,
  addedServices,
  setAddedServices,
  removedServices,
  setRemovedServices,
}: {
  initialServices: ServiceOffer[];
  diagnoseId: string;
  customerId: string;
  loading: boolean;
  error: string | null;
  selectedTeeths: string[];
  mode: "assign" | "confirm" | "diagnosis";
  onDirtyChange?: (isDirty: boolean) => void;
  onSaveSuccess?: () => void;
  offerServices: ServiceOffer[];
  setOfferServices: React.Dispatch<React.SetStateAction<ServiceOffer[]>>;
  addedServices: ServiceOffer[];
  setAddedServices: React.Dispatch<React.SetStateAction<ServiceOffer[]>>;
  removedServices: { OrderDetailId: string; ServiceId: string }[];
  setRemovedServices: React.Dispatch<
    React.SetStateAction<{ OrderDetailId: string; ServiceId: string }[]>
  >;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const abortSubmitRef = React.useRef<AbortController | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [grouped, setGrouped] = useLocal<boolean>("services-grouped", false);

  // ─── Derived display groups ─────────────────────────────────────────────────
  const initialConfirmedNotProcessed = useMemo(
    () =>
      initialServices.filter(
        (s) => s.IsConfirmed === "1" && s.IsProcessed === "0",
      ),
    [initialServices],
  );

  const initialConfirmedProcessed = useMemo(
    () => initialServices.filter((s) => s.IsProcessed === "1"),
    [initialServices],
  );

  // Confirmed-not-processed rows minus any that have been removed/converted this session
  const displayedConfirmedNotProcessed = useMemo(
    () =>
      initialConfirmedNotProcessed.filter(
        (s) => !removedServices.some((r) => r.OrderDetailId === s.Id),
      ),
    [initialConfirmedNotProcessed, removedServices],
  );

  // In "assign" mode show offer rows + confirmed rows; in "confirm" mode skip offer rows
  const renderNotProcessed = useMemo(() => {
    const base =
      mode === "confirm"
        ? [...displayedConfirmedNotProcessed, ...addedServices]
        : [
            ...offerServices,
            ...displayedConfirmedNotProcessed,
            ...addedServices,
          ];
    return [...base].sort(sortByNameAndTooth);
  }, [mode, offerServices, displayedConfirmedNotProcessed, addedServices]);

  // All visible rows — used for cost summary
  const datas = useMemo(
    () => [...renderNotProcessed, ...initialConfirmedProcessed],
    [renderNotProcessed, initialConfirmedProcessed],
  );

  // ─── Dirty flag ─────────────────────────────────────────────────────────────
  const isDirty = useMemo(() => {
    if (addedServices.length > 0 || removedServices.length > 0) return true;
    const initialOffers = initialServices.filter((s) => s.IsConfirmed === "0");
    if (offerServices.length !== initialOffers.length) return true;
    const initialOfferKeys = new Set(
      initialOffers.map((s) => `${s.ServiceId}-${s.AnatomyBodyPartItemId}`),
    );
    return offerServices.some(
      (s) => !initialOfferKeys.has(`${s.ServiceId}-${s.AnatomyBodyPartItemId}`),
    );
  }, [addedServices, removedServices, offerServices, initialServices]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const isCoveredBy = (subject: ServiceOffer, cover: ServiceOffer) => {
    if (subject.ServiceId !== cover.ServiceId) return false;
    const subjectId = subject.AnatomyBodyPartItemId;
    const coverId = cover.AnatomyBodyPartItemId;
    return (
      coverId === "1" ||
      (coverId === "2" && UPPER_TEETH_IDS.includes(subjectId)) ||
      (coverId === "3" && LOWER_TEETH_IDS.includes(subjectId)) ||
      coverId === subjectId
    );
  };

  const onAddServices = (serviceValues: ServiceOffer[]) => {
    // Dedup logic runs only against offerServices; confirmed services are never touched
    const filteredNewServices = serviceValues.reduce(
      (acc, newItem) => {
        const processItem = { ...newItem };
        if (
          processItem.AnatomyBodyPartItemId === "2" ||
          processItem.AnatomyBodyPartItemId === "3"
        ) {
          const counterPartId =
            processItem.AnatomyBodyPartItemId === "2" ? "3" : "2";
          const hasCounterPart = acc.some(
            (item) =>
              item.ServiceId === processItem.ServiceId &&
              item.AnatomyBodyPartItemId === counterPartId,
          );
          if (hasCounterPart) {
            processItem.AnatomyBodyPartItemId = "1";
            processItem.AnatomyBodyPartItemName = "Cả hàm";
          }
        }
        const hasCover = acc.some((item) => isCoveredBy(processItem, item));
        if (hasCover) return acc;
        return [
          ...filter(acc, (item) => !isCoveredBy(item, processItem)),
          processItem,
        ];
      },
      [...offerServices],
    );

    setOfferServices(filteredNewServices);
  };

  const onDeleteService = (serviceData: ServiceOffer) => {
    if (serviceData.IsConfirmed === "0") {
      // Offer service: simply remove from the offer list
      setOfferServices((prev) =>
        prev.filter(
          (s) =>
            !(
              s.ServiceId === serviceData.ServiceId &&
              s.AnatomyBodyPartItemId === serviceData.AnatomyBodyPartItemId
            ),
        ),
      );
    } else {
      // Confirmed service: determine if it came from DB or was added this session
      const isFromDb =
        serviceData.Id !== null &&
        initialServices.some(
          (s) => s.Id === serviceData.Id && s.IsConfirmed === "1",
        );
      if (isFromDb) {
        setRemovedServices((prev) => [
          ...prev,
          {
            OrderDetailId: serviceData.Id!,
            ServiceId: serviceData.ServiceId,
          },
        ]);
      } else {
        setAddedServices((prev) =>
          prev.filter(
            (s) =>
              !(
                s.ServiceId === serviceData.ServiceId &&
                s.AnatomyBodyPartItemId === serviceData.AnatomyBodyPartItemId
              ),
          ),
        );
      }
    }
  };

  const onToggleConfirm = (serviceData: ServiceOffer, isConfirm: boolean) => {
    if (isConfirm) {
      // Offer → Confirmed: move from offerServices into addedServices
      setOfferServices((prev) =>
        prev.filter(
          (s) =>
            !(
              s.ServiceId === serviceData.ServiceId &&
              s.AnatomyBodyPartItemId === serviceData.AnatomyBodyPartItemId
            ),
        ),
      );
      setAddedServices((prev) => [
        ...prev,
        { ...serviceData, IsConfirmed: "1" },
      ]);
    } else {
      // Confirmed → Offer
      const isFromDb =
        serviceData.Id !== null &&
        initialServices.some(
          (s) => s.Id === serviceData.Id && s.IsConfirmed === "1",
        );
      if (isFromDb) {
        // Track the deletion and add a fresh offer clone (no Id)
        setRemovedServices((prev) => [
          ...prev,
          {
            OrderDetailId: serviceData.Id!,
            ServiceId: serviceData.ServiceId,
          },
        ]);
        setOfferServices((prev) => [
          ...prev,
          { ...serviceData, Id: null, IsConfirmed: "0" },
        ]);
      } else {
        // Session-added confirmed service: move back to offerServices
        setAddedServices((prev) =>
          prev.filter(
            (s) =>
              !(
                s.ServiceId === serviceData.ServiceId &&
                s.AnatomyBodyPartItemId === serviceData.AnatomyBodyPartItemId
              ),
          ),
        );
        setOfferServices((prev) => [
          ...prev,
          { ...serviceData, IsConfirmed: "0" },
        ]);
      }
    }
  };

  const onSaveService = async () => {
    try {
      abortSubmitRef.current?.abort();
      abortSubmitRef.current = new AbortController();
      setSubmitting(true);

      const payload: {
        offerServices: ServiceOffer[];
        addedServices?: ServiceOffer[];
        removedServices?: { OrderDetailId: string; ServiceId: string }[];
      } = { offerServices };
      if (addedServices.length > 0) payload.addedServices = addedServices;
      if (removedServices.length > 0) payload.removedServices = removedServices;

      const res = await rest.post(
        `/customer/${customerId}/diagnose/${diagnoseId}/services`,
        payload,
        { signal: abortSubmitRef.current.signal },
      );
      if (res.status !== 200) throw new Error("Lỗi khi lưu dịch vụ");

      addToast({
        title: "Thành công",
        description: "Lưu hồ sơ thành công",
        color: "success",
      });
      onSaveSuccess?.();
    } catch (error: any) {
      if (
        (error instanceof Error && error.name === "AbortError") ||
        error.code === "ERR_CANCELED"
      )
        return;
      addToast({
        title: "Thất bại",
        description: getErrorMessage(error, "Đã có lỗi xảy ra khi lưu dịch vụ"),
        color: "warning",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const sumaryCost = useMemo(() => {
    const totalAmount = datas.reduce(
      (sum, service: ServiceOffer) => sum + parseInt(service.Amount),
      0,
    );
    const totalDiscount = datas.reduce(
      (sum, service: ServiceOffer) => sum + parseInt(service.DiscountAmount),
      0,
    );

    const totalPaid = datas.reduce(
      (sum, service: ServiceOffer) => sum + parseInt(service.PaidAmount ?? "0"),
      0,
    );
    const minimumPayment = 0;
    return {
      totalAmount,
      totalDiscount,
      needToPay: totalAmount - totalDiscount,
      totalPaid,
      remaining: totalAmount - totalDiscount - totalPaid,
      minimumPayment,
    };
  }, [datas]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [datas]);

  const renderContent = (grouped: boolean) => {
    if (loading) {
      return (
        <tr className="h-14 border-b-1 border-default-400 group bg-white [&>td]:group-hover:bg-gray-50 transition-all duration-300 text-default-800">
          <td colSpan={10} className="p-4 text-center text-sm text-default-500">
            <Spinner size="sm" color="default" />
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr className="h-14 border-b-1 border-default-400 group bg-white [&>td]:group-hover:bg-gray-50 transition-all duration-300 text-default-800">
          <td colSpan={10} className="p-4 text-center text-sm text-red-500">
            {error}
          </td>
        </tr>
      );
    }

    if (datas.length === 0)
      return (
        <tr className="h-14 border-b-1 border-default-400 group bg-white [&>td]:group-hover:bg-gray-50 transition-all duration-300 text-default-800">
          <td
            colSpan={10}
            className="p-4 text-center text-sm text-default-500"
          ></td>
        </tr>
      );

    return (
      <>
        {
          <ListServices
            serviceData={renderNotProcessed}
            onDelete={onDeleteService}
            onUpdate={onToggleConfirm}
            mode={mode}
            grouped={grouped}
          />
        }
        {initialConfirmedProcessed.length > 0 && (
          <tr className="h-7 border-b-1 border-default-400 group bg-success-100  transition-all duration-300 ">
            <td colSpan={2} className="sticky left-0 z-10 w-full">
              <p className="px-3 text-success-700 font-bold">Đang điều trị</p>
            </td>
            <td colSpan={7} />
          </tr>
        )}
        {initialConfirmedProcessed.length > 0 && (
          <ListServices
            serviceData={initialConfirmedProcessed}
            onDelete={onDeleteService}
            onUpdate={onToggleConfirm}
            mode={mode}
            grouped={grouped}
          />
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {mode === "assign" && (
        <AddDiagnosisServices
          selectedTeeths={selectedTeeths}
          customerId={customerId ?? ""}
          diagnoseId={diagnoseId ?? ""}
          onAddService={onAddServices}
        />
      )}

      <div className="border border-default-400 rounded-2xl">
        <div ref={scrollRef} className="overflow-x-auto rounded-2xl">
          <table className="w-full rounded-2xl ">
            <thead className="bg-default-100 border-b border-b-default-400 text-default-500 text-sm font-semibold">
              <tr>
                <th className="sticky left-0 z-10 bg-default-100 p-0 text-center">
                  <p className="w-10 p-2">#</p>
                </th>
                <th className="sticky left-10 z-10 bg-default-100 text-left text-sm min-w-50 p-2">
                  <div className="flex justify-start gap-2 items-center pl-2 py-0.5 pr-1 bg-white rounded-sm w-fit">
                    <span className="text-blue-700">Dịch vụ</span>
                    <button
                      className="p-1 bg-white cursor-pointer flex items-center gap-1 hover:text-gray-800 border-l-1 border-default-200"
                      onClick={() => setGrouped(!grouped)}
                    >
                      {!grouped ? (
                        <IconCircleDashed size={16} />
                      ) : (
                        <IconCircleCheckFilled
                          size={16}
                          className="text-sky-500"
                        />
                      )}
                      <span className="text-xs font-medium">Gom nhóm</span>
                    </button>
                  </div>
                </th>
                <th className="sticky left-60 bg-default-100 p-2 z-10 min-w-16 text-left">
                  Vị trí
                </th>
                <th className="p-2 min-w-20 text-center">
                  {grouped ? "Số lượng" : "Điều trị"}
                </th>
                <th className="p-2 text-sm font-semibold text-right text-default-500 min-w-32">
                  Đơn giá <br /> <span className="text-xs">(Chưa GTGT)</span>
                </th>
                <th className="p-2 min-w-32 text-right">Giảm giá</th>
                <th className="p-2 text-sm font-semibold text-right text-default-500 min-w-32 border-r-1 border-default-400">
                  Thành tiền <br /> <span className="text-xs">(Chưa GTGT)</span>
                </th>
                <th className="text-sm font-semibold text-right text-default-500 min-w-38">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-semibold text-center py-1 border-b-1 border-default-400 w-full">
                      Thuế GTGT
                    </p>
                    <div className="h-6 w-full flex items-center justify-between">
                      <p className="w-12 text-center flex items-center justify-center h-6 text-sm text-default-500 px-2 border-r-1 border-default-400 ">
                        %
                      </p>
                      <p className="text-sm text-default-500 px-2">Tiền thuế</p>
                    </div>
                  </div>
                </th>
                <th className="sticky right-0 z-10 bg-default-100 text-right text-sm font-semibold text-default-500 min-w-32 ">
                  <div className="border-l-1 border-default-400 p-2">
                    Thành tiền <br />{" "}
                    <span className="text-xs">(Đã có GTGT)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>{renderContent(grouped)}</tbody>
          </table>
        </div>

        <div className="flex flex-col ">
          <div className="w-full flex items-center justify-end border-b-1 border-default-400 group bg-white hover:bg-gray-100 transition-all duration-300 text-default-800">
            <div className="flex items-center justify-between ">
              <p className="min-w-64 px-4 py-2 text-left text-sm font-bold text-default-800">
                Tổng tiền (A)
              </p>
              <div className="min-w-32 flex items-center justify-end border-l-1 border-default-400">
                <p className="px-1.5 text-right text-sm font-medium flex items-center text-default-800 min-h-[36px]">
                  {formatCurrency(sumaryCost.totalAmount, true)}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-end border-b-1 border-default-400 group bg-white hover:bg-gray-100 transition-all duration-300 text-default-800">
            <div className="flex items-center justify-between ">
              <p className="min-w-64 px-4 py-2 text-left text-sm font-bold text-default-800">
                Giảm giá (B)
              </p>
              <div className="min-w-32 flex items-center justify-end border-l-1 border-default-400">
                <p className="px-1.5 text-right text-sm font-medium flex items-center text-default-800 min-h-[36px]">
                  {formatCurrency(sumaryCost.totalDiscount, true)}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-end border-b-1 border-default-400 group bg-white hover:bg-gray-100 transition-all duration-300 text-default-800">
            <div className="flex items-center justify-between ">
              <p className="min-w-64 px-4 py-2 text-left text-sm font-bold text-default-800">
                Cần thanh toán (C)=(A)-(B)
              </p>
              <div className="min-w-32 flex items-center justify-end border-l-1 border-default-400">
                <p className="px-1.5 text-right text-sm font-medium flex items-center text-default-800 min-h-[36px]">
                  {formatCurrency(sumaryCost.needToPay, true)}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-end border-b-1 border-default-400 group bg-white hover:bg-gray-100 transition-all duration-300 text-default-800">
            <div className="flex items-center justify-between ">
              <p className="min-w-64 px-4 py-2 text-left text-sm font-bold text-default-800">
                Đã trả (D)
              </p>
              <div className="min-w-32 flex items-center justify-end border-l-1 border-default-400">
                <p className="px-1.5 text-right font-medium flex items-center text-default-800 min-h-[36px] text-sm ">
                  {formatCurrency(sumaryCost.totalPaid, true) ?? 0}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-end border-b-1 border-default-400 group bg-white hover:bg-gray-100 transition-all duration-300 text-default-800">
            <div className="flex items-center justify-between ">
              <p className="min-w-64 px-4 py-2 text-left text-sm font-bold text-default-800">
                Còn lại (E)=(C)-(D)
              </p>
              <div className="min-w-32 flex items-center justify-end border-l-1 border-default-400">
                <p className="px-1.5 text-right text-primary-500 font-bold flex items-center min-h-[36px] text-sm ">
                  {formatCurrency(sumaryCost.remaining, true)}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-end  group bg-white hover:bg-gray-100 transition-all duration-300 text-default-800 rounded-b-2xl">
            <div className="flex items-center justify-between ">
              <p className="min-w-64 px-4 py-2 text-left text-sm font-bold text-default-800">
                Thanh toán tối thiểu
              </p>
              <div className="min-w-32 flex items-center justify-end border-l-1 border-default-400">
                <p className="  px-1.5 text-right font-medium flex items-center min-h-[36px] text-default-800 text-sm">
                  {formatCurrency(sumaryCost.minimumPayment, true)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {mode === "assign" && (
        <div className="py-4 flex justify-end border-t-1 border-default-400">
          <Button
            isDisabled={!isDirty}
            isLoading={loading || submitting}
            color="primary"
            onPress={onSaveService}
            className={UI_META.Button.primary.classnames + " max-w-28"}
          >
            Lưu hồ sơ
          </Button>
        </div>
      )}
    </div>
  );
}
