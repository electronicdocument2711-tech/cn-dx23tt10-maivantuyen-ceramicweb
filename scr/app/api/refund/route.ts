import { cms } from "@/lib/cms";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";
import * as Yup from "yup";

const schema = Yup.object().shape({
  customer_id: Yup.number().required("Bắt buộc phải có mã khách hàng"),
  papers: Yup.array().of(Yup.number().required()),
  branch_id: Yup.number().required("Bắt buộc phải chọn chi nhánh"),
  amount: Yup.number().required("Bắt buộc phải nhập số tiền hoàn"),
  payment_method: Yup.number()
    .oneOf([1, 2], "Chỉ chấp nhận tiền mặt hoặc ngân hàng")
    .required("Bắt buộc phải chọn phương thức thanh toán"),
  note: Yup.string().max(255, "Ghi chú không được vượt quá 255 ký tự"),
  bank_id: Yup.number().when("payment_method", {
    is: (val: number) => val === 2,
    then(schema) {
      return schema.required("Bắt buộc phải chọn ngân hàng");
    },
    otherwise(schema) {
      return schema.notRequired();
    },
  }),
});

// API tạo phiếu hoàn tiền
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const validatedData = await schema.validate(payload, { abortEarly: false });

    const customerFormData = new FormData();
    customerFormData.append("CustomerId", validatedData.customer_id.toString());
    const customerInfo = await cms
      .post("pos/customer?_lay=customer", customerFormData)
      .then((res) => prop(res, ...["data", "module", "views", 0, "data"]));

    if (!customerInfo) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin khách hàng" },
        { status: 404 },
      );
    }

    const fb = new FormData();
    fb.append("ExpenditureTypeId", "2"); // Mã loại chi
    fb.append("ExpenditureCategoryId", "44"); // Mã danh mục "Hoàn tiền khách hàng"
    fb.append("Amount", validatedData?.amount?.toString());
    fb.append("RefId", validatedData?.customer_id?.toString());
    fb.append("BranchId", validatedData?.branch_id?.toString());
    fb.append("PaymentMethodId", validatedData?.payment_method?.toString());
    fb.append("ReceiverName", customerInfo?.FullName);
    fb.append("Note", validatedData?.note || "");
    fb.append("ExpenditureStatusId", "5"); // Trạng thái "Pending"
    if (validatedData?.branch_id)
      fb.append("BranchId", validatedData.branch_id.toString());

    for (const id of validatedData?.papers || []) {
      fb.append("Exhibit[]", id.toString());
    }

    const response = await cms.post("/pos/expenditure?_act=save", fb);

    if (response.status !== 200) {
      throw new Error(
        response?.data?.message || "Đã có lỗi xảy ra khi tạo phiếu hoàn tiền",
        { cause: response.status },
      );
    }

    return NextResponse.json({
      message: "Tạo phiếu hoàn tiền thành công",
    });
  } catch (error: any) {
    if (error instanceof Yup.ValidationError) {
      return NextResponse.json(
        {
          error: error?.errors?.join(", ") || "Dữ liệu không hợp lệ",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: error?.message || "Dữ liệu không hợp lệ",
      },
      { status: error?.cause || 500 },
    );
  }
}
