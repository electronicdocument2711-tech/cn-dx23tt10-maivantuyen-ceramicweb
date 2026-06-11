import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, withAuth } from "@/lib/response";
import { cms } from "@/lib/cms";
import { withOwnerPermission } from "@/lib/saasHelper";
import { REGEX } from "../../../../const/global";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const branchId = (await context.params).id;
    if (!branchId || !/^\d+$/.test(branchId.toString()))
      throwError(`Thông tin chi nhánh (ID) không hợp lệ`, 400);

    const formData = new FormData();
    formData.append("BranchId", branchId);

    const res = await cms.post(`/hr/branch?_act=detailBranch`, formData);
    const branchDetail = res.data?.module?.views?.[0];
    if (!branchDetail)
      throwError("Lấy thông tin chi nhánh thất bại do lỗi máy chủ", 502);

    return NextResponse.json(branchDetail, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function PUT(req: NextRequest) {
  try {
    const {
      id,
      code,
      name,
      phone,
      province,
      ward,
      address,
      licenseCode,
      licenseName,
    } = await req.json();

    //validate input
    if (!id || !/^\d+$/.test(id.toString()))
      throwError(`ID chi nhánh không hợp lệ`, 400);

    if (!name || !REGEX.BRANCH_NAME.test(name.toString()))
      throwError(
        "Bạn phải nhập tên chi nhánh,tên chi nhánh phải từ 5 kí tự trở lên",
        400
      );
    if (!code || !REGEX.BRANCH_CODE.test(code.toString()))
      throwError(
        "Bạn phải nhập mã chi nhánh, mã chi nhánh phải từ 3 kí tự trở lên",
        400
      );

    if (phone && !REGEX.PHONE.test(phone.toString()))
      throwError(
        "Số điện thoại không hợp lệ, 0xx-xxx-xxxx hoặc +84xx-xxx-xxxx",
        400
      );

    if (province && !/^\d+$/.test(province.toString())) {
      throwError("Mã tỉnh không hợp lệ", 400);
    }

    if (ward && !/^\d+$/.test(ward.toString())) {
      throwError("Mã phường/xã không hợp lệ", 400);
    }

    if (address && !REGEX.ADDRESS.test(address.toString()))
      throwError("Địa chỉ không hợp lệ", 400);

    if (licenseCode && !REGEX.LICENSE_CODE.test(licenseCode.toString()))
      throwError("Mã giấy phép không hợp lệ", 400);

    if (licenseName && !REGEX.LICENSE_NAME.test(licenseName.toString()))
      throwError("Tên giấy phép không hợp lệ", 400);

    //authorization

    const tokenData = (await withAuth(req)) as any;
    const businessPermission = await withOwnerPermission(tokenData.id);
    if (!businessPermission.isBusinessOwner) {
      throwError("Bạn không có quyền thực hiện tác vụ này", 403);
    }

    const formData = new FormData();
    formData.append("Branch[BranchId]", id);
    formData.append("Branch[BranchCode]", code);
    formData.append("Branch[Name]", name);
    formData.append("Branch[CountryId]", "1");
    formData.append("Branch[CompanyId]", "1");

    if (phone) formData.append("Branch[PublicPhoneNumber]", phone);
    if (province) formData.append("Branch[ProvinceId]", province);
    if (ward) formData.append("Branch[DistrictId]", ward);
    if (address) formData.append("Branch[Address]", address);
    if (licenseCode)
      formData.append("Branch[BusinessLicenseCode]", licenseCode);
    if (licenseName)
      formData.append("Branch[BusinessLicenseName]", licenseName);

    const res = await cms.post("/hr/branch?_act=saveBranch", formData);
    const responseData = res.data.messages?.[0];
    if (!res.data || !res.data.module.code || !responseData)
      throwError("Thêm chi nhánh thất bại do lỗi máy chủ", 502);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const branchId = (await context.params).id;
    if (!branchId || !/^\d+$/.test(branchId.toString()))
      throwError(`Thông tin chi nhánh (ID) không hợp lệ`, 400);

    const tokenData = (await withAuth(req)) as any;
    const businessPermission = await withOwnerPermission(tokenData.id);
    if (!businessPermission.isBusinessOwner) {
      throwError("Bạn không có quyền thực hiện tác vụ này", 403);
    }

    const formData = new FormData();
    formData.append("BranchId", branchId);
    const res = await cms.post(`/hr/branch?_act=removeBranch`, formData);
    const resData = await res.data;

    if (!resData || !resData.module?.code)
      throwError("Xóa chi nhánh thất bại do lỗi máy chủ", 502);
    const response = resData.messages?.[0];

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
