"use client";

import Link from "next/link";

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandThreads,
  IconBrandTiktok,
  IconBrandYoutube,
} from "@tabler/icons-react";

import { IconMapPinFilled, IconPhoneFilled } from "@/com/icons/filled";
import { IconLogo } from "@/com/icons/regular";

const footerSections = [
  {
    title: "Tính năng",
    links: [
      "Quản lý lâm sàng",
      "Lịch hẹn thông minh",
      "CRM & Chăm sóc",
      "Lịch hẹn thông minh",
      "Tài chính & Công nợ",
      "Kho vật tư",
      "Nhân sự & KPI",
      "Báo cáo",
      "Tính năng nâng cao",
    ],
  },
  {
    title: "Giải pháp",
    links: ["Nha khoa vừa và nhỏ", "Nha khoa nhiều chi nhánh"],
  },
  {
    title: "Tài nguyên",
    links: ["Blog", "Video", "Ebook"],
  },
  {
    title: "Về chúng tôi",
    links: [
      "Giới thiệu",
      "Điều khoản",
      "Chính sách",
      "Câu chuyện thành công",
      "Liên hệ",
    ],
  },
];

const footerColumns = [
  [footerSections[0]],
  [footerSections[1], footerSections[2]],
  [footerSections[3]],
];

const contactCards = [
  {
    icon: IconMapPinFilled,
    content: (
      <p className="text-[18px] font-medium leading-8">
        26D D. Lê Quốc Hưng, Phường 13, Quận 4, TP. Hồ Chí Minh
      </p>
    ),
    iconClassName: "mt-1 shrink-0 text-[#79A8F6]",
    containerClassName: "items-start",
  },
  {
    icon: IconPhoneFilled,
    content: (
      <a
        href="tel:0909123456"
        className="text-[18px] font-medium leading-8 hover:text-[#0F3A78]"
      >
        0909 581 165
      </a>
    ),
    iconClassName: "shrink-0 text-[#79A8F6]",
    containerClassName: "items-center",
  },
];

const socialLinks = [
  { label: "YouTube", icon: IconBrandYoutube },
  { label: "Facebook", icon: IconBrandFacebook },
  { label: "Instagram", icon: IconBrandInstagram },
  { label: "Threads", icon: IconBrandThreads },
  { label: "TikTok", icon: IconBrandTiktok },
];

const footerLinkClass =
  "block text-base font-medium text-[#42586D] transition-colors hover:text-[#17407C]";
const footerSectionTitleClass =
  "mb-5 text-[18px] font-bold uppercase text-[#173A73]";

function FooterLinkList({ links }: { links: string[] }) {
  return (
    <div className="space-y-5">
      {links.map((item, index) => (
        <a key={`${item}-${index}`} href="#" className={footerLinkClass}>
          {item}
        </a>
      ))}
    </div>
  );
}

export default function PlanFooter() {
  return (
    <footer className="mt-6 w-full bg-gradient-to-b from-[#1557D6] via-[#4F8FF3] to-[#B7DBFF] p-3">
      <div className="rounded-[36px] bg-white p-12">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_0.7fr_1fr]">
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center text-[#0F3A78]">
              <IconLogo size={54} />
            </Link>

            <div className="max-w-[320px] space-y-3">
              {contactCards.map(
                ({ icon: Icon, content, iconClassName, containerClassName }, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 rounded-2xl bg-[#F7F9FB] px-4 py-3 text-[#173A73] ${containerClassName}`}
                  >
                    <Icon size={20} className={iconClassName} />
                    {content}
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-[1fr_0.9fr_0.9fr]">
            {footerColumns.map((sections, columnIndex) => (
              <div
                key={columnIndex}
                className={sections.length > 1 ? "space-y-10" : undefined}
              >
                {sections.map((section) => (
                  <section key={section.title}>
                    <h3 className={footerSectionTitleClass}>{section.title}</h3>
                    <FooterLinkList links={section.links} />
                  </section>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-[#E7EDF5] pt-6 md:mt-14 md:flex-row md:items-center md:justify-between md:pt-7">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[17px] font-medium text-[#415A77]">
            <span>DentalX © 2025</span>
            <a href="#" className="hover:text-[#17407C]">
              Điều khoản
            </a>
            <a href="#" className="hover:text-[#17407C]">
              Chính sách
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {socialLinks.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex size-12 items-center justify-center rounded-2xl bg-[#F6F8FB] text-[#4A5F7B] transition-colors hover:bg-[#EAF1FB] hover:text-[#173A73]"
              >
                <Icon size={22} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}