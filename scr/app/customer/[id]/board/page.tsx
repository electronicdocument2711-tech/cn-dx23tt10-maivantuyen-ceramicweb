"use client";
import React from "react";
import CustomerNote from "@/com/customer/information/follow/CustomerNote";
import CustomerPayment from "@/com/customer/information/payment/CustomerPayment";
import { Divider } from "@heroui/react";
import { CustomerAppointment } from "@/com/customer/information/CustomerAppointment";
import { useParams } from "next/navigation";

const CustomerDetailPage = () => {
  const params = useParams();

  const customerId = params.id as string;

  return (
    <div className="w-full flex flex-col gap-7 px-6">
      <CustomerAppointment />
      <Divider className="mt-5" />
      <CustomerPayment customerId={customerId} />
      <Divider className="mt-5" />
      <CustomerNote />
    </div>
  );
};

export default CustomerDetailPage;
