import { useCallback } from "react";

type FormDataValue = string | number | boolean | Date | Blob | File | null | undefined;

/**
 * @param fields  - flat key/value pairs (primitive, Blob, File)
 * @param json    - key/value pairs to be JSON-stringified
 */
const useFormData = () => {
  const buildFormData = useCallback(
    (
      fields: Record<string, FormDataValue> = {},
      json: Record<string, unknown> = {},
    ): FormData => {
      const formData = new FormData();

      Object.entries(fields).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (value instanceof Blob) { formData.append(key, value); return; }
        if (value instanceof Date) { formData.append(key, value.toISOString()); return; }
        formData.append(key, String(value));
      });

      Object.entries(json).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, JSON.stringify(value));
        }
      });

      return formData;
    },
    [],
  );

  return { buildFormData };
};

export default useFormData;