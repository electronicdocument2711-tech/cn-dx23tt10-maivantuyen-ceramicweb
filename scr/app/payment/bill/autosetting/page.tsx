"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  addToast,
  Button,
  Card,
  cn,
  Form,
  Input,
  RadioGroup,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  TimeInput,
  useRadio,
  VisuallyHidden,
} from "@heroui/react";
import { IconCheck, IconChevronLeft, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import BranchSelector from "@/com/ap/BranchSelector";
import ChannelSelector from "@/com/ap/ChannelSelector";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";

import { Time } from "@internationalized/date";
import DeleteRowButton from "@/com/payment/DeleteRowButton";

const AutoSettingPage = () => {
  const [isSelected1, setIsSelected1] = useState(false);
  const [isSelected2, setIsSelected2] = useState(false);
  const [radioSelected, setRadioSelected] = useState("");
  const [radioDocumentId, setRadioDocumentId] = useState("");
  const [conditionMinute, setConditioMinute] = useState("0");
  const [autoSeupId, setAutoSetupId] = useState("");

  const router = useRouter();

  const [radioData, setRadioData] = useState<any[]>([]);
  const [exportTimeLoading, setExportTimeLoading] = useState(false);
  const [submitLoadding, setSubmitLoading] = useState(false);
  const [DataLoading, setDataLoading] = useState(false);

  const [autoSetupData, setAutoSetupData] = useState<any>(null);

  const fetcheinvoice_export_time = async () => {
    try {
      setExportTimeLoading(true);

      const res = await rest.get("/einvoice-export-time");
      setRadioData(res?.data);
    } catch {
    } finally {
      setExportTimeLoading(false);
    }
  };

  useEffect(() => {
    fetcheinvoice_export_time();
  }, []);

  const fetchAutoSetup = async () => {
    try {
      setDataLoading(true);
      const res = await rest.get("/einvoice-auto-setup");

      setAutoSetupData(res.data.einvoiceAutoSetupData);
    } catch {
      addToast({
        title: "Lỗi",
        description: "Lấy Data bị lỗi, vui lòng kiểm tra lại",
        color: "danger",
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchAutoSetup();
  }, []);

  const CustomRadio = (props: any) => {
    const { value } = props;

    const {
      Component,
      children,
      description,
      getBaseProps,
      getWrapperProps,
      isSelected,
      getInputProps,
      getLabelProps,
      getLabelWrapperProps,
    } = useRadio(props);

    return (
      <Component
        {...getBaseProps({
          className: cn(
            "group inline-flex font-semibold items-center hover:opacity-70 active:opacity-50 justify-left flex-row m-0",
            "max-w-full cursor-pointer border border-slate-200 rounded-4xl gap-2 p-4",
            "data-[selected=true]:border-primary data-[selected=true]:bg-blue-50",
          ),
        })}
      >
        <VisuallyHidden>
          <input {...getInputProps()} />
        </VisuallyHidden>

        <span
          {...getWrapperProps()}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded-full border border-blue-500 text-white transition-colors",
            radioSelected === value ? "bg-blue-500" : "",
          )}
        >
          <span>
            <IconCheck size={15} />
          </span>
        </span>

        <div {...getLabelWrapperProps()}>
          {children && (
            <span
              {...getLabelProps()}
              className={cn(
                "transition-colors",
                isSelected ? "text-blue-500" : "text-foreground",
              )}
            >
              {children}
            </span>
          )}
          {description && (
            <span
              className={`text-small opacity-70 ${isSelected ? "text-red-500" : "text-foreground"}`}
            >
              {description}
            </span>
          )}
        </div>
      </Component>
    );
  };

  // Logic add cell
  const [conditionRows, setConditionRows] = useState([
    {
      id: 1,
      conditionId: "",
      channel: "pos",
      clinic: "1",
      minutes: "0",
      channelId: "",
    },
  ]);

  const [timeRows, setTimeRows] = useState([
    {
      id: 1,
      timeId: "",
      channel: "pos",
      clinic: "1",
      time: null,
      channelId: "",
    },
  ]);

  const addConditionRow = () => {
    setConditionRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        conditionId: "",
        channel: "pos",
        clinic: "1",
        minutes: "0",
        channelId: "",
      },
    ]);
  };

  const removeConditionRow = (id: number) => {
    setConditionRows((prev) => prev.filter((row) => row.id !== id));
  };

  const updateConditionRow = (
    id: number,
    field: "channel" | "clinic" | "minutes" | "channelId",
    value: string,
  ) => {
    setConditionRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addTimeRow = () => {
    setTimeRows((prev: any[]) => [
      ...prev,
      {
        id: Date.now(),
        timeId: "",
        channel: "pos",
        clinic: "1",
        time: null,
        channelId: "",
      },
    ]);
  };

  const removeTimeRow = (id: number) => {
    setTimeRows((prev) => prev.filter((row) => row.id !== id));
  };

  const updateTimeRow = (
    id: number,
    field: "channel" | "clinic" | "time" | "channelId",
    value: any,
  ) => {
    setTimeRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  // --------------------------------------------------------------------
  const deleteEinvoiceConditionTable = async (conditionId: string) => {
    return await rest.delete("/einvoice-condition-table", {
      data: { conditionId },
    });
  };

  const deleteEinvoiceTimeTable = async (timeId: string) => {
    return await rest.delete(`/einvoice-time-table`, {
      data: { timeId },
    });
  };

  const handleApiDelete = async (
    serverId: string,
    rowType: "condition" | "time",
  ) => {
    try {
      if (rowType === "condition") {
        await deleteEinvoiceConditionTable(serverId);

        addToast({
          title: "Thành công",
          description: "Xóa điều kiện thành công",
          color: "success",
        });
      } else {
        await deleteEinvoiceTimeTable(serverId);

        addToast({
          title: "Thành công",
          description: "Xóa lịch trình thành công",
          color: "success",
        });
      }

      fetchAutoSetup();
      fetcheinvoice_export_time();
    } catch (err) {
      addToast({
        title: "Thất bại",
        description:
          rowType === "condition"
            ? "Xóa điều kiện thất bại"
            : "Xóa lịch trình thất bại",
        color: "danger",
      });
      throw err;
    }
  };
  // --------------------------------------------------------------------

  const isFormValid = useMemo(() => {
    if (!radioSelected) return false;

    const conditionValid = conditionRows.every(
      (row) => row.channel && row.clinic && row.minutes.trim() !== "",
    );

    if (!conditionValid) return false;

    const timeValid = timeRows.every(
      (row) => row.channel && row.clinic && row.time !== null,
    );

    if (!timeValid) return false;

    return true;
  }, [radioSelected, conditionRows, timeRows]);

  const formatTimeToString = (time: any) => {
    if (!time) return "";

    const hour = String(time.hour ?? 0).padStart(2, "0");
    const minute = String(time.minute ?? 0).padStart(2, "0");
    const second = String(time.second ?? 0).padStart(2, "0");

    return `${hour}:${minute}:${second}`;
  };

  const parseTime = (timeStr: string) => {
    const [hour, minute, second] = timeStr.split(":").map(Number);
    return new Time(hour, minute, second);
  };

  useEffect(() => {
    if (!autoSetupData && radioData.length === 0) return;

    setIsSelected1(autoSetupData?.sale_receipt || false);
    setIsSelected2(autoSetupData?.paid_receipt || false);
    setAutoSetupId(autoSetupData?.documentId || "");
    setConditioMinute(autoSetupData?.condition_minute || "0");

    const exportTime = autoSetupData?.einvoice_export_time || {};

    if (exportTime) {
      const matched = radioData.find(
        (d) => d.documentId === exportTime.documentId,
      );
      if (matched) {
        setRadioSelected(matched.value);
        setRadioDocumentId(matched.documentId);
      }
    }

    const conditions = autoSetupData?.einvoice_condition_tables || [];
    if (conditions && conditions.length > 0) {
      setConditionRows(
        conditions.map((c: any, idx: number) => ({
          id: idx + 1,
          conditionId: c.documentId,
          channel: c.einvoice_channel.key,
          channelId: c.einvoice_channel.documentId,
          clinic: c.branch_id,
          minutes: c.export_late,
        })),
      );
    }

    const times = autoSetupData?.einvoice_time_tables || [];
    if (times && times.length > 0) {
      setTimeRows(
        times.map((t: any, idx: number) => ({
          id: idx + 1,
          channel: t.einvoice_channel.key,
          channelId: t.einvoice_channel.documentId,
          clinic: t.branch_id,
          time: t.time ? parseTime(t.time) : null,
        })),
      );
    }
  }, [autoSetupData, radioData]);

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);

      const body = {
        autoSeupId,
        sale_receipt: isSelected1,
        paid_select: isSelected2,
        radioDocumentId,
        conditionMinute,
        conditions: conditionRows.map((row) => ({
          conditionId: row.conditionId,
          channel: row.channel,
          branch: row?.clinic,
          delayMinutes: row.minutes,
          channelId: row.channelId,
        })),
        schedules: timeRows.map((row) => ({
          timeId: row.timeId,
          channel: row.channel,
          branch: row?.clinic,
          time: formatTimeToString(row.time),
          channelId: row.channelId,
        })),
      };

      const res =
        autoSeupId === ""
          ? await rest.post("/einvoice-auto-setup", body)
          : await rest.put("/einvoice-auto-setup", body);

      if (res.status !== 200) {
        if (autoSeupId === "") {
          throw new Error("Lưu thiết lập tự động thất bại");
        } else {
          throw new Error("Cập nhật thiết lập tự động thất bại");
        }
      }

      addToast({
        title: "Thành công",
        description:
          autoSeupId === ""
            ? "Lưu thiết lập tự động thành công"
            : "Cập nhật thiết lập tự động thành công",
        color: "success",
      });

      fetchAutoSetup();
      fetcheinvoice_export_time();
    } catch (err) {
      addToast({
        title: "Thất bại",
        description: getErrorMessage(
          err,
          autoSeupId === ""
            ? "Lưu thiết lập tự động thất bại"
            : "Cập nhật thiết lập tự động thất bại",
        ),
        color: "danger",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-7">
      <div className="flex gap-4 mt-4">
        <Button
          isIconOnly
          variant="bordered"
          className="border-slate-300 bg-white shadow-sm"
          onPress={() => router.push(`/payment/bill`)}
        >
          <IconChevronLeft />
        </Button>
        <h1>Thiết lập xử lý tự động</h1>
      </div>

      <Card shadow="none" className="flex flex-col gap-4 mx-auto mt-4 w-full">
        {DataLoading ? (
          <div className="p-10">Đang tải dữ liệu...</div>
        ) : (
          <>
            <Form className="w-4/5 mx-auto">
              <div className="w-full flex flex-col gap-12 pt-10 pb-16 border-b border-slate-300">
                <div className="flex flex-col gap-6 w-full">
                  <h3>Đơn hàng bán</h3>

                  <div
                    className={`w-full rounded-xl p-4 ${isSelected1 ? "bg-blue-50" : "bg-slate-100"}  flex gap-2`}
                  >
                    <Switch
                      color="success"
                      isSelected={isSelected1}
                      onValueChange={setIsSelected1}
                    />

                    <p className={`${isSelected1 ? "text-blue-500" : ""}`}>
                      Tự động xuất hoá đơn GTGT cho &quot;Đơn hàng bán&quot;
                    </p>
                  </div>
                </div>

                {exportTimeLoading ? (
                  <span className="p-3">Đang tải...</span>
                ) : (
                  <RadioGroup
                    label="Thời điểm xuất hoá đơn bán"
                    value={radioSelected}
                    onValueChange={(value) => {
                      setRadioSelected(value);

                      const selectedItem = radioData.find(
                        (d) => d.value === value,
                      );
                      setRadioDocumentId(selectedItem?.documentId || "");
                    }}
                    className="w-full flex flex-col gap-5"
                    classNames={{
                      label: "px-3 font-bold text-base",
                    }}
                  >
                    <div className="flex flex-col gap-3">
                      {radioData.map((d) => (
                        <CustomRadio key={d.value} value={d.value}>
                          {d.name}
                        </CustomRadio>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                <div className="w-full flex flex-col gap-4">
                  <p className="font-bold text-base px-3">
                    Điều kiện tự xuất hoá đơn
                  </p>

                  <div className="w-full rounded-2xl overflow-hidden border border-slate-300">
                    <Table
                      aria-label="Policy table"
                      shadow="none"
                      radius="none"
                      className="min-w-full"
                      classNames={{
                        wrapper: "p-0 rounded-none",
                        table: "p-0",
                      }}
                    >
                      <TableHeader>
                        <TableColumn
                          key="channel"
                          className="w-2/7 text-base text-slate-500"
                        >
                          Kênh bán hàng
                        </TableColumn>
                        <TableColumn
                          key="room"
                          className="w-2/7 text-base text-slate-500"
                        >
                          Chi nhánh
                        </TableColumn>
                        <TableColumn
                          key="policy"
                          className="text-base text-slate-500"
                        >
                          Xuất hoá đơn sau khi
                          <br /> đơn hàng thoả điều kiện (phút)
                        </TableColumn>
                        <TableColumn key="action"> </TableColumn>
                      </TableHeader>

                      <TableBody>
                        {conditionRows.map((row) => (
                          <TableRow key={row?.id}>
                            <TableCell className="test-base font-semibold">
                              <ChannelSelector
                                value={row.channel}
                                onChange={(channel) => {
                                  updateConditionRow(
                                    row.id,
                                    "channel",
                                    channel.key,
                                  );
                                  updateConditionRow(
                                    row.id,
                                    "channelId",
                                    channel.documentId,
                                  );
                                }}
                              />
                            </TableCell>
                            <TableCell className="test-base font-semibold">
                              <BranchSelector
                                value={{ value: row.clinic }}
                                onChange={(clinic) =>
                                  updateConditionRow(
                                    row.id,
                                    "clinic",
                                    clinic.value,
                                  )
                                }
                                isHidden={true}
                              />
                            </TableCell>
                            <TableCell className="test-base font-semibold">
                              <Input
                                variant="bordered"
                                defaultValue="0"
                                value={row.minutes}
                                onChange={(e) =>
                                  updateConditionRow(
                                    row.id,
                                    "minutes",
                                    e.target.value,
                                  )
                                }
                                className="border-slate-200"
                              />
                            </TableCell>
                            <TableCell className="test-base font-semibold flex items-center justify-center">
                              <DeleteRowButton
                                rowId={row?.id}
                                rowType="condition"
                                serverId={row?.conditionId}
                                onApiDelete={handleApiDelete}
                                onDelete={removeConditionRow}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="w-full flex justify-center">
                    <Button
                      variant="bordered"
                      className="border-slate-200 px-30"
                      onPress={addConditionRow}
                    >
                      <IconPlus size={20} />
                    </Button>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-4">
                  <p className="font-bold text-base px-3">
                    Tự động xuất hóa đơn vào khung giờ cố định
                  </p>

                  <div className="w-full rounded-2xl overflow-hidden border border-slate-300">
                    <Table
                      aria-label="Policy table"
                      shadow="none"
                      radius="none"
                      className="min-w-full"
                      classNames={{
                        wrapper: "p-0 rounded-none",
                        table: "p-0",
                      }}
                    >
                      <TableHeader>
                        <TableColumn
                          key="channel"
                          className="w-2/7 text-base text-slate-500"
                        >
                          Kênh bán hàng
                        </TableColumn>
                        <TableColumn
                          key="room"
                          className="w-2/7 text-base text-slate-500"
                        >
                          Chi nhánh
                        </TableColumn>
                        <TableColumn
                          key="policy"
                          className="text-base text-slate-500 w-2/5"
                        >
                          Thời gian
                        </TableColumn>
                        <TableColumn key="action"> </TableColumn>
                      </TableHeader>
                      <TableBody>
                        {timeRows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="test-base font-semibold">
                              <ChannelSelector
                                value={row.channel}
                                onChange={(channel) => {
                                  updateTimeRow(row.id, "channel", channel.key);
                                  updateTimeRow(
                                    row.id,
                                    "channelId",
                                    channel.documentId,
                                  );
                                }}
                              />
                            </TableCell>
                            <TableCell className="test-base font-semibold">
                              <BranchSelector
                                value={{ value: row.clinic }}
                                onChange={(clinic) =>
                                  updateTimeRow(row.id, "clinic", clinic.value)
                                }
                                isHidden={true}
                              />
                            </TableCell>
                            <TableCell className="test-base font-semibold">
                              <TimeInput
                                aria-label="time range"
                                variant="bordered"
                                className="border-slate-200"
                                value={row.time}
                                onChange={(value) =>
                                  updateTimeRow(row.id, "time", value)
                                }
                                hourCycle={12}
                              />
                            </TableCell>
                            <TableCell className="test-base font-semibold flex items-center justify-center">
                              <DeleteRowButton
                                rowId={row.id}
                                rowType="time"
                                serverId={row.timeId}
                                onDelete={removeTimeRow}
                                onApiDelete={handleApiDelete}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="w-full flex justify-center">
                    <Button
                      variant="bordered"
                      className="border-slate-200 px-30"
                      onPress={addTimeRow}
                    >
                      <IconPlus size={20} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col gap-12 pt-10 pb-16 border-b border-slate-300">
                <div className="flex flex-col gap-6 w-full">
                  <h3>Đơn hàng trả</h3>

                  <div
                    className={`w-full rounded-xl p-4 ${isSelected2 ? "bg-blue-50" : "bg-slate-100"} flex gap-2`}
                  >
                    <Switch
                      color="success"
                      isSelected={isSelected2}
                      onValueChange={setIsSelected2}
                    />

                    <p className={`${isSelected2 ? "text-blue-500" : ""}`}>
                      Tự động xuất hoá đơn GTGT cho &quot;Đơn hàng trả&quot;
                    </p>
                  </div>
                </div>
                <div className="w-1/2 flex flex-col gap-4">
                  <p className="font-bold text-base px-3">
                    Điều kiện tự động xuất hoá đơn
                  </p>

                  <div className="rounded-2xl overflow-hidden border border-slate-300">
                    <Table
                      aria-label="Policy table"
                      shadow="none"
                      radius="none"
                      classNames={{
                        wrapper: "p-0 rounded-none",
                        table: "p-0",
                      }}
                    >
                      <TableHeader>
                        <TableColumn
                          key="policy"
                          className="text-base text-slate-500"
                        >
                          Xuất hoá đơn sau khi đơn hàng thoả điều kiện (phút)
                        </TableColumn>
                      </TableHeader>

                      <TableBody>
                        <TableRow>
                          <TableCell className="test-base font-semibold">
                            <Input
                              variant="bordered"
                              value={conditionMinute}
                              onValueChange={setConditioMinute}
                              className="border-slate-200"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              <div className="w-full mt-1 mb-5 flex justify-end">
                <Button
                  color="primary"
                  className="w-25 text-base font-semibold"
                  isDisabled={!isFormValid}
                  onPress={handleSubmit}
                  isLoading={submitLoadding}
                >
                  Lưu
                </Button>
              </div>
            </Form>
          </>
        )}
      </Card>
    </section>
  );
};

export default AutoSettingPage;
