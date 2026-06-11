export const sortObject = (obj: Record<string, any>) => {
  const sorted: Record<string, any> = {}
  const keys: string[] = []

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      keys.push(encodeURIComponent(key))
    }
  }

  keys.sort()

  for (let i = 0; i < keys.length; i++) {
    sorted[keys[i]] = encodeURIComponent(obj[keys[i]]).replace(/%20/g, '+')
  }

  return sorted
}


const DIGITS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

const readTriple = (value: number, showZeroHundred: boolean) => {
  const hundred = Math.floor(value / 100);
  const ten = Math.floor((value % 100) / 10);
  const unit = value % 10;
  const parts: string[] = [];

  if (hundred > 0 || showZeroHundred) {
    parts.push(`${DIGITS[hundred]} trăm`);
  }

  if (ten > 1) {
    parts.push(`${DIGITS[ten]} mươi`);
    if (unit === 1) parts.push("mốt");
    else if (unit === 4) parts.push("tư");
    else if (unit === 5) parts.push("lăm");
    else if (unit > 0) parts.push(DIGITS[unit]);
  } else if (ten === 1) {
    parts.push("mười");
    if (unit === 5) parts.push("lăm");
    else if (unit > 0) parts.push(DIGITS[unit]);
  } else if (unit > 0) {
    if (hundred > 0 || showZeroHundred) parts.push("lẻ");
    if (unit === 5 && (hundred > 0 || showZeroHundred)) parts.push("năm");
    else parts.push(DIGITS[unit]);
  }

  return parts.join(" ").trim();
};

export const numberToVietnameseCurrency = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "Không đồng";

  const units = ["", "nghìn", "triệu", "tỷ"];
  const groups: number[] = [];
  let remaining = Math.floor(value);

  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];

  for (let index = groups.length - 1; index >= 0; index -= 1) {
    const groupValue = groups[index];
    if (groupValue === 0) continue;

    const hasHigherGroup = index < groups.length - 1;
    const text = readTriple(groupValue, hasHigherGroup);
    const unit = units[index] || "";
    parts.push([text, unit].filter(Boolean).join(" "));
  }

  const result = parts.join(" ").replace(/\s+/g, " ").trim();
  return `${result.charAt(0).toUpperCase()}${result.slice(1)} đồng`;
};