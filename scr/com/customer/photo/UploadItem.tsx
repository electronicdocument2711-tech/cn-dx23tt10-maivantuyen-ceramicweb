import dayjs from "@/lib/dayjs";
import { IconPlus } from "@tabler/icons-react";
import Photo from "./Photo";
import { useState, useEffect } from "react";
import { addToast, useDisclosure } from "@heroui/react";
import PhotoModal from "./PhotoModal";
import rest from "@/lib/rest";

const UploadItem: React.FC<{
  photos: any[];
  isLast?: boolean;
  customerId: string;
}> = ({ photos, isLast, customerId }) => {
  const [photo, setPhoto] = useState<any>(null);
  const [items, setItems] = useState<any[]>(photos);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setItems(photos);
  }, [photos]);

  // handle click to choose files from device and upload to server, then show in photo list
  const handleUpload = async (files: FileList) => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      // create form data
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        // check the file type and size before append to form data, only allow image files less than 5MB
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          addToast({
            title: "Tập tin không hợp lệ",
            description: `Tập tin ${file.name} có định dạng không hợp lệ. Chỉ hỗ trợ JPEG, PNG và WEBP.`,
          });
          return;
        }
        if (file.size > 5242880) {
          addToast({
            title: "Tập tin không hợp lệ",
            description: `Tập tin ${file.name} có kích thước lớn hơn 5MB.`,
          });

          return;
        }

        formData.append("files", file);
      });

      // request server to upload photos by customer id
      const headers = { "Content-Type": "multipart/form-data" };
      const url = `/customer/${customerId}/photo`;
      const res = await rest.post(url, formData, { headers });

      if (res.status === 201 && Array.isArray(res.data?.data)) {
        const newPhotos = res.data?.data || [];
        setItems((prev: any) => [...newPhotos, ...prev]);
      }
    } catch {
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-[48px_1fr] gap-1 items-stretch ">
      <div className="relative flex justify-center">
        <div className="relative z-10 mt-4 size-3.5 rounded-full bg-primary-300" />
        {!isLast && (
          <div className="absolute left-1/2 top-5 bottom-0 -translate-x-1/2 border-l border-dashed border-default-300" />
        )}
      </div>
      <div className="pt-2.5 pb-8">
        <h4 className="text-foreground text-base font-semibold flex items-center capitalize mb-5">
          {dayjs().format("dddd, DD/MM/YYYY")}
          <span className="font-normal text-gray-600 text-sm ml-2">
            (hôm nay)
          </span>
        </h4>
        <div className="flex flex-row justify-start gap-6 flex-wrap">
          <UploadCanvas onUpload={handleUpload} uploading={uploading} />
          {items.map((photo) => (
            <Photo
              key={photo.id}
              photo={photo}
              onClick={() => {
                setPhoto(photo);
                onOpen();
              }}
            />
          ))}
        </div>
        {/* show lightbox when click photo by using Modal component */}
        {photo && (
          <PhotoModal
            photo={photo}
            isOpen={isOpen}
            customerId={customerId}
            onOpenChange={onOpenChange}
            onUpdate={(up) => {
              setItems((prev) => prev.map((p) => (p.id === up.id ? up : p)));
              setPhoto(up);
            }}
            onDelete={(dp) => {
              setItems((prev) => prev.filter((p) => p.id !== dp.id));
              setPhoto(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center w-[22px] h-[22px]">
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
);

const UploadCanvas: React.FC<{
  onUpload: (files: FileList) => void;
  uploading: boolean;
}> = ({ onUpload, uploading }) => {
  return (
    <div className="w-36 h-44 gap-2 rounded-xl border border-default-400 border-dashed flex flex-col items-center justify-center bg-default-50 group">
      <label
        htmlFor="upload-photos"
        className={`flex flex-col items-center justify-center gap-2 ${uploading ? "cursor-default" : "cursor-pointer"}`}
      >
        <span className="bg-white shadow-sm rounded-lg p-2 w-fit h-fit text-gray-600 group-hover:text-gray-800 transition-colors">
          {uploading ? <Spinner /> : <IconPlus size={22} />}
        </span>
        <span className="text-sm font-medium text-gray-600">
          {uploading ? "Đang tải lên..." : "Thêm ảnh"}
        </span>
      </label>
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onUpload(e.target.files!)}
        name="upload-photos"
        id="upload-photos"
        disabled={uploading}
      />
    </div>
  );
};

export default UploadItem;
