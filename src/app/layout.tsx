import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "Lịch Âm Dương Việt Nam - Lịch Vạn Niên & Sự Kiện",
  description:
    "Ứng dụng tra cứu lịch âm dương chuẩn thiên văn Việt Nam, xem giờ hoàng đạo, tiết khí và nhắc nhở ngày rằm, mùng một, ngày giỗ gia đình.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-red-500 selection:text-white">
        <Header />
        <main className="flex-1 pb-16 md:pb-8">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
