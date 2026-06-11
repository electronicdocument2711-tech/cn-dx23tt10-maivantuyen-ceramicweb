import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import {
  IconChevronDown,
  IconCircleCheckFilled,
  IconPlus,
} from "@tabler/icons-react";
import React, { useState } from "react";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { useCustomerContext } from "@/context/CustomerContext";
import { UI_META } from "@/const/ui";
import { CUSTOMER_NOTE_CATEGORIES } from "@/data/customer";

export default function ModalAddNote({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [noteCategorys] = useState<
    {
      CustomerNoteCategoryId: number;
      Name: string;
      State: number;
      Ordering: number;
    }[]
  >(CUSTOMER_NOTE_CATEGORIES);

  const [noteId, setNoteId] = useState<string>(
    noteCategorys[0].CustomerNoteCategoryId.toString() ?? ""
  );
  const [note, setNote] = useState("");

  const { customer } = useCustomerContext();
  const [submitting, setSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    //clear note when close
    // if (!open) {
    //   setNote("");
    // }
    open ? onOpen() : onClose();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const res = await rest.post(`/customer/${customer?.CustomerId}/note`, {
        noteId,
        note: note.trim(),
        customerId: customer?.CustomerId,
      });

      if (res.status !== 201)
        throw new Error("Đã có lỗi xảy ra trong khi tạo ghi chú", {
          cause: 500,
        });

      onSuccess?.();
      addToast({
        title: "Thành công",
        description: "Tạo ghi chú thành công",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Tạo ghi chú thất bại",
        description: getErrorMessage(error, "Đã có lỗi xảy ra"),
        color: "danger",
      });
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <>
      <Button
        // isLoading={loading}
        color="primary"
        onPress={onOpen}
        className={`${UI_META.Button.primary.classnames} max-w-40`}
      >
        <IconPlus size={24} className="font-bold shrink-0" />
        Thêm ghi chú
      </Button>
      <Modal
        size="md"
        radius="lg"
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        isDismissable={UI_META.Modal.isDismissable}
        classNames={UI_META.Modal.classnames}
      >
        <ModalContent>
          <ModalHeader>Thêm ghi chú</ModalHeader>
          <ModalBody>
            <form
              id="add-note-form"
              onSubmit={handleSave}
              className="flex flex-col gap-6"
            >
              <Select
                label="Loại lịch hẹn"
                labelPlacement="outside-top"
                placeholder="Chọn loại lịch hẹn"
                variant="bordered"
                selectedKeys={[noteId]}
                selectorIcon={<IconChevronDown size={20} />}
                onChange={(e) => setNoteId(e.target.value)}
                classNames={{
                  value: "m-2 font-semibold text-base text-foreground",
                  label: "font-bold text-base pb-3",
                  selectorIcon: "w-5 h-5",
                  clearButton: "mx-2",
                  trigger:
                    "h-10.5 w-full px-2 rounded-xl bg-white border-default-400 data-[hover=true]:border-default-500 flex items-center justify-start gap-1 ",
                }}
                // className="max-w-40"
                listboxProps={{
                  hideSelectedIcon: true,
                  classNames: { list: "!gap-1" },
                  itemClasses: {
                    base: "px-3 rounded-xl hover:bg-blue-50 data-[selected=true]:bg-blue-100",
                    title: "py-1 text-base font-semibold leading-[1.3]",
                    // description: "text-base text-default-500",
                  },
                }}
              >
                {noteCategorys.map((note) => (
                  <SelectItem
                    key={note.CustomerNoteCategoryId}
                    textValue={note.Name}
                  >
                    <div className="flex flex-row gap-1 justify-between w-full font-medium items-center">
                      <p className="text-base truncate">{note.Name}</p>
                      {noteId === note.CustomerNoteCategoryId.toString() && (
                        <IconCircleCheckFilled
                          className="text-primary-500 shrink-0"
                          size={24}
                        />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </Select>
              <Textarea
                isRequired
                label="Nội dung ghi chú"
                labelPlacement="outside-top"
                variant="bordered"
                radius="lg"
                classNames={UI_META.Textarea.classNames}
                minRows={2}
                validate={(value) => {
                  if (!value) return "Vui lòng nhập nội dung ghi chú";
                  return true;
                }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              form="add-note-form"
              type="submit"
              isLoading={submitting}
              isDisabled={submitting}
              className={UI_META.Button.primary.classnames}
            >
              Lưu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
