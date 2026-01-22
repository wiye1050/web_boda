import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Alba & Guille | Nuestra boda",
    template: "%s | Alba & Guille",
  },
  description:
    "Detalles para celebrar con Alba y Guille en la finca El Casar (Ponferrada): horarios, ubicación, RSVP y logística del gran día.",
  metadataBase: new URL("https://web-boda-delta.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Alba & Guille | Nuestra boda",
    description:
      "Horarios, ubicación y confirmación de asistencia para la boda de Alba y Guille en la finca El Casar (Ponferrada).",
    url: "https://web-boda-delta.vercel.app/",
    siteName: "Alba & Guille | Nuestra boda",
    images: [
      {
        url: "/photos/hero/boda1.jpeg",
        width: 1200,
        height: 630,
        alt: "Alba y Guille celebrando su boda",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alba & Guille | Nuestra boda",
    description:
      "Horarios, ubicación y confirmación de asistencia para la boda de Alba y Guille en la finca El Casar (Ponferrada).",
    images: ["/photos/hero/boda1.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <div className="relative min-h-screen bg-surface">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(183,110,121,0.12),_transparent_55%)]" />
          {children}
        </div>
      </body>
    </html>
  );
}
