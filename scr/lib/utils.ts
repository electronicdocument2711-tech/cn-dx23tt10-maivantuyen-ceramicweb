import { NextRequest } from "next/server";

export const getCookie = async (key: string) => {
  if (typeof window === "undefined") {
    // Server-side: use Next.js cookies API
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const { value } = cookieStore.get(key) ?? { value: null };
    return value;
  } else {
    // Client-side: use document.cookie
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`))
      ?.split("=")[1];
    return value || null;
  }
};

// transfer from object to FormData, if the value is array, append each item with the same key
export const toFormData = (obj: Record<string, any>): FormData => {
  const formData = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(`${key}[]`, v));
    } else if (value !== undefined) {
      formData.append(key, value);
    }
  });

  return formData;
};

export const groupBy = (xs: any[], key: string) => {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

export function isOn(el: any | undefined): boolean {
  let elType = typeof el;
  if (elType === "undefined" || el === null) return false;

  // string check
  if (el instanceof String) elType = "string";

  switch (elType) {
    case "string":
      return el.length > 0;
    case "object": // array | object
      return Array.isArray(el) ? el.length > 0 : !isEmpty(el);
    default:
      return true;
  }
}

export const clean = async (request: NextRequest) => {
  const params: { [prop: string]: any } = {};
  try {
    // first, parse the searchParams (GET)
    const searchParams = request.nextUrl.searchParams;
    searchParams.forEach((value, key) => {
      const val = searchParams.getAll(key);
      return (params[key] =
        Array.isArray(val) && val.length > 1 ? val : value.trim());
    });

    // then, parse the body (POST, PUT)
    // check the Content-Type was one of "multipart/form-data" or "application/x-www-form-urlencoded" then process
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const data = (await request.clone().formData()).entries();
      for (const [k, value] of data)
        params[k] = typeof value === "string" ? value.trim() : value;
    }

    // then, parse the body json (POST, PUT)
    // check the Content-Type was "application/json"
    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      isOn(body) &&
        Object.keys(body).forEach(
          (k) =>
            (params[k] =
              typeof body[k] === "string" ? body[k].trim() : body[k]),
        );
    }
  } catch (error) {
    console.log(error);
  }

  return params;
};

export function isEmpty(el: any): boolean {
  for (const prop in el) if (Object.hasOwn(el, prop)) return false;

  return true;
}

export const normalizeString = (value: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase();

export const normalizeDigits = (value?: string | null) =>
  (value ?? "").replace(/[^0-9]/g, "");

export const getErrorMessage = (error: any, defaultMsg: string) =>
  `${error.response?.status ?? error.status ?? 500} ${
    error?.response?.data?.message ??
    error?.response?.data ??
    error?.message ??
    defaultMsg
  }`;

export const displayTax = (isTax?: boolean, taxValue?: number) => {
  if (isTax) {
    return `${taxValue}%`;
  }
  return "KCT";
};
