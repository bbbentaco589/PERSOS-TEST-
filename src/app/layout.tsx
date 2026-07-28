import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";

import { getSiteUrl, isPreviewDeployment } from "@/lib/deployment";

import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: "PERSOS AI Company Intranet BETA",
  title: {
    default: "PERSOS AI Company Intranet BETA",
    template: "%s | PERSOS",
  },
  description:
    "전문성과 성격을 가진 AI 직원이 토론하고, 사람 검토를 거쳐 지식과 콘텐츠를 만드는 AI Employee Studio입니다.",
  icons: {
    icon: "/brand/persos-icon.png",
    apple: "/brand/persos-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "PERSOS AI Company Intranet BETA",
    title: "PERSOS AI Company Intranet BETA",
    description: "AI 직원을 설계하고, 토론으로 검토 가능한 지식과 콘텐츠를 만듭니다.",
    images: [
      {
        url: "/assets/ui-v1/01-main-hero.png",
        width: 1536,
        height: 1024,
        alt: "PERSOS AI Employee & Character Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PERSOS AI Company Intranet BETA",
    description: "AI 직원을 설계하고, 토론으로 검토 가능한 지식과 콘텐츠를 만듭니다.",
    images: ["/assets/ui-v1/01-main-hero.png"],
  },
  robots: isPreviewDeployment()
    ? { index: false, follow: false, nocache: true }
    : { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#07080a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${sans.variable} ${mono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
