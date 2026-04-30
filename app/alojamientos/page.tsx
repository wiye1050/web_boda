import { getAccommodations } from "@/lib/getAccommodations";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { getPublicConfig } from "@/lib/getPublicConfig";
import { StayList } from "@/components/StayList";
import { FloralOrnament } from "@/components/DesignElements";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Alojamientos | Alba & Guille",
  description: "Opciones de alojamiento recomendadas para nuestra boda.",
};

export default async function AlojamientosPage() {
  const [config, accommodations] = await Promise.all([
    getPublicConfig(),
    getAccommodations(),
  ]);

  const navItems = config.sections
    .filter((section: any) => section.enabled && section.nav)
    .sort((a: any, b: any) => a.order - b.order)
    .map((section: any) => ({
      label: section.label.trim() || section.id,
      href: section.id === "media" 
        ? "/media" 
        : section.id === "alojamiento" 
          ? "/alojamientos" 
          : `/#${section.id}`,
    }));

  const pluralizeType = (type: string) => {
    switch (type) {
      case "Hotel": return "Hoteles";
      case "Casa Rural": return "Casas Rurales";
      case "Apartamento": return "Apartamentos";
      case "Otro": return "Otros";
      default: return type + "s";
    }
  };

  const accommodationsByType = accommodations.reduce((acc, curr) => {
    if (!acc[curr.type]) {
      acc[curr.type] = [];
    }
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, typeof accommodations>);

  const types = Object.keys(accommodationsByType).sort();

  return (
    <div id="top" className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <TopBar
        brandName={config.brandName}
        navItems={navItems}
        ctaLabel={config.headerCtaLabel}
        config={{
          noticeText: config.noticeText,
          noticeCountdownTarget: config.noticeCountdownTarget,
        }}
      />
      
      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)_+_84px)] sm:pb-0 pt-24 sm:pt-32">
        <div className="relative">
          <FloralOrnament position="top-right" opacity={0.1} />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10 mb-20">
          <Link 
            href="/#alojamiento" 
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted hover:text-primary transition-colors mb-12 ml-2 sm:ml-0"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>

          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-3xl md:text-5xl font-serif text-foreground/90 mb-6">Alojamientos Recomendados</h1>
            <p className="text-lg text-foreground/60 leading-relaxed">
              Hemos seleccionado una lista de hoteles y casas rurales cerca de la finca para que vuestra estancia sea lo más cómoda posible.
            </p>
          </div>

          <div className="relative space-y-24">
            <FloralOrnament position="bottom-left" opacity={0.08} className="translate-y-20 -translate-x-10" />
            
            {accommodations.length > 0 ? (
              types.map((type) => (
                <section key={type} className="space-y-10 relative z-10">
                  <div className="flex items-center gap-6">
                    <h2 className="text-2xl font-serif text-foreground/90 bg-background pr-2">{pluralizeType(type)}</h2>
                    <div className="h-px flex-1 bg-border/60" />
                  </div>
                  <StayList 
                    items={accommodationsByType[type]} 
                    linkLabel="Ver detalles" 
                    variant="detailed"
                  />
                </section>
              ))
            ) : (
               <div className="py-20 text-center rounded-3xl border border-dashed border-border/60 bg-surface/50">
                 <p className="text-muted text-lg">Aún no hemos añadido opciones de alojamiento.</p>
                 <p className="text-muted text-sm mt-2">Pronto actualizaremos esta sección con recomendaciones.</p>
               </div>
            )}
          </div>
        </div>
      </main>

      <Footer
        brandName={config.brandName}
        targetDate={config.noticeCountdownTarget}
      />
    </div>
  );
}
