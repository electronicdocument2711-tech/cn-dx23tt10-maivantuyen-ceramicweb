import React from "react";
import { Metadata } from "next";

import MainLayout from "@/com/MainLayout";

export const metadata: Metadata = {
  title: "DentalX - Nha khoa hiện đại & số hóa",
};

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
