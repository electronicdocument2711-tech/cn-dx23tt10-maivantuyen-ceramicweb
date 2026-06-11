"use client";

import React, { useCallback, useEffect } from "react";
import {
  addToast,
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { IconCalendarEventFilled } from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import rest from "@/lib/rest";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const taxOptions = [
  { key: "-1", label: "KCT" },
  { key: "0", label: "0%" },
  { key: "5", label: "5%" },
  { key: "8", label: "8%" },
  { key: "10", label: "10%" },
];

interface ServiceTaxInfoFormProps {
  data?: any;
  serviceDetails?: any;
  isUpdate?: boolean;
  isClosed?: boolean;
}

const formSchema = Yup.object().shape({
  serviceTaxName: Yup.string().required("Tên dịch vụ trên hóa đơn là bắt buộc"),
  unit: Yup.string().required("Đơn vị tính là bắt buộc"),
  tax: Yup.number().required("Thuế suất là bắt buộc"),
  startDate: Yup.date().required("Ngày bắt đầu áp dụng thuế suất là bắt buộc"),
  endDate: Yup.date()
    .optional()
    .nullable()
    .when("startDate", (startDate, schema, options) => {
      return startDate && options?.value
        ? schema.min(
            startDate,
            "Ngày kết thúc phải sau ngày bắt đầu áp dụng thuế suất",
          )
        : schema;
    }),
});

const ServiceTaxInfoForm: React.FC<ServiceTaxInfoFormProps> = ({
  serviceDetails,
  data,
  isUpdate = false,
  isClosed = false,
}) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);

  const { reset, control, handleSubmit } = useForm({
    resolver: yupResolver(formSchema),
  });

  const onSubmit = async (formData: Yup.InferType<typeof formSchema>) => {
    try {
      setIsSaving(true);

      let res = null;
      if (isUpdate) {
        res = await rest.put("/service/einvoice-service", {
          ServiceId: data?.ServiceId,
          ServiceTaxInfoId: data?.ServiceTaxInfoId,
          ServiceTaxName: formData?.serviceTaxName,
          Unit: formData?.unit,
          TaxPercent: formData?.tax,
        });
      } else {
        res = await rest.post("/service/einvoice-service", {
          ServiceId: serviceDetails?.ServiceId,
          ServiceTaxName: formData?.serviceTaxName,
          Unit: formData?.unit,
          TaxPercent: formData?.tax,
          StartDate: dayjs(formData?.startDate).format("YYYY-MM-DD"),
          EndDate: formData?.endDate
            ? dayjs(formData?.endDate).format("YYYY-MM-DD")
            : null,
        });
      }

      if (res?.status !== 200) {
        throw new Error(`Lỗi khi gọi API: ${res?.message || "Unknown error"}`, {
          cause: res?.status || 500,
        });
      }

      addToast({
        title: "Thành công",
        description: isUpdate
          ? "Cập nhật thông tin thuế của dịch vụ thành công"
          : "Tạo thông tin thuế của dịch vụ thành công",
        color: "success",
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push(
        `/payment/service/${isUpdate ? data?.ServiceId : serviceDetails?.ServiceId}`,
      );
    } catch (error: any) {
      addToast({
        title: "Lỗi",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Đã có lỗi xảy ra, vui lòng thử lại",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    if (isUpdate) {
      if (data) {
        reset({
          serviceTaxName: data?.ServiceTaxName,
          unit: data?.Unit,
          tax: Number(data?.IsTax) === 1 ? Number(data?.TaxPercent) : -1,
          startDate: dayjs(data?.StartDate, "YYYY-MM-DD").toDate(),
          endDate: dayjs(data?.EndDate, "YYYY-MM-DD").isValid()
            ? dayjs(data?.EndDate, "YYYY-MM-DD").toDate()
            : undefined,
        });
      }
    } else {
      // Kiểm tra ngày bắt đầu của cấu hình thuế cuối cùng có lơn hơn ngày hôm nay hay không,
      // - Nếu lớn hơn hoặc bằng thì ngày init phải lớn hơn ngày bắt đầu của cấu hình thuế cuối cùng
      // - Nếu nhỏ hơn thì ngày init có thể là ngày hôm nay

      const today = dayjs().startOf("day");
      const latestStartDate = dayjs(data?.StartDate, "YYYY-MM-DD").startOf(
        "day",
      );
      const initialStartDate = latestStartDate.isAfter(today)
        ? latestStartDate.add(1, "day")
        : today;

      reset({
        serviceTaxName: data?.ServiceTaxName || serviceDetails?.Name,
        unit: data?.Unit,
        tax: Number(data?.IsTax) === 1 ? Number(data?.TaxPercent) || 0 : -1,
        startDate: initialStartDate.toDate(),
      });
    }
  }, [data, isUpdate]);

  return (
    <Form
      className="w-2/5 mx-auto py-12 gap-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1>Thông tin dịch vụ</h1>

      <div className="flex flex-col w-full gap-4 border-b border-slate-300 pb-10">
        <Input
          label={<div className="text-sm font-bold">Tên dịch vụ</div>}
          labelPlacement="outside-top"
          defaultValue={serviceDetails?.Name || data?.ServiceName}
          readOnly
          variant="bordered"
          classNames={{
            inputWrapper: "border-default-400 bg-gray-100",
          }}
        />

        <Controller
          control={control}
          name="serviceTaxName"
          render={({ field, fieldState }) => (
            <Input
              label={
                <div className="text-sm font-bold">
                  Tên dịch vụ trên hoá đơn
                </div>
              }
              labelPlacement="outside-top"
              isReadOnly={isClosed}
              variant="bordered"
              defaultValue={data?.paymentService}
              classNames={{
                inputWrapper: clsx(
                  "border-default-400",
                  isClosed && "bg-gray-100",
                ),
              }}
              isInvalid={!!fieldState?.invalid}
              errorMessage={fieldState?.error?.message}
              {...field}
            />
          )}
        />

        <Input
          label={<div className="text-sm font-bold">Mã dịch vụ</div>}
          labelPlacement="outside-top"
          variant="bordered"
          readOnly
          defaultValue={serviceDetails?.ServiceCode || data?.ServiceCode}
          classNames={{
            inputWrapper: "border-default-400 bg-gray-100",
          }}
        />

        <Controller
          control={control}
          name="unit"
          render={({ field, fieldState }) => (
            <Input
              label={<div className="text-sm font-bold">Đơn vị tính</div>}
              labelPlacement="outside-top"
              variant="bordered"
              readOnly={isClosed}
              defaultValue={data?.unit}
              classNames={{
                inputWrapper: clsx(
                  "border-default-400",
                  isClosed && "bg-gray-100",
                ),
              }}
              isInvalid={!!fieldState?.invalid}
              errorMessage={fieldState?.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          control={control}
          name="tax"
          render={({ field, fieldState }) => (
            <Select
              label={<div className="text-sm font-bold">Thuế suất</div>}
              labelPlacement="outside-top"
              variant="bordered"
              classNames={{
                trigger: clsx("border-default-400", isClosed && "bg-gray-100"),
              }}
              isInvalid={!!fieldState?.invalid}
              errorMessage={fieldState?.error?.message}
              selectedKeys={[field?.value?.toString() || "0"]}
              onSelectionChange={(keys) => {
                field?.onChange(keys?.currentKey || null);
              }}
              disabledKeys={isClosed ? taxOptions.map((tax) => tax.key) : []}
            >
              {taxOptions.map((tax) => (
                <SelectItem key={tax.key}>{tax.label}</SelectItem>
              ))}
            </Select>
          )}
        />

        <div className="w-full flex flex-col gap-2">
          <span className="text-sm font-bold">
            {!isUpdate
              ? "Ngày bắt đầu áp dụng mức thuế suất"
              : "Thời gian áp dụng mức thuế suất"}
          </span>

          <div className="w-full flex flex-row items-center gap-4">
            <Controller
              control={control}
              name="startDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  aria-label="Date Start"
                  variant="bordered"
                  isReadOnly={isUpdate}
                  endContent={
                    <IconCalendarEventFilled
                      size={20}
                      className="text-gray-600"
                    />
                  }
                  isInvalid={!!fieldState?.invalid}
                  errorMessage={fieldState?.error?.message}
                  value={
                    field?.value
                      ? parseDate(dayjs(field.value).format("YYYY-MM-DD"))
                      : null
                  }
                  onChange={(date) => {
                    field?.onChange(date?.toDate(getLocalTimeZone()) || null);
                  }}
                  className="w-full"
                  classNames={{
                    inputWrapper: clsx(
                      "border-default-400",
                      isUpdate && "bg-gray-100",
                    ),
                    innerWrapper: "text-black",
                  }}
                />
              )}
            />

            {isUpdate && (
              <>
                -
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field, fieldState }) => (
                    <DatePicker
                      aria-label="Date End"
                      variant="bordered"
                      isReadOnly={isUpdate}
                      endContent={
                        <IconCalendarEventFilled
                          size={20}
                          className="text-gray-600"
                        />
                      }
                      isInvalid={!!fieldState?.invalid}
                      errorMessage={fieldState?.error?.message}
                      value={
                        field?.value
                          ? parseDate(dayjs(field.value).format("YYYY-MM-DD"))
                          : null
                      }
                      onChange={(date) => {
                        field?.onChange(
                          date?.toDate(getLocalTimeZone()) || null,
                        );
                      }}
                      className="w-full"
                      classNames={{
                        inputWrapper: clsx(
                          "border-default-400",
                          isUpdate && "bg-gray-100",
                        ),
                        innerWrapper: "text-black",
                      }}
                    />
                  )}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex justify-end">
        {isClosed ? (
          <Button onPress={handleClose} type="button" color="primary">
            Đóng
          </Button>
        ) : (
          <Button isLoading={isSaving} type="submit" color="primary">
            Lưu
          </Button>
        )}
      </div>
    </Form>
  );
};

export default ServiceTaxInfoForm;
