"use client";
import React, { useCallback, useState } from "react";
import { ModalAddStaff } from "@/com/clinic/ModalAddStaff";
import { PendingStaffList } from "@/com/clinic/components/PendingStaffList";
import { ActiveStaffList } from "@/com/clinic/components/ActiveStaffList";
import { Tabs, Tab, Divider } from "@heroui/react";

export default function HrPage() {
  const [selectedTab, setSelectedTab] = useState("staff-list");
  const [refreshSignal, setRefreshSignal] = useState(0);
  const notifyUpdate = useCallback(() => {
    setRefreshSignal((prev) => prev + 1);
  }, []);

  return (
    <>
      <div className="w-full flex  items-start justify-between">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key ? key.toString() : "")}
          variant="underlined"
          classNames={{
            base: "flex-1 w-full",
            tabList: "p-0",
            tab: "w-48 py-6",
            tabContent:
              "text-xl font-semibold text-[#7A8593] group-data-[selected=true]:text-default-800",
            cursor: "bg-primary-500",
          }}
        >
          <Tab key="staff-list" title="Danh sách nhân sự" />
          <Tab key="pending" title="Chờ xác nhận" />
        </Tabs>

        <ModalAddStaff onSuccess={notifyUpdate} />
      </div>
      <Divider className="w-full  bg-gray-300 mb-6" />
      {selectedTab === "staff-list" && (
        <ActiveStaffList refreshSignal={refreshSignal} />
      )}
      {selectedTab === "pending" && (
        <PendingStaffList refreshSignal={refreshSignal} />
      )}
    </>
  );
}
