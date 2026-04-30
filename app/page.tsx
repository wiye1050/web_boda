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
  const weddingMapsUrl = config.weddingMapsUrl?.trim();
  const prebodaMapsUrl = config.prebodaMapsUrl?.trim();

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

        <main className="flex-1 pb-12 sm:pb-0">
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
              eyebrow={config.prebodaEyebrow}
              title={config.prebodaTitle}
              description={config.prebodaDescription}
            >
            <ScrollReveal>
              <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
                <article className="flex flex-col items-center justify-center rounded-[2.5rem] glass p-6 text-center sm:p-10">
                  <p className="text-editorial">Fecha</p>
                  <h3 className="mt-4 text-3xl font-serif font-medium">
                    {config.prebodaTime.replace(/\s*h\s*$/i, "")}
                  </h3>
                  <p className="mt-4 text-sm text-foreground/70 leading-relaxed italic">
                    &ldquo;{config.prebodaCardOneDescription || "Un brindis para calentar motores."}&rdquo;
                  </p>
                </article>

                <article className="flex flex-col items-center justify-center rounded-[2.5rem] glass p-6 text-center sm:p-10">
                  <p className="text-editorial">Lugar</p>
                  <h3 className="mt-4 text-3xl font-serif font-medium">{config.prebodaPlace}</h3>
                  {config.prebodaAddress && (
                    <p className="mt-2 text-sm text-foreground/60">{config.prebodaAddress}</p>
                  )}
                  {prebodaMapUrl && (
                    <CTAButton
                      href={prebodaMapUrl}
                      variant="ghost"
                      className="mt-8 w-fit tracking-[0.25em] font-bold uppercase text-[10px] border-accent/30 text-accent"
                      prefetch={false}
                    >
                      Cómo llegar
                    </CTAButton>
                  )}
                </article>
              </div>
            </ScrollReveal>
            </Section>
          )}

          {isSectionEnabled("ubicacion") && (
            <Section
              id="ubicacion"
              eyebrow="La Boda"
              title="Cuándo y dónde"
              description={config.locationDescription}
            >
              <ScrollReveal>
                <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 mb-12">
                  <article className="flex flex-col items-center justify-center rounded-[2.5rem] glass p-6 text-center sm:p-10">
                    <p className="text-editorial">La Ceremonia</p>
                    <h3 className="mt-4 text-3xl font-serif font-medium">
                      {config.eventDate.split("·")[0].trim().toUpperCase()} · {config.ceremonyTime}
                    </h3>
                    <p className="mt-4 text-[13px] md:text-sm italic text-accent font-medium tracking-wide">Se ruega puntualidad</p>
                  </article>

                  <article className="flex flex-col items-center justify-center rounded-[2.5rem] glass p-6 text-center sm:p-10">
                    <p className="text-editorial">El Lugar</p>
                    <h3 className="mt-4 text-3xl font-serif font-medium">{config.locationName}</h3>
                    <p className="mt-2 text-sm text-foreground/60">{config.locationAddress}</p>
                    {weddingMapUrl && (
                      <CTAButton
                        href={weddingMapUrl}
                        variant="ghost"
                        className="mt-8 w-fit tracking-[0.25em] font-bold uppercase text-[10px] border-accent/30 text-accent"
                        prefetch={false}
                      >
                        Cómo llegar
                      </CTAButton>
                    )}
                  </article>
                </div>

                <div className="rounded-[2.5rem] glass p-6 sm:p-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mt-12 overflow-hidden">
                  <h3 className="text-2xl font-serif font-medium m-0 text-center md:text-left flex-shrink-0">
                    {config.locationContactTitle}
                  </h3>
                  <ul className="mt-0 flex flex-col sm:flex-row gap-8 text-sm text-foreground/70 w-full sm:u-auto p-0 list-none m-0">
                      <li className="flex flex-col gap-2 items-center sm:items-start flex-1 min-w-0">
                        <span className="text-editorial">{config.locationEmailLabel}:</span>
                        <div className="flex flex-col gap-2 w-full text-center sm:text-left">
                          {config.contactEmail && (
                            <a href={`mailto:${config.contactEmail}`} className="font-medium text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">
                              {config.contactEmail}
                            </a>
                          )}
                          {config.contactEmail2 && (
                            <a href={`mailto:${config.contactEmail2}`} className="font-medium text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">
                              {config.contactEmail2}
                            </a>
                          )}
                        </div>
                      </li>
                      <li className="flex flex-col gap-2 items-center sm:items-start flex-1 sm:pl-8 sm:border-l border-foreground/10 min-w-0">
                        <span className="text-editorial">{config.locationPhoneLabel}:</span>
                        <div className="flex flex-col gap-2 w-full text-center sm:text-left">
                          {config.contactPhone && (
                            <a href={`tel:${config.contactPhone}`} className="font-medium text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">
                              {config.contactPhone}
                            </a>
                          )}
                          {config.contactPhone2 && (
                            <a href={`tel:${config.contactPhone2}`} className="font-medium text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">
                              {config.contactPhone2}
                            </a>
                          )}
                        </div>
                      </li>
                    </ul>
                </div>
              </ScrollReveal>
            </Section>
          )}

          {(isSectionEnabled("detalles") || isSectionEnabled("alojamiento")) && (
            <Section
              id="detalles"
              eyebrow={config.practicalEyebrow || "Cosas Prácticas"}
              title={config.practicalTitle || "Planifica tu estancia"}
              description={config.practicalDescription || "Todo lo que necesitas para disfrutar del Bierzo."}
            >
              <ScrollReveal>
                <InteractiveExperience 
                  accommodations={accommodations.length > 0 ? accommodations : config.stayOptions}
                  practicalItems={config.practicalItems}
                  mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                  embedUrl={config.locationMapEmbedUrl}
                />
              </ScrollReveal>
            </Section>
          )}

          {isSectionEnabled("regalos") && (
            <Section
              id="regalos"
              eyebrow={config.giftsEyebrow}
              title={config.giftsTitle}
              description={config.giftsDescription}
              align="center"
            >
              <ScrollReveal>
                <GiftList gifts={giftOptions} />
              </ScrollReveal>
            </Section>
          )}

          {isSectionEnabled("asistencia") && (
            <Section
              id="asistencia"
              eyebrow={config.rsvpEyebrow}
              title={config.rsvpTitle}
              description={config.rsvpDescription}
              align="center"
            >
              <ScrollReveal>
                <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 rounded-[3rem] glass p-8 md:p-12 text-center shadow-premium">
                  <RSVPForm
                    importantTitle={config.rsvpImportantTitle}
                    importantNotes={config.rsvpImportantNotes}
                    copy={config.rsvpForm}
                  />
                  <div className="w-full h-px bg-foreground/5" />
                  <p className="mx-auto max-w-2xl text-xs sm:text-sm text-foreground/60 leading-relaxed font-light">
                    {config.rsvpContactLead}{" "}
                    <a href={`mailto:${config.contactEmail}`} className="font-semibold text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">
                      {config.contactEmail}
                    </a>
                    {config.contactEmail2 && (
                      <> · <a href={`mailto:${config.contactEmail2}`} className="font-semibold text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">{config.contactEmail2}</a></>
                    )}{" "}
                    {config.rsvpContactWhatsappLead}{" "}
                    <a href={config.whatsappLink || `tel:${config.contactPhone}`} className="font-semibold text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">
                      {config.contactPhone}
                    </a>
                    {config.contactPhone2 && (
                      <> · <a href={`tel:${config.contactPhone2}`} className="font-semibold text-foreground underline decoration-accent/30 underline-offset-4 hover:text-accent transition-colors">{config.contactPhone2}</a></>
                    )}.
                  </p>
                </div>
              </ScrollReveal>
            </Section>
          )}
        </main>

        <Footer
          brandName={config.brandName}
          targetDate={config.noticeCountdownTarget}
        />
      </div>
    </SaveTheDateManager>
    
    <MobileBottomBar
      confirmHref="#asistencia"
      wedding={weddingMapsUrl ? { name: config.weddingVenueName.trim() || "Boda", url: weddingMapsUrl } : null}
      preboda={prebodaMapsUrl ? { name: config.prebodaVenueName.trim() || "Preboda", url: prebodaMapsUrl } : null}
      weddingVenueName={config.weddingVenueName.trim()}
      confirmLabel={config.mobileBar.confirmLabel}
      mapsLabel={config.mobileBar.mapsLabel}
      mapsModalCopy={config.mapsModal}
    />
    <SaveTheDateModal />
    </>
  );
}
