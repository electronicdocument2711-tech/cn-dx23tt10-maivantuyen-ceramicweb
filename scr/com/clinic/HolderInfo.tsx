"use client";

import rest from "@/lib/rest";
import { addToast } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/utils";
interface BusinessInfo {
  name?: string;
  address?: string;
}

const HolderInfo: React.FC = () => {
  const [info, setInfo] = useState<BusinessInfo | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  const getBussiness = useCallback(async () => {
    try {
      const req = await rest.get(`/business`);

      if (req.status !== 200) {
        throw new Error("Lỗi chưa có thông tin business");
      }

      setInfo(req?.data);
    } catch (err: any) {
      addToast({
        title: "Thất bại",
        description: getErrorMessage(err, "Lỗi khi đổi trạng thái lịch hẹn"),
        color: "danger",
      });
    }
  }, []);

  useEffect(() => {
    if (!loaded) {
      getBussiness();
      setLoaded(true);
    }
  }, [getBussiness, loaded]);

  return (
    <div className="p-6 border-b border-gray-400 flex flex-col items-start gap-3">
      <h2 className="font-bold text-xl">{info?.name}</h2>
      <p className="text-gray-600">{info?.address || "Không có địa chỉ"}</p>
    </div>
  );
};

export default HolderInfo;
