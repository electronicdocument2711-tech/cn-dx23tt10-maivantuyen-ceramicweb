"use client";
import { Input } from "@heroui/input";
import {
  Select,
  SelectItem,
  Button,
  addToast,
  useDisclosure,
} from "@heroui/react";
import { IconPlus } from "@tabler/icons-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ButtonCustom, ModalBase } from "../shared";
import { useState } from "react";
import { BusinessRole, StaffDraft } from "@/types/define.d";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { businessRoles } from "@/data/roles";
// import { useConfirm } from "../ConfirmProvider";

type FormData = {
  staffs: {
    name: string;
    email: string;
    phone: string;
    position: string;
  }[];
};

const newStaff: StaffDraft = {
  name: "",
  email: "",
  phone: "",
  position: "5",
};

interface ModalAddStaffProps {
  onSuccess?: () => void;
}

export const ModalAddStaff = ({ onSuccess }: ModalAddStaffProps) => {
  const { isOpen, onClose, onOpenChange } = useDisclosure();
  const {
    register,
    handleSubmit,
    // reset,
    formState: { errors },
    control,
  } = useForm<FormData>({
    defaultValues: {
      staffs: [newStaff],
    },
  });

  const { fields, append } = useFieldArray<FormData>({
    control,
    name: "staffs",
  });

  const addNewStaff = () => {
    append(newStaff);
  };

  const [businessRole, _setBusinessRole] =
    useState<BusinessRole[]>(businessRoles);

  const [sumitting, setSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);

      const staffs = data.staffs.map((staff) => {
        //validate by react-hook-form
        return {
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          position: staff.position,
        };
      });

      const res = await rest.post(`/auth/invite`, { staffs });
      const resData = (await res.data) as {
        accountStatus: string;
        code: number;
        email: string;
        message: string;
        status: boolean;
      }[];
      if (!resData || resData.length === 0)
        throw new Error("Mời tài khoản thất bại");

      let errorCount = 0;
      for (const item of resData) {
        if (item.status === false && item.accountStatus === "active") {
          errorCount++;
          addToast({
            title: "Thất bại",
            description: `${item.email} tài khoản đã kích hoạt`,
            color: "danger",
          });
        }

        if (item.status === false && item.accountStatus === "pending") {
          errorCount++;
          addToast({
            title: "Thất bại",
            description: `${item.email} - đã tạo và gửi lời mời, vui lòng kiểm tra email`,
            color: "danger",
          });
        }
        if (item.status === false && item.accountStatus === "failed") {
          errorCount++;
          addToast({
            title: "Thất bại",
            description: `${item.email} - đã có lỗi xảy ra khi tạo tài khoản, vui lòng thử lại sau`,
            color: "danger",
          });
        }
      }
      if (errorCount === 0)
        addToast({
          title: "Thành công",
          description: `Mời tài khoản thành công`,
          color: "success",
        });
      console.log(resData);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      if (error.status === 403) {
        addToast({
          title: "Thất bại",
          description: "Không đủ quyền thực hiện tác vụ này",
          color: "danger",
        });
      } else {
        const message = getErrorMessage(error, "Mời tài khoản thất bại");
        addToast({
          title: "Thất bại",
          description: message,
          color: "danger",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalBase
      title="Thêm bác sĩ mới"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="max-w-4xl"
      trigger={
        <ButtonCustom
          label="Thêm mới"
          styleType="primary"
          className="max-w-40"
          startContent={<IconPlus className="shrink-0" />}
        />
      }
    >
      <form
        // validationBehavior="native"
        className="flex flex-col gap-3 justify-start"
        onSubmit={handleSubmit(onSubmit)}
      >
        {fields.map((staffField, idx) => (
          <div
            key={staffField.id}
            className="grid grid-cols-1 lg:grid-cols-5 items-start gap-2"
          >
            <Input
              type="email"
              size="lg"
              placeholder="Nhập Email"
              variant="bordered"
              className="col-span-2"
              {...register(`staffs.${idx}.email`, {
                required: "Email bắt buộc",
                pattern: {
                  value: /^[A-Za-z0-9\._-]+@[A-Za-z0-9\-]+\.[A-Za-z]{2,4}$/,
                  message: "Email không hợp lệ",
                },
              })}
              isInvalid={!!errors.staffs?.[idx]?.email}
              errorMessage={errors.staffs?.[idx]?.email?.message}
            />
            <Input
              type="text"
              size="lg"
              placeholder="Tên bác sĩ"
              variant="bordered"
              {...register(`staffs.${idx}.name`, {
                required: "Tên bác sĩ bắt buộc",
              })}
              isInvalid={!!errors.staffs?.[idx]?.name}
              errorMessage={errors.staffs?.[idx]?.name?.message}
            />

            <Controller
              key={staffField.id}
              control={control}
              name={`staffs.${idx}.position`}
              render={({ field }) => (
                <Select
                  disallowEmptySelection={true}
                  aria-label="doctor-title"
                  size="lg"
                  className="max-w-xs min-w-40"
                  variant="bordered"
                  placeholder="Vai trò"
                  {...field}
                  selectedKeys={[field.value]}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  {businessRole?.map((item) => (
                    <SelectItem key={item.ordering}>{item.name}</SelectItem>
                  ))}
                </Select>
              )}
            />

            <Input
              type="tel"
              size="lg"
              placeholder="Số phone"
              variant="bordered"
              {...register(`staffs.${idx}.phone`, {
                required: false,
                pattern: {
                  value: /^(?:0|\+84)(?:\d){2}[-. ]?(?:\d){3}[-. ]?(?:\d){4}$/,
                  message:
                    "Số điện thoại không hợp lệ, 0xx-xxx-xxxx hoặc +84xx-xxx-xxxx",
                },
              })}
              isInvalid={!!errors.staffs?.[idx]?.phone}
              errorMessage={errors.staffs?.[idx]?.phone?.message}
            />
          </div>
        ))}
        <div className="w-full">
          <Button
            color="primary"
            isIconOnly
            variant="bordered"
            radius="lg"
            onPress={() => addNewStaff()}
            startContent={<IconPlus size={24} />}
          />
        </div>

        <div className="w-full flex items-center justify-center">
          <ButtonCustom
            label="Lưu"
            type="submit"
            isLoading={sumitting}
            styleType="primary"
            className="max-w-40"
          />
        </div>
      </form>
    </ModalBase>
  );
};
