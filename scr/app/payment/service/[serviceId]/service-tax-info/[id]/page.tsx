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
import dayjs from "dayjs";

interface PageProps {
  params: Promise<{
    serviceId: string;
    id: string;
  }>;
}

const Page = async ({ params }: Readonly<PageProps>) => {
  const { id } = await params;

  let data = null;

  try {
    const formData = new FormData();
    formData.append("ServiceTaxInfoId", id);
    const response = await cms.post(
      "/pos/service/ServiceTaxInfo?_lay=getServiceTaxInfoDetails",
      formData,
    );

    data = prop(response, ...["data", "module", "views", "0", "data"]) || {};
  } catch {
    // DO NOTHING
  }

  if (!data) {
    notFound();
  }

  const today = dayjs();
  const startDate = dayjs(data?.StartDate, "YYYY-MM-DD");
  const endDate = dayjs(data?.EndDate, "YYYY-MM-DD");
  const state = today.isBefore(startDate, "day")
    ? "upcoming"
    : endDate.isBefore(today, "day")
      ? "expired"
      : "active";

  return (
    <section className="">
      <ServiceTaxInfoBreadcrumbs />

      <div className="flex gap-4 mt-4">
        <Link href={`/payment/service/${data?.ServiceId}`}>
          <Button isIconOnly variant="bordered" className="border-slate-300">
            <IconChevronLeft />
          </Button>
        </Link>

        <h1 className="page-title">{data?.ServiceName}</h1>
      </div>

      <Card shadow="none" className="flex flex-col gap-4 mx-auto mt-4">
        <ServiceTaxInfoForm
          data={data}
          isUpdate
          isClosed={state === "expired"}
        />
      </Card>
    </section>
  );
};

export default Page;
