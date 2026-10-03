import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "Lịch Âm Dương Việt Nam - Lịch Vạn Niên & Sự Kiện",
  description:
    "Ứng dụng tra cứu lịch âm dương chuẩn thiên văn Việt Nam, xem giờ hoàng đạo, tiết khí và nhắc nhở ngày rằm, mùng một, ngày giỗ gia đình.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.theme==='dark'||(!('theme' in localStorage)&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(_){}`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-red-500 selection:text-white">
        <Header />
        <main className="flex-1 pb-16 md:pb-8">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
