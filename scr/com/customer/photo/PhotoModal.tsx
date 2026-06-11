import { useState, useEffect } from "react";
import { Modal, ModalContent, Button, ModalBody } from "@heroui/react";
import { IconX } from "@tabler/icons-react";
import { useConfirm } from "@/com/ConfirmProvider";
import rest from "@/lib/rest";
import dayjs from "@/lib/dayjs";

const PhotoModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  photo: any;
  customerId: string;
  onUpdate: (photo: any) => void;
  onDelete: (photo: any) => void;
}> = ({ isOpen, onOpenChange, photo, customerId, onUpdate, onDelete }) => {
  const [item, setItem] = useState<any>(photo);
  const [note, setNote] = useState(photo?.note || "");
  const [loading, setLoading] = useState(false);

  const { confirm } = useConfirm();

  useEffect(() => {
    setItem(photo);
    setNote(photo?.note || "");
  }, [photo]);

  const handleDelete = async () => {
    if (
      await confirm({
        message: "Bạn muốn xóa hình ảnh này? Hành động này không thể hoàn tác.",
        hideCancel: true,
        type: "warning",
        confirmText: "Đúng, xóa ảnh",
      })
    ) {
      setItem(null);
      onOpenChange(false);
      onDelete(photo);

      // request server to delete photo by id and customer id
      await rest.delete(`/customer/${customerId}/photo/${photo.documentId}`);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // request server to update note of photo by id and customer id
      await rest.post(`/customer/${customerId}/photo/${photo.documentId}`, {
        note,
      });
      // update note of photo in photos array
      setItem((prev: any) => (prev ? { ...prev, note } : prev));
      onUpdate({ ...photo, note });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      size="full"
      isOpen={isOpen}
      hideCloseButton
      placement="top"
      isDismissable={false}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(handleClose) => (
          <ModalBody className="p-0">
            <div className="grid grid-cols-[1fr_360px] gap-2">
              <div className="w-full max-h-dvh flex items-center justify-center bg-default-100 p-6 border-r border-default-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item?.file?.url}
                  alt={item?.file?.name || "Photo"}
                  className="w-auto h-[calc(100vh-3rem)] object-contain rounded-sm"
                />
              </div>
              <div className="p-6 pt-3 flex flex-col gap-4 justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3>{item?.file?.name || "Photo"}</h3>
                    <Button
                      isIconOnly
                      variant="light"
                      radius="full"
                      size="sm"
                      onPress={() => {
                        handleClose();
                        onOpenChange(false);
                      }}
                      className="rounded-full flex items-center justify-center bg-[#F1F3F6]"
                    >
                      <IconX size={20} className="text-default-600" />
                    </Button>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {item?.user_info?.name && (
                        <span>
                          Tải lên bởi{" "}
                          <span className="font-semibold">
                            {item.user_info.name}
                          </span>{" "}
                          {dayjs(item.createdAt).fromNow()}
                        </span>
                      )}
                    </p>
                  </div>
                  <textarea
                    className="w-full p-2 border border-default-300 rounded-lg bg-default-50"
                    placeholder="Ghi chú..."
                    defaultValue={item?.note || ""}
                    rows={6}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      className="mt-2 font-semibold rounded-lg disabled:bg-gray-300 disabled:text-gray-700 disabled:border-gray-300"
                      onPress={handleSave}
                      color="primary"
                      isDisabled={
                        String(note).trim() === String(item?.note).trim()
                      }
                      isLoading={loading}
                    >
                      Lưu
                    </Button>
                  </div>
                </div>
                <Button
                  onPress={handleDelete}
                  variant="bordered"
                  className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                >
                  Xóa bỏ
                </Button>
              </div>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PhotoModal;
