import { IconChevronRight } from "@/com/icons/outline";

export default async function LoyaltyPage() {
  return (
    <section>
      <div className="flex items-center gap-2 text-gray-600">
        <span className="text-blue-700 font-medium font-size-4">Marketing</span>
        <IconChevronRight className="w-4 h-4" />
        <span className="text-blue-400 font-medium font-size-4">
          Loyalty & Điểm thưởng
        </span>
      </div>
      <h1 className="text-3xl font-bold mt-4">Khách hàng thân thiết</h1>
      <div className="bg-white mt-6 p-6 rounded-2xl shadow-sm">loyalty</div>
    </section>
  );
}
