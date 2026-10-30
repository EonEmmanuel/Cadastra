import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cadastra-Cameroon | Contrôle Autonome du Cadastre & Anti-Fraude Foncière",
  description: "Système autonome de vérification géodésique des plans de bornage et détection de superficie fictive selon les normes MINDCAF Cameroun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
