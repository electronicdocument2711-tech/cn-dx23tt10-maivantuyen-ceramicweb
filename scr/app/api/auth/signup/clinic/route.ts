import { NextResponse } from "next/server";
// import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";
import { handleError } from "@/lib/response";

export async function POST(req: Request) {
  try {
    // const token = await get("access_token");
    const { name, documentId } = await req.json();

    if (!name || !documentId)
      throw new Error("Missing required fields, status code 401");

    const { status, data } = await saas.post("/api/businesses", {
      data: { name: name, owner: documentId, user_infos: documentId },
    });

    if (status !== 201 || !data.data?.id)
      throw new Error(data?.message || `Login failed, status code ${status}`);

    // return NextResponse.json({ status });
    return NextResponse.json({ data: "test" });
  } catch (error) {
    // console.error(error);
    return NextResponse.json(...handleError(error));
  }
}
