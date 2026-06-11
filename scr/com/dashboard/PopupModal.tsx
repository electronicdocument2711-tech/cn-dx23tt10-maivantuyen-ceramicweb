/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
"use client";

import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import Image from "next/image";

const PopupModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <section className="">
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        size="lg" // Chỉnh kích thước modal
        hideCloseButton={true} // Ẩn nút đóng
      >
        <ModalContent className="">
          {(_onClose) => (
            <>
              <ModalHeader className="bg-slate-100 rounded-2xl m-2">
                <Image
                  src="/PupUpPicture.svg"
                  alt="DentalX Client PopUp"
                  width={280}
                  height={280}
                  className="mx-auto"
                />
              </ModalHeader>

              <ModalBody className="px-7 pt-5 pb-0">
                <h1 className="pb-3">
                  Check your inbox to confirm your email address
                </h1>
                <p className="pb-7">
                  We sent a link to yidaw94742@merumart.com. If you don&apos;t
                  see it, check your spam folder. After confirming your email,
                  you can explore the platform.
                </p>
              </ModalBody>

              <ModalFooter className="pt-0 pb-6">
                <Button
                  color="primary"
                  size="lg"
                  className="w-full font-semibold"
                >
                  Hoàn tất
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
};

export default PopupModal;
