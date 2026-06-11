import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, ValidateTokenAndAuth } from "@/lib/response";
import { cms } from "@/lib/cms";
import { ServiceAdd, ServiceOffer } from "@/types/define.d";
import { saas } from "@/lib/saas";
import { prop } from "remeda";
import * as R from "remeda";
import dayjsj from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";

dayjsj.extend(utc);
dayjsj.extend(timezone);

//define interface for service to avoid type error
//only use in this file, no need to export
type ServiceUnconfirmed = {
  AnatomyBodyPartItemId: string;
  BasePrice: string;
  DiscountAmount: string;
  DiscountPercent: string;
  MedicalProcedureId: string | null;
  ParentServiceId: string;
  Quantity: string;
  QuantityParentService: string;
  SalePrice: string;
  ServiceId: string;
};

type ServiceConfirmed = {
  ServiceId: string;
  ServiceName: string;
  MedicalProcedureId: string | null;
  AnatomyBodyPartItemId: string;
  OrderChangingId: string;
  DiscountAmount: string;
  Price: string;
  Quantity: string;
  TaxPercent: string;
  IsTax: string;
};

type ServiceRemoved = { OrderDetailId: string; ServiceId: string };

type ServicePricing = {
  ServiceId: string;
  ServiceCode: string;
  Name: string;
  ServiceGroupName: string;
  MedicalProcedureId: string;
  BasePrice: string;
  SalePrice: string;
  TaxPercent: string;
};

const systemAuthHeader = {
  Authorization: `Bearer ${process.env.SYSTEM_TOKEN || ""}`,
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ customerId: string; diagnoseId: string }> },
) {
  try {
    const params = await context.params;

    const customerId = parseInt(params.customerId, 10);
    if (isNaN(customerId) || customerId < 0)
      throwError("Id khách hàng không hợp lệ", 400);

    const treatmentId = parseInt(params.diagnoseId, 10);
    if (isNaN(treatmentId) || treatmentId < 0)
      throwError("Id điều trị không hợp lệ", 400);

    await ValidateTokenAndAuth(req);

    const res = await cms.get(
      `/pos/treatment?_lay=getTreatmentServiceList&TreatmentId=${treatmentId}`,
    );

    if (res.status !== 200)
      throwError("Lỗi khi lấy danh sách dịch vụ cho chẩn đoán", 500);

    const data = res.data.module.views[0];
    if (!data)
      throwError("Lỗi máy chủ khi lấy danh sách dịch vụ cho chẩn đoán", 404);

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(...handleError(error));
  }
}

const SERVICE_TYPE_MAPING = {
  "1": "kcb",
  "2": "cn",
  "3": "im",
};

const manageEmedicalRecord = async (
  treatmentId: number,
  customerId: number,
  type: string,
  orderDetailIds: string[],
  userBusinessId: string,
  eMedicalRecordId?: string,
) => {
  let response = null;

  if (!eMedicalRecordId) {
    response = await saas.post(
      "/api/electronic-medical-records",
      {
        data: {
          name: `${type.toUpperCase()}.${dayjs().tz("Asia/Ho_Chi_Minh").format("DD.MM.YYYY")}`,
          type,
          is_completed: false,
          api_treatment_id: treatmentId,
          api_customer_id: customerId,
          order_detail_ids: orderDetailIds,
          business: userBusinessId,
        },
      },
      {
        headers: systemAuthHeader,
      },
    );
  } else {
    response = await saas.put(
      `/api/electronic-medical-records/${eMedicalRecordId}`,
      {
        data: {
          order_detail_ids: orderDetailIds,
          ...(orderDetailIds?.length === 0
            ? { deleted_at: dayjs().tz("Asia/Ho_Chi_Minh").format() }
            : {}),
        },
      },
      {
        headers: systemAuthHeader,
      },
    );
  }

  return response;
};

