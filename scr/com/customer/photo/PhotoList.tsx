"use client";

import rest from "@/lib/rest";
import { useEffect, useState } from "react";
import { useCustomerContext } from "@/context/CustomerContext";
import UploadItem from "./UploadItem";
import dayjs from "@/lib/dayjs";
import PhotoListItem from "./PhotoListItem";

const Spinner = () => (
  <div className="flex items-center gap-2 text-gray-600">
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
    Đang tải ảnh...
  </div>
);

const PhotoList: React.FC = () => {
  const { customer } = useCustomerContext();
  const [items, setItems] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  const today = dayjs().format("dddd, DD/MM/YYYY");

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!customer?.CustomerId) return;
      setLoading(true);
      try {
        const res = await rest.get(`/customer/${customer?.CustomerId}/photo`);
        if (res.status === 200 && Array.isArray(res.data?.data)) {
          const photos = res.data.data || [];

          // group photos by date
          const grouped = photos.reduce((acc: any, photo: any) => {
            const date = dayjs(photo.createdAt).format("dddd, DD/MM/YYYY");
            if (!acc[date]) acc[date] = [];
            acc[date].push(photo);
            return acc;
          }, {});

          setItems(grouped);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!loading && Object.keys(items).length === 0) fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  return (
    <>
      <UploadItem
        photos={items[today] || []}
        isLast={Object.keys(items).length === 1}
        customerId={String(customer?.CustomerId)}
      />

      {Object.keys(items)
        .filter((date) => date !== today)
        .map((date, index, array) => (
          <PhotoListItem
            key={date}
            date={date}
            photos={items[date]}
            isLast={index === array.length - 1}
            customerId={String(customer?.CustomerId)}
          />
        ))}

      {loading && (
        <div className="pl-4 my-3">
          <Spinner />
        </div>
      )}
    </>
  );
};

export default PhotoList;
