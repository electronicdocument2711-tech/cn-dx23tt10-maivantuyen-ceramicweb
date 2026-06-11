"use client";
import CustomerList from "@/com/customer/CustomerList";
import AddCustomer from "@/com/ap/AddCustomer";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerPage() {
  const [trigger, setTrigger] = useState<number>(1);
  const router = useRouter();
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Danh sách khách hàng</h1>
        <AddCustomer
          onCreateSuccess={(customerId) => {
            if (!customerId) {
              setTrigger((prev) => prev + 1);
              return;
            }

            setTimeout(() => {
              router.push(`/customer/${customerId}/board`);
            }, 500);
          }}
        />
      </div>
      <Suspense>
        <CustomerList trigger={trigger} />
      </Suspense>
    </section>
  );
}
