import React from "react";
import CustomerCover from "@/com/customer/profile/CustomerCover";
import CustomerMenu from "@/com/customer/CustomerMenu";
import CustomerHeading from "@/com/customer/profile/CustomerHeading";
import CustomerProvider from "@/context/CustomerContext";

export default function CustomerDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CustomerProvider>
      <CustomerHeading />
      <div className="@container bg-white mt-6 flex rounded-2xl border border-gray-300 w-full overflow-hidden">
        <aside className="border-r border-gray-400">
          <CustomerCover className="hidden @3xl:block" />
          <CustomerMenu />
        </aside>
        <section className="w-full py-8 px-8 flex-1 min-w-0">
          {children}
        </section>
      </div>
    </CustomerProvider>
  );
}
