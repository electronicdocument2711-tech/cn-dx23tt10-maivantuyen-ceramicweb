import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { handleError, throwError, withAuth } from "@/lib/response";
import { withOwnerPermission } from "@/lib/saasHelper";
import { REGEX } from "@/const/global";

export async function GET(req: NextRequest) {
  try {
    const tokenData = await withAuth(req);
    if (!tokenData) throwError("Unauthorized", 401);

    const searchParams = await req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const q = searchParams.get("q") || "";

    if (page < 1) throwError("Invalid page", 400);

    const res = await cms.get(
      `/hr/branch?_act=getBranchsWithPagination&lmstart=${(page - 1) * limit}&limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ""}`,
    );

    if (res.status === 401) {
      throwError("Phiên đăng nhập hết hạn, vui lòng đăng nhập laị", 401);
    }

    const branches = res.data?.module?.views?.[0];
    if (!branches) throwError("Lõi tìm kiếm chi nhánh từ máy chủ", 404);

    return NextResponse.json(branches, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
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

    if (!name || !REGEX.BRANCH_NAME.test(name.toString()))
      throwError(
        "Bạn phải nhập tên chi nhánh,tên chi nhánh phải từ 5 kí tự trở lên",
        400,
      );
    if (!code || !REGEX.BRANCH_CODE.test(code.toString()))
      throwError(
        "Bạn phải nhập mã chi nhánh, mã chi nhánh phải từ 3 kí tự trở lên",
        400,
      );

    if (phone && !REGEX.PHONE.test(phone.toString()))
      throwError(
        "Số điện thoại không hợp lệ, 0xx-xxx-xxxx hoặc +84xx-xxx-xxxx",
        400,
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

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(...handleError(error));
  }
}
