"use client";

import { IconTooth1, IconTooth2, IconTooth3 } from "@/com/icons/duotone";
import { IconChevronDown, IconStethoscopeOff } from "@/com/icons/regular";
// import { Button } from "@heroui/react";
import React, { useEffect, useState } from "react";

import { useParams } from "next/navigation";
import rest from "@/lib/rest";
import TreatmentDiarySessionItem from "@/com/customer/TreatmentDiarySessionItem";
import {
  addToast,
  Button,
  Image,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from "@heroui/react";
import { formatRevenueCompact } from "@/lib/format";
import clsx from "clsx";

const CustomerRecordsPage: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { id } = useParams();

  const [isFetched, setIsFetched] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchMedicalRecords = async () => {
      try {
        setIsFetched(false);
        const response = await rest
          .get(`/customer/${id}/electric-medical-record`)
          .then((res) => res?.data);
        setMedicalRecords(response || []);
      } catch {
      } finally {
        setIsFetched(true);
      }
    };

    fetchMedicalRecords();
  }, [id]);

  const renderRecords = (record: any) => {
    if (activeId !== record?.id) {
      return null;
    }

    if (record?.medicalSessions?.length === 0) {
      return (
        <div className="min-h-24 border rounded-2xl text-sm text-center gap-3 flex-col mt-4 border-dashed border-gray-500 text-gray-600 flex justify-center items-center">
          <IconStethoscopeOff size={32} className="text-gray-400" />
          Bệnh án chưa có phiên điều trị nào
        </div>
      );
    }

    return record?.medicalSessions?.map((session: any) => (
      <TreatmentDiarySessionItem
        key={`${session?.MedicalSessionId}-${record?.id}`}
        session={session?.TreatmentTime}
        medicalSessionId={session?.MedicalSessionId}
        isLast={false}
      />
    ));
  };

  const renderContent = () => {
    if (!isFetched) {
      return (
        <div className="flex flex-col min-h-[500px] items-center justify-center gap-4">
          <Spinner size="lg" color="primary" />
          <span className="text-sm text-gray-600 mt-2 ">Đang tải hồ sơ...</span>
        </div>
      );
    }

    if (isFetched && medicalRecords.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 min-h-[500px]">
          <Image src="/image/diagnose/diagnosis.webp" alt="diagnose-image" />
          <span className="text-center">
            Khách hàng chưa có bệnh án điện tử
          </span>
        </div>
      );
    }

    return (
      <>
        {medicalRecords.map((record, idx) => {
          const isOpen = activeId === record?.id;

          return (
            <div key={idx}>
              <div
                onClick={() =>
                  setActiveId((prev) => (prev === record.id ? null : record.id))
                }
                className={`px-4 rounded-2xl flex items-center w-full gap-5 cursor-pointer group-hover:bg-blue-100 ${
                  isOpen ? "bg-blue-100" : ""
                } transition-transform duration-300 ease-in-out`}
              >
                <div
                  className={`size-12 rounded-full flex items-center justify-center text-2xl ${
                    record.type.startsWith("kcb")
                      ? "bg-sky-100"
                      : "bg-violet-50"
                  } ${
                    isOpen ? "bg-white" : ""
                  } transition-transform duration-300 ease-in-out`}
                >
                  <div className="size-5">
                    {record.type.startsWith("kcb") ? (
                      <IconTooth1 size={55} />
                    ) : record.type.startsWith("im") ? (
                      <IconTooth2 size={55} />
                    ) : (
                      <IconTooth3 size={55} />
                    )}
                  </div>
                </div>

                <div className="flex border-b border-gray-400 py-8 flex-1 items-center gap-6 justify-between">
                  <div className="flex gap-7">
                    <span className="font-semibold text-xl">
                      {record.type.startsWith("cn")
                        ? "Chỉnh nha"
                        : record.type.startsWith("im")
                          ? "Implant"
                          : "Đợt điều trị"}
                    </span>

                    <div
                      className={`text-sky-800 text-sm font-semibold border ${
                        record.type.startsWith("kcb")
                          ? "bg-sky-100 border-sky-200"
                          : "bg-violet-50 border-violet-200"
                      } ${
                        isOpen ? "bg-white" : ""
                      } transition-transform duration-300 ease-in-out rounded-xl p-1 px-3`}
                    >
                      {record.name}
                    </div>
                  </div>

                  <div className="flex gap-3 items-center">
                    {record.is_completed ? (
                      <span className="text-sm font-semibold bg-green-50 px-3 py-1 rounded-full text-green-600">
                        Đã hoàn tất
                      </span>
                    ) : (
                      <CloseRecordButton
                        eMedicalRecordId={record?.documentId}
                        onMedicalRecordClosed={() => {
                          setMedicalRecords((prev) =>
                            prev.map((item) =>
                              item.id === record.id
                                ? { ...item, is_completed: true }
                                : item,
                            ),
                          );
                        }}
                      />
                    )}

                    <div className="rounded-full bg-gray-300 size-8 flex justify-center items-center">
                      <IconChevronDown
                        size={24}
                        className={`${
                          isOpen ? "-rotate-180" : "-rotate-90"
                        } transition-transform duration-300 ease-in-out`}
                      />
                      {isOpen && <></>}
                    </div>
                  </div>
                </div>
              </div>
              {renderRecords(record)}
            </div>
          );
        })}
      </>
    );
  };

  return <div>{renderContent()}</div>;
};

