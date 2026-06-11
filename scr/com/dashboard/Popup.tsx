"use client";

import React, { useContext, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  useDisclosure,
} from "@heroui/react";
import Image from "next/image";

import { UserContext } from "@/context/UserContext";

export default function Popup() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { user } = useContext(UserContext);

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      backdrop="opaque"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="p-0">
              <div className="bg-slate-50 rounded-2xl mt-4 mx-4">
                <Image
                  src="/image2.svg"
                  alt="Header"
                  width={280}
                  height={280}
                  className="mx-auto mt-7"
                />
              </div>

              <div className="mx-4 mt-4 mb-7">
                <h2 className="text-2xl font-extrabold mb-4">
                  Kiểm tra hộp thư đến để xác nhận địa chỉ email của bạn.
                </h2>

                <p>
                  Chúng tôi đã gửi một đường dẫn đến địa chỉ{" "}
                  <span className="text-blue-500 font-semibold">
                    {user?.Email}
                  </span>
                  . Nếu bạn không thấy, hãy kiểm tra thư mục thư rác. Sau khi
                  xác nhận email, bạn có thể khám phá nền tảng.
                </p>
              </div>

              <Button
                color="primary"
                onPress={onClose}
                size="lg"
                className="mx-4 mb-4 text-lg font-semibold"
              >
                Hoàn tất
              </Button>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
