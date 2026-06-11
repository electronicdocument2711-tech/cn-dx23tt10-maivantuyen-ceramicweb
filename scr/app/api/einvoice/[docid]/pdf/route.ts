import { validToken } from "@/lib/auth";
import { Bkav } from "@/lib/bkav";
import { cms } from "@/lib/cms";
import { saas } from "@/lib/saas";
import { NextRequest, NextResponse } from "next/server";
import { prop } from "remeda";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docid: string }> },
) {
  try {
    if (!(await validToken(request))) {
      throw new Error("Chưa xác thực", { cause: 401 });
    }

    const authorize = await cms.get("/authen/authorize");

    if (!prop(authorize, ...["data", "module", "code"])) {
      throw new Error("Chưa đăng nhập", { cause: 401 });
    }

    const clientGroupId = prop(
      authorize,
      ...["data", "module", "data", "user", "ClientGroupId"],
    );

    if (!clientGroupId) {
      throw new Error("Phòng khám không hợp lệ", {
        cause: 400,
      });
    }

    const { docid } = await params;

    const einvoice = await saas
      .get(`/api/einvoices/${docid}`, {
        params: {
          filters: {
            business: {
              $eq: clientGroupId,
            },
          },
          fields: [
            "id",
            "documentId",
            "invoice_form",
            "invoice_serial",
            "e_invoice_number",
          ],
          populate: {
            einvoice_config: {
              populate: {
                einvoice_provider: {
                  fields: ["alias", "domain_api"],
                },
                einvoice_accounts: {
                  fields: ["guiid"],
                },
              },
            },
          },
        },
      })
      .then((res) => {
        return res?.data?.data;
      })
      .catch((error) => {
        if (error?.status === 404) {
          throw new Error("Không tìm thấy hóa đơn điện tử", { cause: 404 });
        }

        throw error;
      });

    if (
      !einvoice?.einvoice_config?.einvoice_provider?.domain_api ||
      !einvoice?.einvoice_config?.einvoice_accounts?.[0]?.guiid
    ) {
      throw new Error("Cấu hình hóa đơn điện tử không hợp lệ", { cause: 400 });
    }

    const bkavInstance = new Bkav({
      url: einvoice?.einvoice_config?.einvoice_provider?.domain_api,
      partnerGuid: einvoice?.einvoice_config?.einvoice_accounts?.[0]?.guiid,
    });

    const pdfBase64 = await bkavInstance.getInvoiceFilePDFBase64(
      einvoice.documentId,
    );

    if (pdfBase64?.Status !== 0) {
      throw new Error("Lỗi khi truy xuất file PDF từ đối tác hóa đơn điện tử", {
        cause: 500,
      });
    }

    if (!pdfBase64?.Object?.PDF) {
      throw new Error("Không tìm thấy file PDF của hóa đơn điện tử", {
        cause: 404,
      });
    }

    return NextResponse.json({
      data: {
        base64: pdfBase64?.Object?.PDF,
        name: `[${einvoice?.invoice_form}]_[${einvoice?.invoice_serial}]_[${einvoice?.e_invoice_number}].pdf`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại sau." },
      { status: error?.cause || 500 },
    );
  }
}
