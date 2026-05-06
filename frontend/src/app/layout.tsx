import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {SITE_CONFIG} from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import { buildOrganizationJsonLd, buildLocalBusinessJsonLd } from "@/lib/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription = `${SITE_CONFIG.name}提供中美跨境供应链与物流信息服务，支持入库拍照、包裹确认、发货管理与物流查询。`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),

  title: {
    default: `${SITE_CONFIG.name} | ${SITE_CONFIG.slogan}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },

  description: siteDescription,

  keywords: [
    "中美集运",
    "跨境物流",
    "中国寄美国",
    "包裹转运",
    "国际快递",
    "广骏国际快运",
  ],

  authors: [{name: SITE_CONFIG.name}],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  applicationName: SITE_CONFIG.name,

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.slogan}`,
    description: siteDescription,
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: '广骏供应链服务 - 看得见的中美跨境物流与供应链服务',
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.slogan}`,
    description: siteDescription,
    images: [
      {
        url: '/twitter-image.png',
        width: 1200,
        height: 600,
        alt: '广骏供应链服务 - 看得见的中美跨境物流与供应链服务',
      },
    ],
  },

  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },

  verification: {
    google: "d1k3keXScHBw19TkGR_MLUgoVWR3w34TyVQriFUb5lI", // Google Search Console verification
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={buildOrganizationJsonLd()} />
        <JsonLd data={buildLocalBusinessJsonLd()} />
        {children}
      </body>
    </html>
  );
}
