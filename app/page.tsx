import { CTAButton } from "@/components/CTAButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { Divider } from "@/components/Divider";
import { Section } from "@/components/Section";
import { RSVPForm } from "@/components/RSVPForm";
import { getPublicConfig } from "@/lib/getPublicConfig";
import type {
  FaqItem,
  PracticalItem,
  StayOption,
  TimelineItem,
} from "@/lib/publicContent";

type GiftOption = {
  title: string;
  description: string;
  action?: { label: string; href: string };
  details?: string[];
  hideDetails?: boolean;
};

function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="grid gap-6 md:grid-cols-2">
      {items.map((event) => (
        <li
          key={event.time}
          className="rounded-[var(--radius-card)] border border-border/80 bg-surface/80 p-4 shadow-[var(--shadow-soft)] sm:p-6"
        >
          <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.3em] text-muted">
        <span>{event.time} h</span>
          <span role="img" aria-hidden>
            {event.icon}
          </span>
          </div>
          <h3 className="mt-4 text-2xl font-semibold">{event.title}</h3>
          <p className="mt-3 text-sm text-muted">{event.description}</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-muted/80">
            {event.location}
          </p>
        </li>
      ))}
    </ol>
  );
}

function StayList({
  items,
  linkLabel,
}: {
  items: StayOption[];
  linkLabel: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((stay) => (
        <article
          key={stay.name}
          className="flex h-full flex-col rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 sm:p-6"
        >
          <header className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">{stay.name}</h3>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              {stay.distance}
            </span>
          </header>
          <p className="mt-4 text-sm text-muted">{stay.description}</p>
          <CTAButton
            href={stay.link}
            variant="ghost"
            className="mt-auto w-fit"
            prefetch={false}
          >
            {linkLabel}
          </CTAButton>
        </article>
      ))}
    </div>
  );
}

