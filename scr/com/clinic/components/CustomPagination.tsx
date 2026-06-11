import React, { useEffect, useState } from "react";

import { cn, Pagination, PaginationItemType } from "@heroui/react";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";

interface paginationProps {
  pageNumber: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function CustomPagination({
  pageNumber,
  totalPages,
  onPageChange,
}: paginationProps) {
  const [currentPage, setCurrentPage] = useState(pageNumber);

  useEffect(() => {
    setCurrentPage(pageNumber);
  }, [pageNumber]);

  return (
    <div className="flex w-full justify-center">
      <Pagination
        total={totalPages}
        color="default"
        radius="full"
        page={currentPage}
        onChange={(newPage) => {
          setCurrentPage(newPage);
          onPageChange(newPage);
        }}
        showControls
        classNames={{
          wrapper: "gap-3",
          item: "data-[active=true]:!bg-slate-200",
        }}
        renderItem={({
          ref,
          key,
          value,
          className,
          onNext,
          onPrevious,
          setPage,
          children,
        }) => {
          const isFistPage = currentPage === 1;
          const isLastPage = currentPage === totalPages;

          if (value === PaginationItemType.PREV) {
            const disabled = isFistPage;

            return (
              <button
                key={key}
                ref={ref}
                className={cn(
                  className,
                  "bg-white shadow-none",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
                disabled={disabled}
                onClick={disabled ? undefined : onPrevious}
              >
                <IconArrowNarrowLeft />
              </button>
            );
          }
          if (value === PaginationItemType.NEXT) {
            const disabled = isLastPage;

            return (
              <button
                key={key}
                ref={ref}
                className={cn(
                  className,
                  "bg-white shadow-none",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
                disabled={disabled}
                onClick={disabled ? undefined : onNext}
              >
                <IconArrowNarrowRight />
              </button>
            );
          }
          if (value === PaginationItemType.DOTS) {
            return (
              <button key={key} ref={ref} className={className}>
                {children}
              </button>
            );
          }
          return (
            <button
              key={key}
              ref={ref}
              className={className}
              onClick={() => {
                setPage(value);
              }}
            >
              {value}
            </button>
          );
        }}
      />
    </div>
  );
}
