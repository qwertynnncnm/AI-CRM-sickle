import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";

import { AppShell } from "@/components/app-shell";
import { AudioPlayerProvider } from "@/components/global-audio-player";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description = "为现代营收团队打造的专注型客户管理工作台。";

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim();
}

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    firstHeaderValue(requestHeaders.get("x-forwarded-host")) ??
    firstHeaderValue(requestHeaders.get("host")) ??
    "localhost:3000";
  const protocol =
    firstHeaderValue(requestHeaders.get("x-forwarded-proto")) ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  let metadataBase: URL;

  try {
    metadataBase = new URL(`${protocol}://${host}`);
  } catch {
    metadataBase = new URL("http://localhost:3000");
  }

  return {
    metadataBase,
    title: {
      default: "星联客户管理",
      template: "%s | 星联客户管理",
    },
    description,
    openGraph: {
      title: "星联客户管理",
      description,
      type: "website",
      siteName: "星联客户管理",
      images: [
        {
          url: "/og.png",
          width: 1680,
          height: 945,
          alt: "星联客户管理——专注每一次成交。",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "星联客户管理",
      description,
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AudioPlayerProvider>
          <AppShell>{children}</AppShell>
        </AudioPlayerProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
