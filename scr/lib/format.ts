export const formatCurrency = (
  value: any,
  endChar = false,
  showCurrency = true,
) => {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return showCurrency ? (endChar ? "₫0" : "0 ₫") : "0";
  }
  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numericValue);
  const valueStr = formatted.replace(/\s?₫/, "").trim();
  return showCurrency ? (endChar ? `₫${valueStr}` : formatted) : valueStr;
};

export function removeVietnameseTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export const cleanAndSafeStr = (input: any) => {
  if (!input || typeof input !== "string") return "";

  return input
    .replace(/<(script|iframe|object|embed|style).*?>.*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
};

/** Compact: 10,000,000 → "10tr", 1,500,000,000 → "1.5 tỷ" */
export const formatRevenueCompact = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} tỷ`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
  }
  if (value >= 1_000) {
    // Math.floor avoids rounding 999,500 → "1000k" (incorrect unit jump)
    return `${Math.floor(value / 1_000)}k`;
  }
  return value.toLocaleString("vi-VN");
};

/** Chuyển số nguyên thành chữ tiếng Việt (vd: 5000000 → "Năm triệu đồng") */
export function numberToWordsVi(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "";
  if (amount === 0) return "Không đồng";

  const ones = [
    "",
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

  function readHundreds(n: number): string {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    let result = "";

    if (h > 0) result += ones[h] + " trăm";

    if (t === 0 && u === 0) return result;

    if (t === 0) {
      result += (h > 0 ? " linh " : "") + ones[u];
    } else if (t === 1) {
      result += (h > 0 ? " " : "") + "mười";
      if (u === 5) result += " lăm";
      else if (u > 0) result += " " + ones[u];
    } else {
      result += (h > 0 ? " " : "") + ones[t] + " mươi";
      if (u === 1) result += " mốt";
      else if (u === 5) result += " lăm";
      else if (u > 0) result += " " + ones[u];
    }

    return result.trim();
  }

  const ty = Math.floor(amount / 1_000_000_000);
  const trieu = Math.floor((amount % 1_000_000_000) / 1_000_000);
  const nghin = Math.floor((amount % 1_000_000) / 1_000);
  const remainder = amount % 1_000;

  let result = "";
  if (ty > 0) result += readHundreds(ty) + " tỷ";
  if (trieu > 0) result += (result ? " " : "") + readHundreds(trieu) + " triệu";
  if (nghin > 0) result += (result ? " " : "") + readHundreds(nghin) + " nghìn";
  if (remainder > 0) result += (result ? " " : "") + readHundreds(remainder);

  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
}
