import { cms } from "@/lib/cms";
import { handleError } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";
    const lmstart = searchParams.get("lmstart") || "0";

    const res = await cms.post(
      `/pos/room?_lay=listRoomWithPagination&limit=${limit}&lmstart=${lmstart}`,
    );

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const res = await cms.post("/pos/room?_act=saveRoomV2", formData);
    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
