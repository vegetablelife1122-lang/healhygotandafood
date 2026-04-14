import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "健康を気にする人のための五反田外食決定機",
  description: "健康を気にしながら五反田で外食先を決めたい人のためのアプリ。カロリー、ジャンル、飲みたいもの、店名検索などの条件から、今日の自分に合う1店を決めやすくする。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "五反田外食",
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-512.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#065f46",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-800">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
