"use client";

import { IconPlus } from "@/com/icons/outline";
import TreatmentDiarySessionItem from "@/com/customer/TreatmentDiarySessionItem";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { Button, Spinner, Image } from "@heroui/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface TreatmentDiaryListProps {
  onCreate: () => void;
}

const TreatmentDiaryList: React.FC<TreatmentDiaryListProps> = ({
  onCreate,
}) => {
  const params = useParams<{ id: string }>();
  const customerId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [sessions, setSessions] = useState<
    { TreatmentTime: string; MedicalSessionId: string; CreatedBy: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setSessions([]);
      setError("Không tìm thấy khách hàng");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await rest.get("/customer/treatment", {
          params: { customerId },
        });
        if (res.data.success === false) {
          setSessions([]);
          if (res.data?.message) setError(res.data.message);
          setIsLoading(false);
          return;
        }

        setSessions(res.data?.data || []);
      } catch (fetchError) {
        if (!isMounted) return;
        setSessions([]);
        setError(
          getErrorMessage(
            fetchError,
            "Không thể tải danh sách nhật ký điều trị",
          ),
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchSessions();

    return () => {
      isMounted = false;
    };
  }, [customerId]);

  const diarySessions = useMemo(() => sessions, [sessions]);

  const EmptyTreatment = () => {
    return (
      <div className="w-full flex items-center justify-center ">
        <div className="py-6 flex flex-col items-center justify-center gap-7">
          <Image src="/image/diagnose/diagnosis.webp" alt="diagnose-image" />
          <div className="flex flex-col gap-3 text-center">
            <h1 className="leading-[1.4] tracking-[-0.02em]">
              {error || "Chưa có nhật ký điều trị"}
            </h1>
            <p className="text-default-500 font-medium leading-[1.4] tracking-[-0.02em]">
              Tạo nhật ký điều trị phù hợp cho khách hàng.
            </p>
          </div>
          <Button
            startContent={<IconPlus size={22} />}
            color="primary"
            className="font-semibold text-base racking-[-0.5em]"
            onPress={onCreate}
          >
            Tạo nhật ký điều trị
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {diarySessions.length > 0 && (
        <div className="flex justify-between items-center">
          <h2 className="text-foreground text-xl font-bold tracking-[-0.02em]">
            Nhật ký điều trị
          </h2>
          <Button
            startContent={<IconPlus size={22} />}
            color="primary"
            className="font-semibold text-base racking-[-0.5em]"
            onPress={onCreate}
          >
            Tạo nhật ký điều trị
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {isLoading ? (
          <div className="flex min-h-24 items-center justify-center">
            <Spinner size="sm" color="default" />
          </div>
        ) : diarySessions.length === 0 ? (
          <EmptyTreatment />
        ) : (
          diarySessions.map((session, idx) => {
            return (
              <TreatmentDiarySessionItem
                key={`${session.MedicalSessionId}-${idx}`}
                session={session.TreatmentTime}
                medicalSessionId={session.MedicalSessionId}
                doctor={session.CreatedBy}
                isLast={idx === diarySessions.length - 1}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default TreatmentDiaryList;
