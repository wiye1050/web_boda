import { CTAButton } from "@/components/CTAButton";
import { Footer } from "@/components/Footer";
import { HeroRedesign } from "@/components/HeroRedesign";
import { Section } from "@/components/Section";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getPublicConfig } from "@/lib/getPublicConfig";
import { getAccommodations } from "@/lib/getAccommodations";
import { DEFAULT_PUBLIC_CONTENT } from "@/lib/publicContent";
import dynamic from "next/dynamic";
import type { GiftOption } from "@/components/GiftList";
import { SaveTheDateManager } from "@/components/SaveTheDateManager";

// Dynamic Imports for performance
const MobileBottomBar = dynamic(() => import("@/components/MobileBottomBar").then(mod => mod.MobileBottomBar));
const RSVPForm = dynamic(() => import("@/components/RSVPForm").then(mod => mod.RSVPForm));
const MapInteractive = dynamic(() => import("@/components/MapInteractive").then(mod => mod.MapInteractive));

// Extracted components as dynamic imports
const StayList = dynamic(() => import("@/components/StayList").then(mod => mod.StayList));
const GiftList = dynamic(() => import("@/components/GiftList").then(mod => mod.GiftList));
const PracticalList = dynamic(() => import("@/components/PracticalList").then(mod => mod.PracticalList));
const SaveTheDateModal = dynamic(() => import("@/components/SaveTheDateModal").then(mod => mod.SaveTheDateModal));
const InteractiveExperience = dynamic(() => import("@/components/InteractiveExperience").then(mod => mod.InteractiveExperience));

export const revalidate = 60; // Keep page fast but updated every minute if Firebase changes

