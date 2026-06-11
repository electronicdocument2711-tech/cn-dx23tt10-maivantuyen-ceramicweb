import dayjs from "@/lib/dayjs";
// Helpers and constants
export const getTodayStr = (): string => {
  const now = new Date();
  const y = now.getFullYear().toString().padStart(4, "0");
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const clampToToday = (value: string): string => {
  const today = getTodayStr();
  if (!value || value < today) return today;
  return value;
};

export const formatTimeCompact = (t?: string) => {
  if (!t) return "--:--";
  const [hh, mm] = t.split(":");
  const suffix = Number(hh) >= 12 ? "pm" : "am";
  return `${hh}:${mm}${suffix}`;
};

// Time parsing/formatting helpers (shared by time controls)
export const pad2 = (n: number) => n.toString().padStart(2, "0");
export const to24 = (h: number, m: number) => `${pad2(h)}:${pad2(m)}`;
export const to24WithSuffix = (h24: number, m: number) => {
  const suffix = h24 >= 12 ? "pm" : "am";
  return `${pad2(h24)}:${pad2(m)}${suffix}`;
};
export const clampToEndOfDay = (mins: number) => Math.min(mins, 23 * 60 + 59);
export const addMinutes = (mins: number, delta: number) =>
  clampToEndOfDay(mins + delta);
export const parseHHmmToMinutes = (s?: string | null): number | null => {
  if (!s) return null;
  const m = s.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  if (h > 23 || mm > 59) return null;
  return h * 60 + mm;
};
export const parseDigitsToHM = (
  digits: string
): { h: number; m: number } | null => {
  if (!/^\d{1,4}$/.test(digits)) return null;
  const d = digits;
  if (d.length === 4) {
    const h = parseInt(d.slice(0, 2), 10);
    const m = parseInt(d.slice(2, 4), 10);
    if (h > 23 || m > 59) return null;
    return { h, m };
  }
  if (d.length === 3) {
    const h = parseInt(d.slice(0, 1), 10);
    const m = parseInt(d.slice(1, 3), 10);
    if (h > 23 || m > 59) return null;
    return { h, m };
  }
  if (d.length === 2) {
    const h = parseInt(d, 10);
    if (h > 23) return null;
    return { h, m: 0 };
  }
  // length === 1
  const h = parseInt(d, 10);
  return { h, m: 0 };
};

export const buildQuarterHourOptions = () => {
  const items: Array<{ h: number; m: number; label: string }> = [];
  for (let mins = 0; mins < 24 * 60; mins += 15) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    items.push({ h, m, label: `${pad2(h)}:${pad2(m)}` });
  }
  return items;
};

// Date/time display helpers
export const formatDateDDMMYYYY = (
  value?: Date | string | number
): string => {
  if (!value) return "--/--/----";
  return dayjs(value).format("DD/MM/YYYY");
};

export const formatHHmm = (value?: Date | string | number): string => {
  if (!value) return "--:--";
  return dayjs(value).format("HH:mm");
};
