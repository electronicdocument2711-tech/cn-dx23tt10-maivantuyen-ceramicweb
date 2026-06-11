import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { cms } from "@/lib/cms";
import { MULTIPART_HEADERS } from "@/const/api";

export async function GET(_req: NextRequest) {
  try {
    const data = { _act: "getInfo" };
    const res = await cms.post(
      "/pos/Provinces/Provinces",
      data,
      MULTIPART_HEADERS
    );
    const provinces = res.data.module.views[0].data.Provinces;
    if (!provinces) throw throwError("Provinces null", 404);
    return NextResponse.json(provinces, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
