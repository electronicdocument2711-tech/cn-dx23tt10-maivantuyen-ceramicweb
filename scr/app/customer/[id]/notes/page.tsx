"use client";
import { Spinner } from "@heroui/react";

import React, { useEffect, useRef, useState } from "react";
import { useCustomerContext } from "@/context/CustomerContext";
import { CustomerNoteData } from "@/types/define.d";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { cleanAndSafeStr } from "@/lib/format";
import ModalAddNote from "@/com/customer/information/follow/ModalAddNote";

const typeColors: Record<number, string> = {
  7: "bg-indigo-500",
  8: "bg-blue-500",
  10: "bg-red-500",
  11: "bg-sky-600",
  870: "bg-yellow-500",
  872: "bg-purple-500",
  871: "bg-pink-500",
};

const CustomerNotesPage: React.FC = () => {
  const aboutRef = useRef<AbortController | null>(null);
  const { customer } = useCustomerContext();
  const [notes, setNotes] = useState<CustomerNoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(1);
  //filter note list
  // const noteLists = useMemo(() => {
  // 	if (!notes) return [];
  // 	if (renderItems && renderItems > 0 && renderItems < notes.length)
  // 		return notes.slice(0, renderItems);
  // 	return notes;
  // 	}, [notes]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!customer?.CustomerId) return;
      try {
        setLoading(true);
        setError(null);
        aboutRef?.current?.abort();
        const controler = new AbortController();
        aboutRef.current = controler;

        const res = await rest.get(`/customer/${customer.CustomerId}/note`);
        setNotes(res.data);
      } catch (error) {
        setNotes([]);
        setError(getErrorMessage(error, "Đã có lỗi xảy ra"));
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
    return () => {
      aboutRef?.current?.abort();
    };
  }, [customer?.CustomerId, trigger]);

  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-foreground text-xl font-bold">
          Theo chân khách hàng
        </h2>
        <ModalAddNote onSuccess={() => setTrigger((prev) => prev + 1)} />
      </div>
      {loading === true || notes === null ? (
        <Spinner
          className="border border-gray-300 rounded-2xl min-h-23 w-full items-center "
          size="sm"
          color="default"
        />
      ) : notes?.length === 0 ? (
        <div className="border border-gray-300 rounded-2xl min-h-23 w-full  flex justify-center items-center py-6">
          <p className="text-center text-gray-500">Chưa có ghi chú nào</p>
        </div>
      ) : (
        <ul className="border border-gray-300 rounded-2xl divide-y divide-gray-300">
          {notes?.map((item) => (
            <li
              key={item.CustomerNoteId}
              className="px-5 py-4 flex flex-col @sm:flex-row items-center @sm:items-start justify-between gap-4"
            >
              <div className="w-full flex flex-col justify-center items-center @sm:items-start">
                <h4 className="whitespace-pre-line w-full text-blue-700 pb-[10px] text-sm @sm:text-base font-semibold leading-[1.1]">
                  {cleanAndSafeStr(item.Note)}
                </h4>

                <div
                  className={`min-h-7 max-w-48 flex items-center justify-center rounded-full ${
                    typeColors[Number(item.CustomerNoteCategoryId)]
                  }`}
                >
                  <span className={`text-[13px] font-bold text-white px-3 `}>
                    {item.CustomerNoteCategoryName}
                  </span>
                </div>
              </div>

              {/* disable this feature for now*/}
              {/* <FollowupStatus status={item.status} /> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerNotesPage;
