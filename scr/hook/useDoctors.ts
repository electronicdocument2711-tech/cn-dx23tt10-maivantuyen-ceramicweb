import { useCallback, useEffect, useState } from "react";
import rest from "@/lib/rest";
import { Doctor } from "@/types/define.d";

export function useDoctor(branchId: string) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDoctors = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await rest.get(`/doctor`, {
        params: { branchId },
      });
      if (!res.data) {
        setDoctors([]);
        return new Error("Danh sách bác sĩ trống");
      }
      setDoctors(res.data);
    } catch (error) {
      const typeErr =
        error instanceof Error
          ? error
          : new Error("Tải danh sách bác sĩ thất bại");
      setError(typeErr);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    isLoading,
    error,
    refresh: fetchDoctors,
  };
}
