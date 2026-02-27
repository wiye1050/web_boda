import { CTAButton } from "@/components/CTAButton";
import { Footer } from "@/components/Footer";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { Divider } from "@/components/Divider";
import { HeroFloatingGallery } from "@/components/HeroFloatingGallery";
import { Section } from "@/components/Section";
import { FadeIn } from "@/components/FadeIn";
import { TopBar } from "@/components/TopBar";
import { getPublicConfig } from "@/lib/getPublicConfig";
import { getAccommodations } from "@/lib/getAccommodations";
import dynamic from "next/dynamic";
import type { GiftOption } from "@/components/GiftList";

// Dynamic Imports for performance
const MobileBottomBar = dynamic(() => import("@/components/MobileBottomBar").then(mod => mod.MobileBottomBar));
const Countdown = dynamic(() => import("@/components/Countdown").then(mod => mod.Countdown));
const RSVPForm = dynamic(() => import("@/components/RSVPForm").then(mod => mod.RSVPForm));
const Timeline = dynamic(() => import("@/components/Timeline").then(mod => mod.Timeline));
const AddToCalendar = dynamic(() => import("@/components/AddToCalendar").then(mod => mod.AddToCalendar));
const MapboxMap = dynamic(() => import("@/components/MapboxMap").then(mod => mod.MapboxMap));

