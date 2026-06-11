import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";
import { cms } from "@/lib/cms";
import { ValidateTokenAndAuth, handleError } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    await ValidateTokenAndAuth(request);

    const res = await cms.post(
      `/pos/provinces?_act=getProvincesWithPagination`,
    );
    const provinces =
      prop(res, ...["data", "module", "views", 0, "data"]) || [];
    return NextResponse.json(provinces, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
