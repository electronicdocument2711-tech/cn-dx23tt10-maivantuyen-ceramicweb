"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IconUserPlus, IconBuildingHospital } from "@tabler/icons-react";
import ProgressCircle from "@/com/shared/ProgressCircle";
import { IconUp } from "@/com/icons/duotone";
import { useAppContext } from "@/context/AppContext";
import rest from "@/lib/rest";

type UpgradeInfoItemProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  reached?: boolean;
};

const UpgradeInfoItem = ({
  title,
  value,
  icon,
  reached = false,
}: UpgradeInfoItemProps) => (
  <div className="rounded-xl bg-white p-2.5">
    <div className="flex items-center gap-3">
      <div
        className={`flex size-9 items-center justify-center rounded-full border-2 bg-white ${!reached ? "border-blue-300 text-blue-500" : "border-stone-200 text-stone-300"}`}
      >
        {icon}
      </div>
      <div>
        <p
          className={`text-[14px] font-bold ${reached ? "text-gray-600" : "text-blue-700"}`}
        >
          {title}
        </p>
        <p className="text-[10px] font-medium text-gray-600">{value}</p>
      </div>
    </div>
  </div>
);

const SidebarEngage: React.FC<{ isSidebarOpen: boolean }> = ({
  isSidebarOpen,
}) => {
  const cClasses = !isSidebarOpen
    ? "opacity-100"
    : "opacity-0 pointer-events-none hidden";

  const eClasses = isSidebarOpen
    ? "opacity-100 scale-100 p-1"
    : "opacity-0 scale-75 pointer-events-none h-0 w-0 overflow-hidden";

  const { me, doctors, branches, limitation, setLimitation } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [reachStorated, setReachStorated] = useState(true);
  const [usedStorage, setUsedStorage] = useState(0);
  const [monthlyPhoto, setMonthlyPhoto] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // fetch limitation when component mounts
    const fetchLimitation = async () => {
      setLoading(true);
      try {
        const { data: using } = await rest.get("/business/storage");
        if (using?.photo_by_month && using?.used_storage) {
          setUsedStorage(Number(using.used_storage || 0));
          setMonthlyPhoto(Number(using.photo_by_month || 0));
        }

        const { status, data } = await rest.get("/product/limitation");
        if (status === 200 && data?.data) setLimitation(data.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (!limitation) fetchLimitation();
    }, 1000);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [me]);

  useEffect(() => {
    if (limitation && Number(limitation?.storage) !== 0) {
      const limitStorage = Number(limitation?.storage) * 1000000;
      const limitPhoto = Number(limitation?.photo_by_month) || 0;

      setReachStorated(
        usedStorage >= limitStorage || monthlyPhoto >= limitPhoto,
      );

      const sizeProgress = Math.ceil((usedStorage / limitStorage) * 100);

      const countProgress = limitPhoto
        ? Math.ceil((monthlyPhoto / limitPhoto) * 100)
        : 0;

      setProgress(Math.max(sizeProgress, countProgress));
    }
  }, [usedStorage, monthlyPhoto, limitation]);

  const isDisplay =
    !loading &&
    limitation &&
    me?.is_owner &&
    ![8, 12].includes(me?.subscription?.plan?.id);

  return (
    isDisplay && (
      <div className="p-1.5 flex flex-col items-center gap-1">
        <div className="w-full">
          <div className={`w-[60px] ${cClasses}`}>
            <Link href="/upgrade?engage=true" className="block">
              <div className="bg-blue-500 rounded-lg p-0.5 flex flex-col items-center">
                <div className="w-full h-[40px] bg-white rounded-md flex items-center justify-center">
                  <IconUp size={24} className="text-blue-500" />
                </div>
                <span className="text-white text-[10px] font-semibold my-1">
                  Nâng cấp
                </span>
              </div>
            </Link>
          </div>

          <div
            className={`transition-all shadow-sm duration-300 ease-in-out bg-blue-100 rounded-2xl ${eClasses}`}
          >
            <div className="space-y-1">
              <div className="rounded-xl bg-white p-2">
                <div className="flex items-center gap-3">
                  <ProgressCircle
                    progress={progress}
                    isUnlimited={Number(limitation?.storage) === 0}
                    reached={reachStorated}
                  />
                  <div>
                    <p
                      className={`text-[14px] font-bold ${reachStorated ? "text-gray-600" : "text-blue-700"}`}
                    >
                      Lưu trữ
                    </p>
                    <p className="text-[10px] font-medium text-gray-600">
                      {Number(limitation?.storage) == 0 ? (
                        "Không giới hạn"
                      ) : (
                        <span>
                          {Math.ceil(usedStorage / 100000) / 10} /{" "}
                          {Math.ceil(Number(limitation?.storage) / 1000000)} GB{" "}
                          {Number(limitation?.photo_by_month) !== 0 && (
                            <span>
                              {" • "}
                              {monthlyPhoto.toLocaleString("vi-VN")}/{" "}
                              {Number(
                                limitation?.photo_by_month,
                              ).toLocaleString("vi-VN")}{" "}
                              hình mỗi tháng
                            </span>
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <UpgradeInfoItem
                title="Số bác sĩ"
                value={`${doctors.length}/${limitation?.doctor || 1} bác sĩ`}
                icon={<IconUserPlus size={16} />}
                reached={doctors.length >= (Number(limitation?.doctor) || 1)}
              />
              <UpgradeInfoItem
                title="Số chi nhánh"
                value={`${branches.length}/${limitation?.branch || 1} chi nhánh`}
                icon={<IconBuildingHospital size={16} />}
                reached={branches.length >= (Number(limitation?.branch) || 1)}
              />

              <Link
                href="/upgrade?engage=true"
                className="rounded-xl bg-blue-500 hover:bg-blue-600 transition-all py-3 mb-0.5 mt-2 text-center font-semibold leading-none text-white block"
              >
                Nâng cấp
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default SidebarEngage;
