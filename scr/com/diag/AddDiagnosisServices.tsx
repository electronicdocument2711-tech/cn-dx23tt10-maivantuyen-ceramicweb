import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Checkbox,
  Spinner,
} from "@heroui/react";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { IconAlertTriangleFilled, IconSearch } from "@tabler/icons-react";
import { ServiceDetails, ServiceOffer } from "@/types/define.d";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { useDebounce } from "@/hook/useDebounce";
import { formatCurrency } from "@/lib/format";
import { useOnInView } from "react-intersection-observer";
import { getAnatomyBodyPartItemIds, getTeethLabels } from "./teethItems";
import { useConfirm } from "../ConfirmProvider";

const PAGE_SIZE = 20;
const hasMorePage = (
  currentPage: string,
  totalRecords: string,
  limit: string,
) => {
  const total = parseInt(totalRecords, 10) ?? 0;
  const pageSize = parseInt(limit, 10) ?? PAGE_SIZE;
  return (
    (parseInt(currentPage, 10) ?? 1) <
    (total > pageSize ? Math.ceil(total / pageSize) : 1)
  );
};

const convertToServiceOffers = (item: ServiceDetails[]): ServiceOffer[] => {
  return item.map((s) => ({
    Id: null,
    ServiceId: s.ServiceId,
    ServiceName: s.Name,
    ServicePrice: s.SalePrice ?? "0",
    AnatomyBodyPartItemId: "",
    AnatomyBodyPartItemName: "",
    DiscountPercent: "0",
    DiscountAmount: "0",
    PaidAmount: "0",
    TaxPercent: Number(s.Tax).toString() ?? "0",
    TaxAmount: Number(s.Tax)
      ? ((Number(s.SalePrice) ?? 0) * ((Number(s.Tax) ?? 0) / 100)).toString()
      : "0",
    AmountBeforeTax: s.SalePrice.toString() ?? "0",
    Amount: Number(s.Tax)
      ? (
          (Number(s.SalePrice) ?? 0) *
          (1 + (Number(s.Tax) ?? 0) / 100)
        ).toString()
      : (s.SalePrice ?? 0).toString(),
    IsConfirmed: "0",
    record_ordering: null,
    IsProcessed: "0",
    IsTax: s?.IsTax || "0",
    MedicalProcedureId: s?.MedicalProcedureId,
    ChangedAt: null,
    ChangedBy: null,
  }));
};

