"use client";

import Link from "next/link";
import { useState } from "react";
import { useCustomerContext } from "@/context/CustomerContext";
import { BreadcrumbItem, Breadcrumbs, Button } from "@heroui/react";
import { IconChevronDown } from "@/com/icons/regular";
import AdmissionStatus from "@/com/plan/AdmissionStatus";
import TreatmentProgress from "@/com/plan/TreatmentProgress";
import DiseaseCourse from "@/com/plan/DiseaseCourse";
import TreatmentNote from "@/com/plan/TreatmentNote";
import DischargeNote from "@/com/plan/DischargeNote";

export default function AddDiary() {
  const { customer } = useCustomerContext();
  const customerId = customer?.CustomerId;

  const [activeId, setActiveId] = useState<string | null>(null);

  const sessions = [
    { name: "Tình trạng khi vào viện", slug: AdmissionStatus },
    { name: "Tiến trình điều trị", slug: TreatmentProgress },
    { name: "Diễn biến bệnh", slug: DiseaseCourse },
    { name: "Ghi chú điều trị (Y lệnh điều trị)", slug: TreatmentNote },
    { name: "Ghi chú ra viện (Y lệnh ra viện)", slug: DischargeNote },
  ];

  const [updatedSections, setUpdatedSections] = useState<
    Record<string, boolean>
  >({
    "Tình trạng khi vào viện": false,
    "Tiến trình điều trị": false,
    "Diễn biến bệnh": false,
    "Ghi chú điều trị (Y lệnh điều trị)": false,
    "Ghi chú ra viện (Y lệnh ra viện)": false,
  });

  const allSectionUpdated = Object.values(updatedSections).every(
    (updated: any) => updated,
  );

  return (
    <div className="py-6 px-1">
      <Breadcrumbs className="py-2 px=5">
        <BreadcrumbItem>
          <Link href={`/customer/${customerId}/plan`} className="text-base">
            Nhật ký điều trị
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <span className="text-base">Phiên điều trị</span>
        </BreadcrumbItem>
      </Breadcrumbs>

      <div className="mt-8 cursor-pointer">
        {sessions.map((session, idx) => {
          const isOpen = activeId === session.name;

          const handleSectionUpdated = (sectionName: string) => {
            setUpdatedSections((prev) => ({
              ...prev,
              [sectionName]: true,
            }));
          };

          const DetailComponent = session.slug;

          return (
            <div key={idx}>
              <div
                className={`py-8 px-5 rounded-3xl ${
                  isOpen ? "bg-blue-100" : ""
                }`}
              >
                <div
                  onClick={() =>
                    setActiveId((prev) =>
                      prev === session.name ? null : session.name,
                    )
                  }
                  className="flex justify-between items-center"
                >
                  <h3
                    className={`font-bold text-xl transition-colors ${
                      updatedSections[session.name]
                        ? "text-blue-600"
                        : "text-black"
                    }`}
                  >
                    {session.name}
                  </h3>

                  <div className="rounded-full bg-gray-300 w-8 h-8 flex justify-center items-center">
                    <IconChevronDown
                      size={24}
                      className={`transition-transform duration-300 ease-in-out ${
                        isOpen ? "-rotate-180" : "-rotate-90"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="mt-6 pb-6">
                  <DetailComponent
                    onUpdate={() => handleSectionUpdated(session.name)}
                  />
                </div>
              )}

              <div className="border-b-1.5 border-gray-500 mx-5" />
            </div>
          );
        })}
      </div>

      <div className="mx-4 my-6 flex justify-end">
        <Button
          isDisabled={!allSectionUpdated}
          color="primary"
          className="text-base font-semibold"
        >
          Lưu
        </Button>
      </div>
    </div>
  );
}
