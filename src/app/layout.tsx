import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mrbastos.com.br"),
  title: "Mr. Bastos Barbearia | O Padrão de Excelência em Alagoinhas - BA",
  description: "Tradição, conforto e sofisticação em corte masculino, barba e visagismo. Avenida Dantas Bião s/n, Hiper Gbarbosa - Alagoinhas, BA.",
  keywords: [
    "Barbearia Alagoinhas",
    "Mr Bastos Barbearia",
    "Corte masculino Alagoinhas",
    "Barbeiro Alagoinhas",
    "Degradê Alagoinhas",
    "Barboterapia Alagoinhas",
    "Hiper Gbarbosa Alagoinhas",
  ],
  authors: [{ name: "Mr. Bastos Barbearia" }],
  openGraph: {
    title: "Mr. Bastos Barbearia | O Padrão de Excelência",
    description: "Tradição, conforto e sofisticação em corte masculino, barba e visagismo em Alagoinhas - BA.",
    url: "https://mrbastos.com.br",
    siteName: "Mr. Bastos Barbearia",
    locale: "pt_BR",
    type: "website",
  },
  alternates: {
    canonical: "https://mrbastos.com.br",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfair.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#050B14] text-white font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
