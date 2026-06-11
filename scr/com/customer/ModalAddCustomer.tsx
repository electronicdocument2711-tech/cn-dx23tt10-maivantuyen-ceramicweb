"use client";
import {
  addToast,
  Button,
  DatePicker,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Textarea,
} from "@heroui/react";
import { IconCircle, IconCircleCheckFilled, IconX } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/utils";
import rest from "@/lib/rest";
import { useUser } from "@/context";
import { PhoneInput, Address } from "@/com/shared";
import { UI_META } from "@/const/ui";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { parseDate } from "@internationalized/date";
import { Job, jobData } from "@/data/job";
import { useCustomerContext } from "@/context/CustomerContext";
import { isString } from "remeda";
import { Customer } from "@/types/define.d";
import dayjs from "dayjs";

const formSchema = Yup.object().shape({
  FullName: Yup.string()
    .trim("Vui lòng không để trống")
    .required("Vui lòng nhập họ và tên")
    .default(""),
  CustomerId: Yup.string().max(12, "Tối đa 12 ký tự").default(""),
  Gender: Yup.string().default("1"),
  PhoneNumber: Yup.string()
    .default("")
    .trim("Vui lòng không để trống")
    .required("Vui lòng nhập số điện thoại")
    .transform((val) => val?.replace(/\s/g, "") ?? "")
    .matches(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, {
      message: "Số điện thoại không hợp lệ",
      excludeEmptyString: true,
    }),
  Birthday: Yup.string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired()
    .test("no-future", "Ngày sinh không thể ở tương lai", (value) => {
      if (!value) return true;
      return dayjs(value).isBefore(dayjs().add(1, "day"));
    })
    .test("realistic-age", "Năm sinh không hợp lệ (Quá 120 tuổi)", (value) => {
      if (!value) return true;
      return dayjs().diff(dayjs(value), "year") <= 120;
    })
    .test("is-infant", "Bệnh nhân chưa đủ 6 tháng tuổi", (value) => {
      if (!value) return true;
      const months = dayjs().diff(dayjs(value), "month");
      return months >= 6;
    })
    .default(null),
  Email: Yup.string().default(""),
  VnProvinceId: Yup.string().default(""),
  VnWardId: Yup.string().default(""),
  Address: Yup.string().default(""),
  jobId: Yup.string().default(""),
  JobName: Yup.string().default(""),
  Note: Yup.string().default(""),
  // InviteCode: Yup.string().default(""),
  // SaleId: Yup.string().default(""),
  relativeFullName: Yup.string().default(""),
  relativePhone: Yup.string()
    .default("")
    .transform((val) => val?.replace(/\s/g, "") ?? "")
    .matches(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, {
      message: "Số điện thoại không hợp lệ",
      excludeEmptyString: true,
    }),
  relativeAddress: Yup.string().default(""),
});

type CustomerMode = "basic" | "full";
type FormType = Yup.InferType<typeof formSchema>;
interface AddNewCustomerProps {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: (customerId?: string) => void;
  inputMode?: "add" | "edit";
}

