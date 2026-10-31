import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CADASTRA CM — Geospatial Cadastral Intelligence",
  description: "Autonomous cadastral verification and geodetic fraud detection system for Cameroon (MINDCAF Standards).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`dark h-full bg-[#060709] ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="h-full bg-[#060709] text-zinc-100 antialiased font-sans selection:bg-[#00DF8F]/20 selection:text-[#00DF8F]">
        {children}
      </body>
    </html>
  );
}
