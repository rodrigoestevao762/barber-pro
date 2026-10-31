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
  description: "Tradição, conforto e sofisticação em corte masculino, barba e visagismo. Agende seu horário na Mr. Bastos Barbearia no Hiper Gbarbosa - Alagoinhas, BA.",
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
  icons: {
    icon: "/icon.jpg",
    apple: "/icon.jpg",
    shortcut: "/icon.jpg",
  },
  openGraph: {
    title: "Mr. Bastos Barbearia | O Padrão de Excelência",
    description: "Tradição, conforto e sofisticação em corte masculino, barba e visagismo em Alagoinhas - BA. Agendamentos online e atendimento de primeira.",
    url: "https://mrbastos.com.br",
    siteName: "Mr. Bastos Barbearia",
    images: [
      {
        url: "https://mrbastos.com.br/og-image.jpg",
        width: 800,
        height: 800,
        alt: "Logo Oficial Mr. Bastos Barbearia",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mr. Bastos Barbearia | O Padrão de Excelência",
    description: "Tradição, conforto e sofisticação em corte masculino, barba e visagismo em Alagoinhas - BA.",
    images: ["https://mrbastos.com.br/og-image.jpg"],
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
