"use client";

import { formatCurrency } from "@/lib/format";
import rest from "@/lib/rest";
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  PaginationItemType,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconProgress,
  IconTableImport,
} from "../icons/outline";
import { IconSearch } from "../icons/regular";

import { Service, ServiceDetailV2 } from "@/types/service";
import { useRouter } from "next/navigation";
import { prop } from "remeda";
import { useDebounce } from "@/hook/useDebounce";
import { ServiceDetailModal } from "./ServiceDetailModal";
import ServiceModal from "./ServiceModal";
import { displayTax } from "@/lib/utils";

// ---------------- Constants ----------------
// Table
const headers = [
  {
    key: "id",
    display: "#",
    align: "center",
  },
  {
    key: "code",
    display: "Mã số",
    align: "start",
  },
  {
    key: "name",
    display: "Tên dịch vụ",
    align: "start",
  },
  {
    key: "price",
    display: "Giá bán(đ)",
    align: "center",
  },
  {
    key: "tax",
    display: "Thuế",
    align: "center",
  },
  {
    key: "category",
    display: "Danh mục",
    align: "center",
  },
  {
    key: "status",
    display: "Trạng thái",
    align: "center",
  },
  {
    key: "actions",
    display: "",
    align: "center",
  },
] as const;

const statusOptions = [
  { key: "-1", label: "Tất cả" },
  { key: "1", label: "Đang sử dụng" },
  { key: "0", label: "Ngừng sử dụng" },
];

// Pagination
const ITEMS_PER_PAGE = 20;
function StatusBadge({ status }: { status: Service["Status"] }) {
  const isActive = status === "active";

  return (
    <Chip
      variant="flat"
      className="rounded-md px-1"
      classNames={{
        base: isActive
          ? "bg-emerald-100 text-green-700"
          : "bg-rose-50 text-red-600",
        content: "text-sm",
      }}
    >
      {status === "active" ? "Đang sử dụng" : "Ngừng sử dụng"}
    </Chip>
  );
}

type ChevronIconProps = React.SVGProps<SVGSVGElement>;

