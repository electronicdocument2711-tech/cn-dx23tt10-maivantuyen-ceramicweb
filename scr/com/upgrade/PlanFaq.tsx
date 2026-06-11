"use client";

import { useState } from "react";

import { IconPlus } from "@tabler/icons-react";

import cn from "@/lib/cn";

const faqItems = [
  {
    question: "Dùng thử 14 ngày có cần nhập thông tin thẻ tín dụng không?",
    answer:
      "Hoàn toàn không. Bạn không cần thẻ tín dụng hay bất kỳ thông tin thanh toán nào. Hết 14 ngày, tài khoản tự động về gói Miễn phí - không bị trừ tiền, không cần hủy gói thủ công.",
  },
  {
    question: "Dữ liệu bệnh nhân của tôi có được bảo mật không?",
    answer:
      "Dữ liệu được mã hóa, sao lưu định kỳ và lưu trữ trên hạ tầng cloud. Phòng khám là chủ sở hữu dữ liệu và có thể xuất dữ liệu khi cần.",
  },
  {
    question:
      "Tôi đang dùng phần mềm cũ, hoặc là Excel thì có thể chuyển dữ liệu sang DentalX dễ dàng không?",
    answer:
      "Đội ngũ DentalX hỗ trợ chuyển dữ liệu từ phần mềm cũ hoặc file Excel. Phần lớn phòng khám có thể hoàn tất onboarding trong thời gian ngắn, tùy vào quy mô dữ liệu.",
  },
  {
    question: "Gói Chain có phù hợp với chuỗi mới mở rộng chưa đủ 10 cơ sở không?",
    answer:
      "Có. Chain phù hợp khi phòng khám cần bệnh án liên thông, báo cáo toàn chuỗi, phân quyền nâng cao hoặc Account Manager riêng - kể cả khi mới có 2-3 cơ sở.",
  },
  {
    question: "Hóa đơn điện tử xuất ra có đúng theo Nghị định 123/2020/NĐ-CP không?",
    answer:
      "Có. DentalX hỗ trợ xuất hóa đơn điện tử theo quy định Nghị định 123/2020/NĐ-CP. Tính năng này có từ gói Starter trở lên.",
  },
  {
    question: "Tôi có thể nâng / hạ gói bất cứ lúc nào không?",
    answer:
      "Có. Nâng gói có hiệu lực ngay khi được kích hoạt. Hạ gói thường áp dụng từ chu kỳ thanh toán tiếp theo để tránh gián đoạn dữ liệu và quyền sử dụng.",
  },
];

export default function PlanFaq() {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>(
    Object.fromEntries(faqItems.map((_, index) => [index, true])),
  );

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section className="w-full max-w-4xl px-0 py-14">
      <div className="mx-auto flex w-full flex-col gap-4 ">
        <h2 className="text-center text-5xl font-bold tracking-tight text-[#173A73]">
          Câu hỏi thường gặp
        </h2>

        <div className="mt-3 flex flex-col gap-3">
          {faqItems.map((item, index) => {
            const isOpen = openItems[index];

            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-[28px] bg-[#F7F9FB] p-7"
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 text-left"
                  onClick={() => toggleItem(index)}
                >
                  <span className="text-[20px] font-bold leading-snug text-[#173A73] ">
                    {item.question}
                  </span>
                  <IconPlus
                    size={24}
                    className={cn(
                      "mt-1 shrink-0 text-[#5B708C] transition-transform duration-200",
                      isOpen && "rotate-45",
                    )}
                  />
                </button>

                {isOpen && (
                  <p className="text-start pt-5 text-base font-medium leading-8 text-[#5B708C] ">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}