function GiftList({ gifts }: { gifts: GiftOption[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {gifts.map((gift) => (
        <article
          key={gift.title}
          className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 sm:p-6"
        >
          <h3 className="text-xl font-semibold">{gift.title}</h3>
          <p className="text-sm text-muted">{gift.description}</p>
          {gift.details &&
            (gift.hideDetails ? (
              <details className="rounded-xl border border-border/70 bg-accent/40 px-4 py-3 text-sm text-foreground/90">
                <summary className="cursor-pointer font-semibold uppercase tracking-[0.2em] text-muted">
                  Ver datos bancarios
                </summary>
                <ul className="mt-3 space-y-2">
                  {gift.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </details>
            ) : (
              <ul className="space-y-2 rounded-xl bg-accent/80 p-4 text-sm text-foreground/90">
                {gift.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ))}
          {gift.action && (
            <CTAButton href={gift.action.href} variant="outline" prefetch={false}>
              {gift.action.label}
            </CTAButton>
          )}
        </article>
      ))}
    </div>
  );
}

function PracticalList({ items }: { items: PracticalItem[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((item, index) => (
        <article
          key={`${item.title}-${index}`}
          className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 shadow-[var(--shadow-soft)] sm:p-6"
        >
          <span className="text-2xl" role="img" aria-hidden>
            {item.icon}
          </span>
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="text-sm text-muted">{item.description}</p>
        </article>
      ))}
    </div>
  );
}

function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      {items.map((item, index) => (
        <details
          key={`${item.question}-${index}`}
          className="rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-5 shadow-[var(--shadow-soft)]"
        >
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.2em] text-muted sm:tracking-[0.25em]">
            {item.question}
          </summary>
          <p className="mt-3 text-sm text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export default async function Home() {
  const config = await getPublicConfig();
  const prebodaMapUrl = config.prebodaMapUrl || config.locationMapUrl;
  const heroImages = (config.heroBackgroundImages ?? []).filter(
    (src) => typeof src === "string" && src.trim().length > 0,
  );
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
      title: config.giftsRegistryTitle,
      description: config.giftsRegistryDescription,
      action:
        config.giftLink.trim().length > 0
          ? { label: config.giftsRegistryCtaLabel, href: config.giftLink }
          : undefined,
    },
    {
      title: config.giftsBankTitle,
      description: config.giftsBankDescription,
      action: giftContactHref
        ? { label: giftContactLabel, href: giftContactHref }
        : undefined,
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
      href: `#${section.id}`,
    }));

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header
        brandName={config.brandName}
        navItems={navItems}
        ctaLabel={config.headerCtaLabel}
      />
      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)_+_84px)] sm:pb-0">
        <section className="relative">
          {heroImages.length > 0 ? (
            <HeroSlideshow images={heroImages} intervalMs={heroInterval} />
          ) : (
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(183,110,121,0.25),_transparent_55%),radial-gradient(circle_at_80%_10%,_rgba(241,223,215,0.8),_transparent_60%)]" />
          )}
          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-[calc(var(--spacing-section)*0.75)] sm:gap-10 sm:px-8 sm:py-[calc(var(--spacing-section)*1.2)]">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-muted sm:text-xs sm:tracking-[0.6em]">
              {config.heroEyebrow}
            </span>
            <h1 className="font-display text-[clamp(2.6rem,9vw,4.2rem)] font-semibold leading-[1.05] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-[clamp(3.5rem,10vw,6rem)]">
              {config.heroTitle}
            </h1>
            <p className="max-w-xl text-base text-foreground/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)] sm:text-lg">
              {config.heroDescription}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <CTAButton href="#asistencia" className="w-full sm:w-auto">
                {config.heroPrimaryCtaLabel}
              </CTAButton>
              <CTAButton href="#cronograma" variant="outline" className="w-full sm:w-auto">
                {config.heroSecondaryCtaLabel}
              </CTAButton>
            </div>
            <div className="mt-6 grid gap-6 rounded-[var(--radius-card)] border border-border/70 bg-surface/80 p-4 sm:grid-cols-3 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {config.heroStatDateLabel}
                </p>
                <p className="mt-2 text-lg font-semibold">{config.eventDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {config.heroStatLocationLabel}
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {config.locationName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {config.heroStatTimeLabel}
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {config.eventTimeRange}
                  {config.heroStatTimeNote
                    ? ` (${config.heroStatTimeNote})`
                    : ""}
                </p>
              </div>
            </div>
            {config.locationMapUrl && (
              <div className="flex flex-wrap gap-4">
                <CTAButton
                  href={config.locationMapUrl}
                  variant="ghost"
                  prefetch={false}
                >
                  {config.heroMapCtaLabel}
                </CTAButton>
              </div>
            )}
          </div>
        </section>
        <div className="py-6">
          <Divider />
        </div>

        {isSectionEnabled("preboda") && (
          <Section
            id="preboda"
            eyebrow={config.prebodaEyebrow}
            title={config.prebodaTitle}
            description={config.prebodaDescription}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 shadow-[var(--shadow-soft)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {config.prebodaCardOneLabel}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">
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
              <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 shadow-[var(--shadow-soft)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {config.prebodaCardTwoLabel}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">
                  {config.prebodaCardTwoTitle}
                </h3>
                <p className="mt-3 text-sm text-muted">
                  {config.prebodaCardTwoDescription}
                </p>
              </article>
            </div>
          </Section>
        )}

        {isSectionEnabled("ceremonia") && (
          <Section
            id="ceremonia"
            eyebrow={config.ceremonyEyebrow}
            title={config.ceremonyTitle}
            description={config.ceremonyDescription}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/80 p-4 shadow-[var(--shadow-soft)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {config.ceremonyCardOneLabel}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">
                  {config.ceremonyCardOneTitle}
                </h3>
                <p className="mt-3 text-sm text-muted">
                  {config.ceremonyCardOneDescription}
                </p>
              </article>
              <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/80 p-4 shadow-[var(--shadow-soft)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {config.ceremonyCardTwoLabel}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">
                  {config.ceremonyCardTwoTitle}
                </h3>
                <p className="mt-3 text-sm text-muted">
                  {config.ceremonyCardTwoDescription}
                </p>
              </article>
            </div>
          </Section>
        )}

        {isSectionEnabled("detalles") && (
          <Section
            id="detalles"
            eyebrow={config.practicalEyebrow}
            title={config.practicalTitle}
            description={config.practicalDescription}
          >
            <PracticalList items={config.practicalItems} />
          </Section>
        )}

        <div className="py-6">
          <Divider />
        </div>

        {isSectionEnabled("cronograma") && (
          <Section
            id="cronograma"
            eyebrow={config.timelineEyebrow}
            title={config.timelineTitle}
            description={config.timelineDescription}
            background="accent"
          >
            <Timeline items={config.timelineItems} />
          </Section>
        )}

        {isSectionEnabled("alojamiento") && (
          <Section
            id="alojamiento"
            eyebrow={config.stayEyebrow}
            title={config.stayTitle}
            description={config.stayDescription}
          >
            <StayList
              items={config.stayOptions}
              linkLabel={config.stayLinkLabel}
            />
          </Section>
        )}

        {isSectionEnabled("regalos") && (
          <Section
            id="regalos"
            eyebrow={config.giftsEyebrow}
            title={config.giftsTitle}
            description={config.giftsDescription}
            background="surface"
            align="center"
          >
            <GiftList gifts={giftOptions} />
          </Section>
        )}

        <div className="py-6">
          <Divider />
        </div>

        {isSectionEnabled("faq") && (
          <Section
            id="faq"
            eyebrow={config.faqEyebrow}
            title={config.faqTitle}
            description={config.faqDescription}
            align="center"
          >
            <FaqList items={config.faqItems} />
          </Section>
        )}

        {isSectionEnabled("asistencia") && (
          <Section
            id="asistencia"
            eyebrow={config.rsvpEyebrow}
            title={config.rsvpTitle}
            description={config.rsvpDescription}
            background="accent"
            align="center"
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-8 text-center shadow-[var(--shadow-soft)]">
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
                </a>{" "}
                {config.rsvpContactWhatsappLead}{" "}
                <a
                  href={config.whatsappLink || `tel:${config.contactPhone}`}
                  className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
                >
                  {config.contactPhone}
                </a>
                .
              </p>
            </div>
          </Section>
        )}

        {isSectionEnabled("ubicacion") && (
          <Section
            id="ubicacion"
            eyebrow={config.locationEyebrow}
            title={config.locationTitle}
            description={config.locationDescription}
            background="surface"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 shadow-[var(--shadow-soft)] sm:p-6">
                <h3 className="text-xl font-semibold">{config.locationName}</h3>
                <p className="mt-3 text-sm text-muted">
                  {config.locationAddress}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {config.locationMapUrl && (
                    <CTAButton
                      href={config.locationMapUrl}
                      variant="outline"
                      prefetch={false}
                    >
                      {config.locationMapLabel}
                    </CTAButton>
                  )}
                </div>
              </article>
              <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 shadow-[var(--shadow-soft)] sm:p-6">
                <h3 className="text-xl font-semibold">
                  {config.locationContactTitle}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  <li>
                    {config.locationEmailLabel}:{" "}
                    <a
                      href={`mailto:${config.contactEmail}`}
                      className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary"
                    >
                      {config.contactEmail}
                    </a>
                  </li>
                  <li>
                    {config.locationPhoneLabel}:{" "}
                    <a
                      href={`tel:${config.contactPhone}`}
                      className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary"
                    >
                      {config.contactPhone}
                    </a>
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
