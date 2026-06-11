import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { validToken } from "@/lib/auth";
import { saas } from "@/lib/saas";
import { cms } from "@/lib/cms";
import { OnboardingData, OnboardingSteps } from "@/types/define.d";

async function getBusinessDocumentId(userId: string): Promise<string> {
  const userRes = await saas("/api/users", {
    params: {
      populate: { user_info: { populate: { business: true } } },
      filters: { id: { $eq: userId } },
    },
  });
  const businessDocumentId =
    userRes?.data?.[0]?.user_info?.business?.documentId;
  if (!businessDocumentId) throwError("Không tìm thấy thông tin phòng khám", 404);
  return businessDocumentId;
}

async function countServices(): Promise<number> {
  try {
    const fd = new FormData();
    fd.append("limit", "1");
    fd.append("lmstart", "0");
    const res = await cms.post("/pos/service?_lay=getServicesManagementV2", fd);
    return Number(res?.data?.module?.views?.[0]?.pagination?.totalRecord ?? 0);
  } catch {
    return 0;
  }
}

async function countDentalChairs(): Promise<number> {
  try {
    const res = await cms.get("/pos/dentalChair", {
      params: { _lay: "getChairList", limit: 1, lmstart: 0 },
    });
    return Number(res?.data?.module?.views?.[0]?.pagination?.totalRecord ?? 0);
  } catch {
    return 0;
  }
}

async function countCustomers(): Promise<number> {
  try {
    const fd = new FormData();
    fd.append("limit", "1");
    fd.append("lmstart", "0");
    const res = await cms.post("pos/customer", fd, {
      params: { _lay: "listCustomer" },
    });
    return Number(res?.data?.module?.views?.[0]?.pagination?.totalRecord ?? 0);
  } catch {
    return 0;
  }
}

async function countAppointments(): Promise<number> {
  try {
    const fd = new FormData();
    fd.append("limit", "1");
    fd.append("lmstart", "0");
    const res = await cms.post("/pos/appointment?_lay=listAppointmentInDayV3", fd);
    return Number(res?.data?.module?.views?.[0]?.pagination?.totalRecord ?? 0);
  } catch {
    return 0;
  }
}

async function countStaffUserInfos(businessDocumentId: string): Promise<number> {
  try {
    const res = await saas.get("/api/user-infos", {
      params: {
        filters: { business: { documentId: { $eq: businessDocumentId } } },
        pagination: { pageSize: 1 },
      },
    });
    return Number(res?.data?.meta?.pagination?.total ?? 0);
  } catch {
    return 0;
  }
}

export async function GET(req: NextRequest) {
  try {
    const tokenData = await validToken(req);
    if (!tokenData) throwError("Xác thực không hợp lệ", 401);

    const userId = String(tokenData!.id);
    const businessDocumentId = await getBusinessDocumentId(userId);

    // Check finished flag on Business
    const businessRes = await saas.get(`/api/businesses/${businessDocumentId}`);
    const business = businessRes?.data?.data;

    if (business?.finished === true) {
      const steps: OnboardingSteps = {
        clinic: true,
        staff: true,
        service: true,
        dentalChair: true,
        customer: true,
        appointment: true,
      };
      return NextResponse.json<OnboardingData>(
        { finished: true, steps },
        { status: 200 },
      );
    }

    // Parallel fetch all counts
    const [serviceCount, chairCount, customerCount, appointmentCount, staffCount] =
      await Promise.all([
        countServices(),
        countDentalChairs(),
        countCustomers(),
        countAppointments(),
        countStaffUserInfos(businessDocumentId),
      ]);

    const steps: OnboardingSteps = {
      clinic: true,
      staff: staffCount > 1, // owner counts as 1; >1 means staff has been invited
      service: serviceCount > 0,
      dentalChair: chairCount > 0,
      customer: customerCount > 0,
      appointment: appointmentCount > 0,
    };

    const allDone = Object.values(steps).every(Boolean);

    // Auto-complete onboarding when all steps are satisfied
    if (allDone) {
      try {
        await saas.put(`/api/businesses/${businessDocumentId}`, {
          data: { finished: true },
        });
      } catch {
        // Non-critical: don't fail the request if PUT fails
      }
    }

    return NextResponse.json<OnboardingData>(
      { finished: allDone, steps },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
