import { CTAButton } from "./CTAButton";

type FooterProps = {
  eyebrow?: string;
  title?: string;
  ctaLabel?: string;
  copyright?: string;
  madeWith?: string;
  brandName?: string;
};

const currentYear = new Date().getFullYear();

function formatFooterText({
  text,
  brandName,
}: {
  text: string;
  brandName: string;
}) {
  return text
    .replace("{year}", String(currentYear))
    .replace("{brandName}", brandName);
}

export function Footer({
  eyebrow = "Nos vemos en el gran día",
  title = "Gracias por acompañarnos en esta celebración",
  ctaLabel = "Confirmar asistencia",
  copyright = "© {year} {brandName}. Todos los derechos reservados.",
  madeWith = "Hecho con amor usando Next.js, Vercel y Firebase.",
  brandName = "Alba & Guille",
}: FooterProps) {
  const formattedCopyright = formatFooterText({ text: copyright, brandName });

  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
              {eyebrow}
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              {title}
            </h3>
          </div>
          <CTAButton href="#rsvp" variant="outline">
            {ctaLabel}
          </CTAButton>
        </div>
        <div className="flex flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>{formattedCopyright}</span>
          <span>{madeWith}</span>
        </div>
      </div>
    </footer>
  );
}
