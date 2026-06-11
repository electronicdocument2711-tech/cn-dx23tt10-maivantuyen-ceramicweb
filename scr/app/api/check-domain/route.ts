import { cms } from "@/lib/cms";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { Domain } = await request.json();

    const response = await cms.post("/authen/check-domain", {
      Domain,
    });

    return NextResponse.json(response.data);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(_request: Request) {
  // do something
}
