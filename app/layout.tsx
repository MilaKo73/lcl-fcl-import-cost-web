import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "해상 수입물류 비용 산정 테이블",
  description: "LCL/FCL 해상운임과 국내 안전위탁운임을 비교하는 수입 물류비 대시보드",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
