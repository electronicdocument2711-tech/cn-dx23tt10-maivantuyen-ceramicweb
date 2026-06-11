import { NextRequest, NextResponse } from "next/server";
import { validToken } from "@/lib/auth";
import { throwError } from "@/lib/response";
import { saas } from "@/lib/saas";

export async function POST(req: NextRequest) {
  try {
    const tokenData = await validToken(req);
    if (!tokenData) throwError("Invalid token", 401);

    const userInfor = await saas("/api/users", {
      params: {
        populate: {
          user_info: {
            populate: "*",
          },
        },
        filters: { id: { $eq: tokenData?.id } },
      },
    });

    const info = userInfor.data[0].user_info;

    const business = info.business.documentId;

    const body = await req.json();

    const {
      sale_receipt,
      paid_select,
      radioDocumentId,
      conditions,
      conditionMinute,
      schedules,
    } = body;

    const autoSetupRes = await saas.post("api/einvoice-auto-setups", {
      data: {
        sale_receipt,
        einvoice_export_time: radioDocumentId,
        paid_receipt: paid_select,
        condition_minute: conditionMinute,
        business,
      },
    });

    if (autoSetupRes.status !== 200 && autoSetupRes.status !== 201) {
      throwError("lưu thông tin Auto Setup bị lỗi", 403);
    }

    const autoSetupId = autoSetupRes.data.data.documentId;

    const conditionRes = await Promise.all(
      conditions.map((condition: any) =>
        saas.post("/api/einvoice-condition-tables", {
          data: {
            einvoice_channel: condition.channelId,
            branch_id: condition.branch,
            export_late: condition.delayMinutes,
            einvoice_auto_setup: autoSetupId,
          },
        }),
      ),
    );

    const hasConditionError = conditionRes.some(
      (r) => r.status !== 200 && r.status !== 201,
    );

    if (hasConditionError) {
      throwError("Lưu thông tin điều kiện tự xuất hoá đơn bị lỗi", 403);
    }

    const scheduleRes = await Promise.all(
      schedules.map((s: any) =>
        saas.post("/api/einvoice-time-tables", {
          data: {
            einvoice_channel: s.channelId,
            branch_id: s.branch,
            time: s.time,
            einvoice_auto_setup: autoSetupId,
          },
        }),
      ),
    );

    const hasTimeError = scheduleRes.some(
      (s) => s.status !== 200 && s.status !== 201,
    );

    if (hasTimeError) {
      throwError(
        "Lưu thông tin tự xuất hóa đơn vào khung giờ cố định bị lỗi",
        403,
      );
    }

    return NextResponse.json({
      message: "Lưu thông tin Auto Setup thành công",
      status: 200,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const tokenData = await validToken(req);
    if (!tokenData) throwError("Invalid token", 401);

    const userInfor = await saas("/api/users", {
      params: {
        populate: {
          user_info: {
            populate: "*",
          },
        },
        filters: { id: { $eq: tokenData?.id } },
      },
    });

    const info = userInfor.data[0].user_info;

    const business = info.business.documentId;

    const body = await req.json();

    const {
      autoSeupId,
      sale_receipt,
      paid_select,
      radioDocumentId,
      conditions,
      conditionMinute,
      schedules,
    } = body;

    const autoSetupRes = await saas.put(
      `api/einvoice-auto-setups/${autoSeupId}`,
      {
        data: {
          sale_receipt,
          einvoice_export_time: radioDocumentId,
          paid_receipt: paid_select,
          condition_minute: conditionMinute,
          business,
        },
      },
    );

    if (autoSetupRes.status !== 200 && autoSetupRes.status !== 201) {
      throwError("lưu thông tin Auto Setup bị lỗi", 403);
    }

    const autoSetupId = autoSetupRes.data.data.documentId;

    const conditionRes = await Promise.all(
      conditions.map((c: any) => {
        if (c.conditionId === "") {
          return saas.post("/api/einvoice-condition-tables", {
            data: {
              einvoice_channel: c.channelId,
              branch_id: c.branch,
              export_late: c.delayMinutes,
              einvoice_auto_setup: autoSetupId,
            },
          });
        } else {
          return saas.put(`/api/einvoice-condition-tables/${c.conditionId}`, {
            data: {
              einvoice_channel: c.channelId,
              branch_id: c.branch,
              export_late: c.delayMinutes,
            },
          });
        }
      }),
    );

    const hasConditionError = conditionRes.some(
      (r) => r.status !== 200 && r.status !== 201,
    );

    if (hasConditionError) {
      throwError("Cập nhật thông tin điều kiện tự xuất hoá đơn bị lỗi", 403);
    }

    const timeRes = await Promise.all(
      schedules.map((s: any) => {
        if (s.timeId === "") {
          return saas.post("/api/einvoice-time-tables", {
            data: {
              einvoice_channel: s.channelId,
              branch_id: s.branch,
              time: s.time,
              einvoice_auto_setup: autoSetupId,
            },
          });
        } else {
          return saas.put(`/api/einvoice-time-tables/${s.timeId}`, {
            data: {
              einvoice_channel: s.channelId,
              branch_id: s.branch,
              time: s.time,
            },
          });
        }
      }),
    );

    const hasTimeError = timeRes.some(
      (t) => t.status !== 200 && t.status !== 201,
    );

    if (hasTimeError) {
      throwError(
        "Lưu thông tin tự xuất hóa đơn vào khung giờ cố định bị lỗi",
        403,
      );
    }

    return NextResponse.json({
      message: "Cập nhật thông tin Auto Setup thành công",
      status: 200,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const tokenData = await validToken(req);
    if (!tokenData) throwError("Invalid token", 401);

    const userInfor = await saas("/api/users/me", {
      params: {
        populate: {
          user_info: {
            populate: {
              business: {
                populate: {
                  einvoice_auto_setup: {
                    populate: {
                      einvoice_export_time: true,
                      einvoice_condition_tables: {
                        populate: { einvoice_channel: true },
                      },
                      einvoice_time_tables: {
                        populate: { einvoice_channel: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const einvoiceAutoSetupData =
      userInfor.data.user_info.business.einvoice_auto_setup;

    if (userInfor.status !== 200) {
      throwError("Lấy thông tin user Infor ", 403);
    }

    return NextResponse.json({ einvoiceAutoSetupData }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: err?.cause || 500 },
    );
  }
}
