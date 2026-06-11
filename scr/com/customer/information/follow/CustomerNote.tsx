"use client";
import { IconChevronRight } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import ModalAddNote from "./ModalAddNote";
import NoteList from "./NoteList";
import { useCustomerContext } from "@/context/CustomerContext";
import { CustomerNoteData } from "@/types/define.d";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";
import { UI_META } from "@/const/ui";
import Link from "next/link";

const RENDER_ITEM = 1;

export default function CustomerNote() {
  const aboutRef = useRef<AbortController | null>(null);
  const { customer } = useCustomerContext();
  const [trigger, setTrigger] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<CustomerNoteData[]>([]);

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
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-foreground text-xl font-bold">
            Theo chân khách hàng
          </h2>
        </div>
        <ModalAddNote onSuccess={() => setTrigger((prev) => prev + 1)} />
      </div>

      {error ? (
        <div className="w-full min-h-23 flex flex-col gap-2 justify-center items-center text-default-500">
          <p>{error}</p>
          <button
            type="button"
            className={`${UI_META.Button.primary.classnames} max-w-20`}
            onClick={() => setTrigger((prev) => prev + 1)}
          >
            Tải lại
          </button>
        </div>
      ) : (
        <NoteList renderItems={RENDER_ITEM} data={notes} loading={loading} />
      )}

      {notes?.length > RENDER_ITEM && (
        <Link
          className="py-2 px-4 w-fit mt-4 rounded-xl hover:bg-sky-50 text-default-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          href={`/customer/${customer?.CustomerId}/notes`}
        >
          Xem tất cả ({notes?.length})
          <IconChevronRight size={18} />
        </Link>
      )}
    </div>
  );
}
