"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/react";

import { Key, useCallback, useEffect, useRef, useState } from "react";
import rest from "@/lib/rest";
import { prop } from "remeda";
// import { roleDisplayCalendar } from "@/data/roles";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useDebounce } from "@/hook/useDebounce";

interface Option {
  label: string;
  value?: string;
  branchId?: string;
  startTime?: string;
  endTime?: string;
}

interface ChairSelectorProps {
  value?: Option;
  onChange?: (value: Option) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
  layout?: "outside-left" | "outside-top";
}

export function useChairList({
  query,
  value,
  loaded,
  setLoaded,
  isOpen,
}: {
  query?: string;
  value?: any;
  loaded?: boolean;
  setLoaded?: any;
  isOpen?: boolean;
} = {}) {
  const [items, setItems] = useState<Option[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const loadChair = useCallback(
    async (currentPage: number = 1) => {
      try {
        if (!value?.startTime || !value?.endTime || !value?.branchId) {
          return;
        }

        setIsLoading(true);
        setError(null);

        const nextPage = currentPage + 1;

        const res = await rest.get("/chair", {
          params: {
            BranchId: value?.branchId,
            StartAt: Math.floor(
              new Date(value.startTime.replace(" ", "T")).getTime() / 1000,
            ),
            EndAt: Math.floor(
              new Date(value.endTime.replace(" ", "T")).getTime() / 1000,
            ),
          },
        });

        setHasMore(
          (prop(res, ...["data", "meta", "pagination", "pageCount"]) ?? 0) >=
            nextPage,
        );
        setItems((prevItems) => {
          const existingValues = new Set(prevItems.map((item) => item.value));
          const uniqueNewItems = res?.data?.module?.views[0]?.data.filter(
            (item: any) => !existingValues.has(item.DentalChairId),
          );
          return [
            ...prevItems,
            ...uniqueNewItems.map((item: any) => ({
              label: item.DentalChairCode,
              value: item.DentalChairId,
            })),
          ];
        });
      } catch (error: any) {
        console.error("error: ", error);
        if (error.name === "AbortError") {
          // Do nothing, the request was aborted
          setError("Request was aborted");
        } else {
          setError(error?.message ?? "Đã có lỗi xảy ra");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [value],
  );

  useEffect(() => {
    if (!loaded && isOpen) {
      setCurrentPage(1);
      setItems([]);

      // Load first page of results
      loadChair();

      setLoaded(true);
    }
  }, [loaded, isOpen, query, value, loadChair, setLoaded]); // call for the first time when component mounts

  const onLoadMore = () => {
    const newPage = currentPage + 1;

    setCurrentPage(newPage);
    loadChair(newPage);
  };

  return {
    items,
    hasMore,
    isLoading,
    onLoadMore,
    error,
  };
}

const ChairSelector: React.FC<ChairSelectorProps> = ({
  value,
  onChange,
  isInvalid,
  errorMessage,
  isDisabled,
  layout = "outside-top",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayInput, setDisplayInput] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const searchTermDebounced = useDebounce(searchTerm, 500);
  const selectedLabel = value?.label || "";
  const bookingContextKey = [
    value?.branchId || "",
    value?.startTime || "",
    value?.endTime || "",
  ].join("|");

  const { hasMore, isLoading, items, onLoadMore, error } = useChairList({
    query: searchTermDebounced,
    value,
    loaded,
    setLoaded,
    isOpen,
  });

  const [scrollerRef] = useInfiniteScroll({
    hasMore: hasMore,
    isEnabled: isOpen,
    shouldUseLoader: false, // we will handle loader in our own way
    onLoadMore,
  });

  /**
   * useEffect
   * ====================================================================
   */

  // init display input
  useEffect(() => {
    setDisplayInput(selectedLabel);
  }, [selectedLabel]);

  useEffect(() => {
    setLoaded(false);
    setSearchTerm("");
    setDisplayInput(selectedLabel);
  }, [bookingContextKey, selectedLabel]);

  /**
   * render content
   * ====================================================================
   */

  const renderEmptyContent = useCallback(() => {
    if (error) {
      return <span className="text-danger">{error}</span>;
    }

    if (isLoading) {
      return "Đang tải phòng/ghế...";
    }

    if (searchTerm) {
      return "Không tìm thấy phòng/ghế nào";
    }

    return "Không có phòng/ghế nào";
  }, [error, isLoading, searchTerm]);

  return (
    <Autocomplete
      aria-label="Chair Selector"
      variant="bordered"
      placeholder="Chọn Phòng/Ghế nha"
      items={items}
      size="lg"
      labelPlacement={layout}
      label={<span className="text-base font-bold">Phòng/Ghế nha</span>}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      isDisabled={isDisabled}
      onSelectionChange={(key: Key | null) => {
        const selected = items.find((item) => item.value == key);
        if (selected) {
          onChange?.(selected);
          inputRef.current?.blur(); // close the dropdown after selection
          setDisplayInput(selected.label); // update input display to selected label
        }
      }}
      scrollRef={scrollerRef}
      isClearable={false}
      isLoading={isLoading}
      inputValue={displayInput}
      onInputChange={(text) => {
        setSearchTerm(text);
        setDisplayInput(isOpen ? text : selectedLabel || text);
      }}
      onOpenChange={(isOpen) => {
        setIsOpen(isOpen);
        setSearchTerm("");
        if (!isOpen) {
          setDisplayInput(selectedLabel);
        }
      }}
      inputProps={{
        ref: inputRef,
        classNames: { label: "font-bold" },
      }}
      listboxProps={{ emptyContent: renderEmptyContent() }}
    >
      {(item) => (
        <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
      )}
    </Autocomplete>
  );
};

export default ChairSelector;
