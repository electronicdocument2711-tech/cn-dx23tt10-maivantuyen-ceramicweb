import { cms } from "@/lib/cms";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams?.get("query") || "";
    const page = searchParams?.get("page") || "1";
    const pageSize = searchParams?.get("pageSize") || "24";
    const tax = searchParams?.get("tax") || "all";

    const formData = new FormData();
    formData.append(
      "lmstart",
      String((parseInt(page, 10) - 1) * parseInt(pageSize, 10)),
    );
    formData.append("limit", pageSize);
    if (query) {
      formData.append("query", query);
    }
    if (tax !== "all") {
      formData.append("tax", tax);
    }

    const res = await cms.post("/pos/service?_lay=getServiceTaxInfo", formData);

    if (res?.status !== 200) {
      throw new Error(`Lỗi khi gọi API: ${res?.message || "Unknown error"}`, {
        cause: res?.status || 500,
      });
    }

    const data = prop(res, ...["data", "module", "views", "0"]) || {};

    return NextResponse.json(
      {
        ...data,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const formData = new FormData();
    formData.append("ServiceId", body?.ServiceId);
    formData.append("ServiceTaxInfoId", body?.ServiceTaxInfoId || "");
    formData.append("ServiceTaxName", body?.ServiceTaxName);
    formData.append("Unit", body?.Unit);
    formData.append("TaxPercent", String(body?.TaxPercent));
    formData.append("StartDate", dayjs(body?.StartDate).format("YYYY-MM-DD"));

    if (body?.EndDate) {
      formData.append(
        "EndDate",
        body?.EndDate ? dayjs(body?.EndDate).format("YYYY-MM-DD") : "",
      );
    }

    const res = await cms.post(
      "/pos/service?_act=ServiceTaxInfo.save",
      formData,
    );

    if (res?.status !== 200) {
      throw new Error(`Lỗi khi gọi API: ${res?.message || "Unknown error"}`, {
        cause: res?.status || 500,
      });
    }

    const data = prop(res, ...["data", "module", "code"]);

    if (!data) {
      const message =
        (
          prop(res, ...["data", "messages"])?.map((item: any) =>
            prop(item, ...["mes"]),
          ) || []
        )?.join(", ") || "";

      throw new Error(message || "Lỗi khi lưu thông tin thuế của dịch vụ", {
        cause: 500,
      });
    }

    return NextResponse.json({
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const formData = new FormData();
    formData.append("ServiceId", body?.ServiceId);
    formData.append("ServiceTaxInfoId", body?.ServiceTaxInfoId);
    formData.append("ServiceTaxName", body?.ServiceTaxName);
    formData.append("Unit", body?.Unit);
    formData.append("TaxPercent", String(body?.TaxPercent));

    const res = await cms.post(
      "/pos/service?_act=ServiceTaxInfo.update",
      formData,
    );

    if (res?.status !== 200) {
      throw new Error(`Lỗi khi gọi API: ${res?.message || "Unknown error"}`, {
        cause: res?.status || 500,
      });
    }

    const data = prop(res, ...["data", "module", "code"]);

    if (!data) {
      const message =
        (
          prop(res, ...["data", "messages"])?.map((item: any) =>
            prop(item, ...["mes"]),
          ) || []
        )?.join(", ") || "";

      throw new Error(message || "Lỗi khi lưu thông tin thuế của dịch vụ", {
        cause: 500,
      });
    }

    return NextResponse.json({
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
