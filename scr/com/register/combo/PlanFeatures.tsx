"use client";

import React, { useState } from "react";

import { Button } from "@heroui/react";

import {
  IconCheck,
  IconChevronDown,
  IconInfoCircle,
  IconHelpCircle,
} from "@/com/icons/regular";

import { IconPlus } from "@/com/icons/outline";

const PlanFeatures = () => {
  // Show all feature logic
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    "Lịch hẹn": true,
    "Chăm sóc": true,
  });

  // Mode section
  const toggleSection = (section: any) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Icon Help Button Logic
  const [visibleDescriptions, setVisibleDescriptions] = useState<
    Record<string, boolean>
  >({});

  const toggleDescription = (category: any, itemIndex: any) => {
    const key = `${category} - ${itemIndex}`; // Tạo Key Unique
    setVisibleDescriptions((prev: any) => ({
      ...prev,
      [key]: !prev[key], // Đảo trạng thái
    }));
  };

  const isDescriptionVisible = (category: any, itemIndex: any) => {
    const key = `${category} - ${itemIndex}`;
    return visibleDescriptions[key] === true;
  };

  const featureComparison = {
    "Lịch hẹn": {
      items: [
        {
          name: "Lịch Hẹn Trong Ngày",
          description:
            "Tạo mới và theo dõi Lịch hẹn hàng ngày. Checked in, chuyển tư vấn, nhắc lịch.",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Lịch Hẹn Theo Ngày",
          description: "Theo dõi lịch hẹn tùy chọn theo ngày.",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Calendar",
          description: "Danh sách lịch hẹn theo thời gian biểu.",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Lịch Bác Sĩ",
          description:
            "Lên mới lịch làm và lịch hẹn cho khách hàng. Quản lý lịch hẹn theo từng cá nhân bác sĩ trên thời gian làm việc riêng, giúp theo dõi khối lượng công việc để điều phối khách hàng một cách hợp lý.",
          starter: true,
          pro: true,
          enterprise: true,
        },
      ],
    },
    "Chăm sóc": {
      items: [
        {
          name: "Nhắc Hẹn",
          description:
            "Chi tiết chăm sóc - Nhắc lịch khách hàng. Được quản lý bởi bộ phận telesales hoặc chăm sóc khách hàng. SMS, Zalo chăm sóc theo kịch bản riêng (nếu kết nối).",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Không Làm Dịch Vụ",
          description:
            "Chi tiết chăm sóc khách hàng không phát sinh dịch vụ. SMS, Zalo chăm sóc theo kịch bản riêng (nếu kết nối).",
          starter: true,
          pro: true,
          enterprise: true,
        },
      ],
    },
  };

  return (
    <section className="container mx-auto pt-10 pb-15 px-6">
      {/* 1. View all features Button */}
      <div className="flex pb-20">
        {/* 1.1. Button */}
        <Button
          onPress={() => setShowAllFeatures(!showAllFeatures)}
          disableAnimation
          variant="bordered"
          className="mx-auto text-xl"
        >
          <p className="px-12 py-4 flex flex-row">
            View all plan features
            <IconChevronDown
              size={30}
              className={`transition-transform ${
                showAllFeatures ? "rotate-180" : ""
              }`}
            />
          </p>
        </Button>
      </div>

      {showAllFeatures && (
        <div className="border border-t-0 border-l-0 border-r-0 border-gray-200 overflow-hidden">
          <div className="hidden md:grid grid-cols-9 border-b border-gray-200">
            <div className="col-span-3 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Tính năng</h2>
            </div>

            <div className="col-span-2 px-6 py-4 text-center border-l border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Starter</h3>
            </div>

            <div className="col-span-2 px-6 py-4 text-center border-l  border-gray-200 border-t-4 border-t-blue-500 bg-slate-100">
              <h3 className="text-xl font-bold text-gray-900">Pro</h3>
            </div>

            <div className="col-span-2 px-6 py-4 text-center border-l border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Enterprise</h3>
            </div>
          </div>

          {/* Mobile */}
          <div className="grid grid-cols-3 md:hidden p-4">
            <div className="col-span-1 px-6 py-4 text-center border-b border-gray-200">
              <h2 className="text-d font-semibold text-gray-900">Starter</h2>
            </div>

            <div className="col-span-1 px-6 py-4 text-center border-b-gray-200 border-t-4 border-t-blue-500 bg-slate-100">
              <h2 className="text-d font-semibold text-gray-900">Pro</h2>
            </div>

            <div className="col-span-1 py-4 text-center border-b border-gray-200">
              <h2 className="text-d font-semibold text-gray-900">Enterprise</h2>
            </div>
          </div>

          {Object.entries(featureComparison).map(
            ([category, data], catIndex) => (
              <div key={catIndex}>
                <Button
                  onPress={() => toggleSection(category)}
                  disableAnimation
                  radius="none"
                  className="w-full bg-white px-6 py-8 border-b border-gray-200 flex justify-between hover:opacity-80 transition-opacity"
                >
                  <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                    {category}
                  </h3>

                  <IconPlus
                    size={30}
                    className={`transition-transform ${
                      expandedSections[category] ? "rotate-45" : ""
                    }`}
                  />
                </Button>

                {expandedSections[category] &&
                  data.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      {/* Desktop View */}
                      <div
                        className={`hidden md:grid grid-cols-9 relative border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                          itemIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }`}
                      >
                        <div className="col-span-3 p-4 md:p-6">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base">
                                {item.name}
                              </h4>

                              {isDescriptionVisible(category, itemIndex) && (
                                <p className="text-xs md:text-sm text-gray-600">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <Button
                              onPress={() =>
                                toggleDescription(category, itemIndex)
                              }
                              disableAnimation
                              variant="light"
                              size="sm"
                            >
                              <IconHelpCircle
                                size={10}
                                className="flex items-end w-6 h-6 text-gray-400 flex-shrink-0 mt-1"
                              />
                            </Button>
                          </div>
                        </div>

                        <div className="col-span-2 p-4 md:p-6 flex items-center justify-center border-l border-gray-200">
                          {item.starter && (
                            <IconCheck
                              size={10}
                              className="w-4 h-4 md:w-5 md:h-5 text-green-500"
                            />
                          )}
                        </div>

                        <div
                          className={`col-span-2 p-4 md:p-6 flex items-center justify-center border-l border-gray-200 ${
                            itemIndex % 2 === 0 ? "bg-slate-100" : "bg-gray-100"
                          }`}
                        >
                          {item.pro && (
                            <IconCheck
                              size={10}
                              className="md:w-5 md:h-5 text-green-500"
                            />
                          )}
                        </div>

                        <div className="col-span-2 p-4 md:p-6 flex items-center justify-center border-l border-gray-200">
                          {item.enterprise && (
                            <IconCheck
                              size={10}
                              className="md:w-5 md:h-5 text-green-500"
                            />
                          )}
                        </div>
                      </div>

                      {/* Mobile View */}
                      <div
                        className={`md:hidden border-b border-gray-200 ${
                          itemIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-2 mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1 text-sm">
                                {item.name}
                              </h4>

                              {isDescriptionVisible(category, itemIndex) && (
                                <p className="text-xs text-gray-600">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <Button
                              onPress={() =>
                                toggleDescription(category, itemIndex)
                              }
                              variant="light"
                              size="sm"
                            >
                              <IconInfoCircle
                                size={10}
                                className="w-4 h-4 text-gray-400 flex shrink-0 mt-1"
                              />
                            </Button>
                          </div>

                          {/*  */}
                          <div className="grid grid-cols-3 text-center">
                            <div className="py-2 px-1 bg-white">
                              {item.starter && (
                                <IconCheck
                                  size={10}
                                  className="w-4 h-4 text-green-500 mx-auto"
                                />
                              )}
                            </div>

                            <div className="py-2 px-1 bg-blue-50">
                              {item.pro && (
                                <IconCheck
                                  size={10}
                                  className="w-4 h-4 text-green-500 mx-auto"
                                />
                              )}
                            </div>

                            <div className="py-2 px-1 bg-white">
                              {item.enterprise && (
                                <IconCheck
                                  size={10}
                                  className="w-4 h-4 text-green-500 mx-auto"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
};

export default PlanFeatures;
