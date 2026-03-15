import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConditionalBottomNav } from "@/app/components/ConditionalBottomNav";
import EndelBackground from "@/app/components/EndelBackground";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Forge – Transform Through Consistency",
  description:
    "A focused 30-day program designed to rewire your routines and unlock your potential.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
        <EndelBackground />
        {children}
        <ConditionalBottomNav />
      </body>
    </html>
  );
}