const ChevronIcon = (props: ChevronIconProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M15.5 19l-7-7 7-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

type RenderItemProps = Parameters<
  NonNullable<React.ComponentProps<typeof Pagination>["renderItem"]>
>[0];

const renderItem = ({
  ref,
  key,
  value,
  isActive,
  onNext,
  onPrevious,
  setPage,
  className,
}: RenderItemProps): React.ReactNode => {
  if (value === PaginationItemType.NEXT) {
    return (
      <button
        key={key}
        className={cn(className, "bg-none min-w-8 size-8")}
        onClick={onNext}
      >
        <ChevronIcon className="rotate-180" />
      </button>
    );
  }

  if (value === PaginationItemType.PREV) {
    return (
      <button
        key={key}
        className={cn(className, "bg-none min-w-8 size-8")}
        onClick={onPrevious}
      >
        <ChevronIcon />
      </button>
    );
  }

  if (value === PaginationItemType.DOTS) {
    return (
      <button key={key} className={className}>
        ...
      </button>
    );
  }

  return (
    <button
      key={key}
      ref={ref}
      className={cn(className, isActive && "bg-blue-100 font-bold")}
      onClick={() => setPage(value)}
    >
      {value}
    </button>
  );
};

export default function ServiceTable() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("-1");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedServiceDetail, setSelectedServiceDetail] =
    useState<ServiceDetailV2 | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceModalMode, setServiceModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingServiceDetail, setEditingServiceDetail] =
    useState<ServiceDetailV2 | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<any>({});
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    isOpen: isDetailModalOpen,
    onOpen: onOpenDetailModal,
    onClose: onCloseDetailModal,
  } = useDisclosure();

  const parseJsonData = (rawData: unknown): object | undefined => {
    if (!rawData) return undefined;
    if (typeof rawData === "object") return rawData as object;
    if (typeof rawData === "string") {
      try {
        return JSON.parse(rawData) as object;
      } catch {
        return undefined;
      }
    }

    return undefined;
  };

  const fetchServiceDetail = async (
    service: Service,
  ): Promise<ServiceDetailV2 | null> => {
    try {
      const res = await rest.get(`/service/${service.id}`);
      if (res.status !== 200 && res.status !== 201) {
        addToast({
          color: "danger",
          title: res.message || "Lấy chi tiết dịch vụ thất bại",
        });
      }
      const detailData =
        (prop(res, "data", "module", "views", 0, "data") as
          | ServiceDetailV2
          | ServiceDetailV2[]
          | null
          | undefined) ?? null;

      if (Array.isArray(detailData)) {
        return detailData[0] ?? null;
      }

      return detailData ?? null;
    } catch (error) {
      console.log("error:", error);
      return null;
    }
  };

  const fetchServices = async (page = 1) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("imstart", String((page - 1) * ITEMS_PER_PAGE));
      formData.append("limit", String(ITEMS_PER_PAGE));
      formData.append("StatusId", selectedStatus);
      const keyword = debouncedSearchTerm.trim();
      if (keyword) {
        formData.append("Keyword", keyword);
      }

      const query = new URLSearchParams(
        Object.fromEntries(formData.entries()) as Record<string, string>,
      ).toString();

      const res = await rest.get(`/service?${query}`);

      if (res.status === 200 || res.status === 201) {
        const data =
          (prop(res, "data", "module", "views", 0, "data") as any[]) ?? [];
        const totalFromApi = Number(
          prop(
            res,
            "data",
            "module",
            "views",
            0,
            "pagination",
            "totalRecord",
          ) ??
            prop(res, "data", "module", "views", 0, "pagination", "total") ??
            prop(res, "data", "pagination", "totalRecord") ??
            prop(res, "data", "pagination", "total") ??
            0,
        );

        const transformData =
          data?.map((item: any) => ({
            id: item.ServiceId,
            Code: item.ServiceCode || "",
            Name: item.Name || "",
            SalePrice: Number(item.SalePrice || 0),
            Plan: item.TreatmentPlan || "",
            Tax: Number(item.Tax || 0),
            Category: item.ServiceGroup?.Name || "",
            Status: (item.Status === "1" ? "active" : "paused") as
              | "active"
              | "paused",
            Description: item.Description || "",
            JsonData: parseJsonData(item.JsonData),
            IsTax: item?.IsTax,
          })) ?? [];

        setServices(transformData);
        if (Number.isFinite(totalFromApi) && totalFromApi >= 0) {
          setTotalRecords(totalFromApi);
        } else {
          setTotalRecords(transformData.length);
        }
      }
    } catch (error) {
      console.log("error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchServices(currentPage);
  }, [currentPage, selectedStatus, debouncedSearchTerm]);

  // Client-side sorting only; searching/filtering is handled by API.
  const sortedServices = useMemo(() => {
    const getColumnValue = (
      service: Service,
      column: string,
    ): string | number => {
      switch (column) {
        case "code":
          return service.Code;
        case "name":
          return service.Name;
        case "price":
          return service.SalePrice;
        case "tax":
          return service.Tax;
        case "category":
          return service.Category;
        case "status":
          return service.Status;
        default:
          return "";
      }
    };

    const sorted = [...services];

    // Sorting Logic
    if (sortDescriptor.column) {
      sorted.sort((a, b) => {
        let aValue = getColumnValue(a, String(sortDescriptor.column));
        let bValue = getColumnValue(b, String(sortDescriptor.column));

        if (aValue === undefined || bValue === undefined) return 0;

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (sortDescriptor.direction === "ascending") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return sorted;
  }, [services, sortDescriptor]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE));
  const paginatedServices = sortedServices;

  const handleEditService = async (service: Service) => {
    if (isLoadingDetail) return;

    setIsLoadingDetail(true);
    try {
      const detail = await fetchServiceDetail(service);
      if (!detail) {
        addToast({
          color: "danger",
          title: "Không tải được chi tiết dịch vụ để chỉnh sửa",
        });
        return;
      }

      setEditingServiceDetail(detail);
      setServiceModalMode("edit");
      setIsServiceModalOpen(true);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleOpenCreateServiceModal = () => {
    setEditingServiceDetail(null);
    setServiceModalMode("create");
    setIsServiceModalOpen(true);
  };

  const handleStatusChange = (keys: "all" | Set<React.Key>) => {
    const nextStatus = String(Array.from(keys)[0] || "-1");
    setSelectedStatus(nextStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const showServiceDetail = async (service: Service) => {
    if (isLoadingDetail) return;

    setIsLoadingDetail(true);
    try {
      const detail = await fetchServiceDetail(service);

      if (!detail) return;

      setSelectedServiceDetail(detail);
      onOpenDetailModal();
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getServiceRowKey = (service: Service, idx: number) =>
    `${service.id}-${service.Code}-${idx}`;

  const renderTableRow = (service: Service, idx: number) => (
    <TableRow
      key={getServiceRowKey(service, idx)}
      className="min-h-14 border-b border-slate-100 hover:bg-gray-50 hover:cursor-pointer"
      onClick={() => {
        void showServiceDetail(service);
      }}
    >
      <TableCell className="text-center">{idx + 1}</TableCell>
      <TableCell className="font-medium ">{service.Code}</TableCell>
      <TableCell>{service.Name}</TableCell>
      <TableCell className="font-semibold text-center">
        {formatCurrency(service.SalePrice)}
      </TableCell>
      <TableCell className="text-center">
        {displayTax(!!Number(service?.IsTax), service?.Tax)}
      </TableCell>
      <TableCell className="min-w-36 text-center">{service.Category}</TableCell>
      <TableCell className="text-center">
        <StatusBadge status={service.Status} />
      </TableCell>
      <TableCell
        className="text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light">
              <IconDotsVertical size={16} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Service actions">
            <DropdownItem
              key="edit"
              startContent={<IconEdit size={16} />}
              onPress={() => {
                void handleEditService(service);
              }}
            >
              Chỉnh sửa
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </TableCell>
    </TableRow>
  );

  const Header = () => (
    <div className="flex items-center justify-between pb-5">
      <h1 className="text-3xl font-bold mb-3">Danh sách dịch vụ</h1>
      <div className="flex gap-3">
        <Button
          variant="bordered"
          className="rounded-xl font-medium flex items-center gap-2 bg-white"
          onPress={() => {
            router.push("/service/upload-csv");
          }}
        >
          <IconTableImport size={16} />
          Nhập
        </Button>
        <Button
          color="primary"
          onPress={handleOpenCreateServiceModal}
          className="rounded-xl font-medium flex items-center gap-2"
        >
          <IconPlus size={20} />
          Thêm mới
        </Button>
      </div>
    </div>
  );

  // **** MAIN RETURN ****
  return (
    <section>
      <Header />
      {/* List Services */}
      <Card shadow="none" className="border border-gray-400">
        <CardHeader className="flex flex-col md:flex-row gap-3 justify-between">
          <Input
            startContent={<IconSearch size={16} />}
            placeholder="Tìm dịch vụ..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full md:max-w-2/5"
            classNames={{
              inputWrapper: "bg-white shadow-none",
            }}
          />

          <Select
            aria-label="Select"
            variant="bordered"
            startContent={<IconProgress size={20} className="md:w-6 md:h-6" />}
            placeholder="Chọn trạng thái"
            selectedKeys={[selectedStatus]}
            onSelectionChange={handleStatusChange}
            className="w-full md:min-w-2/14 md:w-auto shadow-none"
            classNames={{
              value: "font-semibold text-sm",
              selectorIcon: "size-6",
            }}
          >
            {statusOptions.map((status) => (
              <SelectItem key={status.key}>{status.label}</SelectItem>
            ))}
          </Select>
        </CardHeader>

        <CardBody className="p-0">
          {/* Desktop Table View */}

          <Table
            aria-label="Services table"
            shadow="none"
            radius="none"
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            className="min-w-full"
            classNames={{
              th: "bg-slate-100 border-b border-b-gray-400 text-sm font-medium text-default-500 px-2 py-1 h-auto",
              tr: "border-slate-200 border-b hover:bg-gray-50",
              wrapper: "p-0 rounded-none",
              table: "p-0 border-t border-gray-400",
              td: "px-2 text-base",
              tbody: "last-row-no-border",
            }}
          >
            <TableHeader>
              {headers.map((header, id) => (
                <TableColumn
                  key={header.key}
                  align={header.align}
                  className={`text-sm font-medium w-${
                    id === 0 ? "max-w-12" : ""
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {header.display}
                  </span>
                </TableColumn>
              ))}
            </TableHeader>

            <TableBody
              emptyContent={isLoading ? "Đang tải..." : "Không có dữ liệu"}
            >
              {paginatedServices.map(renderTableRow)}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center py-6">
          <Pagination
            disableCursorAnimation
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            radius="full"
            showShadow
            renderItem={renderItem}
            className="gap-2"
            classNames={{
              item: "size-8 shadow-none size-10 text-sm bg-transparent mx-1 data-[selected=true]:text-white",
              cursor: "size-10 text-sm",
              prev: "bg-transparent shadow-none",
              next: "bg-transparent shadow-none",
            }}
          />
        </div>
      )}
      {/* MODAL DETAIL */}
      <ServiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={onCloseDetailModal}
        selectedServiceDetail={selectedServiceDetail}
      />
      {/* MODAL CREATE & EDIT */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        mode={serviceModalMode}
        editingServiceDetail={editingServiceDetail}
        onSuccess={() => {
          void fetchServices(currentPage);
        }}
      />
    </section>
  );
}
