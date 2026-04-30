import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { getPublicConfig } from "@/lib/getPublicConfig";
import { DEFAULT_PUBLIC_CONTENT } from "@/lib/publicContent";
import { LazyMotionProvider } from "@/components/providers/LazyMotionProvider";

import { ThemeProvider } from "@/components/ThemeProvider";
import { WeddingChatWrapper } from "@/components/WeddingChatWrapper";
import { EnvelopeWrapper } from "@/components/EnvelopeWrapper";
import { MusicWrapper } from "@/components/MusicWrapper";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const pinyonScript = Pinyon_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pinyon-script",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let config;
  try {
    config = await getPublicConfig();
  } catch (error) {
    config = DEFAULT_PUBLIC_CONTENT;
  }

  return {
    title: {
      default: config.brandName,
      template: `%s | ${config.brandName}`,
    },
    description: "¿Preparado? Pincha el enlace...",
    metadataBase: new URL("https://ayg2026.vercel.app"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: config.brandName,
      description: "¿Preparado? Pincha el enlace...",
      url: "https://ayg2026.vercel.app/",
      siteName: config.brandName,
      images: [
        {
          url: "https://ayg2026.vercel.app/logo-whatsapp.jpg",
          secureUrl: "https://ayg2026.vercel.app/logo-whatsapp.jpg",
          width: 1024,
          height: 1024,
          alt: `${config.brandName} - Nuestra Boda`,
          type: "image/jpeg",
        },
      ],
      locale: "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.brandName,
      description: "¿Preparado? Pincha el enlace...",
      images: ["https://ayg2026.vercel.app/logo-whatsapp.jpg"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${montserrat.variable} ${cormorant.variable} ${pinyonScript.variable} antialiased selection:bg-accent/30 selection:text-foreground grain-overlay`}
      >
        <ThemeProvider attribute="data-theme" forcedTheme="light" disableTransitionOnChange>
          <div className="relative min-h-screen mesh-bg">

            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-[0.3em] focus:text-primary-foreground focus:shadow-lg"
            >
              Saltar al contenido
            </a>

            <LazyMotionProvider>
              <div className="w-full">
                <main id="main-content" className="w-full">{children}</main>
              </div>
            </LazyMotionProvider>
            <Toaster position="top-center" richColors />
            <WeddingChatWrapper />
            {/* <EnvelopeWrapper /> */}
            <MusicWrapper />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
