import Photo from "@/com/customer/photo/Photo";
import { useState, useEffect } from "react";
import { useDisclosure } from "@heroui/react";
import PhotoModal from "./PhotoModal";

const PhotoListItem: React.FC<{
  date: string;
  photos: any[];
  isLast?: boolean;
  customerId: string;
}> = ({ date, photos, isLast, customerId }) => {
  const [photo, setPhoto] = useState<any>(null);
  const [items, setItems] = useState<any[]>(photos);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    setItems(photos);
  }, [photos]);

  return (
    <div className="grid grid-cols-[48px_1fr] gap-1 items-stretch">
      <div className="relative flex justify-center">
        <div className="relative z-10 mt-4 size-3.5 rounded-full bg-primary-300" />
        {!isLast && (
          <div className="absolute left-1/2 top-5 bottom-0 -translate-x-1/2 border-l border-dashed border-default-300" />
        )}
      </div>
      <div className="pt-2.5 pb-8">
        <h4 className="text-foreground text-base font-semibold flex items-center capitalize mb-5">
          {date}
        </h4>
        <div className="flex flex-row justify-start gap-6 flex-wrap">
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

export default PhotoListItem;
