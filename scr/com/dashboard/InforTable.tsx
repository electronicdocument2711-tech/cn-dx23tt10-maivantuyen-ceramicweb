"use client";

import React from "react";
import { Card, CardBody, CardHeader, Link } from "@heroui/react";
import { IconStar } from "../icons/regular";
import { IconFlameFilled } from "../icons/filled";
import { IconChevronDown } from "../icons/regular";
import { IconRecycle, IconShippingBox } from "../icons/duotone";

type Item = {
  id?: string | number;
  name: string;
  count?: number;
  status?: string;
};

export default function InforTable() {
  const Informations = [
    {
      title: "top 10 dịch vụ đồng ý",
      icons: <IconStar size={28} className="text-amber-300" />,
      items: [
        { name: "Gội đầu trị liễu nhà MammaMia - 90 phút", count: 5 },
        { name: "Cấy DNA cá hồi", count: 5 },
        { name: "Chăm sóc da chuyên sâu / Intensive Care", count: 4 },
        { name: "Combo Chào Xuân 2025", count: 3 },
        { name: "Combo điều trị mụn I604", count: 2 },
        { name: "Lăn kim/phi kim tóc - Exosome Hải AnteAge", count: 2 },
        { name: "Cấy Collagen tuổi", count: 2 },
        { name: "Combo gội đầu thư giãn", count: 1 },
        {
          name: "Chăm sóc da mụn/MamaMia Facial Care & Acnes Treatment - 75 minutes",
          count: 1,
        },
        { name: "Liệu trình căng bóng da Hàn Quốc", count: 1 },
      ],
    },
    {
      title: "Top 10 sản phẩm bán chạy",
      icons: <IconFlameFilled size={28} className="text-rose-400" />,
      items: [
        { name: "SỮA DƯỠNG THẾ VASELINE HỒNG TRẮNG DA - Chai", count: 5 },
        { name: "Dầu gội dưỡng tóc - Chai", count: 2 },
        { name: "Dầu massage KOBI - Lọ", count: 2 },
        { name: "KEM DƯỠNG DA NÂNG CAO CẤP - Chai", count: 1 },
      ],
    },
    {
      title: "Cảnh báo sản phẩm hết hạn",
      icons: <IconShippingBox size={28} />,
      items: [
        { name: "Sản phẩm < 3 tháng", count: 5 },
        { name: "Sản phẩm < 6 tháng", count: 3 },
        { name: "Sản phẩm < 9 tháng", count: 2 },
      ],
      twoColumn: false,
    },
    {
      title: "Lý do trả hàng",
      icons: <IconRecycle />,
      items: [
        { name: "Không còn nhu cầu", status: "Đang cập nhật" },
        { name: "Gọi không bắt máy", status: "Đang cập nhật" },
        { name: "KH từ chối nhận", status: "Đang cập nhật" },
      ],
      isReason: true,
    },
  ];

  interface InfoBlock {
    title: string;
    icons: React.ReactNode;
    items: Item[];
    twoColumn?: boolean;
    isReason?: boolean;
  }
  const TableBlock = ({ info }: { info: InfoBlock }) => {
    const headerLabel = info.isReason ? "Lý do trả hàng" : "Tên dịch vụ";
    const rightLabel = info.isReason
      ? "Đơn hàng"
      : info.twoColumn
      ? "SL sản phẩm"
      : "SL đồng ý";

    return (
      <div className="bg-white rounded-4xl shadow-sm">
        <div className="flex items-center justify-between mx-7 my-6">
          <div className="flex items-center">
            <div className="mr-4">{info.icons}</div>
            <span className="text-2xl font-bold">{info.title}</span>
          </div>

          <Link href="#">
            <span className="text-base font-bold pr-2">Xem thêm</span>
            <IconChevronDown size={20} className="-rotate-90" />
          </Link>
        </div>

        <hr className="border-t border-slate-200" />

        <Card
          shadow="none"
          radius="lg"
          className="mx-6 my-7"
          classNames={{ base: "border border-gray-400" }}
        >
          <CardHeader className="bg-slate-100 text-base font-semibold text-slate-500 flex justify-between px-5">
            <span>{headerLabel}</span>
            <span>{rightLabel}</span>
          </CardHeader>

          <CardBody className="p-0">
            <div>
              {info.items.map((item: Item, idx: number) => (
                <div key={idx} className="px-5 border-b border-slate-200">
                  <div className="flex justify-between py-5 gap-22 ">
                    <div className="">{item.name}</div>
                    <div className="">{item.count || item.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <div className="mt-9 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
      {Informations.map((info, idx) => (
        <TableBlock key={idx} info={info} />
      ))}
    </div>
  );
}
