"use client";
import rest from "@/lib/rest";
import {
  addToast,
  Button,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  Spinner,
} from "@heroui/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UI_META } from "@/const/ui";
import { IconPlus, IconX } from "@tabler/icons-react";
import { getErrorMessage } from "@/lib/utils";

export default function DiagnosePage() {
  const router = useRouter();
  const aboutRef = useRef<AbortController | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sumiting, setSumiting] = useState(false);

  const handleCreateDiagnose = async () => {
    try {
      setSumiting(true);
      const res = await rest.post(`/customer/${params.id}/diagnose`, {
        customerId: params.id,
      });

      const diagnoseId = res.data.data;
      if (!res.data.code || !diagnoseId)
        throw new Error("Đã có lỗi xảy ra", { cause: 502 });

      addToast({
        title: "Thành công",
        description: "Đã tạo đợt điều trị mới thành công",
        color: "success",
      });

      router.push(`/customer/${params.id}/diagnose/${diagnoseId}`);
    } catch (error: any) {
      addToast({
        title: "Thất bại",
        description: getErrorMessage(error, "Đã có lỗi xảy ra"),
        color: "danger",
      });
      void error;
    } finally {
      setSumiting(false);
    }
  };

  useEffect(() => {
    if (!params.id) return;
    const fetchDiagnose = async () => {
      try {
        setLoading(true);
        setError(null);

        aboutRef?.current?.abort();
        const controler = new AbortController();
        aboutRef.current = controler;

        const res = await rest.get(`/customer/${params.id}/diagnose`, {
          signal: controler.signal,
        });
        if (res.status !== 200) {
          throw new Error("Lấy thống tin chuẩn đoán thất bại do lỗi máy chủ", {
            cause: 502,
          });
        }

        const diagnoseId: string = res.data.data.data;
        if (diagnoseId) {
          router.push(`/customer/${params.id}/diagnose/${diagnoseId}`);
        } else {
          setLoading(false);
          setIsOpen(true);
        }
      } catch (error: any) {
        if (
          (error instanceof Error && error.name === "CanceledError") ||
          error.code === "ERR_CANCELED"
        )
          return;
        setError(getErrorMessage(error, "Đã có lỗi xảy ra"));
        setLoading(false);
        //only set loading to false when there is an error or when the request is completed for navigate to next page, not when it's aborted
      }
    };
    fetchDiagnose();
    return () => {
      aboutRef?.current?.abort();
    };
  }, [params, router]);

  const renderContent = () => {
    if (loading)
      return (
        <div className="w-full min-h-96 flex justify-center items-center">
          <Spinner size="sm" color="default" />
        </div>
      );

    if (error)
      return (
        <div className="w-full min-h-96 flex flex-col gap-2 justify-center items-center text-default-500">
          {error}
          <Button
            className={`${UI_META.Button.primary.classnames} max-w-20`}
            onPress={() => router.refresh()}
          >
            Thử lại
          </Button>
        </div>
      );
    return (
      <div className="w-full flex items-center justify-center ">
        <div className="py-6 flex flex-col items-center justify-center gap-7">
          <Image src="/image/diagnose/diagnosis.webp" alt="diagnose-image" />
          <div className="flex flex-col gap-3 text-center">
            <h1>Chưa có đợt điều trị</h1>
            <p className="text-default-500 max-w-lg mx-auto">
              Đợt điều trị (Episode of care) chỉ toàn bộ một{" "}
              <span className="font-medium">chu kỳ điều trị</span> cho một khách
              hàng, từ bắt đầu đến kết thúc.
            </p>
          </div>
          <Button
            isLoading={sumiting}
            startContent={<IconPlus size={24} />}
            className={`${UI_META.Button.primary.classnames} max-w-46 h-12`}
            onPress={handleCreateDiagnose}
          >
            Tạo đợt điều trị
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <Modal
        isOpen={isOpen}
        size="lg"
        // scrollBehavior="outside"
        onOpenChange={setIsOpen}
        hideCloseButton
        isDismissable={UI_META.Modal.isDismissable}
        classNames={{
          ...UI_META.Modal.classnames,
          base: "rounded-4xl",
        }}
        className="max-w-[464px]"
      >
        <ModalContent>
          <ModalBody className="px-2 pt-2 pb-6 flex flex-col items-center gap-7 relative">
            <Button
              isIconOnly
              className="absolute top-4 right-4 z-20 rounded-full"
              onPress={() => setIsOpen(false)}
            >
              <IconX size={24} />
            </Button>
            <Image
              src="/image/diagnose/diagnosis_bg.webp"
              alt="diagnose-image"
              className="w-full h-full"
              draggable={false}
            />
            <div className="flex flex-col gap-4 px-5">
              <h1>Bắt đầu đợt điều trị mới</h1>
              <p className="text-default-500">
                Đợt điều trị (Episode of care) chỉ toàn bộ một chu kỳ điều trị
                cho một khách hàng, từ bắt đầu đến kết thúc.
              </p>
            </div>
            <div className="w-full px-4">
              <Button
                isLoading={sumiting}
                className={`${UI_META.Button.primary.classnames}  h-12 rounded-2xl`}
                onPress={handleCreateDiagnose}
              >
                Tạo đợt điều trị
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
