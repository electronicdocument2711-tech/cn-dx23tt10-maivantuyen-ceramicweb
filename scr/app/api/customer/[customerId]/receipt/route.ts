import { NextRequest, NextResponse } from "next/server";
import { handleError, throwError } from "@/lib/response";
import { cms } from "@/lib/cms";
import { MULTIPART_HEADERS } from "@/const/api";
import * as Yup from "yup";
import { prop } from "remeda";

export async function GET(
  _req: NextRequest,
  context: {
    params: Promise<{ customerId: string }>;
  },
) {
  try {
    const { customerId } = await context.params;
    if (!customerId || customerId === "") throwError("customerId missing", 400);

    const data = {
      _renderer: "module",
      CustomerId: customerId,
      lmstart: "0",
      limit: "999",
    };
    const res = await cms.post(
      "/pos/payment/deposit?_lay=listDeposit",
      data,
      MULTIPART_HEADERS,
    );

    const payment = res?.data?.module?.views?.[0]?.data;
    if (!payment) throwError("promotion null", 404);
    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    return NextResponse.json(...handleError(error));
  }
}

const validateInput = Yup.object().shape({
  BranchId: Yup.string().required("Mã chi nhánh là bắt buộc"),
  ReceiptDate: Yup.string().nullable(),
  Note: Yup.string(),
  MccCode: Yup.string().test(
    "mccCodeRequired",
    "MccCode là bắt buộc khi có Receipt",
    function (value) {
      const { Receipt } = this.parent;

      const haveReceiptCardMethod =
        Receipt &&
        Receipt.some((receipt: any) => receipt.PaymentMethodId === 3);

      if (haveReceiptCardMethod) {
        return !!value;
      }

      return true;
    },
  ),
  Receipt: Yup.array()
    .of(
      Yup.object().shape({
        Amount: Yup.number()
          .required("Số tiền là bắt buộc")
          .min(1, "Số tiền phải lớn hơn hoặc bằng 0"),
        PaymentMethodId: Yup.number().required(
          "Phương thức thanh toán là bắt buộc",
        ),
        BankId: Yup.number().test(
          "bankIdRequired",
          "Ngân hàng là bắt buộc khi phương thức thanh toán là chuyển khoản hoặc thẻ tín dụng",
          function (value) {
            const { PaymentMethodId } = this.parent;
            if (PaymentMethodId === 2 || PaymentMethodId === 3) {
              return value !== undefined && value !== null;
            }
            return true;
          },
        ),
      }),
    )
    .required("Danh sách phiếu thu không được để trống")
    .min(1, "Phải có ít nhất một phương thức thanh toán"),
});

export async function POST(
  req: NextRequest,
  { params }: Readonly<{ params: Promise<{ customerId: string }> }>,
) {
  try {
    const payload = await req.json();

    const validatedData = await validateInput.validate(payload, {
      abortEarly: false,
    });

    const formData = new FormData();

    formData.append("BranchId", validatedData.BranchId);
    if (validatedData.ReceiptDate) {
      formData.append("ReceiptDate", validatedData.ReceiptDate);
    }
    formData.append("Note", validatedData.Note || "");
    formData.append("MccCode", validatedData.MccCode || "");
    formData.append("CustomerId", await params.then((p) => p.customerId));

    validatedData.Receipt.forEach((receipt, index) => {
      formData.append(`Receipt[${index}][Amount]`, receipt.Amount.toString());
      formData.append(
        `Receipt[${index}][PaymentMethodId]`,
        receipt.PaymentMethodId.toString(),
      );
      if (receipt.BankId !== undefined && receipt.BankId !== null) {
        formData.append(`Receipt[${index}][BankId]`, receipt.BankId.toString());
      }
    });

    const res = await cms.post(
      "/pos/payment?_act=deposit.addDeposit",
      formData,
    );

    if (res?.status !== 200) {
      throw new Error("Đã có lỗi xảy ra, vui lòng thử lại", {
        cause: res?.status || 500,
      });
    }

    const isSuccess = prop(res, ...["data", "module", "code"]) ?? false;

    if (!isSuccess) {
      const message =
        (
          prop(res, ...["data", "messages"])?.map((item: any) =>
            prop(item, ...["mes"]),
          ) || []
        )?.join(", ") || "Đã có lỗi xảy ra, vui lòng thử lại";

      throw new Error(message, {
        cause: 500,
      });
    }

    return NextResponse.json(
      {
        message: "Tạo phiếu thu thành công",
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại" },
      { status: error?.cause || 500 },
    );
  }
}
