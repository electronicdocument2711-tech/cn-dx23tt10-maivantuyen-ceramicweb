import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { handleError, throwError, ValidateTokenAndAuth } from "@/lib/response";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ customerId: string }> },
) {
  try {
    const params = await context.params;
    const customerId = parseInt(params.customerId || "", 10);
    if (isNaN(customerId) || customerId < 0)
      return NextResponse.json(
        { message: `Mã khách hàng không hợp lệ` },
        { status: 400 },
      );

    await ValidateTokenAndAuth(_req);

    const formData = new FormData();
    formData.append("_lay", "customer");
    formData.append("CustomerId", params.customerId);

    const res = await cms.post("pos/customer", formData);
    if (res.status !== 200)
      throwError("Đã có lỗi khi lấy thông tin khách hàng", res.code);

    const profile = res.data?.module?.views?.[0].data;
    if (!profile)
      return NextResponse.json(
        { message: `Không tìm thấy thông tin khách hàng` },
        { status: 502 },
      );

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ customerId: string }> },
) {
  try {
    const params = await context.params;
    const customerId = parseInt(params.customerId || "", 10);
    if (isNaN(customerId) || customerId < 0)
      throwError(`Mã khách hàng không hợp lệ`, 400);

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
    formData.append("Customer[CustomerId]", customerId.toString());
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

    formData.append("type", "UPDATE_CUSTOMER");
    formData.append("_renderer", "module");
    formData.append("PermissionCode", "customer-management");

    // formData.append("Customer[ChannelId]", "");
    // formData.append("Customer[CustomerSourceId]", "");
    // formData.append("Languages", "");
    // formData.append("Relationships", "");
    // formData.append("successCloseModal", "true");
    // formData.append("extraState", "");
    console.log("form:", formData);

    const res = await cms.post("/pos/customer", formData);

    const edit = res.data?.module;
    if (!edit || edit.code === false)
      return NextResponse.json(
        { message: `Chỉnh sửa thông tin thất bại, id:${params.customerId}` },
        { status: 422 },
      );
    return NextResponse.json(edit, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
