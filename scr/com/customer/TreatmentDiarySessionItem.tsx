"use client";

import { IconChevronDown } from "@/com/icons/regular";
import DiaryDetail from "@/com/customer/DiaryDetail";
import rest from "@/lib/rest";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useState } from "react";
import { addToast, Spinner } from "@heroui/react";

interface TreatmentDiarySessionItemProps {
  session: string;
  medicalSessionId: string;
  isLast: boolean;
  doctor?: string;
}

interface TreatmentSessionDetail {
  MedicalSessionId?: string;
  BranchId?: string;
  TreatmentId?: string;
  DiseaseProgressionNote?: unknown;
  NextTimeTreatmentNote?: unknown;
  HospitalizationStatus?: unknown;
  TreatmentNote?: unknown;
}

function formatDateTimeVN(input: string) {
  const d = dayjs(input).locale("vi");
  const weekday = d
    .format("dddd")
    .trim()
    .split(/\s+/)
    .map((word) =>
      word ? word[0].toLocaleUpperCase("vi-VN") + word.slice(1) : "",
    )
    .join(" ");

  return `${d.format("H:mm")}, ${weekday}, ${d.format("D/M/YYYY")}`;
}

async function fetchTreatmentSessionDetail(
  medicalSessionId: string,
): Promise<TreatmentSessionDetail | null> {
  const res = await rest.get("/customer/treatment/detail", {
    params: { medicalSessionId },
  });

  const payload = Array.isArray(res.data?.data)
    ? res.data.data[0]
    : res.data?.data;

  if (!payload) {
    addToast({
      color: "warning",
      title: "Không tìm thấy chi tiết phiên điều trị",
    });
    return null;
  }

  return payload as TreatmentSessionDetail;
}

const TreatmentDiarySessionItem: React.FC<TreatmentDiarySessionItemProps> = ({
  session,
  medicalSessionId,
  isLast,
  doctor,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [detail, setDetail] = useState<TreatmentSessionDetail | null>(null);

  const handleToggleDetail = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    if (detail) {
      setIsExpanded(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchTreatmentSessionDetail(medicalSessionId);
      if (!response) return;

      setDetail(response);
      setIsExpanded(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-[48px_1fr] gap-1 items-stretch">
      <div className="relative flex justify-center">
        {!isLast ? (
          <div className="absolute left-1/2 top-5 bottom-0 -translate-x-1/2 border-l border-dashed border-default-300" />
        ) : null}
        <div className="relative z-10 mt-4 size-3.5 rounded-full bg-primary-300" />
      </div>

      <div className="rounded-2xl pb-4 transition-colors">
        <div
          className={`group flex items-center justify-between gap-3 rounded-2xl p-4 ${
            isExpanded
              ? "bg-default-100"
              : "bg-transparent hover:bg-default-100"
          }`}
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-default-500 text-sm font-semibold">
              Phiên điều trị
            </span>

            <span className="text-foreground text-base font-medium tracking-[-0.02em]">
              {formatDateTimeVN(session)}
              {doctor && (
                <>
                  <span className="text-gray-600 px-2">bởi</span>
                  {doctor}
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            className={`flex items-center cursor-pointer justify-center gap-1 rounded-full px-4 py-1.5 transition-colors ${
              isExpanded ? "bg-white" : "bg-default-100 group-hover:bg-white"
            }`}
            onClick={handleToggleDetail}
            disabled={isLoading}
          >
            {!isLoading ? (
              <span className="text-default-600 text-[14px] font-medium">
                {isExpanded ? "Thu gọn" : "Xem"}
              </span>
            ) : null}
            {isLoading ? <Spinner size="sm" /> : null}
            <IconChevronDown
              size={14}
              className={`text-default-500 transition-transform duration-300 ease-out ${
                isExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>
        </div>

        {isExpanded && detail ? (
          <div className="">
            <DiaryDetail detail={detail} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TreatmentDiarySessionItem;
