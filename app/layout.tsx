import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
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
        url: "https://web-boda-delta.vercel.app/photos/hero/share-boda0.png",
        secureUrl: "https://web-boda-delta.vercel.app/photos/hero/share-boda0.png",
        width: 1200,
        height: 630,
        alt: "Alba y Guille celebrando su boda",
        type: "image/png",
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
    images: ["https://web-boda-delta.vercel.app/photos/hero/share-boda0.png"],
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
        className={`${lato.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <div className="relative min-h-screen bg-surface">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-[0.3em] focus:text-primary-foreground focus:shadow-lg"
          >
            Saltar al contenido
          </a>
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(183,110,121,0.12),_transparent_55%)]" />
          <main id="main-content">{children}</main>
          <Toaster position="top-center" richColors />
        </div>
      </body>
    </html>
  );
}
