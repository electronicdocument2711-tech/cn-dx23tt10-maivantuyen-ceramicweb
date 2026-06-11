import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { doMediaReverse } from "./lib/helperUrl";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // reverse all uploads files
  if (pathname.startsWith("/uploads/")) return doMediaReverse(pathname);

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|strapi-api|_next/static|_next/image|favicon.ico).*)"],
};
