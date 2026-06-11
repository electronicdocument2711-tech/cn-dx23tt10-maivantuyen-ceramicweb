import React from "react";
import MainLayout from "@/com/MainLayout";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "DentalX - Nha khoa hiện đại & số hóa",
};

export default function PaymentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
