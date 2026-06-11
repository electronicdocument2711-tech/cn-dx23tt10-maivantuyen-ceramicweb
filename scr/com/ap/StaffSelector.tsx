"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/react";

import { IconUsers } from "@tabler/icons-react";
import { Key, useCallback, useEffect, useRef, useState } from "react";
import rest from "@/lib/rest";
import { prop } from "remeda";
import { roleDisplayCalendar } from "@/data/roles";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useDebounce } from "@/hook/useDebounce";

interface Option {
  label: string;
  value?: string;
}

interface DoctorSelectorProps {
  value?: Option;
  onChange?: (value: Option) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  hideLabel?: boolean;
}

const PAGE_SIZE = 15;

export function useDoctorList({
  loaded,
  setLoaded,
  isOpen,
  query,
}: {
  loaded?: boolean;
  setLoaded?: any;
  isOpen?: boolean;
  query?: string;
} = {}) {
  const [items, setItems] = useState<Option[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = useCallback(
    async (currentPage: number = 1) => {
      const controller = new AbortController();
      const { signal } = controller;

      try {
        setIsLoading(true);
        setError(null);

        const nextPage = currentPage + 1;

        const response = await rest.get("/v2/doctor", {
          params: {
            page: currentPage,
            pageSize: PAGE_SIZE,
            q: query,
            roles: roleDisplayCalendar,
            active: 1,
          },
          signal,
        });

        setHasMore(
          (prop(response, ...["data", "meta", "pagination", "pageCount"]) ??
            0) >= nextPage,
        );
        // Append new results to existing ones
        setItems((prevItems) => [
          ...prevItems,
          ...(response?.data?.data?.map((item: any) => ({
            label: item.name,
            value: item.id,
          })) || []),
        ]);
      } catch (error: any) {
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
    [query],
  );

  useEffect(() => {
    if (!loaded && isOpen) {
      // Reset state when query changes
      setCurrentPage(1);
      setItems([]);

      // Load first page of results
      loadStaff();

      setLoaded(true);
    }
  }, [loaded, isOpen, setLoaded, loadStaff, query]); // call for the first time when component mounts

  const onLoadMore = () => {
    const newPage = currentPage + 1;

    setCurrentPage(newPage);
    loadStaff(newPage);
  };

  return {
    items,
    hasMore,
    isLoading,
    onLoadMore,
    error,
  };
}

const StaffSelector: React.FC<DoctorSelectorProps> = ({
  value,
  onChange,
  isInvalid,
  errorMessage,
  hideLabel,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayInput, setDisplayInput] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const searchTermDebounced = useDebounce(searchTerm, 500);
  const [loaded, setLoaded] = useState<boolean>(false);

  const { hasMore, isLoading, items, onLoadMore, error } = useDoctorList({
    isOpen,
    loaded,
    setLoaded,
    query: searchTermDebounced,
  });

  const [, scrollerRef] = useInfiniteScroll({
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
    setDisplayInput(value?.label || "");
  }, [value?.label]);

  /**
   * render content
   * ====================================================================
   */

  const renderEmptyContent = useCallback(() => {
    if (error) {
      return <span className="text-danger">{error}</span>;
    }

    if (isLoading) {
      return "Đang tải chi nhánh...";
    }

    if (searchTerm) {
      return "Không tìm thấy chi nhánh nào";
    }

    return "Không có chi nhánh nào";
  }, [error, isLoading, searchTerm]);

  return (
    <Autocomplete
      aria-label="Staff Selector"
      variant="bordered"
      label={!hideLabel && <span className="text-base font-bold">Hẹn gặp</span>}
      placeholder="Chọn bác sĩ"
      items={items}
      size="lg"
      labelPlacement="outside-top"
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      startContent={
        !hideLabel && <IconUsers size={24} className="text-default-500" />
      }
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
        setDisplayInput(text);
      }}
      onOpenChange={(isOpen) => {
        setIsOpen(isOpen);
        setSearchTerm("");
      }}
      inputProps={{
        ref: inputRef,
        classNames: {
          input: `${hideLabel ? "font-bold" : ""}`,
          inputWrapper: `${hideLabel ? "p-0" : ""}`,
        },
      }}
      listboxProps={{
        emptyContent: renderEmptyContent(),
      }}
    >
      {(item) => (
        <AutocompleteItem key={item.value} className="capitalize">
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};

export default StaffSelector;
