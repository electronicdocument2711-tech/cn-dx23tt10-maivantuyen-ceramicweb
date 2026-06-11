import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { handleError, throwError, ValidateTokenAndAuth } from "@/lib/response";
import { saas } from "@/lib/saas";

export async function GET(request: NextRequest) {
  try {
    const searchParams = await request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const sortType = searchParams.get("sort-type") || "default";
    if (page < 1) throwError("Invalid page", 400);

    const isSortByCreatedAt = sortType === "created-at";

    await ValidateTokenAndAuth(request);

    const formData = new FormData();
    formData.append("search", searchParams.get("search") || "");
    formData.append("limit", limit.toString());
    formData.append("lmstart", `${(page - 1) * limit}`);
    if (isSortByCreatedAt) {
      formData.append("sortByCreatedAt", "1");
    }

    const res = await cms.post("pos/customer", formData, {
      params: { _lay: "listCustomer" },
    });

    const customers = res.data?.module?.views?.[0]?.data || [];
    const paginationRes = res.data?.module?.views?.[0]?.pagination;
    const paginationTotalRecord = Number(paginationRes?.totalRecord) || 0;
    const paginationLimit = Number(paginationRes?.limit) || limit;
    const pagination = {
      label: paginationRes?.label ?? "",
      currentPage: Number(paginationRes?.currentPage) ?? 1,
      totalRecord: paginationTotalRecord,
      limit: paginationLimit,
      totalPages: Math.max(
        Math.ceil(paginationTotalRecord / paginationLimit),
        1,
      ),
    };
    if (!customers) throwError("Không tìm thấy danh sách khách hàng", 404);
    return NextResponse.json({ customers, pagination }, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      FullName,
      CustomerId,
      Gender,
      PhoneNumber,
      Birthday,
      Email,
      JobName,
      Note,
      SaleId,
      VnProvinceId,
      VnWardId,
      Address,
      InviteCode,
      relativeFullName,
      relativePhone,
      relativeAddress,
    } = await req.json();

    if (!FullName || FullName.trim() === "")
      throwError("Tên khách hàng là bắt buộc", 400);
    if (!PhoneNumber || PhoneNumber.trim() === "")
      throwError("Số điện thoại là bắt buộc", 400);
    if (PhoneNumber && !/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(PhoneNumber))
      throwError("Số điện thoại không hợp lệ", 400);
    if (Birthday && isNaN(Date.parse(Birthday)))
      throwError("Ngày sinh không hợp lệ", 400);
    if (Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email))
      throwError("Email không hợp lệ", 400);
    if (Gender && !["1", "2"].includes(Gender))
      throwError("Giới tính không hợp lệ", 400);
    if (VnProvinceId && (isNaN(VnProvinceId) || Number(VnProvinceId) <= 0))
      throwError("Tỉnh/thành phố không hợp lệ", 400);
    if (VnWardId && (isNaN(VnWardId) || Number(VnWardId) <= 0))
      throwError("Xã/phường/thị xã không hợp lệ", 400);
    if (Address && Address.trim() === "")
      throwError("Địa chỉ không hợp lệ", 400);
    if (InviteCode && !/^[A-Za-z0-9]+$/.test(InviteCode))
      throwError("Mã giới thiệu không hợp lệ", 400);
    if (relativePhone && !/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(relativePhone))
      throwError("Số điện thoại người thân không hợp lệ", 400);

    await ValidateTokenAndAuth(req);

    const formData = new FormData();
    formData.append("_act", "save");
    formData.append("Customer[FullName]", FullName);
    if (CustomerId) formData.append("Customer[CustomerIdNumber]", CustomerId);
    if (Gender) formData.append("Customer[Gender]", Gender);
    if (Birthday) formData.append("Customer[Birthday]", Birthday);
    if (JobName) formData.append("Customer[JobName]", JobName);
    if (Note) formData.append("Customer[Note]", Note);

    if (VnProvinceId) formData.append("Customer[CountryId]", "1");
    if (VnProvinceId) formData.append("Customer[ProvinceId]", VnProvinceId);

    //request API hiện tại đang dùng DistrictId để lưu WardId, nên tạm thời vẫn append DistrictId, sau này nếu API fix thì chỉ cần đổi lại là append WardId
    // if (VnWardId) formData.append("Customer[WardId]", VnWardId);
    if (VnWardId) formData.append("Customer[DistrictId]", VnWardId);

    if (Address) formData.append("Customer[Address]", Address);
    if (InviteCode) formData.append("Customer[ReferralCode]", InviteCode);

    if (PhoneNumber) formData.append("Phones[0]", PhoneNumber);
    if (Email) formData.append("Emails[0]", Email);
    if (SaleId) formData.append("CustomerFollowing[FollowedBy]", SaleId);

    if (relativeFullName)
      formData.append("Customer[UrgentContactName]", relativeFullName);
    if (relativePhone)
      formData.append("Customer[UrgentContactPhone]", relativePhone);
    if (relativeAddress)
      formData.append("Customer[UrgentContactAddress]", relativeAddress);

    formData.append("type", "ADD_CUSTOMER");
    formData.append("_renderer", "module");
    formData.append("PermissionCode", "daily-appointment");

    // formData.append("Customer[ChannelId]", "");
    // formData.append("Customer[CustomerSourceId]", "");
    // formData.append("Languages", "");
    // formData.append("Relationships", "");
    // formData.append("successCloseModal", "true");
    // formData.append("extraState", "");

    const res = await cms.post("pos/customer", formData);
    const customers = res.data?.module?.data;
    if (!customers) throwError("Không thể tạo khách hàng mới", 500);

    // : sau khi tạo khách hàng thành công thì init luôn thông tin xuất hóa đơn
    saas
      .post("/api/einvoice-recipients", {
        data: {
          customer_id: customers?.CustomerId,
          customer_code: customers?.CustomerCode,
          customer_name: customers?.FullName,
          address: combineAddress(
            customers?.Address,
            customers?.District,
            customers?.Province,
          ),
        },
      })
      .then((res) => {
        if (res?.status !== 200 && res?.status !== 201) {
          throw new Error(
            `Lỗi khi tạo thông tin xuất hóa đơn: ${res?.statusText || "Unknown error"}`,
          );
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tạo thông tin xuất hóa đơn:", err);
      });

    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

const combineAddress = (
  Address?: string,
  VnWardId?: string,
  VnProvinceId?: string,
) => {
  return [Address, VnWardId, VnProvinceId].filter(Boolean).join(", ");
};