export default async function Home() {
  let config;
  let accommodations = [];

  try {
    const [configRes, accommodationsRes] = await Promise.all([
      getPublicConfig(),
      getAccommodations(),
    ]);
    config = configRes;
    accommodations = accommodationsRes;
  } catch (error) {
    console.error("Critical error fetching data:", error);
    config = DEFAULT_PUBLIC_CONTENT;
    accommodations = DEFAULT_PUBLIC_CONTENT.stayOptions || [];
  }

  if (!config) return null;

  const prebodaMapUrl = config.prebodaMapsUrl?.trim() || config.prebodaMapUrl?.trim() || (config.prebodaPlace ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.prebodaPlace)}` : "");
  const weddingMapUrl = config.weddingMapsUrl?.trim() || config.locationMapUrl?.trim() || (config.locationName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.locationName + " " + (config.locationAddress || ""))}` : "");
  
  const hasPracticalItems = config.practicalItems.length > 0;

  const giftOptions: GiftOption[] = [
    {
      title: config.giftsBankTitle,
      description: config.giftsBankDescription,
      details: ["ES57 0081 5035 9900 0123 2724"],
      hideDetails: true,
    },
  ];

  const sectionHasContent = (sectionId: string) => {
    switch (sectionId) {
      case "detalles":
        return hasPracticalItems;

      case "alojamiento":
        return accommodations.length > 0 || config.stayOptions.length > 0;
      case "ubicacion":
        return Boolean(
          config.locationName.trim() ||
            config.locationAddress.trim() ||
            config.locationMapUrl.trim(),
        );
      default:
        return true;
    }
  };

  const isSectionEnabled = (sectionId: string) => {
    const section = config.sections.find((item: any) => item.id === sectionId);
    return Boolean(section?.enabled && sectionHasContent(sectionId));
  };


  
  return (
    <>
      <head>
        {/* Preload critical Hero assets */}
        <link rel="preload" href="/photos/hero/hero_ilustracion.png" as="image" />
        <link rel="preload" href="/images/masks/brush_stroke_1.png" as="image" />
        <link rel="preload" href="/images/masks/brush_stroke_2.png" as="image" />
        <link rel="preload" href="/images/masks/brush.png" as="image" />
      </head>
      <SaveTheDateManager>
      <div id="top" className="flex min-h-screen flex-col w-full">

        <main className="flex-1 pb-32 sm:pb-0">
          <HeroRedesign
            config={{
              heroTitle: config.heroTitle,
              heroDescription: config.heroDescription,
              eventDate: config.eventDate || "12 de septiembre · 2026",
              ceremonyTime: config.ceremonyTime,
              ceremonyDateISO: config.ceremonyDateISO,
              locationName: config.locationName,
              locationAddress: config.locationAddress,
            }}
          />

          {isSectionEnabled("preboda") && (
            <Section 
              id="preboda"
              fineArt
              eyebrow="La víspera"
              title="La Preboda"
              description="La excusa perfecta para vernos dos veces"
              showDivider
            >
              <ScrollReveal>
                <div className="flex flex-col items-center">
                  {/* Handwritten Details Grid */}
                  <div className="grid max-w-4xl gap-12 md:gap-24 sm:grid-cols-2 w-full">
                    <article className="flex flex-col items-center justify-center text-center group">
                      <p className="font-script text-2xl text-accent/80 -mb-2">Fecha</p>
                      <h3 className="text-3xl sm:text-4xl font-serif font-medium text-foreground leading-tight">
                        {config.prebodaTime.replace(/\s*h\s*$/i, "")}
                      </h3>
                    </article>

                    <article className="flex flex-col items-center justify-center text-center group">
                      <p className="font-script text-2xl text-accent/80 -mb-2">Lugar</p>
                      <h3 className="text-3xl sm:text-4xl font-serif font-medium text-foreground leading-tight">
                        {config.prebodaPlace}
                      </h3>
                      {config.prebodaAddress && (
                        <p className="mt-3 text-sm text-foreground/60 leading-relaxed max-w-[280px] font-medium italic">
                          {config.prebodaAddress}
                        </p>
                      )}
                      {prebodaMapUrl && (
                        <CTAButton
                          href={prebodaMapUrl}
                          variant="ghost"
                          className="mt-10 w-fit tracking-[0.25em] font-bold uppercase text-[10px] border-accent/20 text-accent/80 hover:bg-accent/5"
                          prefetch={false}
                        >
                          Cómo llegar
                        </CTAButton>
                      )}
                    </article>
                  </div>
                </div>
              </ScrollReveal>
            </Section>
          )}

          {isSectionEnabled("ubicacion") && (
            <Section 
              id="ubicacion"
              fineArt
              eyebrow="El Gran Día"
              title="La Boda"
              description="La finca será el escenario de todos los actos de la boda"
              showDivider
            >
              <ScrollReveal>
                <div className="flex flex-col items-center">
                  {/* Handwritten Details Grid */}
                  <div className="mx-auto grid max-w-4xl gap-12 md:gap-24 sm:grid-cols-2 w-full">
                    <article className="flex flex-col items-center justify-center text-center group">
                      <p className="font-script text-2xl text-accent/80 -mb-2">Cuándo</p>
                      <h3 className="text-3xl sm:text-4xl font-serif font-medium text-foreground leading-tight">
                        {config.eventDate.split('·')[0]} · {config.ceremonyTime}
                      </h3>
                    </article>

                    <article className="flex flex-col items-center justify-center text-center group">
                      <p className="font-script text-2xl text-accent/80 -mb-2">El Lugar</p>
                      <h3 className="text-3xl sm:text-4xl font-serif font-medium text-foreground leading-tight">{config.locationName}</h3>
                      {config.locationAddress && (
                        <p className="mt-3 text-sm text-foreground/60 leading-relaxed max-w-[280px] font-medium italic">
                          {config.locationAddress}
                        </p>
                      )}
                      {weddingMapUrl && (
                        <CTAButton
                          href={weddingMapUrl}
                          variant="ghost"
                          className="mt-10 w-fit tracking-[0.25em] font-bold uppercase text-[10px] border-accent/20 text-accent/80 hover:bg-accent/5"
                          prefetch={false}
                        >
                          Cómo llegar
                        </CTAButton>
                      )}
                    </article>
                  </div>
                </div>
              </ScrollReveal>
            </Section>
          )}

          {isSectionEnabled("detalles") && (
            <Section 
              id="detalles"
              fineArt
              eyebrow="Faq"
              title="Información Útil"
              description="Detalles prácticos para vuestra comodidad durante la jornada"
              showDivider
            >
              <ScrollReveal>
                <div className="flex flex-col items-center">
                  <div className="mx-auto max-w-5xl w-full">
                    <PracticalList items={config.practicalItems} variant="strip" />
                  </div>
                </div>
              </ScrollReveal>
            </Section>
          )}

          {(isSectionEnabled("alojamiento") || isSectionEnabled("detalles")) && (
            <Section 
              id="experiencia"
              fineArt
              eyebrow="Vuestra Estancia"
              title="Guía Interactiva"
              description="Descubre los mejores rincones, dónde dormir y cómo prepararte para el gran día"
              showDivider
            >
              <ScrollReveal>
                <div className="flex flex-col items-center">
                  <div className="w-full">
                    <InteractiveExperience 
                      accommodations={accommodations.length > 0 ? accommodations : config.stayOptions}
                      practicalItems={config.practicalItems}
                      mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                      embedUrl={config.locationMapEmbedUrl}
                    />
                  </div>
                </div>
              </ScrollReveal>
            </Section>
          )}

          {isSectionEnabled("regalos") && (
            <Section 
              id="regalos"
              fineArt
              eyebrow="Detalle"
              title="Tu presencia es el mejor regalo"
              description="Pero si de todas formas queréis ayudarnos con nuestros proyectos, podéis hacerlo aquí. Gracias infinitas"
              showDivider
            >
              <ScrollReveal>
                <div className="flex flex-col items-center">
                  <div className="w-full">
                    <GiftList gifts={giftOptions} />
                  </div>
                </div>
              </ScrollReveal>
            </Section>
          )}

          {isSectionEnabled("asistencia") && (
            <Section 
              id="asistencia"
              fineArt
              eyebrow="RSVP"
              title="Confirma tu asistencia"
              description="Completa el formulario para confirmar que vienes."
            >
              <ScrollReveal>
                <div className="flex flex-col items-center">
                  <div className="mx-auto max-w-4xl w-full">
                    <div className="rounded-[var(--radius-card)] glass p-6 md:p-14 shadow-premium">
                      <RSVPForm
                        importantTitle={config.rsvpImportantTitle}
                        importantNotes={config.rsvpImportantNotes}
                        copy={config.rsvpForm}
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </Section>
          )}

          {/* Contacto final */}
          <Section 
            id="contacto"
            fineArt
            eyebrow="Contacto"
            title="¿Alguna duda?"
            description="Contacta con nosotros, estamos a vuestra disposición."
          >
            <ScrollReveal>
              <div className="flex flex-col items-center">

                <ul className="flex flex-col sm:flex-row gap-12 sm:gap-2 items-center sm:items-start justify-center w-full max-w-4xl">
                  <li className="flex flex-col gap-2 items-center sm:items-start flex-1 min-w-0">
                    <span className="font-script text-2xl text-accent/80">{config.locationEmailLabel}:</span>
                    <div className="flex flex-col gap-2 w-full text-center sm:text-left">
                      {config.contactEmail && (
                        <a href={`mailto:${config.contactEmail}`} className="font-serif italic text-lg text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">
                          {config.contactEmail}
                        </a>
                      )}
                      {config.contactEmail2 && (
                        <a href={`mailto:${config.contactEmail2}`} className="font-serif italic text-lg text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">
                          {config.contactEmail2}
                        </a>
                      )}
                    </div>
                  </li>
                  <li className="flex flex-col gap-2 items-center sm:items-start flex-1 sm:pl-8 sm:border-l border-accent/10 min-w-0">
                    <span className="font-script text-2xl text-accent/80">{config.locationPhoneLabel}:</span>
                    <div className="flex flex-col gap-2 w-full text-center sm:text-left">
                      {config.contactPhone && (
                        <a href={`tel:${config.contactPhone}`} className="font-serif italic text-lg text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">
                          {config.contactPhone}
                        </a>
                      )}
                      {config.contactPhone2 && (
                        <a href={`tel:${config.contactPhone2}`} className="font-serif italic text-lg text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">
                          {config.contactPhone2}
                        </a>
                      )}
                    </div>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </Section>
        </main>

        <Footer
          brandName={config.brandName}
          targetDate={config.noticeCountdownTarget}
        />
      </div>
    </SaveTheDateManager>
    
    <MobileBottomBar
      confirmHref="#asistencia"
      wedding={weddingMapUrl ? { name: config.weddingVenueName.trim() || "Boda", url: weddingMapUrl } : null}
      preboda={prebodaMapUrl ? { name: config.prebodaVenueName.trim() || "Preboda", url: prebodaMapUrl } : null}
      weddingVenueName={config.weddingVenueName.trim()}
      confirmLabel={config.mobileBar.confirmLabel}
      mapsLabel={config.mobileBar.mapsLabel}
      mapsModalCopy={config.mapsModal}
    />
    <SaveTheDateModal />
    </>
  );
}
