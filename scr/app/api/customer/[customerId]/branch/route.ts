import { cms } from "@/lib/cms";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";

export async function GET(
  _: NextRequest,
  { params }: Readonly<{ params: Promise<{ customerId: string }> }>,
) {
  try {
    const { customerId } = await params;

    const response = await cms
      .get("/pos/customer", {
        params: {
          _lay: "getCurrentBranchId",
          CustomerId: customerId,
        },
      })
      .then((res) => {
        console.log("Rest", res);

        if (res?.status !== 200) {
          throw new Error("Không thể lấy thông tin chi nhánh", {
            cause: res?.status || 500,
          });
        }

        const branch = prop(res, ...["data", "module", "views", "0", "data"]);

        if (!branch) {
          const message =
            (
              prop(res, ...["data", "messages"])?.map((item: any) =>
                prop(item, ...["mes"]),
              ) || []
            )?.join(", ") || "";

          throw new Error(message || "Không thể lấy thông tin chi nhánh", {
            cause: 404,
          });
        }

        return prop(res, ...["data", "module", "views", "0", "data"]);
      });

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
