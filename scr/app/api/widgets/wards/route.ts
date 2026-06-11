import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { cms } from "@/lib/cms";
import { MULTIPART_HEADERS } from "@/const/api";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const ProvincesId = searchParams.get("VnProvinceId");
    if (!ProvincesId || ProvincesId === "")
      throwError("ProvincesId is required", 400);

    const dataDistrict = { _act: "getInfo", ProvincesId };
    const resDistrict = await cms.post(
      "/pos/Provinces/Provinces",
      dataDistrict,
      MULTIPART_HEADERS
    );
    const districts = resDistrict?.data?.module?.views?.[0]?.data?.District;

    if (!districts || districts.length === 0)
      throwError("District data null", 404);

    //BE-API not have get-wards-by-provincesID, using call all districtID
    //this code willbe change if BE method change late
    const promises = districts
      .filter((d: any) => d.VnDistrictId)
      .map((district: any) =>
        cms
          .post(
            "/pos/Provinces/Provinces",
            {
              _act: "getInfo",
              DistrictId: district.VnDistrictId,
            },
            MULTIPART_HEADERS
          )
          .then((res) => {
            return res?.data?.module?.views?.[0]?.data?.Ward ?? [];
          })
      );
    const wardList = await Promise.all(promises);
    const wards = wardList.flat();

    if (wards.length === 0) throwError("Ward null", 404);
    return NextResponse.json(wards, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
