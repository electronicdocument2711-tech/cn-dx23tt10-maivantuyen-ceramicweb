import React from "react";

import MainLayout from "@/com/MainLayout";
import HolderInfo from "@/com/clinic/HolderInfo";
import ClinicMenu from "@/com/clinic/ClinicMenu";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "DentalX - Nha khoa hiện đại & số hóa",
};

export default function ClinicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold">Phòng khám</h1>
      <div className="bg-white mt-3 grid grid-cols-[260px_1fr] rounded-2xl border border-gray-400">
        <aside className="border-r-1 border-gray-400">
          <HolderInfo />
          <ClinicMenu />
        </aside>
        <div className="p-6">{children}</div>
      </div>
    </MainLayout>
  );
}
