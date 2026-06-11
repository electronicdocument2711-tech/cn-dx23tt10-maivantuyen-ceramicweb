"use client";

import { useState } from "react";

type SetValue<T> = T | ((val: T) => T);

function useLocal<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  const store = (key: string, value: T | null) => {
    if (typeof window !== "undefined" && window?.localStorage) {
      if (value === "" || value === null || value === undefined)
        window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(value));
    }
  };

  // State to store our value
  // Pass  initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      if (typeof window !== "undefined") {
        // browser code
        const item = window.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      }

      return initialValue;
    } catch {
      return initialValue;
    }
  });

  // useEffect to update local storage when the state changes
  const setValue = (value: SetValue<T>) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    store(key, valueToStore);
  };

  return [storedValue, setValue];
}

export default useLocal;
