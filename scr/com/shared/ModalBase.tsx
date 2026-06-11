import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  useDisclosure,
} from "@heroui/react";
import { IconMinusVertical, IconPlus, IconX } from "@tabler/icons-react";
import React from "react";
import { ReactNode, useState } from "react";
import { ButtonCustom } from "./ButtonCustom";

interface CustomLayout {
  modal: string;
  header?: string;
  body?: string;
  footer?: string;
  trigger?: string;
}

const renderTrigger = ({
  trigger,
  onTrigger,
  triggerStyle,
}: {
  trigger: React.ReactNode;
  onTrigger: () => void;
  triggerStyle: string;
}) => {
  if (trigger && React.isValidElement(trigger)) {
    const oldClassName = (trigger.props as any).className || "";
    return React.cloneElement(trigger as React.ReactElement<any>, {
      className: `${oldClassName} ${triggerStyle ? triggerStyle.trim() : ""}`,
      onPress: (_e: any) => {
        onTrigger?.();
      },
      onClick: (e: React.MouseEvent) => {
        if (e && typeof e.stopPropagation === "function") {
          e.stopPropagation();
        }
        onTrigger?.();
      },
    });
  }
  return (
    <ButtonCustom
      styleType="primary"
      label="Show modal"
      startContent={<IconPlus />}
      onClick={onTrigger}
      className={`${triggerStyle || ""}`}
    />
  );
};

interface BaseModalProps extends Omit<ModalProps, "children"> {
  trigger?: ReactNode;
  title: string;
  startHeaderContent?: ReactNode | ((onClose: () => void) => ReactNode);
  endHeaderContent?: ReactNode;
  footer?: ReactNode | ReactNode[];
  children: ReactNode | ((container: HTMLDivElement | null) => ReactNode);
  showDivider?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  hideTrigger?: boolean;
  customLayout?: Partial<CustomLayout>;
}

export const ModalBase = ({
  trigger,
  hideTrigger = false,
  onOpen: onOpenExternal,
  onClose: onCloseExternal,
  title,
  startHeaderContent,
  endHeaderContent,
  footer,
  children,
  showDivider = true,
  classNames,
  customLayout,
  ...props
}: BaseModalProps) => {
  const [portalNode, setPortalNode] = useState<HTMLDivElement | null>(null);
  const internalDisclosure = useDisclosure();
  const _isOpen = props.isOpen ?? internalDisclosure.isOpen;
  const _onOpenChange = props.onOpenChange ?? internalDisclosure.onOpenChange;

  const handleOpen = () => {
    _onOpenChange(true);
    onOpenExternal?.();
  };

  const handleClose = () => {
    _onOpenChange(false);
    onCloseExternal?.();
  };

  return (
    <>
      {hideTrigger
        ? null
        : renderTrigger({
            trigger,
            onTrigger: handleOpen,
            triggerStyle: customLayout?.trigger ?? "",
          })}
      <Modal
        isOpen={_isOpen}
        onOpenChange={_onOpenChange}
        isDismissable={false}
        scrollBehavior="outside"
        className={`w-full ${customLayout?.modal}`}
        classNames={{
          backdrop: `${classNames?.backdrop || ""}`,
          wrapper: `${classNames?.wrapper || ""}`,
          base: `@container ${classNames?.base || ""}`,
          header: ` ${classNames?.header || ""}`,
          body: ` ${classNames?.body || ""}`,
          footer: ` ${classNames?.footer || ""}`,
        }}
        {...props}
        hideCloseButton
      >
        <ModalContent>
          <ModalHeader
            className={`max-h-13 flex pl-7 pr-5 items-center justify-between gap-4 ${customLayout?.header}`}
          >
            <div className="flex items-center gap-3">
              {startHeaderContent && (
                <div className="flex-shrink-0">
                  {typeof startHeaderContent === "function"
                    ? startHeaderContent(handleClose)
                    : startHeaderContent}
                </div>
              )}
              <div className="text-base font-bold">{title}</div>
            </div>

            <div className="flex items-center justify-end">
              {endHeaderContent && (
                <div className="items-center hidden @md:flex ">
                  {endHeaderContent}
                  <IconMinusVertical size={24} strokeWidth={0.5} />
                </div>
              )}
              <Button
                isIconOnly
                variant="light"
                radius="full"
                size="sm"
                onPress={handleClose}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-[#F1F3F6]"
              >
                <IconX size={20} className="text-default-600" />
              </Button>
            </div>
          </ModalHeader>
          {showDivider && <Divider />}
          <ModalBody className={`px-7 pt-7 pb-9 ${customLayout?.body}`}>
            <div
              ref={setPortalNode}
              className="relative w-full h-full flex flex-col gap-6"
            >
              {typeof children === "function" ? children(portalNode) : children}
            </div>
          </ModalBody>
          {showDivider && footer && <Divider />}
          {footer && (
            <ModalFooter
              className={` px-7 py-4 min-h-11 flex flex-col @sm:flex-row w-full items-center justify-center gap-3 ${customLayout?.footer}`}
            >
              {footer}
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
