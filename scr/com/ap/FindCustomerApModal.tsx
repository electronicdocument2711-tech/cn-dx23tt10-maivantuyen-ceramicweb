"use client";
import {
  // Avatar,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import {
  IconCircleCheckFilled,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import rest from "@/lib/rest";
import { Customer } from "@/types/define.d";
import { UI_META } from "@/const/ui";
import { ButtonCustom } from "@/com/shared";
import AddCustomer from "./AddCustomer";
import AddAppointmentModal from "./AddApModal";
import { getErrorMessage } from "@/lib/utils";
import { useOnInView } from "react-intersection-observer";

interface FindCustomerApModalProps {
  onSuccess: () => void;
  onRefreshAppointments: () => void;
}
const FindCustomerApModal = ({
  onSuccess,
  onRefreshAppointments,
}: FindCustomerApModalProps) => {
  const aboutRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenAppointment, onOpenChange: onOpenChangeAppointment } =
    useDisclosure();

  const [query, setQuery] = useState("");
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (open) return onOpen();
    clearData();
    onClose();
    onRefreshAppointments?.();
  };

  const handleRefresh = useCallback(() => {
    setTrigger((prev) => prev + 1);
    onSuccess?.();
  }, [onSuccess]);

  const clearData = () => {
    setQuery("");
    setSelected(null);
  };

  const inViewRef = useOnInView(
    (inView) => {
      if (inView) handleLoadMore();
    },
    {
      root: scrollRef.current,
      threshold: 0.5,
    },
  );

  useEffect(() => {
    if (!isOpen) return;
    const fetchCustomerList = async () => {
      try {
        setLoading(true);
        setError(null);
        setHasMore(false);
        setPage(1);
        aboutRef.current?.abort();
        aboutRef.current = new AbortController();
        const res = await rest.get("/customer", {
          params: {
            search: query,
            signal: aboutRef.current.signal,
            "sort-type": "created-at",
          },
        });
        const data = res.data;
        if (!data) return setCustomerList([]);
        setCustomerList(data.customers);
        setHasMore(data.pagination.totalPages > data.pagination.currentPage);
      } catch (error: any) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
          return;
        }
        setCustomerList([]);
        setError(getErrorMessage(error, "Đã có lỗi xảy ra"));
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerList();

    return () => aboutRef.current?.abort();
  }, [query, trigger, isOpen]);

  const handleLoadMore = async () => {
    try {
      setIsLoadingMore(true);
      setError(null);
      const nextPage = page + 1;
      const res = await rest.get("/customer", {
        params: {
          search: query,
          page: nextPage,
        },
      });
      const data = res.data;
      if (!data) return;
      setCustomerList((prev) => [...prev, ...data.customers]);
      setHasMore(data.pagination.totalPages > data.pagination.currentPage);
      setPage(data.pagination.currentPage);
    } catch (error) {
      setError(getErrorMessage(error, "Đã có lỗi xảy ra"));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderContent = () => {
    if (error)
      return (
        <div className="min-h-25 flex-col flex justify-center gap-2 items-center text-danger text-xs text-center">
          {error || "Có lỗi xảy ra"}
          <Button color="danger" size="sm" onPress={handleRefresh}>
            Tải lại
          </Button>
        </div>
      );

    if (loading)
      return (
        <div className="min-h-25 flex justify-center items-center text-gray-600 text-xs text-center">
          <Spinner size="sm" color="default" />
        </div>
      );

    if (!customerList?.length)
      return (
        <div className="min-h-25 flex justify-center items-center text-gray-600 text-xs text-center">
          Chưa có dữ liệu khách hàng
        </div>
      );

    return (
      <>
        {customerList.map((customer: Customer) => (
          <button
            key={customer.CustomerId}
            type="button"
            className="w-full relative flex items-center gap-3 px-4 py-2 rounded-2xl hover:bg-gray-300 text-left"
            onClick={() => setSelected(customer)}
          >
            {/* <Avatar
              name={customer.CustomerId}
              // src={(s as any).avatar}
              src={""}
              size="sm"
              className="w-8 h-8"
            /> */}
            <div className="flex flex-col">
              <span className="font-medium ">{customer.FullName}</span>
              <span
                className={`text-xs ${
                  selected && selected.CustomerId === customer.CustomerId
                    ? "text-blue-500"
                    : "text-gray-600"
                }`}
              >
                {`${customer.CustomerCode} | ${customer?.PhoneNumbers?.[0] ?? ""}`}
              </span>
            </div>
            {selected && selected.CustomerId === customer.CustomerId && (
              <span className="absolute right-2 text-blue-500">
                <IconCircleCheckFilled className="size-7" />
              </span>
            )}
          </button>
        ))}
        {hasMore && !isLoadingMore && (
          <div
            ref={inViewRef}
            className="w-full flex justify-center items-center"
          >
            <Spinner size="sm" color="default" />
          </div>
        )}
        {isLoadingMore && (
          <div className="w-full flex justify-center items-center">
            <Spinner size="sm" color="default" />
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Button
        color="primary"
        onPress={onOpen}
        className={`${UI_META.Button.primary.classnames} max-w-40`}
      >
        <IconPlus size={24} className="font-bold shrink-0" />
        Tạo lịch hẹn
      </Button>
      <Modal
        size="md"
        radius="lg"
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        isDismissable={UI_META.Modal.isDismissable}
        classNames={UI_META.Modal.classnames}
      >
        <ModalContent>
          <ModalHeader>Tạo lịch hẹn</ModalHeader>
          <ModalBody>
            <Input
              autoFocus
              placeholder="Tìm tên, mã khách hàng, số điện thoại..."
              size="md"
              classNames={{
                // base: "px-2",
                inputWrapper:
                  "h-11 rounded-full border border-gray-400 focus:border-gray-400 data-[hover=true]:border-gray-400 data-[focus=true]:border-gray-400 shadow-none focus:shadow-none pr-2",
              }}
              value={query}
              onValueChange={setQuery}
              startContent={<IconSearch className="w-6 h-6 text-default-600" />}
              endContent={
                query ? (
                  <button
                    type="button"
                    aria-label="Xoá tìm kiếm"
                    className="w-7 h-7 text-default-500 bg-default-300 rounded-full hover:bg-default-400"
                    onClick={() => clearData()}
                  >
                    <div className="flex items-center justify-center">
                      <IconX className="w-4 h-4 " />
                    </div>
                  </button>
                ) : null
              }
            />
            <div className="w-full h-96 overflow-y-auto">{renderContent()}</div>
          </ModalBody>
          <ModalFooter>
            {/* this component willbe refactor ui -> basic on feature, remove special code */}
            <AddCustomer onCreateSuccess={handleRefresh} />
            <ButtonCustom
              styleType="primary"
              label="Tiếp tục"
              isDisabled={!selected}
              startContent={<IconPlus />}
              onClick={onOpenChangeAppointment}
            />
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AddAppointmentModal
        customer={selected}
        onSuccess={onSuccess}
        isOpen={isOpenAppointment}
        onOpenChange={onOpenChangeAppointment}
      />
    </>
  );
};

export default FindCustomerApModal;
