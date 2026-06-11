import React from "react";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { IconChevronLeft } from "@tabler/icons-react";
import { cms } from "@/lib/cms";
import { prop } from "remeda";
import { notFound } from "next/navigation";
import ServiceTaxInfoBreadcrumbs from "@/com/service/ServiceTaxInfoBreadcrumbs";
import Link from "next/link";
import ServiceTaxInfoForm from "@/com/service/ServiceTaxInfoForm";

interface PageProps {
  params: Promise<{
    serviceId: string;
  }>;
}

const Page = async ({ params }: Readonly<PageProps>) => {
  const { serviceId } = await params;

  let data = null;
  let latestServiceTaxInfoData = null;

  try {
    const formData = new FormData();
    formData.append("ServiceId", serviceId);

    const [response, latestResponse] = await Promise.all([
      cms.post("/pos/service?_lay=getServiceDetailV2", formData),
      cms.post(
        "/pos/service/ServiceTaxInfo?_lay=getLatestServiceTaxInfoDetails",
        formData,
      ),
    ]);

    data = prop(response, ...["data", "module", "views", "0", "data"]);
    latestServiceTaxInfoData = prop(
      latestResponse,
      ...["data", "module", "views", "0", "data"],
    );
  } catch {
    // DO NOTHING
  }

  if (!data) {
    notFound();
  }

  return (
    <section className="">
      <ServiceTaxInfoBreadcrumbs />

      <div className="flex gap-4 mt-4">
        <Link href={`/payment/service/${data?.ServiceId}`}>
          <Button isIconOnly variant="bordered" className="border-slate-300">
            <IconChevronLeft />
          </Button>
        </Link>

        <h1 className="page-title">{data?.Name}</h1>
      </div>

      <Card shadow="none" className="flex flex-col gap-4 mx-auto mt-4">
        <ServiceTaxInfoForm
          serviceDetails={data}
          data={latestServiceTaxInfoData}
        />
      </Card>
    </section>
  );
};

export default Page;
