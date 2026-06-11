import React from "react";

import MainLayout from "@/com/MainLayout";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainLayout>
      <div className="max-w-3xl lg:max-w-5xl xl:max-w-7xl mx-auto px-3 py-6">
        {children}
      </div>
    </MainLayout>
  );
}
