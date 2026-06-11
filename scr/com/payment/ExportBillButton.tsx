"use client";

import React, { useState } from "react";

import {
  Button,
  cn,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  RadioGroup,
  useDisclosure,
  useRadio,
  VisuallyHidden,
} from "@heroui/react";
import { IconCheck, IconUpload, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const radioData = [
  {
    value: "Service",
    option: "Hoá đơn dịch vụ",
    link: "/payment/list/servicebill",
  },
  {
    value: "ExportService",
    option: "Xuất nhiều hoá đơn dịch vụ",
    link: "/payment/list/exportservicebill",
  },
];

const ExportBillButton = () => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selected, setSelected] = useState("");

  const disabled = selected === "" ? true : false;

  const selectData = radioData.find((item) => item.value === selected);

  const CustomRadio = (props: any) => {
    const { value } = props;

    const {
      Component,
      children,
      description,
      getBaseProps,
      getWrapperProps,
      getInputProps,
      getLabelProps,
      getLabelWrapperProps,
    } = useRadio(props);

    return (
      <Component
        {...getBaseProps({
          className: cn(
            "group font-bold inline-flex items-center hover:opacity-70 active:opacity-50 justify-between flex-row-reverse m-0",
            "max-w-full cursor-pointer border border-slate-200 rounded-xl gap-4 p-4",
            "data-[selected=true]:border-primary data-[selected=true]:bg-blue-50 data-[selected=true]:border-2",
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
            selected === value ? "bg-blue-500" : "",
          )}
        >
          <span>
            <IconCheck size={15} />
          </span>
        </span>

        <div {...getLabelWrapperProps()}>
          {children && <span {...getLabelProps()}>{children}</span>}
          {description && (
            <span className="text-small text-foreground opacity-70">
              {description}
            </span>
          )}
        </div>
      </Component>
    );
  };

  return (
    <div>
      <Button
        onPress={onOpen}
        startContent={<IconUpload size={20} />}
        className="font-bold text-base border-default-300 border-2"
        color="primary"
      >
        Xuất hoá đơn
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="py-2 flex items-center justify-between">
                Chọn cách xuất hoá đơn
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  onPress={() => {
                    onClose();
                    setSelected("");
                  }}
                  className="bg-slate-50 data-[focus=true]:outline-none"
                >
                  <IconX size={20} />
                </Button>
              </ModalHeader>

              <ModalBody className="py-9 border-t-2 border-slate-200">
                <RadioGroup value={selected} onValueChange={setSelected}>
                  <div className="flex flex-col gap-4">
                    {radioData.map((d) => (
                      <CustomRadio key={d.value} value={d.value}>
                        <p
                          className={`${selected === d.value ? "text-blue-500" : ""}`}
                        >
                          {d.option}
                        </p>
                      </CustomRadio>
                    ))}
                  </div>
                </RadioGroup>
              </ModalBody>

              <ModalFooter className="border-t-2 border-slate-200">
                <Button
                  onPress={() => {
                    if (selectData?.link) {
                      router.push(selectData?.link);
                    }
                    setSelected("");
                    onClose();
                  }}
                  isDisabled={disabled}
                  className="w-full text-base"
                  color="primary"
                >
                  Tiếp tục
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ExportBillButton;
