//
import React, { useState } from "react";
import { Form, Input, Button } from "@heroui/react";

import { IconPlus } from "@/com/icons/outline";
import { useConfirm } from "../../ConfirmProvider";

export default function AddMembers() {
  const { confirm } = useConfirm();
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      await confirm({
        message: "Mật khẩu xác nhận không khớp!",
        type: "warning",
      });
      return;
    }
  };

  // Add Input Button
  const [inputs, setInputs] = useState([""]);

  const addInput = () => {
    setInputs([...inputs, ""]);
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  return (
    <section className="container max-w-90 mx-auto pt-4">
      {/* 1. Header */}
      <div className="">
        {/* 1.1. Title */}
        <h1 className="flex flex-col text-center font-bold text-2xl text-gray-600">
          Thêm thành viên
        </h1>

        {/* 1.2. Content */}
        <p className="text-center text-gray-600 text-xl pt-3">
          Bạn có thể cập nhật quyền của thành viên ở trang đội nhóm sau khi hoàn
          tất tạo phòng khám
        </p>
      </div>

      {/* 2. Input Form */}
      <Form className="w-full pt-6" onSubmit={onSubmit}>
        {/* 2.1. Input Member Email */}
        {/* 2.1.1. Input default */}
        <Input placeholder="Email" className="mt-5" />
        <Input placeholder="Email" className="mt-5" />

        {/* 2.1.2. Added Input */}
        {inputs.map((val, idx) => (
          <Input
            key={idx}
            placeholder="Email"
            value={val}
            onValueChange={(v) => handleInputChange(idx, v)}
            className="mt-5"
          />
        ))}

        {/* 2.2. Add New Button */}
        <Button
          onPress={addInput}
          color="primary"
          variant="bordered"
          className="mt-5 text-xl font-bold flex"
        >
          <IconPlus className="size-5" />
          Thêm mới
        </Button>

        {/* 2.3. Next Button */}
        <Button color="primary" className="w-full mt-10 text-xl font-semibold">
          Tiếp tục
        </Button>

        {/* 2.4. Skip Button */}
        <Button
          color="primary"
          variant="light"
          className="w-full mt-10 text-xl font-semibold"
        >
          Bỏ qua
        </Button>
      </Form>
    </section>
  );
}
