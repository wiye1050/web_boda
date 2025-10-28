import Link from "next/link";
import { CTAButton } from "./CTAButton";

const NAV_ITEMS = [
  { label: "Preboda", href: "#preboda" },
  { label: "La boda", href: "#ceremonia" },
  { label: "Cronograma", href: "#cronograma" },
  { label: "Alojamiento", href: "#alojamiento" },
  { label: "Regalos", href: "#regalos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link
          href="#top"
          className="font-display text-sm font-semibold uppercase tracking-[0.6em] text-foreground transition-colors hover:text-primary"
        >
          Alba & Guille
        </Link>
        <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.3em] text-muted sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <CTAButton href="#rsvp" className="hidden sm:inline-flex">
          Confirmar asistencia
        </CTAButton>
      </div>
      <nav className="sm:hidden">
        <div className="mx-auto flex w-full max-w-6xl gap-5 overflow-x-auto px-6 pb-4 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-muted">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
