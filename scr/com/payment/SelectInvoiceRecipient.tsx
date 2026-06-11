import { Select, SelectItem } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import rest from "@/lib/rest";

export function SelectInvoiceRecipient({
  query,
  value,
  onChange,
  errorMessage,
}: {
  query: string;
  value: any;
  onChange: React.Dispatch<React.SetStateAction<any>>;
  errorMessage?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim() === "") return;

    const fetchData = async () => {
      try {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        setError(null);
        const res = await rest.get(`/einvoice-recipient?code=${query}`, {
          signal: abortRef.current?.signal,
        });

        setData(res.data ?? []);
        onChange(res.data[0]);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [query]);

  return (
    <div className="flex flex-col gap-1 w-full">
      <Select
        label={
          <div
            className={`font-bold text-base ${errorMessage ? "text-danger" : ""} flex`}
          >
            Họ và tên khách hàng<span className="text-danger ml-0.5">*</span>
          </div>
        }
        labelPlacement="outside-top"
        placeholder="Chọn khách hàng"
        variant="bordered"
        size="md"
        disallowEmptySelection
        itemHeight={40}
        isLoading={loading}
        selectedKeys={value?.customer_name ? [value.customer_name] : []}
        classNames={{
          label: "font-bold text-base",
          trigger: "border-default-400 text-base font-medium",
          value: "text-slate-500 text-base font-medium",
        }}
        listboxProps={{
          emptyContent: (
            <div className="p-4 text-center text-gray-500">
              Không tìm thấy thông tin xuất hóa đơn.
            </div>
          ),
          hideSelectedIcon: true,
          ref: scrollRef,
        }}
      >
        <>
          {data.map((item: any) => (
            <SelectItem
              key={item.customer_name}
              textValue={item.customer_name}
              className={`relative w-full data-[focus=true]:bg-transparent
            data-[focus=true]:text-inherit data-[hover=true]:bg-transparent`}
              classNames={{
                base: "py-0",
                title:
                  " w-full min-h-10 flex items-center justify-between gap-10 ",
              }}
              onPress={() => onChange?.(item)}
            >
              {item.customer_name}
            </SelectItem>
          ))}
          {error && (
            <SelectItem>
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center">
                  <p className="text-sm text-default-500 px-4">
                    Lỗi khi tải thông tin khách hàng, {error}
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
