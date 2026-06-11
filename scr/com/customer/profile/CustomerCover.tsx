"use client";
import {
  Avatar,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import {
  IconBuilding,
  IconChevronDown,
  IconChevronUp,
  IconGenderFemale,
  IconGenderMale,
  IconId,
  IconMail,
  IconMoodSmile,
  IconPhone,
  IconUserCircle,
} from "@tabler/icons-react";
import React, { useState, useEffect } from "react";
import { useCustomerContext } from "@/context/CustomerContext";
import ModalEditProfile from "./ModalEditProfile";
import dayjs from "@/lib/dayjs";
import rest from "@/lib/rest";
// import { EmailElement } from "../../../types/define.d";

interface CustomerCoverProps {
  className?: string;
}
const CustomerCover: React.FC<CustomerCoverProps> = ({ className }) => {
  const { customer } = useCustomerContext();
  const [showMore, setShowMore] = useState(false);

  // const gender =
  //   customer?.Gender === "1" ? "Nam" : customer?.Gender === "2" ? "Nữ" : "N/A";

  return (
    <div className={`p-6 border-b border-gray-400 relative ${className}`}>
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <ModalEditProfile />
        <ButtonRate />
      </div>
      <Avatar
        isBordered
        radius="full"
        // src="/UserAvatar.png"
        className="text-3xl font-black w-16 h-16"
        size="lg"
        fallback={customer?.FullName?.charAt(0).toUpperCase() || "U"}
        name={customer?.FullName}
      />
      <h3 className="font-bold max-w-52 text-2xl mt-3 mb-6">
        {customer?.FullName}
      </h3>
      <ul className="space-y-2 mt-2 mb-4 text-sm">
        {customer?.FullName && (
          <li className="flex items-center gap-4">
            <IconUserCircle size={18} className="text-blue-600" />
            <p className="line-clamp-1 truncate">
              {customer?.CustomerCode}
              {customer?.CustomerLevelId && (
                <span className="font-semibold text-white bg-amber-500 leading-4 px-1 ml-1 rounded-lg">
                  {customer?.CustomerLevelId}
                </span>
              )}
            </p>
          </li>
        )}

        <li className="flex items-center gap-4">
          {customer?.Gender === "1" ? (
            <IconGenderMale size={18} className="text-blue-600" />
          ) : customer?.Gender === "2" ? (
            <IconGenderFemale size={18} className="text-blue-600" />
          ) : null}
          <div className="flex gap-2">
            {customer?.Gender === "1"
              ? "Nam"
              : customer?.Gender === "2"
                ? "Nữ"
                : ""}
            {customer?.Birthday && (
              <div className="flex items-center gap-2">
                <p>•</p>
                <span>
                  {dayjs().diff(dayjs(customer?.Birthday), "year")} Tuổi
                </span>
              </div>
            )}
          </div>
        </li>
        {showMore && (
          <>
            {customer?.PhoneNumbers &&
              customer?.PhoneNumbers.map((phone, idx) => (
                <li key={idx} className="flex items-center gap-4">
                  <IconPhone size={18} className="text-blue-600" />
                  {phone}
                </li>
              ))}
            {customer?.Emails &&
              customer?.Emails.map((email: any, idx) => (
                <li key={idx} className="flex items-center gap-4">
                  <IconMail size={18} className="text-blue-600 shrink-0" />
                  <p className="line-clamp-1 truncate">
                    {email.Email
                      ? email.Email
                      : typeof email === "string"
                        ? email
                        : ""}
                  </p>
                </li>
              ))}
            {customer?.CustomerCode && (
              <li className="flex items-center gap-4">
                <IconId size={18} className="text-blue-600 shrink-0" />
                <p className="line-clamp-1 truncate">
                  {customer?.CustomerCode}
                </p>
              </li>
            )}
            {customer?.Address && (
              <li className="flex items-center gap-4">
                <IconBuilding size={18} className="text-blue-600 shrink-0" />
                <p>{customer?.Address}</p>
              </li>
            )}
          </>
        )}
      </ul>
      <button
        onClick={() => setShowMore(!showMore)}
        className="text-sm flex items-center justify-center py-1 text-center gap-2 cursor-pointer border border-gray-300 hover:bg-gray-200 w-full rounded-lg"
      >
        {showMore ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        {showMore ? "Thu gọn" : "Xem thêm"}
      </button>
    </div>
  );
};

export default CustomerCover;

interface RatingItem {
  emotionalState: string;
  emoji: string;
  label: string;
}
const ratings: RatingItem[] = [
  { emotionalState: "1", emoji: "🥰", label: "Hài lòng" },
  { emotionalState: "2", emoji: "🥲", label: "Phàn nàn" },
  { emotionalState: "3", emoji: "🛑", label: "Cấm" },
];

const ButtonRate: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { customer } = useCustomerContext();

  const [rated, setRated] = useState<RatingItem | null>(null);

  useEffect(() => {
    if (customer?.EmotionalState) {
      setRated(
        ratings.find((r) => r.emotionalState === customer?.EmotionalState) ||
          null,
      );
    } else {
      setRated(null);
    }
  }, [customer?.EmotionalState]);

  const handleRate = async (rating: RatingItem) => {
    const previous = rated;
    setRated(rating);
    setIsSubmitting(true);
    try {
      const res = await rest.post("/satisfaction-log", {
        customerId: customer?.CustomerId,
        emotionState: rating.emotionalState,
      });

      if (res?.status !== 200 && res?.status !== 201) {
        throw new Error("Failed to submit rating");
      }
    } catch {
      setRated(previous);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Popover placement="right">
      <PopoverTrigger>
        <Button
          variant="faded"
          className="hover:bg-blue-50 bg-white shadow-xs min-w-0"
          startContent={
            <div className="w-6 h-6 flex items-center justify-center font-medium">
              {rated ? (
                <span className="text-2xl leading-6">{rated.emoji}</span>
              ) : (
                <IconMoodSmile className="shrink-0" size={24} />
              )}
            </div>
          }
          isIconOnly
          isDisabled={isSubmitting}
        />
      </PopoverTrigger>
      <PopoverContent>
        <ul className="flex gap-1 py-1.5">
          {ratings.map((rating) => (
            <li key={rating.emotionalState}>
              <Button
                variant="light"
                className={`flex flex-col text-base text-center gap-1 py-2 h-auto ${
                  rated?.emotionalState === rating.emotionalState
                    ? "bg-blue-100"
                    : ""
                }`}
                onPress={() => handleRate(rating)}
                isDisabled={isSubmitting}
              >
                <span className="text-2xl">{rating?.emoji}</span>
                <p>{rating?.label}</p>
              </Button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
