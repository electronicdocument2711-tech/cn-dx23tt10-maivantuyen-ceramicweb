"use client";

import Link from "next/link";
import { IconCircleCheck } from "../icons/outline";
import { IconChevronRight } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@/context";
import { OnboardingData } from "@/types/define.d";
import rest from "@/lib/rest";
import { Chip } from "@heroui/react";

const ONBOARDING_ITEMS = [
  {
    key: "clinic" as keyof OnboardingData["steps"],
    title: "Phòng khám",
    desc: "Mang phòng khám nha khoa của bạn lên DentalX",
    href: "/clinic",
  },
  {
    key: "staff" as keyof OnboardingData["steps"],
    title: "Nhân sự",
    desc: "Thêm nhân viên và bác sĩ",
    href: "/clinic/hr",
  },
  {
    key: "service" as keyof OnboardingData["steps"],
    title: "Dịch vụ",
    desc: "Nhập hoặc tải lên dịch vụ của bạn",
    href: "/service",
  },
  {
    key: "dentalChair" as keyof OnboardingData["steps"],
    title: "Khám chữa bệnh",
    desc: "Thêm phòng/ghế nha cho việc vận hành",
    href: "/clinic/dental-chair",
  },
  {
    key: "customer" as keyof OnboardingData["steps"],
    title: "Khách hàng",
    desc: "Tạo khách hàng đầu tiên",
    href: "/customer",
  },
  {
    key: "appointment" as keyof OnboardingData["steps"],
    title: "Lịch hẹn",
    desc: "Tạo lịch hẹn để thao tác khám chữa cho khách hàng",
    href: "/schedule",
  },
];

const Onboarding: React.FC = () => {
  const { business, setBusiness } = useAppContext();
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  const label = useMemo(() => {
    if (loading) return "";

    const totlal = ONBOARDING_ITEMS.length;
    const completed = Object.values(data?.steps ?? {}).filter((v) => v).length;
    return `${completed}/${totlal}`;
  }, [data, loading]);

  useEffect(() => {
    // Don't fetch until business data is available
    if (business === null) return;

    if (business?.finished === true) {
      setLoading(false);
      setData({
        finished: true,
        steps: {
          clinic: true,
          staff: true,
          service: true,
          dentalChair: true,
          customer: true,
          appointment: true,
        },
      });
      return;
    }

    const fetchOnboarding = async () => {
      try {
        const res = await rest.get("/onboarding");
        if (res?.data?.finished) {
          setBusiness({ ...business, finished: true } as any);
        }

        setData(res.data);
      } catch {
        // silently fail — component will not render
      } finally {
        setLoading(false);
      }
    };

    fetchOnboarding();
  }, [business, business?.finished]);

  return (
    <div className="p-4 rounded-3xl pb-5 bg-white border border-default-200">
      <div className="flex items-center justify-between mb-4 mt-2">
        <h2 className="">Thiết lập phòng khám</h2>
        {label && (
          <Chip color="primary" className="mr-1">
            {label}
          </Chip>
        )}
      </div>
      <ul className="flex flex-col gap-1 rounded-2xl border border-gray-300 divide-y divide-gray-300 overflow-hidden">
        {ONBOARDING_ITEMS.map((item) => {
          const done = loading ? false : (data?.steps?.[item.key] ?? false);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className="flex group items-center justify-between py-2 px-4 hover:text-blue-600"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-gray-600 group-hover:text-blue-600 group-hover:opacity-60 text-sm">
                    {item.desc}
                  </p>
                </div>
                {done ? (
                  <IconCircleCheck size={20} className="text-green-500" />
                ) : loading ? (
                  <span className="w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
                ) : (
                  <IconChevronRight size={20} className="text-gray-600" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Onboarding;
