import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { getPublicConfig } from "@/lib/getPublicConfig";
import { GalleryUpload } from "@/components/gallery/GalleryUpload";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { Lock } from "lucide-react";
import Link from "next/link";
import { MediaCountdownClient } from "@/components/MediaCountdownClient";

const WEDDING_DATE = new Date("2026-09-12T13:30:00+02:00");

export default async function GalleryPage() {
  const config = await getPublicConfig();
  const navItems = config.sections
    .filter((section) => section.enabled && section.nav)
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      label: section.label.trim() || section.id,
      href: section.id === "media" ? "/media" : `/#${section.id}`,
    }));

  const now = new Date();
  const isUnlocked = now >= WEDDING_DATE;

  return (
    <>
      <TopBar
        config={config}
        navItems={navItems}
        brandName={config.brandName}
        ctaLabel={config.headerCtaLabel}
      />
      <main className="min-h-screen pt-24 pb-12">
        {isUnlocked ? (
          <>
            {/* HEADER */}
            <Section
              align="center"
              title="Media & Recuerdos"
              description="Comparte tus fotos y vídeos favoritos de la boda con nosotros. ¡Ayúdanos a recopilar todos los recuerdos!"
            >
              <div />
            </Section>

            {/* UPLOAD SECTION */}
            <Section>
              <div className="bg-surface rounded-2xl border border-border/60 shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-serif italic text-center mb-6">Sube tus fotos</h2>
                <GalleryUpload />
                <p className="text-center text-xs text-muted-foreground mt-4">
                  * Las fotos pasarán una pequeña revisión antes de publicarse para evitar sustos de última hora. 😉
                </p>
              </div>
            </Section>

            {/* GRID SECTION */}
            <Section title="Momentos Capturados" align="center">
              <PhotoGrid />
            </Section>
          </>
        ) : (
          /* LOCKED STATE */
          <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
            <div className="flex flex-col items-center gap-6 max-w-md">
              {/* Lock icon with elegant styling */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-bg border border-accent/20">
                <Lock className="h-9 w-9 text-accent-strong" />
              </div>

              {/* Decorative divider */}
              <div className="flex items-center gap-3 w-full max-w-[200px]">
                <div className="h-px flex-1 bg-border" />
                <span className="font-script text-2xl text-accent">AG</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-3xl text-foreground">
                  Los recuerdos están por llegar
                </h1>
                <p className="text-muted text-sm leading-relaxed">
                  Esta sección se abrirá el día de la boda, el{" "}
                  <span className="font-semibold text-foreground">12 de septiembre de 2026</span>.
                  <br />
                  Vuelve entonces para compartir y ver los momentos únicos del gran día.
                </p>
              </div>

              {/* Countdown display */}
              <MediaCountdown targetDate={WEDDING_DATE.toISOString()} />

              {/* Back link */}
              <Link
                href="/"
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-xs font-sans uppercase tracking-[0.2em] text-foreground/70 transition hover:border-primary/30 hover:text-foreground"
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

/* Client-side countdown for the locked state */
function MediaCountdown({ targetDate }: { targetDate: string }) {
  return (
    <div
      suppressHydrationWarning
      className="grid grid-cols-4 gap-3 text-center"
    >
      {/* Rendered on client via useEffect in a separate client component */}
      <MediaCountdownClient targetDate={targetDate} />
    </div>
  );
}
