/**
 * Utility functions for TreatmentProgressSection
 */

export const normalizeId = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  const asNumber = Number(raw);
  return Number.isFinite(asNumber) ? String(asNumber) : raw;
};

export const toNumberOrUndefined = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

export const readFirstString = (
  item: Record<string, unknown>,
  keys: string[],
): string => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
};

export const buildQuantity = (item: Record<string, unknown>): string => {
  const quantity = readFirstString(item, [
    "QuantityDisplay",
    "quantity",
    "Quantity",
  ]);
  if (quantity) return quantity;

  const completed = readFirstString(item, [
    "CompletedQuantity",
    "DoneQuantity",
    "CurrentQuantity",
  ]);
  const total = readFirstString(item, ["TotalQuantity", "QuantityTotal"]);

  if (completed && total) return `${completed}/${total}`;
  return total || completed || "-";
};

export const getChairTotalCount = (data: Record<string, unknown>[]): number => {
  if (!Array.isArray(data) || data.length === 0) return 0;
  const total = data[0].TotalRow;
  return Number.isFinite(Number(total)) ? Number(total) : 0;
};

export const formatProgressLabel = (label: string, percent?: number): string => {
  if (typeof percent !== "number" || !Number.isFinite(percent)) return label;
  const boundedPercent = Math.max(0, Math.min(100, percent));
  return `${label} (${boundedPercent.toFixed(0)}%)`;
};
