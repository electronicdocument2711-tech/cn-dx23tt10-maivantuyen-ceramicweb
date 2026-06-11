"use client";

import React, { useEffect, useState } from "react";
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  // Tooltip,
} from "@heroui/react";
import SetUpInvoiceModal from "@/com/clinic/SetUpInvoiceModal";
import Image from "next/image";
import EinvoiceImage from "../../../../public/Einvoice.webp";
import rest from "@/lib/rest";
import { IconDotsVertical } from "@tabler/icons-react";

const IntegratePage = () => {
  const [datas, setDatas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedTab, setSelectedTab] = useState<"used" | "notUsed">("used");

  const fetchEinvoiceConfig = async () => {
    try {
      setLoading(true);
      const res = await rest.get("/einvoice-config");

      setDatas(res?.data?.data || []);
    } catch (err: any) {
      addToast({
        title: "Thất bại",
        description: err?.message || "Có lỗi xảy ra",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEinvoiceConfig();
  }, []);

  return (
    <>
      {loading ? (
        <div>Đang tải dữ liệu</div>
      ) : datas.length === 0 ? (
        <div className="flex flex-col justify-center items-center mt-14">
          <Image src={EinvoiceImage} alt="Einvoice" width={170} height={170} />
          <div className="mt-12 mb-7  flex flex-col text-center gap-3">
            <h2 className="font-bold">Chưa tích hợp hoá đơn điện tử</h2>
            <span>
              Kết nối nhà cung cấp hóa đơn điện tử để bắt đầu tạo và
              <br /> xuất hóa đơn ngay trên DentalX.
            </span>
          </div>

          <SetUpInvoiceModal onSuccess={fetchEinvoiceConfig} />
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-10">
            <div className="flex justify-between items-center">
              <h1 className="font-bold">Kết nối hóa đơn điện tử</h1>
              <SetUpInvoiceModal onSuccess={fetchEinvoiceConfig} />
            </div>

            <Card className="w-full flex  items-start justify-between shadow-none">
              {/* <Card className="shadow-none border border-gray-400 w-full flex  items-start justify-between"> */}
              <CardHeader className="mt-6 w-2/3 mx-auto">
                <Tabs
                  aria-label="Tabs form"
                  selectedKey={selectedTab}
                  onSelectionChange={(key) =>
                    setSelectedTab(key as "used" | "notUsed")
                  }
                  variant="underlined"
                  classNames={{
                    base: "flex-1 w-full ",
                    tabList: "py-1 border-b border-divider w-full",
                    tab: "w-48 pt-4 pb-6",
                    tabContent:
                      "text-lg font-bold text-[#7A8593] group-data-[selected=true]:text-default-800",
                    cursor: "h-2 rounded-t-full bg-primary-500 p-0",
                  }}
                >
                  <Tab key="used" title="Đang sử dụng" />
                  {/* <Tab key="notUsed" title="Ngừng sử dụng" /> */}
                </Tabs>
              </CardHeader>

              <CardBody className="mt-6 mb-20 w-2/3 mx-auto">
                <div className="rounded-2xl overflow-hidden border border-slate-300">
                  <Table
                    aria-label="Services table"
                    shadow="none"
                    radius="none"
                    className="min-w-full"
                    classNames={{
                      wrapper: "p-0 rounded-none",
                      table: "p-0",
                    }}
                  >
                    <TableHeader>
                      <TableColumn className="text-sm text-slate-500">
                        #
                      </TableColumn>
                      <TableColumn className="text-sm text-slate-500 w-3/5">
                        Đơn vị cung cấp hóa đơn
                      </TableColumn>
                      <TableColumn className="text-sm text-slate-500 w-3/5">
                        Mẫu / ký hiệu hóa đơn
                      </TableColumn>
                      <TableColumn className="text-sm text-slate-500">
                        Trạng thái
                      </TableColumn>
                      <TableColumn className="text-sm text-slate-500 w-1/12">
                        {" "}
                      </TableColumn>
                    </TableHeader>

                    {datas.length > 0 ? (
                      <TableBody>
                        {datas.map((d, idx) => (
                          <TableRow
                            key={d?.id}
                            className={`${idx + 1 !== datas.length ? "border-b border-slate-200" : ""} hover:bg-slate-100`}
                          >
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell className="font-semibold">
                              {d?.einvoice_provider?.name}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {d?.FormNo}
                              {d?.Serial}
                            </TableCell>
                            <TableCell>
                              <Chip
                                radius="sm"
                                className={`${d?.state ? "bg-green-50 border border-green-100 text-green-700" : "bg-slate-100 border border-slate-200"}`}
                              >
                                <span className="font-semibold">
                                  {d?.state ? "Đã hoạt động" : "Ngắt kết nối"}
                                </span>
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                  <Button isIconOnly variant="bordered">
                                    <IconDotsVertical size={20} />
                                  </Button>
                                </DropdownTrigger>

                                <DropdownMenu>
                                  <DropdownItem key="fix">
                                    <span className="text-base font-semibold">
                                      Chỉnh sửa
                                    </span>
                                  </DropdownItem>
                                  {selectedTab === "used" ? (
                                    <DropdownItem
                                      key="stop"
                                      color="danger"
                                      className="text-red-600"
                                    >
                                      <span className="text-base font-semibold">
                                        Ngừng sử dụng
                                      </span>
                                    </DropdownItem>
                                  ) : (
                                    <DropdownItem key="stop" color="danger">
                                      <span className="text-base font-semibold">
                                        Sử dụng lại
                                      </span>
                                    </DropdownItem>
                                  )}
                                </DropdownMenu>
                              </Dropdown>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    ) : (
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            Chưa có dữ liệu
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )}
                  </Table>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default IntegratePage;
