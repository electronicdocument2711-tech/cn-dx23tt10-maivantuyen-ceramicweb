import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError, withAuth } from "@/lib/response";
import { cms } from "@/lib/cms";
import { prop } from "remeda";
import { saas } from "@/lib/saas";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ customerId: string }>;
  },
) {
  try {
    const { customerId } = await context.params;
    if (!customerId || customerId === "") throwError("params missing", 400);

    const tokenData = await withAuth(req);
    if (!tokenData) throwError("Unauthorized", 401);

    const authorize = await cms.get("/authen/authorize");
    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId)
      throw new Error("Phòng khám không hợp lệ", { cause: 400 });

    const params = {
      fields: ["note", "createdAt"],
      populate: {
        file: { fields: ["width", "height", "formats", "name", "url", "hash"] },
        user_info: { fields: ["name"] },
      },
      filters: { customer_id: { $eq: customerId } },
      sort: ["createdAt:desc"],
    };

    // truy vấn các hóa đơn
    const { status, data } = await saas.get("/api/customer-photos", { params });

    if (status !== 200)
      throwError("Lỗi khi lấy danh sách ảnh khách hàng", status);

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await context.params;
    if (!customerId || customerId === "") throwError("params missing", 400);

    const tokenData = await withAuth(req);
    if (!tokenData) throwError("Unauthorized", 401);

    const authorize = await cms.get("/authen/authorize");
    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId)
      throw new Error("Phòng khám không hợp lệ", { cause: 400 });

    let params: any = {
      populate: {
        user_info: {
          populate: "*",
        },
      },
      filters: { id: { $eq: tokenData?.id } },
    };

    const res = await saas("/api/users", { params });
    const userInfo = res.data[0].user_info;

    const formData = await req.formData();

    // files is a FileList object, need to convert to array
    const files = formData.getAll("files") as File[];

    // need to verify file type and size

    if (!files || files.length === 0)
      throw new Error("Không có tập tin được chọn", { cause: "INVALID_INPUT" });

    // exclude files that have invalid type or size, and return error if all files are invalid
    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
        throw new Error(
          "Loại tập tin không hợp lệ. Chỉ hỗ trợ JPEG, PNG và WEBP",
          { cause: "INVALID_INPUT" },
        );

      if (file.size > 5242880)
        throw new Error("Kích thước tập tin phải nhỏ hơn 5MB", {
          cause: "INVALID_INPUT",
        });
    }

    params = { fields: ["id", "documentId"] };

    const headers = { "Content-Type": "multipart/form-data" };
    const payload = { params, headers };

    const { data: uploadeds, status } = await saas.post(
      "/api/upload",
      formData,
      payload,
    );

    if ((status !== 200 && status !== 201) || !uploadeds)
      throwError("Lỗi khi tải lên ảnh", status);

    // after upload photos to server, need to create customer photo records by customer id and document id
    params = {
      fields: ["note", "createdAt"],
      populate: {
        file: { fields: ["width", "height", "formats", "name", "url", "hash"] },
        user_info: { fields: ["name"] },
      },
    };

    let sumSize = 0;
    const createPhoto = async (file: any) => {
      const data = {
        file: file.id,
        note: "",
        user_info: userInfo?.id,
        customer_id: customerId,
        business_id: clientGroupId,
        size: file?.size,
      };

      sumSize += file?.size || 0;

      const url = "/api/customer-photos";
      const { status: s, data: d } = await saas.post(url, { data }, { params });
      if ((s !== 200 && s !== 201) || !d?.data)
        throwError("Lỗi khi tạo ảnh khách hàng", s);

      return d.data;
    };

    const items = await Promise.all(
      uploadeds.map((file: any) => createPhoto(file)),
    );

    // update the total storage of the business after upload photos
    params = {
      fields: ["used_storage"],
      filters: { id: { $eq: clientGroupId } },
    };

    const { data: bus } = await saas.get("/api/businesses", { params });

    if (bus?.data && bus.data?.[0]?.documentId) {
      const used_storage = Number(bus.data[0].used_storage || 0) + sumSize;
      const url = `/api/businesses/${bus.data[0].documentId}`;
      await saas.put(url, { data: { used_storage } });
    }

    return NextResponse.json({ data: items }, { status });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}
