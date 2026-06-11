"use client";

import { useEffect, useState } from "react";
import { set, get, remove } from "@/lib/cookie";

export function useCookie<T>(key: string, initialValue?: T) {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    get(
      key,
      initialValue !== undefined ? String(initialValue) : undefined
    ).then((val) => {
      setValue(val as unknown as T);
      setIsLoaded(true);
    });
  }, [key, initialValue]);

  const updateCookie = (
    val: T | null,
    options?: { days?: number; path?: string }
  ) => {
    if (val === null || val === "") {
      setValue(undefined);
      return remove(key);
    } else {
      set(key, String(val), options);
      setValue(val);
    }
  };

  return [value, updateCookie, isLoaded] as const;
}
