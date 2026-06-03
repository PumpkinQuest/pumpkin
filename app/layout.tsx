import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | PumpkinQuest",
    default: "PumpkinQuest",
  },
  description:
    "PumpkinQuest — инструменты и материалы для НРИ",
  metadataBase: new URL("https://pumpkin.quest"),
  openGraph: {
    siteName: "PumpkinQuest",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-[var(--font-inter)] bg-pumpkin-bg text-pumpkin-text flex flex-col min-h-screen antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
