import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오출완",
  description: "텔레그램과 연결되는 오늘출근완료 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