export default function AddDiagnosisServices({
  selectedTeeths,
  customerId,
  diagnoseId,
  onAddService,
}: {
  selectedTeeths: string[];
  customerId: string;
  diagnoseId: string;
  onAddService: (services: ServiceOffer[]) => void;
}) {
  const { confirm } = useConfirm();
  const abortRef = useRef<AbortController | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [serviceOffers, setServiceOffers] = useState<ServiceOffer[]>([]);
  const filteredServiceOffers = useMemo(() => {
    return serviceOffers.sort((a, b) =>
      a.ServiceName.toLowerCase().localeCompare(
        b.ServiceName.toLowerCase(),
        "vi",
      ),
    );
  }, [serviceOffers]);
  const [selectedSevices, setSelectedServices] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const inViewRef = useOnInView(
    (inView) => {
      if (inView) {
        fetchMoreServices();
      }
    },
    {
      root: scrollRef.current,
      threshold: 0.5,
    },
  );

  const toggleSelect = (id: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAddServices = async (): Promise<boolean> => {
    // const handleAddServices =boolean => {
    if (selectedSevices.length === 0) {
      await confirm({
        message: "Vui lòng chọn ít nhất một dịch vụ trước khi thêm",
        type: "warning",
      });
      return false;
    }
    if (selectedTeeths && selectedTeeths.length === 0) {
      await confirm({
        message: "Vui lòng chọn vị trí răng áp dụng cho dịch vụ",
        type: "warning",
      });
      setSelectedServices([]);
      return false;
    }

    const selectedServiceOffers: ServiceOffer[] = [];
    selectedSevices.forEach((serviceId) => {
      const service = serviceOffers.find((s) => s.ServiceId === serviceId);
      if (service) {
        if (!selectedTeeths || selectedTeeths.length === 0) return;
        const topJaw = selectedTeeths.some((t) => t === "1-2" || t === "5-6");
        const bottomJaw = selectedTeeths.some(
          (t) => t === "3-4" || t === "7-8",
        );
        if (topJaw && bottomJaw)
          return selectedServiceOffers.push({
            ...service,
            AnatomyBodyPartItemId: "1",
            AnatomyBodyPartItemName: "Cả hàm",
          });
        if (topJaw)
          return selectedServiceOffers.push({
            ...service,
            AnatomyBodyPartItemId: "2",
            AnatomyBodyPartItemName: "Hàm trên",
          });
        if (bottomJaw)
          return selectedServiceOffers.push({
            ...service,
            AnatomyBodyPartItemId: "3",
            AnatomyBodyPartItemName: "Hàm dưới",
          });

        selectedTeeths.forEach((toothId) => {
          selectedServiceOffers.push({
            ...service,
            AnatomyBodyPartItemId:
              getAnatomyBodyPartItemIds([toothId])?.[0] ?? "",
            AnatomyBodyPartItemName: getTeethLabels([toothId])?.[0] ?? "",
          });
        });
      }
    });
    onAddService(selectedServiceOffers);

    setSelectedServices([]);
    return true;
  };

  useEffect(() => {
    const fetchServiceList = async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      try {
        setLoading(true);
        setError(null);
        setPage(1);

        const res = await rest.get(`/service`, {
          params: {
            lmstart: 0,
            limit: PAGE_SIZE,
            Keyword: debouncedQuery,
            StatusId: "1",
          },
          signal: abortRef.current.signal,
        });
        if (res.status !== 200) {
          throw new Error("Lỗi khi tải danh sách dịch vụ");
        }

        const data = res.data.module.views[0];
        if (!data || !Array.isArray(data.data)) {
          throw new Error("Dữ liệu dịch vụ không hợp lệ");
        }

        setHasMore(
          hasMorePage(
            data.pagination.currentPage,
            data.pagination.totalRecord,
            data.pagination.limit,
          ),
        );

        setServiceOffers(
          convertToServiceOffers((data.data as ServiceDetails[]) ?? []),
        );
      } catch (error: any) {
        if (
          (error instanceof Error && error.name === "CanceledError") ||
          error.code === "ERR_CANCELED"
        )
          return;

        setError(getErrorMessage(error, "Đã có lỗi xảy ra"));
      } finally {
        setLoading(false);
      }
    };
    fetchServiceList();
    return () => abortRef.current?.abort();
  }, [debouncedQuery, customerId, diagnoseId]);

  const fetchMoreServices = async () => {
    try {
      setLoadingMore(true);
      setError(null);
      const nextPage = page + 1;
      const res = await rest.get(`/service`, {
        params: {
          lmstart: (nextPage - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
          Keyword: debouncedQuery,
          StatusId: "1",
        },
      });
      if (res.status !== 200) {
        throw new Error("Lỗi khi tải danh sách chẩn đoán");
      }
      const data = res.data.module.views[0];
      if (!data || !Array.isArray(data.data)) {
        throw new Error("Dữ liệu dịch vụ không hợp lệ");
      }

      setHasMore(
        hasMorePage(
          data.pagination.currentPage,
          data.pagination.totalRecord,
          data.pagination.limit,
        ),
      );

      setServiceOffers(
        convertToServiceOffers((data.data as ServiceDetails[]) ?? []),
      );
      setPage(nextPage);
    } catch (error: any) {
      setError(getErrorMessage(error, "Đã có lỗi xảy ra"));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Autocomplete
      aria-label="search service"
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
      placeholder="Tìm tên dịch vụ..."
      itemHeight={64}
      maxListboxHeight={415}
      inputProps={{
        classNames: { input: "h-11" },
      }}
      classNames={{
        selectorButton: "hidden",
        base: "w-full",
        listboxWrapper:
          "overflow-visible [&_li[data-focus='true']:not(:hover)]:bg-transparent",
      }}
      startContent={<IconSearch size={20} className="w-6 h-6 text-slate-500" />}
      scrollShadowProps={{ isEnabled: false, hideScrollBar: false }}
      popoverProps={{
        placement: "bottom",
        shouldCloseOnScroll: false,
        // shouldFlip: false,
      }}
      listboxProps={{
        hideSelectedIcon: true,
        classNames: {
          base: "flex flex-col ",
          list: "overflow-y-auto max-h-[300px] ",
        },
        emptyContent: (
          <div className="p-4 text-center text-gray-500">
            Không tìm thấy dịch vụ
          </div>
        ),
        bottomContent: (
          <div className="py-2  px-4 flex items-center justify-between border-t border-default-300">
            <div>
              {selectedTeeths.length > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-base">Vị trí</span>
                  <div className="flex gap-1 flex-wrap">
                    {getTeethLabels(selectedTeeths).map((label, idx) => (
                      <div
                        key={idx}
                        className="rounded-md bg-primary-200 font-medium text-sm py-0.5 px-1.5"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-1 px-2 rounded-md bg-red-50 border border-red-100 flex items-center gap-2 text-red-700">
                  <IconAlertTriangleFilled size="18" />
                  Chưa chọn vị trí áp dụng
                </div>
              )}
            </div>
            <Button
              isLoading={loading}
              color="primary"
              onMouseDown={async (e) => {
                e.preventDefault();
                if (await handleAddServices()) inputRef.current?.blur();
              }}
              disabled={
                selectedSevices.length === 0 ||
                (selectedTeeths && selectedTeeths.length === 0)
              }
              className="font-bold px-4 disabled:opacity-60 disabled:cursor-default disabled:pointer-events-none"
            >
              Thêm dịch vụ
            </Button>
          </div>
        ),
      }}
    >
      <>
        {filteredServiceOffers.map((item: ServiceOffer) => (
          <AutocompleteItem
            key={item.ServiceId}
            textValue={item.ServiceName}
            className={`relative w-full data-[focus=true]:bg-transparent data-[focus=true]:text-inherit data-[hover=true]:bg-transparent`}
            classNames={{
              base: "py-0",
              title: "w-full flex items-center justify-between gap-10",
            }}
          >
            <div
              className={`w-full flex items-center gap-4 p-2 font-medium text-base justify-between ${selectedSevices.includes(item.ServiceId) ? "bg-default-200" : ""} hover:bg-default-50 rounded-2xl cursor-pointer`}
            >
              <div className={`w-full h-full flex items-center gap-3`}>
                <Checkbox
                  isReadOnly
                  isSelected={selectedSevices.includes(item.ServiceId)}
                  className="w-full pointer-events-none"
                  classNames={{
                    base: "w-full !bg-transparent",
                    label: "w-full flex items-center",
                    wrapper: "group-data-[hover=true]:before:bg-transparent",
                  }}
                />
                <p>{item.ServiceName}</p>
              </div>
              <p>{formatCurrency(item.AmountBeforeTax, true, true)}</p>
            </div>
          </AutocompleteItem>
        ))}
        {hasMore && !loadingMore && (
          <AutocompleteItem textValue="inview ref">
            <div ref={inViewRef} />
          </AutocompleteItem>
        )}
        {(loadingMore || loading) && (
          <AutocompleteItem
            textValue="loading more"
            className="w-full py-2 flex items-center justify-center"
          >
            <div className="flex items-center justify-center">
              <Spinner size="sm" color="default" />
            </div>
          </AutocompleteItem>
        )}
        {error && (
          <AutocompleteItem
            textValue="error"
            className="w-full py-2 flex items-center justify-center"
          >
            <div className="flex items-center justify-center">
              <p className="text-sm text-default-500 px-4">
                Lỗi khi tải danh sách dịch vụ, {error}
              </p>
            </div>
          </AutocompleteItem>
        )}
      </>
    </Autocomplete>
  );
}
