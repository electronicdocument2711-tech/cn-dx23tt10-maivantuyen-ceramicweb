import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";

import "@/css/globals.css";
import "@/css/hero.scss";
import "@/css/teeth.scss";

export const metadata: Metadata = {
  title: "Gốm Sứ Vòng Đời",
  description: "Website mua bán đồ gốm sứ qua sử dụng.",
};

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam-pro",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.className}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
