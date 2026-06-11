"use client";

import { useAppContext } from "@/context/AppContext";
import { Tabs, Tab, Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import TableReceipt from "./TableReceipt";
import TableFeedback from "./TableFeedback";
import TableRefund from "./TableRefund";
import TableInvoice from "./TableInvoice";

const by = [
  { key: "day", text: "Hôm nay" }, // 7 ngày gần nhất
  { key: "week", text: "Tuần này" }, // 8 tuần gần nhất
  { key: "month", text: "Tháng này" }, // 6 tháng gần nhất
];

const OperateTracking: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("receipt");
  const [range, setRange] = useState("day");
  const [branch, setBranch] = useState("all");
  const { branches } = useAppContext();

  return (
    <div>
      <div className="flex justify-between items-center border-b border-gray-300 pl-4 pr-2 py-2">
        <h2 className="text-lg font-semibold flex-1 leading-5">
          Theo dõi vận hành
        </h2>
        <div className="flex items-center gap-2">
          <Select
            label=""
            aria-label="branch-select"
            size="sm"
            className="w-50"
            selectedKeys={[branch]}
            onSelectionChange={(item: any) => setBranch(item.currentKey)}
          >
            <SelectItem
              key="all"
              textValue="Tất cả chi nhánh"
              aria-labelledby="branch-select"
            >
              Tất cả chi nhánh
            </SelectItem>
            <>
              {branches.map((item) => (
                <SelectItem
                  key={item.BranchId}
                  textValue={item.Name}
                  aria-labelledby="branch-select"
                >
                  {item.Name}
                </SelectItem>
              ))}
            </>
          </Select>
          <Select
            label=""
            aria-label="range-select"
            size="sm"
            className="w-36"
            selectedKeys={[range]}
            onSelectionChange={(item: any) => setRange(item.currentKey)}
          >
            {by.map((item) => (
              <SelectItem
                key={item.key}
                textValue={item.text}
                aria-labelledby="range-select"
              >
                {item.text}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      <div className="p-4 pt-0">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key ? key.toString() : "")}
          variant="underlined"
          classNames={{
            base: "w-full border-b border-gray-300",
            tabList: "pb-0.5",
            tab: "min-w-32 h-10",
            tabContent:
              "font-semibold text-[#7A8593] group-data-[selected=true]:text-default-800",
            cursor: "h-1 rounded-t-[3px] bg-primary-500",
          }}
        >
          <Tab key="receipt" title="Phiếu thu" />
          <Tab key="invoice" title="Hóa đơn" />
          <Tab key="refund" title="Phiếu hoàn tiền" />
          {/* <Tab key="feedback" title="Phản hồi" /> */}
        </Tabs>
        {selectedTab === "receipt" && (
          <TableReceipt range={range} branch={branch} />
        )}
        {selectedTab === "invoice" && (
          <TableInvoice range={range} branch={branch} />
        )}
        {selectedTab === "refund" && (
          <TableRefund range={range} branch={branch} />
        )}
        {selectedTab === "feedback" && (
          <TableFeedback range={range} branch={branch} />
        )}
      </div>
    </div>
  );
};

export default OperateTracking;
