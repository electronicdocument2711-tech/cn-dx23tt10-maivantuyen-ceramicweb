import React from "react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { prop } from "remeda";
import Image from "next/image";
import Link from "next/link";
import PaymentServiceBreadcrumbs from "@/com/payment/PaymentServiceBreadcrumbs";
import { cms } from "@/lib/cms";
import PaymentServiceTable from "@/com/payment/PaymentServiceTable";
import { notFound } from "next/navigation";

const Page = async ({ params }: { params: Promise<{ serviceId: string }> }) => {
  const { serviceId } = await params;
  let data = [];
  let details = null;

  try {
    const formData = new FormData();
    formData.append("ServiceId", serviceId);

    const [detailsRes, res] = await Promise.all([
      cms.post("/pos/service?_lay=getServiceDetailV2", formData),
      cms.post("/pos/service?_lay=getServiceTaxInfoList", formData),
    ]);

    details = prop(detailsRes, ...["data", "module", "views", "0", "data"]);
    data = prop(res, ...["data", "module", "views", "0", "data"]) || [];
  } catch {
    // DO NOTHING
  }

  if (!details) {
    notFound();
  }

  const renderContent = () => {
    if (!data || data?.length === 0) {
      return (
        <div className="min-h-96 flex-col flex items-center gap-4 justify-center">
          <Image
            src="/image/undraw_no-data.svg"
            width={300}
            height={300}
            alt="Blank"
            className="size-30 opacity-60"
          />
          <p className="text-center text-sm text-gray-600">Không có dữ liệu</p>
        </div>
      );
    }

    return <PaymentServiceTable data={data || []} />;
  };

  return (
    <section className="flex flex-col gap-7">
      <PaymentServiceBreadcrumbs />

      <div className="flex items-center justify-between">
        <h1 className="page-title">{details?.Name}</h1>
        <Link href={`/payment/service/${serviceId}/service-tax-info`}>
          <Button color="primary" startContent={<IconPlus size={22} />}>
            Thêm thiết lập
          </Button>
        </Link>
      </div>

      <Card className="shadow-none border border-gray-400">
        {renderContent()}
      </Card>
    </section>
  );
};

export default Page;
