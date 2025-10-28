import { CTAButton } from "@/components/CTAButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Section } from "@/components/Section";
import { RSVPForm } from "@/components/RSVPForm";
import { getPublicConfig } from "@/lib/getPublicConfig";

const TIMELINE = [
  {
    time: "13:30",
    title: "Bienvenida & aperitivo",
    description:
      "Abrimos puertas con vermú y tapas locales para que puedas acomodarte con calma.",
    location: "Patio de recepción, Finca El Casar",
    icon: "🍹",
  },
  {
    time: "14:15",
    title: "Ceremonia civil",
    description:
      "Celebramos nuestra unión al aire libre. Tendremos música en directo y lectura de votos.",
    location: "Jardín principal",
    icon: "💍",
  },
  {
    time: "16:00",
    title: "Banquete bajo el sol",
    description:
      "Menú de temporada con guiños bercianos. Avisadnos intolerancias o alergias en el formulario.",
    location: "Carpa acristalada",
    icon: "🍽️",
  },
  {
    time: "20:00",
    title: "Atardecer & fiesta",
    description:
      "Pista de baile con DJ, barra libre y sorpresas. Preparad vuestras canciones favoritas.",
    location: "Sala el Mirador",
    icon: "🕺",
  },
  {
    time: "00:30",
    title: "Recena y despedida",
    description:
      "Food trucks dulces y salados para recargar energías antes de volver a casa. La música baja sobre las 02:00.",
    location: "Terraza exterior",
    icon: "🌙",
  },
];

const STAY_OPTIONS = [
  {
    name: "Hotel AC Ponferrada",
    description: "Moderno y céntrico, ideal si quieres explorar la ciudad a pie.",
    distance: "10 minutos en coche",
    link: "https://maps.app.goo.gl/",
  },
  {
    name: "The Rock Suites & Spa",
    description:
      "Habitaciones amplias, spa y desayuno hasta tarde para recuperarse de la fiesta.",
    distance: "12 minutos en coche",
    link: "https://maps.app.goo.gl/",
  },
  {
    name: "Casa Rural Lago de Carucedo",
    description: "Opción tranquila en plena naturaleza, perfecta para grupos.",
    distance: "18 minutos en coche",
    link: "https://maps.app.goo.gl/",
  },
];

type GiftOption = {
  title: string;
  description: string;
  action?: { label: string; href: string };
  details?: string[];
};

