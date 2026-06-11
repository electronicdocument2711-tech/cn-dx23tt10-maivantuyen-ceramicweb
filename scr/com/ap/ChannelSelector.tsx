"use client";

import React, { useEffect, useState } from "react";
import { addToast, Autocomplete, AutocompleteItem } from "@heroui/react";
import rest from "@/lib/rest";
import { getErrorMessage } from "@/lib/utils";

interface ChannelSelectorProps {
  value?: string;
  onChange?: (channel: {
    key: string;
    name: string;
    documentId: string;
  }) => void;
}

const ChannelSelector = ({ value, onChange }: ChannelSelectorProps) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchChannels = async () => {
    try {
      setLoading(true);

      const res = await rest.get("/einvoice-channel");

      if (res.status !== 200)
        throw new Error("Lấy thông tin kênh bán hàng thất bại");

      setChannels(res?.data);
    } catch (err: any) {
      addToast({
        title: "Thất bại",
        description: getErrorMessage(err, "Đã có lỗi xảy ra"),
        color: "warning",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loaded) {
      fetchChannels();
      setLoaded(true);
    }
  }, [fetchChannels, loaded]);

  return (
    <Autocomplete
      isLoading={loading}
      aria-label="Channel Selector"
      placeholder="Chọn kênh"
      variant="bordered"
      selectedKey={value || null}
      onSelectionChange={(key) => {
        const selected = channels.find((c: any) => c.key === key);
        if (selected)
          onChange?.({
            key: (selected as any).key,
            name: (selected as any).name,
            documentId: (selected as any).documentId,
          });
      }}
    >
      {channels.map((c: any) => (
        <AutocompleteItem key={c?.key}>{c.name}</AutocompleteItem>
      ))}
    </Autocomplete>
  );
};

export default ChannelSelector;
