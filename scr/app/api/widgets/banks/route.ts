import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { handleError, throwError } from "@/lib/response";
import { MULTIPART_HEADERS } from "@/const/api";

export async function GET(_req: NextRequest) {
  try {
    const data = { lmstart: 0, lmlimit: 1000 };
    const res = await cms.post(
      "/hr/bank?_act=listReceiptBanks",
      data,
      MULTIPART_HEADERS
    );

    const banks = res.data.module.views[0].data;
    if (!banks) throwError("banks data null", 404);
    return NextResponse.json(banks);
  } catch (error) {
    return NextResponse.json(handleError(error));
  }
}
