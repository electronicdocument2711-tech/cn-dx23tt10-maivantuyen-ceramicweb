import { NextRequest, NextResponse } from "next/server";

const STRAPI = process.env.NEXT_PUBLIC_SAAS_URL;

export function getQueryFromUrl(req: NextRequest) {
  return Object.fromEntries(req.nextUrl.searchParams);
}

export const doMediaReverse = (path: string) =>
  NextResponse.rewrite(new URL(path, STRAPI));
