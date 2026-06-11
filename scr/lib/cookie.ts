import Cookies from "universal-cookie";

export async function get(key: string, dft = ""): Promise<string> {
  try {
    if (typeof window === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const cookieStore = await require("next/headers").cookies();
      const { value } = (await cookieStore.get(key)) ?? { value: dft };
      return value;
    } else {
      const cookies = new Cookies();
      return cookies.get(key) ?? dft;
    }
  } catch {}
  return dft;
}

export function set(
  key: string,
  value: string,
  options?: {
    days?: number;
    path?: string;
    domain?: string;
    sameSite?: "lax" | "strict" | "none";
  },
) {
  try {
    if (typeof window !== "undefined") {
      const opts = { path: "/", sameSite: true, ...options };
      const cookies = new Cookies();
      return cookies.set(key, value, opts);
    }
  } catch (e) {
    console.log("libs cookie set() failure: ", e);
  }

  return false;
}

export function remove(
  key: string,
  options?: { path?: string; domain?: string },
) {
  try {
    // if (typeof window !== "undefined") {
    const opts = { path: "/", sameSite: true, ...options };
    const cookies = new Cookies();
    return cookies.remove(key, opts);
    // }
  } catch (e) {
    console.log(e);
  }
}
