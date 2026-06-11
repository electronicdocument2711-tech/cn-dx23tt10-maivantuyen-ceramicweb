import React, {
  PropsWithChildren,
  useState,
  createContext,
  useContext,
} from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/react";

import ReactMarkdown from "react-markdown";

interface ConfirmContextType {
  confirm: (payload: Payload) => Promise<boolean>;
}

interface Payload {
  message: string;
  title?: string;
  type?: "info" | "warning" | "error";
  confirmText?: string;
  cancelText?: string;
  /**
   * Hàm xử lý hành động khi người dùng xác nhận(nếu có). Ví dụ: hàm gọi API để xóa dữ liệu,...
   * @returns Promise
   */
  handler?: () => Promise<any>;
  hideCancel?: boolean;
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: async () => false,
});

const ConfirmProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [config, setConfig] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const confirm = (payload: Payload) => {
    return new Promise<boolean>((resolve) => {
      setConfig({
        message: payload?.message,
        title: payload?.title,
        type: payload?.type ?? "info",
        confirmText: payload?.confirmText ?? "Xác nhận",
        cancelText: payload?.cancelText ?? "Hủy",
        hideCancel: payload?.hideCancel ?? false,
        onConfirm: async () => {
          if (payload.handler) {
            setIsProcessing(true);
            try {
              await payload.handler();
            } catch {
              // Dừng hành động khi gặp lỗi
              return;
            } finally {
              setIsProcessing(false);
            }
          }
          resolve(true);
          setConfig(null);
        },
        onCancel: () => {
          resolve(false);
          setConfig(null);
        },
      });
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal
        isOpen={!!config}
        onOpenChange={(isOpen) => !isOpen && config?.onCancel()}
      >
        <ModalContent>
          <>
            <ModalHeader></ModalHeader>
            <ModalBody>
              <p className="text-lg font-bold">{config?.title}</p>
              <ReactMarkdown>{config?.message}</ReactMarkdown>
            </ModalBody>
            <ModalFooter className="pb-6">
              {!config?.hideCancel && (
                <Button
                  variant="bordered"
                  className=""
                  onPress={config?.onCancel}
                  disabled={isProcessing}
                >
                  {config?.cancelText}
                </Button>
              )}
              <Button
                color={
                  config?.type === "info"
                    ? "primary"
                    : config?.type === "warning"
                      ? "warning"
                      : "danger"
                }
                className=""
                onPress={config?.onConfirm}
                disabled={isProcessing}
                isLoading={isProcessing}
              >
                {config?.confirmText}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </ConfirmContext.Provider>
  );
};

/**
 * Hook để sử dụng ConfirmContext, giúp hiển thị modal xác nhận với nội dung và kiểu tùy chỉnh.
 * @example
 * const { confirm } = useConfirm();
 * const result = await confirm({
 *   title: "Xác nhận hành động",
 *   message: "Bạn có chắc chắn muốn thực hiện hành động này không?",
 *   type: "warning",
 *   confirmText: "Xác nhận",
 *   cancelText: "Hủy",
 * });
 *
 * if (result) {
 *   console.log("Người dùng đã xác nhận hành động");
 * } else {
 *   console.log("Người dùng đã hủy hành động");
 * }
 *
 * // Hoặc với handler:
 * const result = await confirm({
 *   title: "Xác nhận xóa",
 *   message: "Bạn có chắc chắn muốn xóa mục này không?",
 *   type: "error",
 *   confirmText: "Xóa",
 *   cancelText: "Hủy",
 *   handler: async () => {
 *     // Giả sử đây là một hành động bất đồng bộ, ví dụ: gọi API để xóa dữ liệu
 *     await api.deleteItem(itemId);
 *   },
 * });
 *
 * // Nếu handler được cung cấp, modal sẽ tự động hiển thị trạng thái loading khi xử lý và sẽ không đóng modal nếu có lỗi xảy ra trong quá trình xử lý.
 */
export const useConfirm = () => {
  return useContext(ConfirmContext);
};

export default ConfirmProvider;
