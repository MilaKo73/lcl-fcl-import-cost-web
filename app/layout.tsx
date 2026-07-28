import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "해운 수입 비용·경로 시뮬레이터",
  description:
    "LCL/FCL, 인코텀즈, HS CODE, 선적항과 국내 안전운임을 검토하는 수입 물류비 대시보드",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