// Extracted components as dynamic imports
const StayList = dynamic(() => import("@/components/StayList").then(mod => mod.StayList));
const GiftList = dynamic(() => import("@/components/GiftList").then(mod => mod.GiftList));
const PracticalList = dynamic(() => import("@/components/PracticalList").then(mod => mod.PracticalList));
const FaqList = dynamic(() => import("@/components/FaqList").then(mod => mod.FaqList));


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
    // Fallback to a safe default if the fetch fails completely
    const { DEFAULT_PUBLIC_CONTENT } = await import("@/lib/publicContent");
    config = DEFAULT_PUBLIC_CONTENT;
    accommodations = config.stayOptions;
  }

  const prebodaMapUrl = config.prebodaMapsUrl?.trim() || config.prebodaMapUrl?.trim() || (config.prebodaPlace ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.prebodaPlace)}` : "");
  const weddingMapUrl = config.weddingMapsUrl?.trim() || config.locationMapUrl?.trim() || (config.locationName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.locationName + " " + (config.locationAddress || ""))}` : "");
  const heroImages = [
    "/hero-images/IMG-20180813-WA0013.jpg",
    "/hero-images/IMG-20220906-WA0027.jpg",
    "/hero-images/IMG_20200717_193506.jpg",
  ];
  const intervalMs = Number.parseInt(
    config.heroBackgroundIntervalMs ?? "8000",
    10,
  );
  const heroInterval = Number.isFinite(intervalMs) ? intervalMs : 8000;
  const hasPracticalItems = config.practicalItems.length > 0;
  const hasFaqItems = config.faqItems.length > 0;
  const weddingMapsUrl = config.weddingMapsUrl.trim();
  const prebodaMapsUrl = config.prebodaMapsUrl.trim();
  const giftContactHref = config.whatsappLink.trim().length > 0
    ? config.whatsappLink
    : config.contactPhone.trim().length > 0
      ? `tel:${config.contactPhone}`
      : "";
  const giftContactLabel =
    config.whatsappLink.trim().length > 0
      ? config.giftsContactWhatsappLabel
      : config.giftsContactPhoneLabel;

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
      case "faq":
        return hasFaqItems;
      case "cronograma":
        return config.timelineItems.length > 0;
      case "alojamiento":
        return config.stayOptions.length > 0;
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
    const section = config.sections.find((item) => item.id === sectionId);
    return Boolean(section?.enabled && sectionHasContent(sectionId));
  };

  const navItems = config.sections
    .filter((section) => section.enabled && section.nav)
    .filter((section) => sectionHasContent(section.id))
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      label: section.label.trim() || section.id,
      href: section.id === "media" ? "/media" : `#${section.id}`,
    }));
  const showNotice = true; // config.noticeEnabled && config.noticeText.trim().length > 0;
  
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
      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)_+_84px)] sm:pb-0">
        <HeroFloatingGallery
          config={{
            heroTitle: config.heroTitle,
            heroDescription: config.heroDescription,
            eventDate: config.eventDate || "12 de septiembre · 2026",
            eventTimeRange: config.eventTimeRange,
            locationName: config.locationName,
            locationAddress: config.locationAddress,
          }}
          localImages={heroImages}
        />
        <div className="py-6 hidden">
          <Divider />
        </div>

        {isSectionEnabled("preboda") && (
          <Section
            id="preboda"
            eyebrow={config.prebodaEyebrow}
            title={config.prebodaTitle}
            description={config.prebodaDescription}
            background="surface" // White
          >
          <FadeIn>
            <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
              {/* Tarjeta 1: Fecha y Hora */}
              <article className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-border/60 bg-surface p-6 text-center shadow-[var(--shadow-soft)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Fecha
                </p>
                <h3 className="mt-3 text-2xl font-display font-semibold">
                  {config.prebodaTime.replace(/\s*h\s*$/i, "")}
                </h3>
                <p className="mt-3 text-sm text-muted">
                  {config.prebodaCardOneDescription || "Un brindis para calentar motores."}
                </p>
              </article>

              {/* Tarjeta 2: Lugar */}
              <article className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-border/60 bg-surface p-6 text-center shadow-[var(--shadow-soft)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Lugar
                </p>
                <h3 className="mt-3 text-2xl font-display font-semibold">
                  {config.prebodaPlace}
                </h3>
                {prebodaMapUrl && (
                  <CTAButton
                    href={prebodaMapUrl}
                    variant="ghost"
                    className="mt-6 w-fit tracking-[0.2em] font-bold uppercase text-[10px]"
                    prefetch={false}
                  >
                    Cómo llegar
                  </CTAButton>
                )}
              </article>
            </div>
          </FadeIn>
          </Section>
        )}



        {isSectionEnabled("ubicacion") && (
          <Section
            id="ubicacion"
            eyebrow="La Boda"
            title="Cuándo y dónde"
            description={config.locationDescription}
            background="surface" // White
          >
            <FadeIn>
              {/* Bloque de Tarjetas: Fecha y Lugar (Estética unificada con Preboda) */}
              <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2 mb-8">
                {/* Tarjeta 1: Fecha y Hora */}
                <article className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-border/60 bg-surface p-6 text-center shadow-[var(--shadow-soft)] sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                    Fecha
                  </p>
                  <h3 className="mt-3 text-2xl font-display font-semibold">
                    12 de septiembre · 14:00
                  </h3>
                  <p className="mt-3 text-xs italic text-muted">
                    Se ruega puntualidad (procurad estar 15 min antes)
                  </p>
                </article>

                {/* Tarjeta 2: Lugar */}
                <article className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-border/60 bg-surface p-6 text-center shadow-[var(--shadow-soft)] sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                    Lugar
                  </p>
                  <h3 className="mt-3 text-2xl font-display font-semibold">
                    {config.locationName}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {config.locationAddress}
                  </p>
                  {weddingMapUrl && (
                    <CTAButton
                      href={weddingMapUrl}
                      variant="ghost"
                      className="mt-6 w-fit tracking-[0.2em] font-bold uppercase text-[10px]"
                      prefetch={false}
                    >
                      Cómo llegar
                    </CTAButton>
                  )}
                </article>
              </div>

              {/* Bloque de Contacto */}
              <article className="rounded-[var(--radius-card)] border border-border/60 bg-surface p-6 shadow-[var(--shadow-soft)] max-w-3xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6 overflow-hidden mt-8">
                <h3 className="text-xl font-display font-semibold m-0 text-center md:text-left flex-shrink-0">
                  {config.locationContactTitle}
                </h3>
                <ul className="mt-0 flex flex-col sm:flex-row gap-6 text-sm text-muted w-full sm:w-auto p-0 list-none m-0">
                    <li className="flex flex-col gap-1 items-center sm:items-start flex-1 min-w-0">
                      <span className="text-[10px] uppercase tracking-widest text-muted">{config.locationEmailLabel}:</span>
                      <div className="flex flex-col gap-1 w-full text-center sm:text-left">
                        {config.contactEmail && (
                          <a
                            href={`mailto:${config.contactEmail}`}
                            className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary truncate"
                          >
                            {config.contactEmail}
                          </a>
                        )}
                        {config.contactEmail2 && (
                          <a
                            href={`mailto:${config.contactEmail2}`}
                            className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary truncate"
                          >
                            {config.contactEmail2}
                          </a>
                        )}
                      </div>
                    </li>
                    <li className="flex flex-col gap-1 items-center sm:items-start flex-1 sm:pl-6 sm:border-l border-border/50 min-w-0">
                      <span className="text-[10px] uppercase tracking-widest text-muted">{config.locationPhoneLabel}:</span>
                      <div className="flex flex-col gap-1 w-full text-center sm:text-left">
                        {config.contactPhone && (
                          <a
                            href={`tel:${config.contactPhone}`}
                            className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary truncate"
                          >
                            {config.contactPhone}
                          </a>
                        )}
                        {config.contactPhone2 && (
                          <a
                            href={`tel:${config.contactPhone2}`}
                            className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary truncate"
                          >
                            {config.contactPhone2}
                          </a>
                        )}
                      </div>
                    </li>
                  </ul>
              </article>
            </FadeIn>
          </Section>
        )}

        {isSectionEnabled("detalles") && (
          <Section
            id="detalles"
            eyebrow={config.practicalEyebrow}
            title={config.practicalTitle}
            description={config.practicalDescription}
            background="default" // Beige
          >
            <FadeIn>
              <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
                {/* Lado Izquierdo: Notas del Evento */}
                <div className="flex flex-col gap-6">
                  <PracticalList 
                    variant="strip"
                    items={config.practicalItems}
                  />
                </div>

                {/* Lado Derecho: Mapa Interactivo */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent-soft/20 to-primary/10 rounded-[var(--radius-card)] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                  <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-border/40 shadow-[var(--shadow-soft)] h-[400px] lg:h-[450px]">
                    {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
                      <MapboxMap />
                    ) : config.locationMapEmbedUrl ? (
                      <iframe
                        src={config.locationMapEmbedUrl}
                        className="h-full w-full border-0 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        aria-label="Mapa con ubicaciones de la boda y preboda"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </FadeIn>
          </Section>
        )}

        {isSectionEnabled("alojamiento") && (
          <Section
            id="alojamiento"
            eyebrow={config.stayEyebrow}
            title={config.stayTitle}
            description={config.stayDescription}
            background="surface" // White
          >
            <FadeIn>
              <StayList
                items={accommodations.length > 0 ? accommodations.slice(0, 4) : config.stayOptions}
                linkLabel={config.stayLinkLabel}
                showViewAll={accommodations.length > 0 || config.stayOptions.length > 0}
              />
            </FadeIn>
          </Section>
        )}

        {isSectionEnabled("regalos") && (
          <Section
            id="regalos"
            eyebrow={config.giftsEyebrow}
            title={config.giftsTitle}
            description={config.giftsDescription}
            background="default" // Beige
            align="center"
          >
            <FadeIn>
              <GiftList gifts={giftOptions} />
            </FadeIn>
          </Section>
        )}

        <div className="py-6 hidden">
          <Divider />
        </div>

        {isSectionEnabled("faq") && (
          <Section
            id="faq"
            eyebrow={config.faqEyebrow}
            title={config.faqTitle}
            description={config.faqDescription}
            background="surface" // White
            align="center"
          >
            <FadeIn>
              <FaqList items={config.faqItems} />
            </FadeIn>
          </Section>
        )}

        {isSectionEnabled("asistencia") && (
          <Section
            id="asistencia"
            eyebrow={config.rsvpEyebrow}
            title={config.rsvpTitle}
            description={config.rsvpDescription}
            background="accent" // Light Gold
            align="center"
          >
            <FadeIn>
              <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-[var(--radius-card)] border border-border/40 bg-surface/80 p-8 text-center shadow-[var(--shadow-soft)] backdrop-blur-sm">
                <RSVPForm
                  importantTitle={config.rsvpImportantTitle}
                  importantNotes={config.rsvpImportantNotes}
                  copy={config.rsvpForm}
                />
                <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
                  {config.rsvpContactLead}{" "}
                  <a
                    href={`mailto:${config.contactEmail}`}
                    className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
                  >
                    {config.contactEmail}
                  </a>
                  {config.contactEmail2 && (
                    <>
                      {" · "}
                      <a
                        href={`mailto:${config.contactEmail2}`}
                        className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
                      >
                        {config.contactEmail2}
                      </a>
                    </>
                  )}{" "}
                  {config.rsvpContactWhatsappLead}{" "}
                  <a
                    href={config.whatsappLink || `tel:${config.contactPhone}`}
                    className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
                  >
                    {config.contactPhone}
                  </a>
                  {config.contactPhone2 && (
                    <>
                      {" · "}
                      <a
                        href={`tel:${config.contactPhone2}`}
                        className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
                      >
                        {config.contactPhone2}
                      </a>
                    </>
                  )}
                  .
                </p>
              </div>
            </FadeIn>
          </Section>
        )}


      </main>
      <Footer
        brandName={config.brandName}
        targetDate={config.noticeCountdownTarget}
      />
      <MobileBottomBar
        confirmHref="#asistencia"
        wedding={
          weddingMapsUrl
            ? {
                name: config.weddingVenueName.trim() || "Boda",
                url: weddingMapsUrl,
              }
            : null
        }
        preboda={
          prebodaMapsUrl
            ? {
                name: config.prebodaVenueName.trim() || "Preboda",
                url: prebodaMapsUrl,
              }
            : null
        }
        weddingVenueName={config.weddingVenueName.trim()}
        confirmLabel={config.mobileBar.confirmLabel}
        mapsLabel={config.mobileBar.mapsLabel}
        mapsModalCopy={config.mapsModal}
      />
    </div>
  );
}

