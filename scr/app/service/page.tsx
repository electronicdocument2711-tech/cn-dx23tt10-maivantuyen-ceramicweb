import ServiceTable from "@/com/service/ServiceTable";
import MainLayout from "@/com/MainLayout";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "DentalX - Nha khoa hiện đại & số hóa",
};

export default function ServicePage() {
  return (
    <MainLayout>
      <ServiceTable />
    </MainLayout>
  );
}
