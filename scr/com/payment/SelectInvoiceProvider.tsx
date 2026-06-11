import { Select, SelectItem } from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useOnInView } from "react-intersection-observer";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";

export function SelectInvoiceProvider({
  value,
  onChange,
  errorMessage,
}: {
  value: any;
  onChange: React.Dispatch<React.SetStateAction<any>>;
  errorMessage?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const hasMore = useMemo(() => page < totalPages, [page, totalPages]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const inViewRef = useOnInView(
    (inView) => {
      if (inView) {
        fetchMore();
      }
    },
    {
      root: scrollRef.current,
      threshold: 0.5,
    },
  );

  useEffect(() => {
    const fetchInvoceProviders = async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      try {
        setLoading(true);
        setError(null);
        page === 1 ? setPage(1) : null;

        const res = await rest.get(`/clinic-invoice-config?`, {
          params: {
            page: "1",
            status: "1",
          },
          signal: abortRef.current.signal,
        });

        setData(res.data.data || []);
        setTotalPages(res.data.meta.pagination.pageCount);
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
    fetchInvoceProviders();
    return () => abortRef.current?.abort();
  }, []);

  const fetchMore = async () => {
    try {
      setLoadingMore(true);
      setError(null);
      const nextPage = page + 1;
      const res = await rest.get(
        `/clinic-invoice-config?status=1&page=${nextPage}`,
        {
          signal: abortRef.current?.signal,
        },
      );
      setData([...data, ...res.data.data]);
      setTotalPages(res.data.meta.pagination.pageCount);
      setPage(nextPage);
    } catch (error: any) {
      setError(getErrorMessage(error, "Đã có lỗi xảy ra"));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <Select
        label={
          <div
            className={`font-bold text-base ${errorMessage ? "text-danger" : ""} flex`}
          >
            Chủ thể xuất hóa đơn<span className="text-danger ml-0.5">*</span>
          </div>
        }
        labelPlacement="outside-top"
        placeholder="Chọn chủ thể xuất hóa đơn"
        variant="bordered"
        size="md"
        disallowEmptySelection
        itemHeight={40}
        isLoading={loading}
        value={value?.company_name}
        classNames={{
          label: "font-bold text-base",
          trigger: "border-default-400 text-base font-medium",
          value: "text-base font-medium text-slate-500",
        }}
        startContent={
          value && (
            <p className="flex gap-2 items-center px-2 py-0.5 text-sm rounded-lg bg-[#E6F2FB]">
              MST:{" "}
              <span className="text-base font-medium">{value.tax_number}</span>
            </p>
          )
        }
        listboxProps={{
          emptyContent: (
            <div className="p-4 text-center text-gray-500">
              Không tìm thấy thông tin xuất hóa đơn
            </div>
          ),
          hideSelectedIcon: true,
          ref: scrollRef,
        }}
      >
        <>
          {data.map((item: any) => (
            <SelectItem
              key={item.company_name}
              textValue={item.company_name}
              className={`relative w-full data-[focus=true]:bg-transparent
            data-[focus=true]:text-inherit data-[hover=true]:bg-transparent`}
              classNames={{
                base: "py-0",
                title:
                  " w-full min-h-10 flex items-center justify-between gap-10 ",
              }}
              onPress={() => onChange?.(item)}
            >
              {item.company_name}
            </SelectItem>
          ))}
          {hasMore && !loadingMore && (
            <SelectItem>
              <div ref={inViewRef} />
            </SelectItem>
          )}
          {error && (
            <SelectItem>
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center">
                  <p className="text-sm text-default-500 px-4">
                    Lỗi khi tải thông tin xuất hóa đơn, {error}
                  </p>
                </div>
              </div>
            </SelectItem>
          )}
        </>
      </Select>

      {!!errorMessage && (
        <span className="text-tiny text-danger ml-1">{errorMessage}</span>
      )}
    </div>
  );
}
