import { cms } from "@/lib/cms";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;

		const statuses = searchParams.getAll("statuses[]").filter(Boolean);
		const doctors = searchParams.getAll("doctors[]").filter(Boolean);
		const branches = searchParams.getAll("branches[]").filter(Boolean);
		const customers = searchParams.getAll("customers[]").filter(Boolean);
		const labels = searchParams.getAll("labels[]").filter(Boolean);
		const fromTime = searchParams.get("from_time") || "";
		const toTime = searchParams.get("to_time") || "";
		const order = searchParams.get("order") || "";

		const formData = new FormData();
		statuses.forEach((status) => formData.append("statuses[]", status));
		doctors.forEach((doctor) => formData.append("doctors[]", doctor));
		branches.forEach((branch) => formData.append("branches[]", branch));
		customers.forEach((customer) => formData.append("customers[]", customer));
		labels.forEach((label) => formData.append("labels[]", label));

		if (fromTime) formData.append("from_time", fromTime);
		if (toTime) formData.append("to_time", toTime);
		if (order) formData.append("order", order);

		const response = await cms.post(
			"/pos/appointment?_lay=summaryAppointments",
			formData,
		);

		const summaryData = response?.data?.module?.views?.[0]?.data || response?.data;

		return NextResponse.json({ data: summaryData }, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
			{ status: error?.cause || 500 },
		);
	}
}
