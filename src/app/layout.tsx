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
    icon: [
      { url: "/icon.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico?v=2", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png?v=2", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=2",
  },
  manifest: "/manifest.json",
  verification: {
    google: "-VKaG-kU7v50FaW3bA9SZVnvloirfRaPLWV7Bwjp6MI",
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
      <head>
        <meta name="google-site-verification" content="-VKaG-kU7v50FaW3bA9SZVnvloirfRaPLWV7Bwjp6MI" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png?v=2" />
      </head>
      <body className="min-h-full flex flex-col bg-[#050B14] text-white font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
