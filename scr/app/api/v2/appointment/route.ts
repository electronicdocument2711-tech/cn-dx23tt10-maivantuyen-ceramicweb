import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";
import { NextRequest, NextResponse } from "next/server";
import { prop, unique } from "remeda";

export async function GET(request: NextRequest) {
  try {
    const authorize = await cms.get("/authen/authorize");

    if (
      authorize?.status !== 200 ||
      !prop(authorize, ...["data", "module", "code"])
    ) {
      throw new Error("Chưa đăng nhập", { cause: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    const statuses = searchParams?.getAll("statuses[]");
    const doctors = searchParams?.getAll("doctors[]");
    const branches = searchParams?.getAll("branches[]");
    const page = searchParams?.get("page");
    const pageSize = searchParams?.get("page_size");
    const formTime = searchParams?.get("from_time");
    const toTime = searchParams?.get("to_time");
    const customers = searchParams?.getAll("customers[]");
    const labels = searchParams?.getAll("labels[]");
    const order = searchParams?.get("order");

    const formData = new FormData();
    if (statuses && statuses?.length > 0) {
      statuses.forEach((status) => formData.append("statuses[]", status));
    }

    if (doctors && doctors?.length > 0) {
      doctors.forEach((doctor) => formData.append("doctors[]", doctor));
    }

    if (branches && branches?.length > 0) {
      branches.forEach((branch) => formData.append("branches[]", branch));
    }

    if (customers && customers?.length > 0) {
      customers.forEach((customer) => formData.append("customers[]", customer));
    }

    if (labels && labels?.length > 0) {
      labels.forEach((label) => formData.append("labels[]", label));
    }

    if (formTime) {
      formData.append("from_time", formTime);
    }

    if (toTime) {
      formData.append("to_time", toTime);
    }

    if (pageSize && page) {
      formData.append("limit", String(pageSize));
      formData.append(
        "lmstart",
        ((parseInt(page, 10) - 1) * parseInt(pageSize, 10)).toString(),
      );
    } else {
      formData.append("limit", "-1");
    }

    if (order) {
      formData.append("order", order);
    }

    const response = await cms.post(
      "/pos/appointment?_lay=listAppointmentInDayV3",
      formData,
    );

    let appointments = prop(
      response,
      ...["data", "module", "views", "0", "data"],
    );
    const pagination =
      prop(response, ...["data", "module", "views", "0", "pagination"]) || {};

    const message =
      (
        prop(response, ...["data", "messages"])?.map((item: any) =>
          prop(item, ...["mes"]),
        ) || []
      )?.join(", ") || "";

    if (!appointments && message) {
      throw new Error(message, { cause: 500 });
    }

    // TODO: process doctor data from strapi and map to appointment data
    const doctorIds = unique(
      appointments
        ?.filter(Boolean)
        ?.map((item: any) => Number.parseInt(item?.AppointedTo, 10)),
    );

    let doctorsResponse = [];

    if (doctorIds?.length > 0) {
      doctorsResponse = await saas
        .get("/api/users", {
          params: {
            filters: {
              id: {
                $in: doctorIds,
              },
            },
            populate: {
              user_info: {
                fields: ["name"],
                populate: {
                  avatar: {
                    fields: ["url", "formats"],
                  },
                },
              },
            },
            pagination: {
              pageSize: doctorIds?.length,
            },
          },
        })
        ?.then((res) => res?.data || []);
    }

    appointments = appointments?.map(({ AppointedTo, ...item }: any) => {
      const doctor = doctorsResponse?.find(
        (doctor: any) => doctor?.id === Number.parseInt(AppointedTo, 10),
      );

      return {
        ...item,
        doctor: doctor?.user_info,
      };
    });

    return NextResponse.json(
      {
        data: appointments,
        ...(page && pageSize ? { pagination } : {}),
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
