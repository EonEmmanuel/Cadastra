import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL("http://localhost:3000"),
  applicationName: "Cadastra-Cameroon",
  title: {
    default: "CADASTRA CM — Geospatial Cadastral Intelligence",
    template: "%s · Cadastra-Cameroon",
  },
  description:
    "Autonomous cadastral verification and geodetic area fraud detection engine for Cameroon.",
  keywords: [
    "cadastre",
    "Cameroun",
    "bornage",
    "superficie fictive",
    "UTM 32N",
    "UTM 33N",
    "géodésie",
    "titre foncier",
  ],
  authors: [{ name: "Cadastra-Cameroon" }],
  creator: "Cadastra-Cameroon",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_CM",
    siteName: "Cadastra-Cameroon",
    title: "CADASTRA CM — Geospatial Cadastral Intelligence",
    description:
      "Audit géodésique autonome et détection de la superficie fictive pour les plans de bornage camerounais.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CADASTRA CM — Geospatial Cadastral Intelligence",
    description:
      "Audit géodésique autonome et détection de la superficie fictive au Cameroun.",
  },
};

export const viewport: Viewport = {
  themeColor: "#060709",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`dark h-full bg-[#060709] ${geistSans.variable} ${geistMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="h-full bg-[#060709] text-zinc-100 antialiased font-sans selection:bg-[#00DF8F]/20 selection:text-[#00DF8F]"
      >
        {children}
      </body>
    </html>
  );
}
