import { handleError } from "@/lib/response";
import { saas } from "@/lib/saas";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [res, dictionaryRes] = await Promise.all([
      saas.get("/api/plans", {
        params: {
          populate: {
            product: {
              populate: {
                product_features: true,
              },
            },
            product_pricings: true,
          },
          sort: "ordering:asc",
        },
      }),
      saas.get("/api/config"),
    ]);

    if (!res.data?.data) {
      throw new Error("Không có dữ liệu plans");
    }

    return NextResponse.json({
      plans: res.data.data,
      dictionary: dictionaryRes.data?.data?.plan_dictionary ?? {},
    });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
