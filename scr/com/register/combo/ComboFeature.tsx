"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, Tab, Card, CardBody, Button } from "@heroui/react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { formatCurrency } from "../../../lib/format";
import { useRouter } from "next/navigation";
// import { IconVnd } from "../../icons/regular";

const PlantMeta = [
  {
    id: 0,
    name: "Free",
    type: "monthly",
    description: "Phù hợp với doanh nghiệp có quy mô nhỏ",
    features: [
      { label: "1 phòng khám", included: true },
      { label: "1 bác sĩ / 1 phòng khám", included: true },
      { label: "0 ghế nha", included: false },
      { label: "Không giới hạn số khách", included: true },
      { label: "Không giới hạn giờ điều trị", included: true },
      { label: "Hướng dẫn, training Online", included: true },
      { label: "Tài liệu hướng dẫn sử dụng miễn phí", included: true },
    ],
  },
  {
    id: 1,
    name: "Starter Monthly",
    type: "monthly",
    description: "Phù hợp với doanh nghiệp có quy mô lớn",
    features: [
      { label: "1 phòng khám", included: true },
      { label: "3 bác sĩ / 1 phòng khám", included: true },
      { label: "5 ghế nha", included: true },
      { label: "Không giới hạn khách", included: true },
      { label: "Không giới hạn giờ điều trị", included: true },
      { label: "Training trực tiếp tại TP HCM", included: true },
      { label: "Hỗ trợ triển khai trong 15 ngày", included: true },
      { label: "Tài liệu hướng dẫn sử dụng miễn phí", included: true },
    ],
  },
  {
    id: 2,
    name: "Growth Monthly",
    type: "monthly",
    description: "Phù hợp với doanh nghiệp có quy mô lớn",
    features: [
      { label: "1 phòng khám", included: true },
      { label: "7 bác sĩ / 1 phòng khám", included: true },
      { label: "15 ghế nha", included: true },
      { label: "Không giới hạn khách", included: true },
      { label: "Không giới hạn giờ điều trị", included: true },
      { label: "Training trực tiếp tại TP HCM", included: true },
      { label: "Hỗ trợ triển khai trong 20 ngày", included: true },
      { label: "Tài liệu hướng dẫn sử dụng miễn phí", included: true },
    ],
  },
  {
    id: 3,
    name: "Chain Monthly",
    type: "monthly",
    description: "Phù hợp với doanh nghiệp có quy mô lớn",
    features: [
      { label: "15 phòng khám", included: true },
      { label: "7 bác sĩ / 1 phòng khám", included: true },
      { label: "15 ghế nha", included: true },
      { label: "Không giới hạn khách", included: true },
      { label: "Không giới hạn giờ điều trị", included: true },
      { label: "Training trực tiếp tại TP HCM", included: true },
      { label: "Hỗ trợ triển khai trong 30 ngày", included: true },
      { label: "Tài liệu hướng dẫn sử dụng miễn phí", included: true },
    ],
  },
  {
    id: 4,
    name: "Free Yearly",
    type: "yearly",
    description: "Phù hợp với doanh nghiệp có quy mô nhỏ",
    features: [
      { label: "1 phòng khám", included: true },
      { label: "1 bác sĩ / 1 phòng khám", included: true },
      { label: "0 ghế nha", included: true },
      { label: "Không phí khởi tạo", included: true },
      { label: "Không giới hạn tạo kho", included: true },
      { label: "Không giới hạn lượt điều trị", included: true },
      { label: "Training trực tiếp tại TP HCM", included: true },
      { label: "Nhóm hỗ trợ riêng", included: true },
      { label: "Tài liệu hướng dẫn sử dụng miễn phí", included: true },
    ],
  },
  {
    id: 5,
    name: "Starter Yearly",
    type: "yearly",
    description: "Phù hợp với doanh nghiệp có quy mô lớn",
    features: [
      { label: "1 phòng khám", included: true },
      { label: "3 bác sĩ / 1 phòng khám", included: true },
      { label: "5 ghế nha", included: true },
      { label: "Không phí khởi tạo", included: true },
      { label: "Không giới hạn tạo kho", included: true },
      { label: "Không giới hạn lượt điều trị", included: true },
      { label: "Training trực tiếp tại TP HCM", included: true },
      { label: "Nhóm hỗ trợ riêng", included: true },
      { label: "Tài liệu hướng dẫn sử dụng miễn phí", included: true },
    ],
  },
  {
    id: 6,
    name: "Growth Yearly",
    type: "yearly",
    description: "Phù hợp với doanh nghiệp có quy mô lớn",
    features: [
      { label: "1 phòng khám", included: true },
      { label: "7 bác sĩ / 1 phòng khám", included: true },
      { label: "15 ghế nha", included: true },
      { label: "Không phí khởi tạo", included: true },
      { label: "Không giới hạn tạo kho", included: true },
      { label: "Không giới hạn lượt điều trị", included: true },
      { label: "Training trực tiếp tại TP HCM", included: true },
      { label: "Nhóm hỗ trợ riêng", included: true },
      { label: "Tài liệu hướng dẫn sử dụng miễn phí", included: true },
    ],
  },
  {
    id: 7,
    name: "Chain Yearly",
    type: "yearly",
    description: "Phù hợp với doanh nghiệp có quy mô lớn",
    features: [
      { label: "15 phòng khám", included: true },
      { label: "7 bác sĩ / 1 phòng khám", included: true },
      { label: "15 ghế nha", included: true },
      { label: "Không phí khởi tạo", included: true },
      { label: "Không giới hạn tạo kho", included: true },
      { label: "Không giới hạn lượt điều trị", included: true },
      { label: "Training trực tiếp tại TP HCM", included: true },
      { label: "Nhóm hỗ trợ riêng", included: true },
      { label: "Tài liệu hướng dẫn sử dụng miễn phí", included: true },
    ],
  },
];