function Timeline() {
  return (
    <ol className="grid gap-6 md:grid-cols-2">
      {TIMELINE.map((event) => (
        <li
          key={event.time}
          className="rounded-[var(--radius-card)] border border-border/80 bg-surface/80 p-6 shadow-[var(--shadow-soft)]"
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

function StayList() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {STAY_OPTIONS.map((stay) => (
        <article
          key={stay.name}
          className="flex h-full flex-col rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-6"
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
            Ver mapa
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
          className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-6"
        >
          <h3 className="text-xl font-semibold">{gift.title}</h3>
          <p className="text-sm text-muted">{gift.description}</p>
          {gift.details && (
            <ul className="space-y-2 rounded-xl bg-accent/80 p-4 text-sm text-foreground/90">
              {gift.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          )}
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

export default async function Home() {
  const config = await getPublicConfig();

  const giftOptions: GiftOption[] = [
    {
      title: "Mesa de regalos",
      description:
        "Seleccionamos algunos detalles para nuestro nuevo hogar. ¡Gracias por ayudarnos a elegir!",
      action:
        config.giftLink.trim().length > 0
          ? { label: "Ver mesa online", href: config.giftLink }
          : undefined,
    },
    {
      title: "Transferencia bancaria",
      description:
        "Si prefieres hacer un regalo en efectivo, déjanos tu cariño en nuestra cuenta.",
      details: [
        `Titulares: ${config.bankHolder}`,
        `IBAN: ${config.bankIban}`,
      ],
    },
  ];

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,_rgba(183,110,121,0.25),_transparent_55%),radial-gradient(circle_at_80%_10%,_rgba(241,223,215,0.8),_transparent_60%)]" />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-[calc(var(--spacing-section)*1.2)] sm:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.6em] text-muted">
              Ponferrada · 2025
            </span>
            <h1 className="font-display text-[clamp(3.5rem,10vw,6rem)] font-semibold leading-[1.05]">
              Alba &amp; Guille
            </h1>
            <p className="max-w-xl text-base text-muted">
              El {config.eventDate} nos damos el sí en {config.locationName}. La
              celebración empieza con el aperitivo del mediodía y se alarga hasta
              la madrugada. El día previo nos vemos en la preboda para brindar con
              vistas a Ponferrada.
            </p>
            <div className="flex flex-wrap gap-4">
              <CTAButton href="#rsvp">Confirmar asistencia</CTAButton>
              <CTAButton href="#cronograma" variant="outline">
                Ver cronograma
              </CTAButton>
            </div>
            <div className="mt-6 grid gap-6 rounded-[var(--radius-card)] border border-border/70 bg-surface/80 p-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Fecha
                </p>
                <p className="mt-2 text-lg font-semibold">{config.eventDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Lugar
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {config.locationName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Horario
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {config.eventTimeRange} (adultos únicamente)
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
                  Ver ubicación de la finca
                </CTAButton>
              </div>
            )}
          </div>
        </section>

        <Section
          id="preboda"
          eyebrow="Preboda"
          title="Nos vemos el día antes en el Casino Rooftop"
          description="Nos encantaría brindar contigo la víspera de la boda. Será un encuentro relajado para recibir a quienes llegan antes y ponernos al día."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-6 shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Cuándo y dónde
              </p>
              <h3 className="mt-3 text-2xl font-semibold">
                {config.prebodaTime}
              </h3>
              <p className="mt-3 text-sm text-muted">
                {config.prebodaPlace}. Confirma tu asistencia en el formulario
                para que sepamos cuántos brindaremos en el rooftop.
              </p>
              {config.locationMapUrl && (
                <CTAButton
                  href={config.locationMapUrl}
                  variant="ghost"
                  className="mt-6 w-fit"
                  prefetch={false}
                >
                  Ver ubicación
                </CTAButton>
              )}
            </article>
            <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-6 shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Qué te espera
              </p>
              <h3 className="mt-3 text-2xl font-semibold">
                Brindis informal entre amigos
              </h3>
              <p className="mt-3 text-sm text-muted">
                Habrá cócteles, un picoteo ligero y buena música para empezar el
                fin de semana con energía. Igual que el gran día, será una noche
                solo para adultos.
              </p>
            </article>
          </div>
        </Section>

        <Section
          id="ceremonia"
          eyebrow="Ceremonia civil"
          title="Todo lo que necesitas saber para acompañarnos"
          description="La finca abre sus portones a las 13:30 h. Tendremos ceremonia civil al aire libre, banquete con productos del Bierzo y una fiesta larga hasta las 02:00."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/80 p-6 shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Cómo llegar
              </p>
              <h3 className="mt-3 text-2xl font-semibold">
                Accesos y traslados
              </h3>
              <p className="mt-3 text-sm text-muted">
                La finca se encuentra a 10 minutos del centro de Ponferrada. Hay
                parking asfaltado dentro del recinto. Si prefieres transporte,
                dinos cuántas plazas necesitas y coordinamos un bus de ida y
                vuelta.
              </p>
            </article>
            <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/80 p-6 shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Solo adultos
              </p>
              <h3 className="mt-3 text-2xl font-semibold">
                Celebración para mayores de 18
              </h3>
              <p className="mt-3 text-sm text-muted">
                Queremos que disfrutes de un día sin prisas, por eso la boda será
                exclusivamente para adultos. Si necesitas ayuda con el cuidado de
                peques, avísanos y compartimos recomendaciones de confianza.
              </p>
            </article>
          </div>
        </Section>

        <Section
          id="cronograma"
          eyebrow="Cronograma"
          title="Así será nuestro gran día"
          description="Unimos lo mejor de un día en el campo berciano: comida larga, sobremesa al atardecer y fiesta nocturna. Revisa los hitos para organizar traslados y descanso."
          background="accent"
        >
          <Timeline />
        </Section>

        <Section
          id="alojamiento"
          eyebrow="Planifica tu viaje"
          title="Opciones de alojamiento recomendadas"
          description="Hemos bloqueado habitaciones con tarifa especial hasta 60 días antes. Llama indicando que asistes a la boda de Alba y Guille."
        >
          <StayList />
        </Section>

        <Section
          id="regalos"
          eyebrow="Celebrar con detalles"
          title="Tu presencia es lo más importante"
          description="Solo con tu presencia nos haces muy felices. Si aún así deseas tener un detalle con nosotros, aquí tienes algunas alternativas."
          background="surface"
          align="center"
        >
          <GiftList gifts={giftOptions} />
        </Section>

        <Section
          id="rsvp"
          eyebrow="RSVP"
          title="Confirma tu asistencia"
          description="Queremos preparar todo a tu medida. Completa el formulario y cuéntanos si vienes con acompañantes, intolerancias alimentarias u otras necesidades."
          background="accent"
          align="center"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-8 text-center shadow-[var(--shadow-soft)]">
            <RSVPForm />
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
              ¿Prefieres otro canal? Escríbenos a{" "}
              <a
                href={`mailto:${config.contactEmail}`}
                className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
              >
                {config.contactEmail}
              </a>{" "}
              o por WhatsApp al{" "}
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

        <Section
          id="ubicacion"
          eyebrow="Cómo llegar"
          title="Ubicación y contacto"
          description="La finca cuenta con aparcamiento propio. Si necesitas ayuda con rutas, transporte o recomendaciones, escríbenos y te echamos una mano."
          background="surface"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-6 shadow-[var(--shadow-soft)]">
              <h3 className="text-xl font-semibold">{config.locationName}</h3>
              <p className="mt-3 text-sm text-muted">{config.locationAddress}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {config.locationMapUrl && (
                  <CTAButton
                    href={config.locationMapUrl}
                    variant="outline"
                    prefetch={false}
                  >
                    Abrir en Maps
                  </CTAButton>
                )}
              </div>
            </article>
            <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-6 shadow-[var(--shadow-soft)]">
              <h3 className="text-xl font-semibold">Contacta con nosotros</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>
                  Email:{" "}
                  <a
                    href={`mailto:${config.contactEmail}`}
                    className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary"
                  >
                    {config.contactEmail}
                  </a>
                </li>
                <li>
                  Teléfono:{" "}
                  <a
                    href={`tel:${config.contactPhone}`}
                    className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary"
                  >
                    {config.contactPhone}
                  </a>
                </li>
                {config.whatsappLink && (
                  <li>
                    WhatsApp:{" "}
                    <a
                      href={config.whatsappLink}
                      className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary"
                    >
                      Abrir chat
                    </a>
                  </li>
                )}
              </ul>
            </article>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