const updateEMedicalRecord = async (
  customerId: number,
  treatmentId: number,
  addedOrderDetails: any[],
  deletedOrderDetails: any[],
) => {
  try {
    const [userBusinessId, activeEMedicalRecords] = await Promise.all([
      saas
        .get("/api/users/me", {
          params: {
            fields: ["id", "documentId"],
            populate: {
              user_info: {
                fields: ["id", "documentId"],
                populate: {
                  business: {
                    fields: ["id", "documentId"],
                  },
                },
              },
            },
          },
        })
        .then((res) => {
          if (res?.status !== 200) {
            throw new Error("Lỗi khi lấy thông tin người dùng", { cause: 500 });
          }

          const businessId = prop(
            res,
            ...["data", "user_info", "business", "documentId"],
          );

          if (!businessId) {
            throw new Error(
              "Không tìm thấy thông tin phòng khám của người dùng",
              {
                cause: 404,
              },
            );
          }

          return businessId;
        }),
      saas
        .get("/api/electronic-medical-records", {
          params: {
            filters: {
              api_customer_id: customerId,
              api_treatment_id: treatmentId,
              is_completed: false,
              deleted_at: {
                $null: true,
              },
            },
          },
          headers: systemAuthHeader,
        })
        .then((res) => {
          if (res?.status !== 200) {
            throw new Error("Lỗi khi lấy bệnh án điện tử", { cause: 500 });
          }

          const records = prop(res, ...["data", "data"]);

          return records || [];
        }),
    ]);

    const kcbEmedicalRecord = activeEMedicalRecords?.find(
      (record: any) => record?.type === "kcb",
    );
    const cnEmedicalRecord = activeEMedicalRecords?.find(
      (record: any) => record?.type === "cn",
    );

    const imEmedicalRecord = activeEMedicalRecords?.find(
      (record: any) => record?.type === "im",
    );

    const originalKCBODetails = kcbEmedicalRecord?.order_detail_ids || [];
    const originalCNODetails = cnEmedicalRecord?.order_detail_ids || [];
    const originalIMODetails = imEmedicalRecord?.order_detail_ids || [];

    let currentKCBODetails = originalKCBODetails || [];
    let currentCNODetails = originalCNODetails || [];
    let currentIMODetails = originalIMODetails || [];

    // Remove
    currentKCBODetails = currentKCBODetails?.filter((id: string) => {
      return !deletedOrderDetails.some(
        (od) => od?.OrderDetailId == id && od?.ServiceType === "1",
      );
    });

    currentCNODetails = currentCNODetails?.filter((id: string) => {
      return !deletedOrderDetails.some(
        (od) => od?.OrderDetailId == id && od?.ServiceType === "2",
      );
    });

    currentIMODetails = currentIMODetails?.filter((id: string) => {
      return !deletedOrderDetails.some(
        (od) => od?.OrderDetailId == id && od?.ServiceType === "3",
      );
    });

    // Add
    addedOrderDetails.forEach((od) => {
      const serviceType =
        SERVICE_TYPE_MAPING[
          od?.ServiceType as keyof typeof SERVICE_TYPE_MAPING
        ];
      if (serviceType === "kcb") {
        currentKCBODetails.push(od?.OrderDetailId);
      } else if (serviceType === "cn") {
        currentCNODetails.push(od?.OrderDetailId);
      } else if (serviceType === "im") {
        currentIMODetails.push(od?.OrderDetailId);
      }
    });

    // *: Tạo hoặc cập nhật bệnh án điện tử tương ứng với từng loại dịch vụ, hiện tại đang tạm thời log ra để kiểm tra dữ liệu trước khi gọi API cập nhật lên saas
    const areEqualUnorderedKcb =
      originalKCBODetails.length === currentKCBODetails.length &&
      R.difference(originalKCBODetails, currentKCBODetails).length === 0;

    const areEqualUnorderedCno =
      originalCNODetails.length === currentCNODetails.length &&
      R.difference(originalCNODetails, currentCNODetails).length === 0;

    const areEqualUnorderedIm =
      originalIMODetails.length === currentIMODetails.length &&
      R.difference(originalIMODetails, currentIMODetails).length === 0;

    const results: any = [];
    if (!areEqualUnorderedKcb) {
      if (!kcbEmedicalRecord) {
        // Create new KCB medical record
        const newKCBRecord = await manageEmedicalRecord(
          treatmentId,
          customerId,
          "kcb",
          currentKCBODetails,
          userBusinessId,
        ).catch((err) => {
          return {
            error: true,
            message: err?.message || "Lỗi khi tạo mới bệnh án điện tử KCB",
          };
        });
        results.push(newKCBRecord);
      } else {
        // Update existing KCB medical record
        const updatedKCBRecord = await manageEmedicalRecord(
          treatmentId,
          customerId,
          "kcb",
          currentKCBODetails,
          userBusinessId,
          kcbEmedicalRecord.documentId,
        ).catch((err) => {
          return {
            error: true,
            message: err?.message || "Lỗi khi cập nhật bệnh án điện tử KCB",
          };
        });
        results.push(updatedKCBRecord);
      }
    }

    if (!areEqualUnorderedCno) {
      if (!cnEmedicalRecord) {
        // Create new CNO medical record
        const newCNORecord = await manageEmedicalRecord(
          treatmentId,
          customerId,
          "cn",
          currentCNODetails,
          userBusinessId,
        ).catch((err) => {
          return {
            error: true,
            message: err?.message || "Lỗi khi tạo mới bệnh án điện tử CNO",
          };
        });
        results.push(newCNORecord);
      } else {
        // Update existing CNO medical record
        const updatedCNORecord = await manageEmedicalRecord(
          treatmentId,
          customerId,
          "cn",
          currentCNODetails,
          userBusinessId,
          cnEmedicalRecord.documentId,
        ).catch((err) => {
          return {
            error: true,
            message: err?.message || "Lỗi khi cập nhật bệnh án điện tử CNO",
          };
        });
        results.push(updatedCNORecord);
      }
    }

    if (!areEqualUnorderedIm) {
      if (!imEmedicalRecord) {
        // Create new IM medical record
        const newIMRecord = await manageEmedicalRecord(
          treatmentId,
          customerId,
          "im",
          currentIMODetails,
          userBusinessId,
        ).catch((err) => {
          return {
            error: true,
            message: err?.message || "Lỗi khi tạo mới bệnh án điện tử IM",
          };
        });
        results.push(newIMRecord);
      } else {
        // Update existing IM medical record
        const updatedIMRecord = await manageEmedicalRecord(
          treatmentId,
          customerId,
          "im",
          currentIMODetails,
          userBusinessId,
          imEmedicalRecord.documentId,
        ).catch((err) => {
          return {
            error: true,
            message: err?.message || "Lỗi khi cập nhật bệnh án điện tử IM",
          };
        });
        results.push(updatedIMRecord);
      }
    }

    return results;
  } catch (error: any) {
    // *: handle error, có thể log lại để debug sau này
    return [
      {
        error: true,
        message: error?.message || "Lỗi khi xử lý yêu cầu",
      },
    ];
  }
};

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ customerId: string; diagnoseId: string }> },
) {
  try {
    const params = await context.params;

    const customerId = parseInt(params.customerId, 10);
    if (isNaN(customerId) || customerId < 0)
      throwError("Id khách hàng không hợp lệ", 400);

    const treatmentId = parseInt(params.diagnoseId, 10);
    if (isNaN(treatmentId) || treatmentId < 0)
      throwError("Id điều trị không hợp lệ", 400);

    const payload = await req.json();
    const offerServices = (payload.offerServices ?? []) as ServiceOffer[];
    const addedServices = (payload.addedServices ?? []) as ServiceAdd[];
    const removedServices = (payload.removedServices ?? []) as {
      OrderDetailId: string;
      ServiceId: string;
    }[];

    if (
      !Array.isArray(offerServices) ||
      !Array.isArray(addedServices) ||
      !Array.isArray(removedServices)
    )
      throwError("Dữ liệu dịch vụ không hợp lệ", 400);

    await ValidateTokenAndAuth(req);

    // Fetch pricing only for new offer services (Id === null) to get MedicalProcedureId
    const newOfferServiceIds = [
      ...new Set(
        offerServices.filter((s) => s.Id === null).map((s) => s.ServiceId),
      ),
    ];

    const servicePricingMap = new Map<string, ServicePricing>();
    if (newOfferServiceIds.length > 0) {
      const resServicePricing = await cms.get("/pos/service", {
        params: {
          _lay: "getServicesAdvance",
          limit: newOfferServiceIds.length,
          lmstart: 0,
          ServiceIds: newOfferServiceIds,
        },
      });

      if (resServicePricing.status !== 200)
        throwError("Lỗi máy chủ khi lấy thông tin dịch vụ", 500);

      const pricingList = resServicePricing.data.module.views[0]?.data ?? [];
      pricingList.forEach((s: any) => {
        servicePricingMap.set(s.ServiceId, {
          ServiceId: s.ServiceId,
          ServiceCode: s.ServiceCode,
          Name: s.Name,
          ServiceGroupName: s.ServiceGroupName,
          MedicalProcedureId: s.MedicalProcedureId,
          BasePrice: s.BasePrice,
          SalePrice: s.SalePrice,
          TaxPercent: s?.TaxPercent,
        });
      });
    }

    // Build serviceUnconfirmed from offerServices (always send full list)
    const serviceUnconfirmed: ServiceUnconfirmed[] = offerServices.map((s) => {
      const isNew = s.Id === null;
      const pricing = isNew ? servicePricingMap.get(s.ServiceId) : null;
      return {
        ServiceId: s.ServiceId,
        AnatomyBodyPartItemId: s.AnatomyBodyPartItemId,
        BasePrice: s.AmountBeforeTax,
        DiscountAmount: s.DiscountAmount || "0",
        DiscountPercent: s.DiscountPercent || "0",
        MedicalProcedureId:
          s.MedicalProcedureId ?? pricing?.MedicalProcedureId ?? null,
        ParentServiceId: "0",
        Quantity: "1",
        QuantityParentService: isNew ? "1" : "0",
        SalePrice: s.Amount,
      };
    });

    // Build serviceConfirmed from addedServices (offer→confirmed this session)
    const serviceConfirmed: ServiceConfirmed[] = addedServices.map((s) => ({
      ServiceId: s.ServiceId,
      ServiceName: s.ServiceName,
      MedicalProcedureId: s.MedicalProcedureId || null,
      AnatomyBodyPartItemId: s.AnatomyBodyPartItemId,
      OrderChangingId: "0",
      DiscountAmount: s.DiscountAmount || "0",
      Price: s.AmountBeforeTax,
      Quantity: "1",
      TaxPercent: s.TaxPercent || "0",
      IsTax: s.IsTax || "0",
    }));

    // Build serviceRemoved from removedServices (DB confirmed services deleted/converted this session)
    const serviceRemoved: ServiceRemoved[] = removedServices.map((s) => ({
      OrderDetailId: s.OrderDetailId,
      ServiceId: s.ServiceId,
    }));

    const formData = new FormData();
    formData.append("Treatment[TreatmentId]", treatmentId.toString());
    formData.append("Treatment[CustomerId]", customerId.toString());
    formData.append("Treatment[MedicalDomainId]", "1");

    if (serviceRemoved.length > 0) {
      serviceRemoved.forEach((s, index) => {
        formData.append(
          `DeleteServices[${index}][OrderDetailId]`,
          s.OrderDetailId,
        );
        formData.append(`DeleteServices[${index}][ServiceId]`, s.ServiceId);
      });
    }

    if (serviceConfirmed.length > 0) {
      serviceConfirmed.forEach((s, index) => {
        formData.append(`AddServices[${index}][ServiceId]`, s.ServiceId);
        formData.append(`AddServices[${index}][ServiceName]`, s.ServiceName);
        formData.append(
          `AddServices[${index}][MedicalProcedureId]`,
          s.MedicalProcedureId ? s.MedicalProcedureId : "",
        );
        formData.append(
          `AddServices[${index}][AnatomyBodyPartItemId]`,
          s.AnatomyBodyPartItemId,
        );
        formData.append(
          `AddServices[${index}][OrderChangingId]`,
          s.OrderChangingId,
        );
        formData.append(
          `AddServices[${index}][DiscountAmount]`,
          s.DiscountAmount,
        );
        formData.append(`AddServices[${index}][Price]`, s.Price);
        formData.append(`AddServices[${index}][Quantity]`, s.Quantity);
        formData.append(`AddServices[${index}][Service_Tax]`, s?.TaxPercent);
        formData.append(`AddServices[${index}][IsTax]`, s?.IsTax);
      });
    }

    serviceUnconfirmed.forEach((s, index) => {
      formData.append(
        `ServicesOffer[0][${index}][AnatomyBodyPartItemId]`,
        s.AnatomyBodyPartItemId,
      );
      formData.append(`ServicesOffer[0][${index}][BasePrice]`, s.BasePrice);
      formData.append(
        `ServicesOffer[0][${index}][DiscountAmount]`,
        s.DiscountAmount,
      );
      formData.append(
        `ServicesOffer[0][${index}][DiscountPercent]`,
        s.DiscountPercent,
      );
      formData.append(
        `ServicesOffer[0][${index}][MedicalProcedureId]`,
        s.MedicalProcedureId ? s.MedicalProcedureId : "",
      );
      formData.append(
        `ServicesOffer[0][${index}][ParentServiceId]`,
        s.ParentServiceId,
      );
      formData.append(`ServicesOffer[0][${index}][Quantity]`, s.Quantity);
      formData.append(
        `ServicesOffer[0][${index}][QuantityParentService]`,
        s.QuantityParentService,
      );
      formData.append(`ServicesOffer[0][${index}][SalePrice]`, s.SalePrice);
      formData.append(`ServicesOffer[0][${index}][ServiceId]`, s.ServiceId);
    });
    console.log("Form data", formData);

    const res = await cms.post(
      `/pos/treatment?_act=saveTreatmentMedicalProcedure`,
      formData,
    );
    if (res.status !== 200)
      throwError("Lỗi máy chủ khi cập nhật dịch vụ cho chẩn đoán", 500);

    const moduleRes = res.data.module;
    if (!moduleRes)
      throwError("Lỗi máy chủ khi cập nhật dịch vụ cho chẩn đoán", 502);
    if (!moduleRes.code) {
      const mes =
        res.data.messages?.[0]?.mes ||
        "Lỗi không xác định khi cập nhật dịch vụ cho chẩn đoán";
      throwError(mes, 500);
    }

    // *: sau khi cập nhật hệ thông cms thành công thì  gọi API cập nhật bện án điện tử lên strapi
    updateEMedicalRecord(
      customerId,
      treatmentId,
      moduleRes?.data?.addedOrderDetails || [],
      moduleRes?.data?.deletedOrderDetails || [],
    );

    return NextResponse.json(moduleRes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(...handleError(error));
  }
}
