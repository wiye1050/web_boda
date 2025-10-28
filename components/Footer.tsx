import { CTAButton } from "./CTAButton";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
              Nos vemos en el gran día
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              Gracias por acompañarnos en esta celebración
            </h3>
          </div>
          <CTAButton href="#rsvp" variant="outline">
            Confirmar asistencia
          </CTAButton>
        </div>
        <div className="flex flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {currentYear} Alba & Guille. Todos los derechos reservados.</span>
          <span>Hecho con amor usando Next.js, Vercel y Firebase.</span>
        </div>
      </div>
    </footer>
  );
}
