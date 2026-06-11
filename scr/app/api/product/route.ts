import { NextResponse } from "next/server";
import { handleError } from "../../../lib/response";
import { saas } from "../../../lib/saas";

export async function GET() {
  try {
    const res = await saas.get("api/plans?populate=*");

    if (res.status !== 200) throw new Error();

    const data = res.data.data;

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(...handleError(error));
  }
}
