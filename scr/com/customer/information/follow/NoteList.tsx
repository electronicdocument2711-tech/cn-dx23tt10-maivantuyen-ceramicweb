/* eslint-disable @typescript-eslint/no-unused-vars */
import { CustomerNoteData } from "@/types/define.d";
import {
  Spinner,
} from "@heroui/react";
import React, { useMemo } from "react";
import { cleanAndSafeStr } from "@/lib/format";

const typeColors: Record<number, string> = {
  7: "bg-indigo-500",
  8: "bg-blue-500",
  10: "bg-red-500",
  11: "bg-sky-600",
  870: "bg-yellow-500",
  872: "bg-purple-500",
  871: "bg-pink-500",
};

const NoteList = ({
  renderItems,
  data,
  loading = false,
}: {
  renderItems?: number;
  data: CustomerNoteData[];
  loading?: boolean;
}) => {
  //filter note list
  const noteLists = useMemo(() => {
    if (!data) return [];
    if (renderItems && renderItems > 0 && renderItems < data.length)
      return data.slice(0, renderItems);
    return data;
  }, [data, renderItems]);

  return (
    <div className="w-full @container">
      {loading === true || noteLists === null ? (
        <Spinner
          className="border border-gray-300 rounded-2xl min-h-23 w-full items-center "
          size="sm"
          color="default"
        />
      ) : noteLists?.length === 0 ? (
        <div className="border border-gray-300 rounded-2xl min-h-23 w-full  flex justify-center items-center py-6">
          <p className="text-center text-gray-500">Chưa có ghi chú nào</p>
        </div>
      ) : (
        <ul className="border border-gray-300 rounded-2xl divide-y divide-gray-300">
          {noteLists?.map((item) => (
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

export default NoteList;