export default function ModalAddCustomer({
  isOpen,
  setOpen,
  onSuccess,
  inputMode = "add",
}: AddNewCustomerProps) {
  const { user: _user } = useUser();
  const { customer, setCustomer } = useCustomerContext();
  const [mode, setMode] = useState<CustomerMode>("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [jobs] = useState<Job[]>(jobData);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormType>({
    resolver: yupResolver(formSchema),
    defaultValues: { ...formSchema.getDefault() },
  });

  const onSubmit = (data: FormType) => {
    if (inputMode === "add") {
      onAddCustomer(data);
    } else if (inputMode === "edit") {
      onEditCustomer(data);
    }
  };

  const onAddCustomer = async (data: FormType) => {
    try {
      if (!data) return;
      setIsSaving(true);
      const res = await rest.post("/customer", data);
      if (!res || res.status !== 200) {
        throw new Error("Lỗi không xác định");
      }

      const customerId = res?.data?.CustomerId;

      onSuccess?.(customerId);
      addToast({
        title: "Thành công",
        description: "Thêm khách hàng thành công",
        color: "success",
      });

      reset();
      setOpen(false);
    } catch (error) {
      addToast({
        title: "Thất bại",
        description: getErrorMessage(
          error,
          "Chỉnh sửa thông tin khách hàng thất bại",
        ),
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onEditCustomer = async (data: FormType) => {
    try {
      console.log("sadasdsda");
      if (!data) return;
      setIsSaving(true);
      const res = await rest.put(`/customer/${customer?.CustomerId}`, data);
      if (!res || res.status !== 200) {
        throw new Error("Lỗi không xác định");
      }

      onSuccess?.();
      addToast({
        title: "Thành công",
        description: "Chỉnh sửa thông tin khách hàng thành công",
        color: "success",
      });

      const customerData = {
        ...customer,
        ...{
          FullName: data.FullName,
          CustomerIdNumber: data.CustomerId,
          Gender: data.Gender,
          PhoneNumbers: [data.PhoneNumber],
          Birthday: data.Birthday,
          Emails: [data.Email],
          VnProvinceId: data.VnProvinceId,
          VnDistrictId: data.VnWardId,
          VnWardId: data.VnWardId,
          Address: data.Address,
          JobName: data.JobName,
          Note: data.Note,
          // InviteCode: data.InviteCode,
          // SaleId: data.SaleId,
          UrgentContactName: data.relativeFullName,
          UrgentContactPhone: data.relativePhone,
          UrgentContactAddress: data.relativeAddress,
        },
      } as Customer;
      setCustomer(customerData);
      console.log(customerData);
      reset();
      setOpen(false);
    } catch (error) {
      addToast({
        title: "Thất bại",
        description: getErrorMessage(
          error,
          "Chỉnh sửa thông tin khách hàng thất bại",
        ),
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return; // Chỉ xử lý khi Modal đang mở

    if (inputMode === "add") {
      // Đưa form về trạng thái trống ban đầu và xoá toàn bộ lỗi
      reset({ ...formSchema.getDefault() });
      setMode("basic");
    } else if (inputMode === "edit" && customer) {
      reset({
        FullName: customer?.FullName,
        CustomerId: customer?.CustomerIdNumber || "",
        Gender: customer?.Gender,
        PhoneNumber: customer?.PhoneNumbers?.[0] || "",
        Birthday: customer?.Birthday,
        Email: isString(customer?.Emails?.[0])
          ? customer?.Emails?.[0]
          : customer?.Emails?.[0]?.Email || "",
        VnProvinceId: customer?.VnProvinceId || "",

        // replace VnDistrictId for curent, change to wardID late
        // VnWardId: customer?.VnWardId || "",
        VnWardId: customer?.VnDistrictId || "",

        Address: customer?.Address,
        jobId: jobs?.find((j) => j.label === customer?.JobName)?.id || "",
        Note: Array.isArray(customer?.Note)
          ? (customer?.Note[0] || "").toString()
          : (customer?.Note || "").toString(),
        // InviteCode: customer?.,
        // SaleId: customer?.FollowingByStaff?.[0]?.StaffId || "",
        relativeFullName: customer?.UrgentContactName,
        relativePhone: customer?.UrgentContactPhone,
        relativeAddress: customer?.UrgentContactAddress,
      });
    }
  }, [isOpen, inputMode, customer, reset, jobs]);

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onOpenChange={setOpen}
      scrollBehavior="outside"
      isDismissable={false}
      hideCloseButton
      classNames={{
        base: "max-w-[560px]",
        closeButton:
          "bg-gray-50 flex items-center justify-center w-7 h-7 text-3xl my-2 mx-2 p-1",
        header:
          "h-13 py-0 px-7 border-b-[0.5px] border-gray-400 text-base font-bold flex justify-start items-center",
        body: "px-7 py-7",
        footer:
          "h-19 px-7 py-0 border-t-[0.5px] border-gray-400 text-base font-bold flex justify-center items-center",
      }}
    >
      <ModalContent>
        <form
          onSubmit={handleSubmit(onSubmit, (_err) => {})}
          className="flex flex-col w-full"
        >
          <ModalHeader className={`flex items-center justify-between gap-4`}>
            <div className="flex items-center gap-3">
              <div className="text-base font-bold">
                {inputMode === "edit" ? "Thay đổi thông tin" : "Thêm"} khách
                hàng
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Tabs
                aria-label="Options"
                size="sm"
                radius="full"
                selectedKey={mode}
                onSelectionChange={(key) => setMode(key as CustomerMode)}
                classNames={{
                  tab: " data-[selected=true]:bg-white ",
                  tabList: "bg-[#F1F3F6]",
                }}
              >
                <Tab key={"basic"} title="Tạo nhanh" />
                <Tab key={"full"} title="Đầy đủ" />
              </Tabs>

              <Divider orientation="vertical" className="w-[1px] h-3" />

              <Button
                isIconOnly
                variant="light"
                radius="full"
                size="sm"
                onPress={() => setOpen(false)}
                className="rounded-full flex items-center justify-center bg-[#F1F3F6]"
              >
                <IconX size={20} className="text-default-600" />
              </Button>
            </div>
          </ModalHeader>
          <Divider />
          <ModalBody>
            <div className="flex flex-col gap-7">
              <Controller
                control={control}
                name="FullName"
                render={({ field, fieldState }) => (
                  <Input
                    size="lg"
                    label={
                      <span className="font-bold text-base text-foreground">
                        Họ và tên{" "}
                        <span className="text-base font-bold text-red-500">
                          *
                        </span>
                      </span>
                    }
                    placeholder="Nhập họ và tên"
                    autoFocus
                    variant="bordered"
                    labelPlacement="outside"
                    classNames={{
                      base: "w-full",
                      inputWrapper:
                        "h-12 rounded-2xl border-default-400 data-[hover=true]:border-default-500 data-[invalid=true]:!border-danger",
                      input: "text-base font-medium",
                    }}
                    value={field.value}
                    onValueChange={field.onChange}
                    isInvalid={fieldState?.invalid}
                    errorMessage={fieldState?.error?.message}
                  />
                )}
              />
              <div className="w-full flex flex-row gap-3 ">
                <Controller
                  control={control}
                  name="PhoneNumber"
                  render={({ field, fieldState }) => (
                    <PhoneInput
                      onPhoneChange={(val) =>
                        field.onChange(val.replace(/\s/g, ""))
                      }
                      isInvalid={fieldState?.invalid}
                      errorMessage={fieldState?.error?.message}
                      isRequired={true}
                      value={field.value}
                    />
                  )}
                />

                <Input
                  size="lg"
                  label="Số căn cước"
                  labelPlacement="outside-top"
                  type="number"
                  variant="bordered"
                  radius="lg"
                  placeholder="Nhập số căn cước"
                  classNames={{
                    base: "w-full",
                    label: "!font-bold !text-base",
                    inputWrapper:
                      "h-12 rounded-2xl border-default-400 data-[hover=true]:border-default-500 data-[invalid=true]:!border-danger",
                    input:
                      "text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  }}
                  {...register("CustomerId")}
                  isInvalid={!!errors?.CustomerId}
                  errorMessage={errors?.CustomerId?.message}
                />
              </div>
              <div className="w-full flex gap-3 flex-nowrap">
                <div className="w-full">
                  <p className="text-medium font-bold mb-1">Giới tính</p>
                  <Controller
                    control={control}
                    name="Gender"
                    render={({ field }) => (
                      <Tabs
                        aria-label="Dynamic tabs"
                        variant="light"
                        radius="full"
                        className="w-full"
                        classNames={{
                          tab: "!opacity-100 rounded-full outline-default-400 data-[selected=true]:outline-primary data-[hover=true]:outline-default-500",
                          tabContent:
                            "!opacity-100 data-[selected=true]:font-bold ",
                          tabList: "w-full m-0",
                        }}
                        selectedKey={field?.value}
                        onSelectionChange={field?.onChange}
                      >
                        {Array.from({ length: 2 }).map((_, idx) => (
                          <Tab
                            key={idx + 1}
                            className="h-12 max-w-28 my-0 py-0"
                            title={
                              <div className="flex items-center justify-between gap-8">
                                <span
                                  className={`${
                                    field?.value === String(idx + 1)
                                      ? "text-primary font-bold"
                                      : ""
                                  }`}
                                >
                                  {idx === 0 ? "Nam" : "Nữ"}
                                </span>
                                {field?.value === String(idx + 1) ? (
                                  <IconCircleCheckFilled
                                    strokeWidth={3}
                                    className="text-primary"
                                  />
                                ) : (
                                  <IconCircle strokeWidth={0.5} />
                                )}
                              </div>
                            }
                          />
                        ))}
                      </Tabs>
                    )}
                  />
                </div>

                <div className={`w-full flex flex-col gap-2`}>
                  <span className="text-base font-bold min-h-6">Ngày sinh</span>
                  <Controller
                    control={control}
                    name="Birthday"
                    render={({ field, fieldState }) => (
                      <DatePicker
                        aria-label="date-picker"
                        showMonthAndYearPickers
                        calendarWidth={280}
                        value={field?.value ? parseDate(field?.value) : null}
                        onChange={(date) =>
                          field.onChange(date ? date.toString() : "")
                        }
                        variant="bordered"
                        radius="lg"
                        isInvalid={fieldState?.invalid}
                        errorMessage={fieldState?.error?.message}
                        classNames={{
                          base: "",
                          inputWrapper: "h-12 hover:border-default-500 ",
                          input: " text-base font-medium ml-1",
                        }}
                      />
                    )}
                  />
                </div>
              </div>

              <Address
                province={watch("VnProvinceId")}
                ward={watch("VnWardId")}
                address={watch("Address")}
                setProvince={(val) => setValue("VnProvinceId", val)}
                setWard={(val) => setValue("VnWardId", val)}
                setAddress={(val) => setValue("Address", val)}
              />

              {mode === "full" && (
                <div className="w-full flex flex-col gap-7">
                  <div className="w-full flex gap-3">
                    <Input
                      size="lg"
                      label="Email"
                      placeholder="Nhập email"
                      type="email"
                      variant="bordered"
                      labelPlacement={"outside-top"}
                      radius="lg"
                      classNames={{
                        base: "w-full",
                        label: "!font-bold !text-base",
                        inputWrapper:
                          "h-12 rounded-2xl border-default-400 data-[hover=true]:border-default-500 data-[invalid=true]:!border-danger",
                        input:
                          "text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                      }}
                      {...register("Email")}
                      // isInvalid={!!errors?.Email}
                      // errorMessage={errors?.Email?.message}
                    />

                    <Controller
                      control={control}
                      name="jobId"
                      render={({ field }) => (
                        <Select
                          isDisabled={!jobs || jobs.length === 0}
                          size="lg"
                          label="Nghề nghiệp"
                          placeholder="Chọn nghề nghiệp"
                          variant="bordered"
                          labelPlacement="outside-top"
                          className="w-full max-w-61"
                          itemProp="!text-base !font-bold"
                          classNames={{
                            label: "text-base font-bold min-h-6 px-1",
                            trigger:
                              "h-12 rounded-2xl bg-white border-gray-400 hover:border-default-500 data-[hover=true]:border-default-500 data-[invalid=true]:!border-danger",
                            value: "!font-medium !text-base",
                            innerWrapper: "gap-2",
                            selectorIcon: "w-4 h-4",
                          }}
                          listboxProps={{
                            itemClasses: {
                              base: ["data-[selected=true]:bg-blue-200"],
                            },
                            hideSelectedIcon: true,
                          }}
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => {
                            const selectedId = Array.from(keys)[0] as string;
                            field.onChange(selectedId);
                            const jobName =
                              jobs.find((j) => j.id === selectedId)?.label ||
                              "";
                            setValue("JobName", jobName, {
                              shouldValidate: true,
                            });
                          }}
                        >
                          {jobs?.map((item: Job) => (
                            <SelectItem
                              key={String(item?.id)}
                              textValue={item?.label}
                            >
                              {item?.label}
                            </SelectItem>
                          )) || []}
                        </Select>
                      )}
                    />
                  </div>
                  <Textarea
                    classNames={UI_META.Textarea.classNames}
                    labelPlacement="outside-top"
                    variant="bordered"
                    radius="lg"
                    minRows={2}
                    label={"Ghi chú"}
                    placeholder="Nhập ghi chú"
                    {...register("Note")}
                    isInvalid={!!errors?.Note}
                    errorMessage={errors?.Note?.message}
                  />

                  <Divider />
                  <p className="font-bold text-xl text-foreground">
                    Thông tin nhân thân
                  </p>
                  <div className="w-full flex gap-3">
                    <Input
                      size="lg"
                      label="Họ và tên"
                      placeholder="Nhập họ và tên"
                      variant="bordered"
                      labelPlacement={"outside-top"}
                      classNames={{
                        base: "w-full",
                        label: "!font-bold !text-base",
                        inputWrapper:
                          "h-12 rounded-2xl border-default-400 data-[hover=true]:border-default-500 data-[invalid=true]:!border-danger",
                        input: "text-base font-medium",
                      }}
                      {...register("relativeFullName")}
                      isInvalid={!!errors?.relativeFullName}
                      errorMessage={errors?.relativeFullName?.message}
                    />
                    <Controller
                      control={control}
                      name="relativePhone"
                      render={({ field, fieldState }) => (
                        <PhoneInput
                          onPhoneChange={(val) =>
                            field.onChange(val.replace(/\s/g, ""))
                          }
                          isInvalid={fieldState?.invalid}
                          errorMessage={fieldState?.error?.message}
                          value={field.value}
                        />
                      )}
                    />
                  </div>
                  <Input
                    size="lg"
                    placeholder="Nhập số nhà, tên đường"
                    variant="bordered"
                    label="Địa chỉ"
                    labelPlacement={"outside-top"}
                    radius="lg"
                    classNames={{
                      base: "w-full",
                      label: "!font-bold !text-base",
                      inputWrapper:
                        "h-12 rounded-2xl border-default-400 data-[hover=true]:border-default-500 data-[invalid=true]:!border-danger",
                      input:
                        "text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    }}
                    {...register("relativeAddress")}
                  />
                </div>
              )}
            </div>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button
              type="submit"
              isLoading={isSaving}
              className={`${UI_META.Button.primary.classnames} h-11`}
            >
              Xong
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