export default CustomerRecordsPage;

interface CloseRecordButtonProps {
  eMedicalRecordId: string;
  onMedicalRecordClosed?: () => void;
}

const CloseRecordButton: React.FC<CloseRecordButtonProps> = ({
  eMedicalRecordId,
  onMedicalRecordClosed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [data, setData] = useState<any>(null);
  const [isLoadingClosing, setIsLoadingClosing] = useState(false);

  const isPassedAmount = Number(data?.PaidAmount) >= Number(data?.TotalAmount);
  const isPassedService =
    Number(data?.DoneServices) >= Number(data?.TotalServices);
  const isPassed = isPassedAmount && isPassedService;

  const handleCloseRecord = async () => {
    try {
      setIsLoadingClosing(true);
      const response = await rest.post(
        `/electric-medical-record/${eMedicalRecordId}/close`,
      );

      if (response.status !== 200) {
        throw new Error(response?.message || "Đóng hồ sơ thất bại", {
          cause: response.status,
        });
      }

      addToast({
        description: "Hồ sơ đã được đóng thành công",
        title: "Thành công",
        color: "success",
      });

      // *close popover and refresh data
      setIsOpen(false);
      onMedicalRecordClosed?.();
    } catch {
      addToast({
        description:
          "Đóng hồ sơ thất bại. Vui lòng kiểm tra lại điều kiện đóng hồ sơ hoặc thử lại sau",
        title: "Thất bại",
        color: "danger",
      });
    } finally {
      setIsLoadingClosing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await rest.get(
          `/electric-medical-record/${eMedicalRecordId}/summary`,
        );
        setData(response?.data?.data);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, trigger]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex min-h-20 flex-col items-center justify-center gap-2">
          <Spinner size="sm" color="primary" />
          <span className="text-sm text-gray-600 mt-2">Đang tải...</span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col min-h-20 gap-2 items-center justify-center">
          <span className="text-sm text-danger text-center">
            Đã có lỗi xảy ra, vui lòng thử lại
          </span>
          <Button
            color="danger"
            size="sm"
            onPress={() => {
              setTrigger((prev) => prev + 1);
            }}
          >
            Thử lại
          </Button>
        </div>
      );
    }

    return (
      <div>
        <p className="text-xl font-bold">Đóng hồ sơ</p>

        <table className="w-full mt-3 text-sm border-collapse">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 pr-4 text-gray-600 font-medium">Thu</td>
              <td
                className={clsx(
                  "py-2 text-right font-semibold ",
                  isPassedAmount ? "text-green-600" : "text-warning-600",
                )}
              >
                {formatRevenueCompact(Number(data?.PaidAmount))}/
                {formatRevenueCompact(Number(data?.TotalAmount))}
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-600 font-medium">Dịch vụ</td>
              <td
                className={clsx(
                  "py-2 text-right font-semibold ",
                  isPassedService ? "text-green-600" : "text-warning-600",
                )}
              >
                {`${data?.DoneServices}/${data?.TotalServices}`}
              </td>
            </tr>
          </tbody>
        </table>

        {!isPassed ? (
          <p className="text-xs font-light text-warning-600 mt-6">
            Hồ sơ chưa thể đóng do chưa hoàn tất!
          </p>
        ) : null}

        <div className="flex justify-end mt-4">
          <Button
            onPress={handleCloseRecord}
            isDisabled={!isPassed || isLoadingClosing}
            color="primary"
            size="sm"
            isLoading={isLoadingClosing}
          >
            Đóng hồ sơ
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Popover
      onClick={(e) => {
        e.stopPropagation();
      }}
      onOpenChange={(newState) => setIsOpen(newState)}
      isOpen={isOpen}
    >
      <PopoverTrigger>
        <Button color="default" size="sm" radius="full">
          Đóng hồ sơ
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="w-64 p-2">{renderContent()}</div>
      </PopoverContent>
    </Popover>
  );
};
