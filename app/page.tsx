"use client";

import { CTAButton } from "@/components/CTAButton";
import { Footer } from "@/components/Footer";
import { HeroRedesign } from "@/components/HeroRedesign";
import { Section } from "@/components/Section";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TopBar } from "@/components/TopBar";
import { getPublicConfig } from "@/lib/getPublicConfig";
import { getAccommodations } from "@/lib/getAccommodations";
import dynamic from "next/dynamic";
import type { GiftOption } from "@/components/GiftList";
import { useState, useEffect, Suspense } from "react";
import { Map as MapIcon, MousePointer2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamic Imports for performance
const MobileBottomBar = dynamic(() => import("@/components/MobileBottomBar").then(mod => mod.MobileBottomBar));
const RSVPForm = dynamic(() => import("@/components/RSVPForm").then(mod => mod.RSVPForm));
const MapboxMap = dynamic(() => import("@/components/MapboxMap").then(mod => mod.MapboxMap));

// Extracted components as dynamic imports
const StayList = dynamic(() => import("@/components/StayList").then(mod => mod.StayList));
const GiftList = dynamic(() => import("@/components/GiftList").then(mod => mod.GiftList));
const PracticalList = dynamic(() => import("@/components/PracticalList").then(mod => mod.PracticalList));


export default function Home() {
  const [isMapActive, setIsMapActive] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [configRes, accommodationsRes] = await Promise.all([
          getPublicConfig(),
          getAccommodations(),
        ]);
        setConfig(configRes);
        setAccommodations(accommodationsRes);
      } catch (error) {
        console.error("Critical error fetching data:", error);
        const { DEFAULT_PUBLIC_CONTENT } = await import("@/lib/publicContent");
        setConfig(DEFAULT_PUBLIC_CONTENT);
        setAccommodations(DEFAULT_PUBLIC_CONTENT.stayOptions);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !config) return null;

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
      hideDetails: false,
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

  const navItems = config.sections
    .filter((section: any) => section.enabled && section.nav)
    .filter((section: any) => sectionHasContent(section.id))
    .sort((a: any, b: any) => a.order - b.order)
    .map((section: any) => ({
      label: section.label.trim() || section.id,
      href: section.id === "media" ? "/media" : `#${section.id}`,
    }));

  const showNotice = true;
  
  return (
    <div id="top" className="flex min-h-screen flex-col">
      {showNotice && (
        <TopBar
          brandName={config.brandName}
          navItems={navItems}
          ctaLabel={config.headerCtaLabel}
          config={{
            noticeText: config.noticeText,
            noticeCountdownTarget: config.noticeCountdownTarget,
          }}
        />
      )}
      <main className="flex-1 pb-12 sm:pb-0">
        <HeroRedesign
          config={{
            heroTitle: config.heroTitle,
            heroDescription: config.heroDescription,
            eventDate: config.eventDate || "12 de septiembre · 2026",
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
              <article className="flex flex-col items-center justify-center rounded-[2.5rem] glass p-8 text-center sm:p-10">
                <p className="text-editorial">Fecha</p>
                <h3 className="mt-4 text-3xl font-serif font-medium">
                  {config.prebodaTime.replace(/\s*h\s*$/i, "")}
                </h3>
                <p className="mt-4 text-sm text-foreground/60 leading-relaxed italic">
                  &ldquo;{config.prebodaCardOneDescription || "Un brindis para calentar motores."}&rdquo;
                </p>
              </article>

              <article className="flex flex-col items-center justify-center rounded-[2.5rem] glass p-8 text-center sm:p-10">
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
                <article className="flex flex-col items-center justify-center rounded-[2.5rem] glass p-8 text-center sm:p-10">
                  <p className="text-editorial">La Ceremonia</p>
                  <h3 className="mt-4 text-3xl font-serif font-medium">12 SEPT · 14:00</h3>
                  <p className="mt-4 text-xs italic text-accent font-medium tracking-wide">Se ruega puntualidad</p>
                </article>

                <article className="flex flex-col items-center justify-center rounded-[2.5rem] glass p-8 text-center sm:p-10">
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

              <div className="rounded-[2.5rem] glass p-8 sm:p-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mt-12 overflow-hidden">
                <h3 className="text-2xl font-serif font-medium m-0 text-center md:text-left flex-shrink-0">
                  {config.locationContactTitle}
                </h3>
                <ul className="mt-0 flex flex-col sm:flex-row gap-8 text-sm text-foreground/70 w-full sm:w-auto p-0 list-none m-0">
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

        {isSectionEnabled("detalles") && (
          <Section
            id="detalles"
            eyebrow={config.practicalEyebrow}
            title={config.practicalTitle}
            description={config.practicalDescription}
          >
            <ScrollReveal>
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
                <div className="flex flex-col gap-6">
                  <PracticalList variant="strip" items={config.practicalItems} />
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-accent/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                  <div className="relative overflow-hidden rounded-[2.5rem] glass shadow-premium h-[420px] lg:h-[500px]">
                    {!isMapActive && (
                      <div 
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[2px] cursor-pointer group/shield"
                        onClick={() => setIsMapActive(true)}
                      >
                        <div className="flex flex-col items-center gap-4 rounded-3xl glass px-8 py-6 shadow-2xl group-hover/shield:scale-105 transition-transform duration-500">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                            <MapIcon className="h-7 w-7" />
                          </div>
                          <div className="text-center">
                            <p className="text-base font-medium text-foreground">Mapa Interactivo</p>
                            <p className="text-xs text-foreground/50 flex items-center justify-center gap-1.5 mt-1">
                              <MousePointer2 className="h-3 w-3" /> Toca para explorar
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {isMapActive && (
                      <button 
                        onClick={() => setIsMapActive(false)}
                        className="absolute top-6 left-6 z-20 flex h-12 w-12 items-center justify-center rounded-full glass shadow-lg hover:scale-110 transition-all text-foreground"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    )}
                    <div className={cn("h-full w-full", !isMapActive && "pointer-events-none opacity-60 grayscale-[50%]")}>
                      <Suspense fallback={<div className="h-full w-full bg-muted animate-pulse" />}>
                        {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
                          <MapboxMap />
                        ) : config.locationMapEmbedUrl ? (
                          <iframe
                            src={config.locationMapEmbedUrl}
                            className="h-full w-full border-0 transition-opacity duration-700"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        ) : null}
                      </Suspense>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </Section>
        )}

        {isSectionEnabled("alojamiento") && (
          <Section
            id="alojamiento"
            eyebrow={config.stayEyebrow}
            title={config.stayTitle}
            description={config.stayDescription}
          >
            <ScrollReveal>
              <StayList
                items={accommodations.length > 0 ? accommodations.slice(0, 4) : config.stayOptions}
                linkLabel={config.stayLinkLabel}
                showViewAll={accommodations.length > 0 || config.stayOptions.length > 0}
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
                <div className="px-6 py-2 glass rounded-full inline-block bg-white/40">
                  <p className="text-[10px] md:text-xs text-accent font-medium italic tracking-wide">
                    Si tenéis pensado traer niños, por favor indicádnoslo en los comentarios.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </Section>
        )}
      </main>

      <Footer
        brandName={config.brandName}
        targetDate={config.noticeCountdownTarget}
      />

      <MobileBottomBar
        confirmHref="#asistencia"
        wedding={weddingMapsUrl ? { name: config.weddingVenueName.trim() || "Boda", url: weddingMapsUrl } : null}
        preboda={prebodaMapsUrl ? { name: config.prebodaVenueName.trim() || "Preboda", url: prebodaMapsUrl } : null}
        weddingVenueName={config.weddingVenueName.trim()}
        confirmLabel={config.mobileBar.confirmLabel}
        mapsLabel={config.mobileBar.mapsLabel}
        mapsModalCopy={config.mapsModal}
      />
    </div>
  );
}
