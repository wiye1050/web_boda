import { CTAButton } from "@/components/CTAButton";
import { Footer } from "@/components/Footer";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { Divider } from "@/components/Divider";
import { HeroFloatingGallery } from "@/components/HeroFloatingGallery";
import { Section } from "@/components/Section";
import { FadeIn } from "@/components/FadeIn";
import { TopBar } from "@/components/TopBar";
import { getPublicConfig } from "@/lib/getPublicConfig";
import dynamic from "next/dynamic";
import type { GiftOption } from "@/components/GiftList";

// Dynamic Imports for performance
const MobileBottomBar = dynamic(() => import("@/components/MobileBottomBar").then(mod => mod.MobileBottomBar));
const Countdown = dynamic(() => import("@/components/Countdown").then(mod => mod.Countdown));
const RSVPForm = dynamic(() => import("@/components/RSVPForm").then(mod => mod.RSVPForm));
const Timeline = dynamic(() => import("@/components/Timeline").then(mod => mod.Timeline));
const AddToCalendar = dynamic(() => import("@/components/AddToCalendar").then(mod => mod.AddToCalendar));

// Extracted components as dynamic imports
const StayList = dynamic(() => import("@/components/StayList").then(mod => mod.StayList));
const GiftList = dynamic(() => import("@/components/GiftList").then(mod => mod.GiftList));
const PracticalList = dynamic(() => import("@/components/PracticalList").then(mod => mod.PracticalList));
const FaqList = dynamic(() => import("@/components/FaqList").then(mod => mod.FaqList));


export default async function Home() {
  let config;
  try {
    config = await getPublicConfig();
  } catch (error) {
    console.error("Critical error fetching public config:", error);
    // Fallback to a safe default if the fetch fails completely
    const { DEFAULT_PUBLIC_CONTENT } = await import("@/lib/publicContent");
    config = DEFAULT_PUBLIC_CONTENT;
  }

  const prebodaMapUrl = config.prebodaMapUrl || config.locationMapUrl; /* DYNAMIC IMAGES (Floating Hero) */
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
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-[var(--radius-card)] border border-border/40 bg-background/50 p-4 shadow-[var(--shadow-soft)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {config.prebodaCardOneLabel}
                </p>
                <h3 className="mt-3 text-2xl font-display font-semibold">
                  {config.prebodaTime}
                </h3>
                <p className="mt-3 text-sm text-muted">
                  {config.prebodaPlace}. {config.prebodaCardOneDescription}
                </p>
                {prebodaMapUrl && (
                  <CTAButton
                    href={prebodaMapUrl}
                    variant="ghost"
                    className="mt-6 w-fit"
                    prefetch={false}
                  >
                    {config.prebodaCardOneCtaLabel}
                  </CTAButton>
                )}
              </article>
              <article className="rounded-[var(--radius-card)] border border-border/40 bg-background/50 p-4 shadow-[var(--shadow-soft)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {config.prebodaCardTwoLabel}
                </p>
                <h3 className="mt-3 text-2xl font-display font-semibold">
                  {config.prebodaCardTwoTitle}
                </h3>
                <p className="mt-3 text-sm text-muted">
                  {config.prebodaCardTwoDescription}
                </p>
              </article>
            </div>
          </FadeIn>
          </Section>
        )}



        {isSectionEnabled("ubicacion") && (
          <Section
            id="ubicacion"
            eyebrow={config.locationEyebrow}
            title={config.locationTitle}
            description={config.locationDescription}
            background="surface" // White
          >
            <FadeIn>
              {config.locationMapEmbedUrl && (
                <div className="mb-6 overflow-hidden rounded-[var(--radius-card)] border border-border/40 shadow-[var(--shadow-soft)]">
                  <iframe
                    src={config.locationMapEmbedUrl}
                    className="h-[360px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    aria-label="Mapa con ubicaciones de la boda y preboda"
                  />
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                <article className="rounded-[var(--radius-card)] border border-border/40 bg-background/50 p-4 shadow-[var(--shadow-soft)] sm:p-6">
                  <h3 className="text-xl font-display font-semibold">{config.locationName}</h3>
                  <p className="mt-3 text-sm text-muted">
                    {config.locationAddress}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {config.locationMapUrl && (
                      <CTAButton
                        href={config.locationMapUrl}
                        variant="primary"
                        prefetch={false}
                      >
                        {config.locationMapLabel}
                      </CTAButton>
                    )}
                  </div>
                </article>
                <article className="rounded-[var(--radius-card)] border border-border/40 bg-background/50 p-4 shadow-[var(--shadow-soft)] sm:p-6">
                  <h3 className="text-xl font-display font-semibold">
                    {config.locationContactTitle}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted">
                    <li className="flex flex-col gap-1">
                      <span>{config.locationEmailLabel}:</span>
                      <div className="flex flex-wrap gap-2">
                        {config.contactEmail && (
                          <a
                            href={`mailto:${config.contactEmail}`}
                            className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary"
                          >
                            {config.contactEmail}
                          </a>
                        )}
                        {config.contactEmail2 && (
                          <a
                            href={`mailto:${config.contactEmail2}`}
                            className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary"
                          >
                            {config.contactEmail2}
                          </a>
                        )}
                      </div>
                    </li>
                    <li className="flex flex-col gap-1">
                      <span>{config.locationPhoneLabel}:</span>
                      <div className="flex flex-wrap gap-2">
                        {config.contactPhone && (
                          <a
                            href={`tel:${config.contactPhone}`}
                            className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary"
                          >
                            {config.contactPhone}
                          </a>
                        )}
                        {config.contactPhone2 && (
                          <a
                            href={`tel:${config.contactPhone2}`}
                            className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
                          >
                            {config.contactPhone2}
                          </a>
                        )}
                      </div>
                    </li>
                    {config.whatsappLink && (
                      <li>
                        {config.locationWhatsappLabel}:{" "}
                        <a
                          href={config.whatsappLink}
                          className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary"
                        >
                          {config.locationWhatsappActionLabel}
                        </a>
                      </li>
                    )}
                  </ul>
                </article>
              </div>

              {(config.weddingMapsUrl || config.prebodaMapsUrl) && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {config.weddingMapsUrl && (
                    <article className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-primary/20 bg-primary/5 p-4 text-foreground">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                        Boda (principal)
                      </p>
                      <p className="text-sm text-muted">Ceremonia y banquete</p>
                      <CTAButton
                        href={config.weddingMapsUrl}
                        variant="primary"
                        className="w-full sm:w-auto"
                        prefetch={false}
                      >
                        Abrir mapa boda
                      </CTAButton>
                    </article>
                  )}
                  {config.prebodaMapsUrl && (
                    <article className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border/40 bg-background/50 p-4 text-foreground">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                        Preboda
                      </p>
                      <p className="text-sm text-muted">
                        Evento del día anterior (no es la ubicación de la boda)
                      </p>
                      <CTAButton
                        href={config.prebodaMapsUrl}
                        variant="outline"
                        className="w-full sm:w-auto"
                        prefetch={false}
                      >
                        Abrir mapa preboda
                      </CTAButton>
                    </article>
                  )}
                </div>
              )}
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
              <PracticalList 
                variant="strip"
                items={config.practicalItems}
              />
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
                items={config.stayOptions}
                linkLabel={config.stayLinkLabel}
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
        eyebrow={config.footerEyebrow}
        title={config.footerTitle}
        ctaLabel={config.footerCtaLabel}
        copyright={config.footerCopyright}
        madeWith={config.footerMadeWith}
        brandName={config.brandName}
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

