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
  title: "Mr. Bastos Barbearia | O Padrão de Excelência",
  description: "Tradição, conforto e sofisticação em corte e barba. Avenida Dantas Bião s/n, Hiper Gbarbosa - Alagoinhas, BA.",
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

