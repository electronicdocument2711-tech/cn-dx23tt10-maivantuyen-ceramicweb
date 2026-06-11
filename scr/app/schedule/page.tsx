import MainLayout from "@/com/MainLayout";
import dynamic from "next/dynamic";
import { Metadata } from "next";

const CalendarView = dynamic(() => import("@/com/calendar/CalendarView"), {
  ssr: true,
});

export const metadata: Metadata = {
  title: "DentalX - Nha khoa hiện đại & số hóa",
};

const PageSchedule: React.FC = () => {
  return (
    <MainLayout>
      <CalendarView />
    </MainLayout>
  );
};

export default PageSchedule;
