import { NextResponse, NextRequest } from "next/server";
import { cms } from "@/lib/cms";
import { handleError } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const res = await cms.post(
      "/customer/dashboard/statistics", payload
    )

    return NextResponse.json(res.data)
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}