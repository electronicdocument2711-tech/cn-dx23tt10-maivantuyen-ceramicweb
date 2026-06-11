interface JwtPayload {
  exp: number;
  iat?: number;
  [key: string]: unknown;
}

const decodeBase64 = (payload: string) => {
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");

  if (typeof window === "undefined") {
    return Buffer.from(normalized, "base64").toString("utf-8");
  }
  return decodeURIComponent(escape(window.atob(normalized)));
};

export function getJwtMaxAge(jwt: string): number | null {
  try {
    const [, payload] = jwt.split(".");
    if (!payload) return null;

    const decoded = JSON.parse(decodeBase64(payload)) as JwtPayload;

    if (typeof decoded.exp !== "number") return null;

    const now = Math.floor(Date.now() / 1000);
    return Math.max(decoded.exp - now, 0);
  } catch {
    return null;
  }
}
