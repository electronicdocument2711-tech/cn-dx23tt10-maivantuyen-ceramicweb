import MainLayout from "@/com/MainLayout";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "DentalX - Nha khoa hiện đại & số hóa",
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