const PlantTab = [
  { type: "monthly", title: "Monthly" },
  { type: "yearly", title: "Yearly" },
];

interface Plant {
  months_per_interval: number;
  name: string;
  product_name: string;
  price: number;
}

export default function ComboFeature() {
  const [selected, setSelected] = useState<string | string>("monthly");
  const [plan, setPlan] = useState<string | string>("Free");
  const [plants, setPlants] = useState<Plant[]>([]);

  const MemberShipPlants = useMemo(() => {
    return plants.map((plant) => {
      const meta = PlantMeta.find(
        (meta) => meta.name.trim() === plant.name.trim()
      );

      let object = {};

      plants.forEach((p, idx) => {
        if (idx === meta?.id) {
          object = { ...p, ...meta };
        }
      });
      return object;
    });
  }, [plants]);

  const router = useRouter();

  const period = useMemo(() => {
    return MemberShipPlants.filter((item: any) => item.type === selected);
  }, [MemberShipPlants, selected]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/product");
        const data = await response.json();

        setPlants(data);
      } catch (error) {
        setPlants([]);
        console.log("error", error);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="container mx-auto p-8">
      <div className="flex w-full flex-col">
        <div className="pt-5 pb-9">
          <h1 className="flex flex-col text-center font-bold text-[28px] text-blue-text">
            Chọn gói phù hợp với
            <br />
            phòng khám của bạn
          </h1>

          <p className="pt-4 text-center">
            Bắt đầu với $10 mỗi tháng, — <br /> dùng thử 14 ngày miễn phí.
          </p>
        </div>

        <Tabs
          key="full"
          aria-label="Options Tabs radius"
          radius="full"
          className="mx-auto"
        >
          {PlantTab.map((p) => (
            <Tab
              key={p.type}
              title={p.title}
              onClick={() => setSelected(p.type)}
            />
          ))}
        </Tabs>

        {selected === "yearly" && (
          <div className="flex justify-center pt-1">
            <span className="text-blue-400">Tặng 3 tháng</span>
            &nbsp;khi thanh toán theo năm
          </div>
        )}

        <div className="mx-auto pt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {period.map((plant: any, idx: number) => (
            <Card
              key={idx}
              radius="lg"
              shadow="sm"
              className={`${
                plant.name?.split(" ")[0] === "Starter"
                  ? "border-2 border-blue-500"
                  : "border border-gray-200"
              }`}
            >
              <CardBody className="mt-1.5 mb-10">
                <div className="flex flex-row items-center">
                  <h1>{plant.name?.split(" ")[0]}</h1>
                  <div className="h-8">
                    {plant.name?.split(" ")[0] === "Starter" && (
                      <div className="bg-blue-500 rounded-xl px-2 py-1 text-white ml-3">
                        Phổ biến
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-slate-400 text-base font-light pt-2">
                  {plant.description}
                </p>

                {plant.product_pricings[0].price === 0 ? (
                  <div className="mt-7 flex text-3xl font-bold tracking-tighte">
                    Miễn phí
                  </div>
                ) : (
                  <div className="mt-7 flex items-end text-3xl font-bold tracking-tighter flex-wrap">
                    {formatCurrency(plant.product_pricings[0].price)}
                    <span className="text-xl font-medium">
                      /{selected === "monthly" ? "Tháng" : "Năm"}
                    </span>
                  </div>
                )}

                {selected === "yearly" &&
                plant.product_pricings[0].price !== 0 ? (
                  <p className="text-slate-600">Đăng ký theo năm</p>
                ) : (
                  <div className="h-6" />
                )}

                <Button
                  radius="lg"
                  isDisabled={plant.name?.split(" ")[0] === plan}
                  color="primary"
                  onPress={() => {
                    setPlan(plant.name?.split(" ")[0]);
                    router.push("/");
                  }}
                  className={`text-xl font-semibold mt-6 mb-6 ${
                    plant.name?.split(" ")[0] !== plan
                      ? "bg-blue-500 text-white hover:bg-white hover:border-2 hover:border-blue-500 hover:text-blue-500"
                      : "bg-white border-2 border-blue-500 text-blue-500 "
                  }`}
                >
                  Đăng ký
                </Button>

                <ul className="space-y-3">
                  {plant.features.map((feature: any, idx: any) => (
                    <li key={idx} className="flex items-start gap-2">
                      {feature.included ? (
                        <IconCheck
                          size={20}
                          strokeWidth={3}
                          className="text-green-500"
                        />
                      ) : (
                        <IconX
                          size={20}
                          strokeWidth={3}
                          className="text-red-500"
                        />
                      )}
                      {feature.label}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
