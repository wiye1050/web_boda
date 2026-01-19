"use client";

import { useEffect, useState, type ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { getFirestoreDb } from "@/lib/firebase";
import {
  DEFAULT_PUBLIC_CONTENT,
  normalizePublicContent,
  serializePublicContent,
  type PublicContent,
  type StayOption,
  type TimelineItem,
} from "@/lib/publicContent";

const EMPTY_TIMELINE_ITEM: TimelineItem = {
  time: "",
  title: "",
  description: "",
  location: "",
  icon: "",
};

const EMPTY_STAY_OPTION: StayOption = {
  name: "",
  description: "",
  distance: "",
  link: "",
};

const FIELD_LIMITS: Record<string, number> = {
  brandName: 120,
  headerCtaLabel: 60,
  navWeddingLabel: 60,
  navTimelineLabel: 60,
  navStayLabel: 60,
  navGiftsLabel: 60,
  navRsvpLabel: 60,
  heroEyebrow: 120,
  heroTitle: 140,
  heroDescription: 800,
  heroPrimaryCtaLabel: 80,
  heroSecondaryCtaLabel: 80,
  heroMapCtaLabel: 100,
  heroStatDateLabel: 60,
  heroStatLocationLabel: 60,
  heroStatTimeLabel: 60,
  heroStatTimeNote: 80,
  eventDate: 80,
  eventTimeRange: 60,
  locationName: 160,
  locationAddress: 200,
  locationMapUrl: 300,
  locationMapLabel: 80,
  prebodaPlace: 160,
  prebodaTime: 80,
  prebodaMapUrl: 300,
  contactEmail: 120,
  contactPhone: 40,
  whatsappLink: 200,
  giftLink: 200,
  bankHolder: 200,
  bankIban: 40,
  prebodaEyebrow: 120,
  prebodaTitle: 200,
  prebodaDescription: 800,
  prebodaCardOneLabel: 120,
  prebodaCardOneCtaLabel: 120,
  prebodaCardTwoLabel: 120,
  prebodaCardTwoTitle: 160,
  prebodaCardTwoDescription: 800,
  ceremonyEyebrow: 120,
  ceremonyTitle: 200,
  ceremonyDescription: 800,
  ceremonyCardOneLabel: 120,
  ceremonyCardOneTitle: 160,
  ceremonyCardOneDescription: 800,
  ceremonyCardTwoLabel: 120,
  ceremonyCardTwoTitle: 160,
  ceremonyCardTwoDescription: 800,
  timelineEyebrow: 120,
  timelineTitle: 200,
  timelineDescription: 800,
  timelineItems: 8000,
  stayEyebrow: 120,
  stayTitle: 200,
  stayDescription: 800,
  stayLinkLabel: 120,
  stayOptions: 8000,
  giftsEyebrow: 120,
  giftsTitle: 200,
  giftsDescription: 800,
  giftsRegistryTitle: 160,
  giftsRegistryDescription: 800,
  giftsRegistryCtaLabel: 120,
  giftsBankTitle: 160,
  giftsBankDescription: 800,
  rsvpEyebrow: 120,
  rsvpTitle: 200,
  rsvpDescription: 800,
  rsvpContactLead: 200,
  rsvpContactWhatsappLead: 200,
  rsvpImportantTitle: 160,
  rsvpImportantNotes: 4000,
  locationEyebrow: 120,
  locationTitle: 200,
  locationDescription: 800,
  locationContactTitle: 160,
  locationEmailLabel: 80,
  locationPhoneLabel: 80,
  locationWhatsappLabel: 80,
  locationWhatsappActionLabel: 120,
  footerEyebrow: 160,
  footerTitle: 220,
  footerCtaLabel: 120,
  footerCopyright: 240,
  footerMadeWith: 200,
};

const FIELD_LABELS: Record<string, string> = {
  brandName: "Nombre de la marca",
  headerCtaLabel: "Botón principal del menú",
  navWeddingLabel: "Menú: La boda",
  navTimelineLabel: "Menú: Cronograma",
  navStayLabel: "Menú: Alojamiento",
  navGiftsLabel: "Menú: Regalos",
  navRsvpLabel: "Menú: RSVP",
  heroEyebrow: "Texto superior",
  heroTitle: "Título principal",
  heroDescription: "Descripción principal",
  heroPrimaryCtaLabel: "Botón principal",
  heroSecondaryCtaLabel: "Botón secundario",
  heroMapCtaLabel: "Botón de mapa",
  heroStatDateLabel: "Etiqueta fecha",
  heroStatLocationLabel: "Etiqueta lugar",
  heroStatTimeLabel: "Etiqueta horario",
  heroStatTimeNote: "Nota de horario",
  eventDate: "Fecha del evento",
  eventTimeRange: "Horario del evento",
  locationName: "Nombre de la ubicación",
  locationAddress: "Dirección",
  locationMapUrl: "Enlace del mapa",
  locationMapLabel: "Texto del mapa",
  prebodaPlace: "Lugar preboda",
  prebodaTime: "Hora preboda",
  prebodaMapUrl: "Mapa preboda",
  contactEmail: "Email de contacto",
  contactPhone: "Teléfono de contacto",
  whatsappLink: "Enlace de WhatsApp",
  giftLink: "Enlace regalos",
  bankHolder: "Titular banco",
  bankIban: "IBAN",
  prebodaEyebrow: "Preboda: texto superior",
  prebodaTitle: "Preboda: título",
  prebodaDescription: "Preboda: descripción",
  prebodaCardOneLabel: "Preboda: tarjeta 1 etiqueta",
  prebodaCardOneCtaLabel: "Preboda: tarjeta 1 botón",
  prebodaCardTwoLabel: "Preboda: tarjeta 2 etiqueta",
  prebodaCardTwoTitle: "Preboda: tarjeta 2 título",
  prebodaCardTwoDescription: "Preboda: tarjeta 2 descripción",
  ceremonyEyebrow: "Ceremonia: texto superior",
  ceremonyTitle: "Ceremonia: título",
  ceremonyDescription: "Ceremonia: descripción",
  ceremonyCardOneLabel: "Ceremonia: tarjeta 1 etiqueta",
  ceremonyCardOneTitle: "Ceremonia: tarjeta 1 título",
  ceremonyCardOneDescription: "Ceremonia: tarjeta 1 descripción",
  ceremonyCardTwoLabel: "Ceremonia: tarjeta 2 etiqueta",
  ceremonyCardTwoTitle: "Ceremonia: tarjeta 2 título",
  ceremonyCardTwoDescription: "Ceremonia: tarjeta 2 descripción",
  timelineEyebrow: "Cronograma: texto superior",
  timelineTitle: "Cronograma: título",
  timelineDescription: "Cronograma: descripción",
  timelineItems: "Cronograma: lista",
  stayEyebrow: "Alojamiento: texto superior",
  stayTitle: "Alojamiento: título",
  stayDescription: "Alojamiento: descripción",
  stayLinkLabel: "Alojamiento: texto del botón",
  stayOptions: "Alojamiento: lista",
  giftsEyebrow: "Regalos: texto superior",
  giftsTitle: "Regalos: título",
  giftsDescription: "Regalos: descripción",
  giftsRegistryTitle: "Regalos: mesa título",
  giftsRegistryDescription: "Regalos: mesa descripción",
  giftsRegistryCtaLabel: "Regalos: mesa botón",
  giftsBankTitle: "Regalos: banco título",
  giftsBankDescription: "Regalos: banco descripción",
  rsvpEyebrow: "RSVP: texto superior",
  rsvpTitle: "RSVP: título",
  rsvpDescription: "RSVP: descripción",
  rsvpContactLead: "RSVP: texto contacto",
  rsvpContactWhatsappLead: "RSVP: texto WhatsApp",
  rsvpImportantTitle: "RSVP: título importante",
  rsvpImportantNotes: "RSVP: notas importantes",
  locationEyebrow: "Ubicación: texto superior",
  locationTitle: "Ubicación: título",
  locationDescription: "Ubicación: descripción",
  locationContactTitle: "Ubicación: título contacto",
  locationEmailLabel: "Ubicación: etiqueta email",
  locationPhoneLabel: "Ubicación: etiqueta teléfono",
  locationWhatsappLabel: "Ubicación: etiqueta WhatsApp",
  locationWhatsappActionLabel: "Ubicación: botón WhatsApp",
  footerEyebrow: "Footer: texto superior",
  footerTitle: "Footer: título",
  footerCtaLabel: "Footer: botón",
  footerCopyright: "Footer: copyright",
  footerMadeWith: "Footer: texto final",
};

type ValidationIssue = {
  key: string;
  label: string;
  length: number;
  max: number;
};

function validateConfig(content: PublicContent): ValidationIssue[] {
  const payload = serializePublicContent(content);
  const errors: ValidationIssue[] = [];

  Object.entries(FIELD_LIMITS).forEach(([key, max]) => {
    const value = payload[key as keyof typeof payload];
    if (typeof value === "string" && value.length > max) {
      const label = FIELD_LABELS[key] ?? key;
      errors.push({ key, label, length: value.length, max });
    }
  });

  return errors;
}

export function ConfigView() {
  const [config, setConfig] = useState<PublicContent>(DEFAULT_PUBLIC_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const db = getFirestoreDb();
        const docRef = doc(db, "config", "general");
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as Record<string, unknown>;
          setConfig(normalizePublicContent(data));
        } else {
          setConfig(DEFAULT_PUBLIC_CONTENT);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el contenido. Reintenta más tarde.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const validationErrors = validateConfig(config);
    if (validationErrors.length > 0) {
      const visibleErrors = validationErrors.slice(0, 3);
      const extraCount = validationErrors.length - visibleErrors.length;
      setError(
        `Revisa estos campos: ${visibleErrors
          .map((issue) => `${issue.label} (${issue.length}/${issue.max})`)
          .join(", ")}${
          extraCount > 0 ? ` (+${extraCount} más)` : ""
        }.`,
      );
      setIsSaving(false);
      return;
    }

    try {
      const db = getFirestoreDb();
      const payload = serializePublicContent(config);
      await setDoc(doc(db, "config", "general"), payload, { merge: true });
      setMessage("Contenido guardado correctamente.");
    } catch (err) {
      console.error(err);
      if (err instanceof FirebaseError) {
        setError(
          `No pudimos guardar. Código: ${err.code}. ${err.message ?? ""}`.trim(),
        );
      } else if (err instanceof Error) {
        setError(`No pudimos guardar: ${err.message}`);
      } else {
        setError("No pudimos guardar los cambios. Intenta de nuevo.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  function updateField<K extends keyof PublicContent>(
    key: K,
    value: PublicContent[K],
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function updateTimelineItem(
    index: number,
    field: keyof TimelineItem,
    value: string,
  ) {
    setConfig((prev) => {
      const next = [...prev.timelineItems];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, timelineItems: next };
    });
  }

  function addTimelineItem() {
    setConfig((prev) => ({
      ...prev,
      timelineItems: [...prev.timelineItems, { ...EMPTY_TIMELINE_ITEM }],
    }));
  }

  function removeTimelineItem(index: number) {
    setConfig((prev) => {
      const next = prev.timelineItems.filter((_, idx) => idx !== index);
      return { ...prev, timelineItems: next };
    });
  }

  function updateStayOption(
    index: number,
    field: keyof StayOption,
    value: string,
  ) {
    setConfig((prev) => {
      const next = [...prev.stayOptions];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, stayOptions: next };
    });
  }

  function addStayOption() {
    setConfig((prev) => ({
      ...prev,
      stayOptions: [...prev.stayOptions, { ...EMPTY_STAY_OPTION }],
    }));
  }

  function removeStayOption(index: number) {
    setConfig((prev) => {
      const next = prev.stayOptions.filter((_, idx) => idx !== index);
      return { ...prev, stayOptions: next };
    });
  }

  function updateRsvpNote(index: number, value: string) {
    setConfig((prev) => {
      const next = [...prev.rsvpImportantNotes];
      next[index] = value;
      return { ...prev, rsvpImportantNotes: next };
    });
  }

  function addRsvpNote() {
    setConfig((prev) => ({
      ...prev,
      rsvpImportantNotes: [...prev.rsvpImportantNotes, ""],
    }));
  }

  function removeRsvpNote(index: number) {
    setConfig((prev) => {
      const next = prev.rsvpImportantNotes.filter((_, idx) => idx !== index);
      return { ...prev, rsvpImportantNotes: next };
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
          Contenido web
        </p>
        <h1 className="text-3xl font-semibold">Editar textos de la web pública</h1>
        <p className="max-w-2xl text-sm text-muted">
          Todo lo que se ve en la página principal se edita aquí. Cambia textos,
          enlaces y listas (cronograma, alojamiento, notas) y guarda para
          publicarlo al instante.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <Fieldset title="Marca y navegación">
          <InputField
            label="Nombre de la marca"
            value={config.brandName}
            onChange={(value) => updateField("brandName", value)}
          />
          <InputField
            label="Botón principal del menú"
            value={config.headerCtaLabel}
            onChange={(value) => updateField("headerCtaLabel", value)}
          />
          <InputField
            label="Menú: La boda"
            value={config.navWeddingLabel}
            onChange={(value) => updateField("navWeddingLabel", value)}
          />
          <InputField
            label="Menú: Cronograma"
            value={config.navTimelineLabel}
            onChange={(value) => updateField("navTimelineLabel", value)}
          />
          <InputField
            label="Menú: Alojamiento"
            value={config.navStayLabel}
            onChange={(value) => updateField("navStayLabel", value)}
          />
          <InputField
            label="Menú: Regalos"
            value={config.navGiftsLabel}
            onChange={(value) => updateField("navGiftsLabel", value)}
          />
          <InputField
            label="Menú: RSVP"
            value={config.navRsvpLabel}
            onChange={(value) => updateField("navRsvpLabel", value)}
          />
        </Fieldset>

        <Fieldset title="Portada">
          <InputField
            label="Texto superior"
            value={config.heroEyebrow}
            onChange={(value) => updateField("heroEyebrow", value)}
          />
          <InputField
            label="Título principal"
            value={config.heroTitle}
            onChange={(value) => updateField("heroTitle", value)}
          />
          <TextAreaField
            label="Descripción principal"
            value={config.heroDescription}
            onChange={(value) => updateField("heroDescription", value)}
            rows={4}
          />
          <InputField
            label="Botón principal"
            value={config.heroPrimaryCtaLabel}
            onChange={(value) => updateField("heroPrimaryCtaLabel", value)}
          />
          <InputField
            label="Botón secundario"
            value={config.heroSecondaryCtaLabel}
            onChange={(value) => updateField("heroSecondaryCtaLabel", value)}
          />
          <InputField
            label="Botón de mapa"
            value={config.heroMapCtaLabel}
            onChange={(value) => updateField("heroMapCtaLabel", value)}
          />
        </Fieldset>

        <Fieldset title="Datos del evento">
          <InputField
            label="Fecha"
            value={config.eventDate}
            onChange={(value) => updateField("eventDate", value)}
          />
          <InputField
            label="Horario"
            value={config.eventTimeRange}
            onChange={(value) => updateField("eventTimeRange", value)}
          />
          <InputField
            label="Etiqueta: Fecha"
            value={config.heroStatDateLabel}
            onChange={(value) => updateField("heroStatDateLabel", value)}
          />
          <InputField
            label="Etiqueta: Lugar"
            value={config.heroStatLocationLabel}
            onChange={(value) => updateField("heroStatLocationLabel", value)}
          />
          <InputField
            label="Etiqueta: Horario"
            value={config.heroStatTimeLabel}
            onChange={(value) => updateField("heroStatTimeLabel", value)}
          />
          <InputField
            label="Nota de horario (opcional)"
            value={config.heroStatTimeNote}
            onChange={(value) => updateField("heroStatTimeNote", value)}
          />
        </Fieldset>

        <Fieldset title="Ubicación principal">
          <InputField
            label="Nombre del lugar"
            value={config.locationName}
            onChange={(value) => updateField("locationName", value)}
          />
          <TextAreaField
            label="Dirección"
            value={config.locationAddress}
            onChange={(value) => updateField("locationAddress", value)}
            rows={2}
          />
          <InputField
            label="Link Google Maps"
            value={config.locationMapUrl}
            onChange={(value) => updateField("locationMapUrl", value)}
          />
          <InputField
            label="Texto del botón de mapa"
            value={config.locationMapLabel}
            onChange={(value) => updateField("locationMapLabel", value)}
          />
        </Fieldset>

        <Fieldset title="Preboda">
          <InputField
            label="Eyebrow"
            value={config.prebodaEyebrow}
            onChange={(value) => updateField("prebodaEyebrow", value)}
          />
          <InputField
            label="Título"
            value={config.prebodaTitle}
            onChange={(value) => updateField("prebodaTitle", value)}
          />
          <TextAreaField
            label="Descripción"
            value={config.prebodaDescription}
            onChange={(value) => updateField("prebodaDescription", value)}
            rows={3}
          />
          <InputField
            label="Horario preboda"
            value={config.prebodaTime}
            onChange={(value) => updateField("prebodaTime", value)}
          />
          <InputField
            label="Lugar preboda"
            value={config.prebodaPlace}
            onChange={(value) => updateField("prebodaPlace", value)}
          />
          <InputField
            label="Link mapa preboda (opcional)"
            value={config.prebodaMapUrl}
            onChange={(value) => updateField("prebodaMapUrl", value)}
          />
          <InputField
            label="Etiqueta tarjeta 1"
            value={config.prebodaCardOneLabel}
            onChange={(value) => updateField("prebodaCardOneLabel", value)}
          />
          <InputField
            label="Botón tarjeta 1"
            value={config.prebodaCardOneCtaLabel}
            onChange={(value) => updateField("prebodaCardOneCtaLabel", value)}
          />
          <InputField
            label="Etiqueta tarjeta 2"
            value={config.prebodaCardTwoLabel}
            onChange={(value) => updateField("prebodaCardTwoLabel", value)}
          />
          <InputField
            label="Título tarjeta 2"
            value={config.prebodaCardTwoTitle}
            onChange={(value) => updateField("prebodaCardTwoTitle", value)}
          />
          <TextAreaField
            label="Descripción tarjeta 2"
            value={config.prebodaCardTwoDescription}
            onChange={(value) => updateField("prebodaCardTwoDescription", value)}
            rows={3}
          />
        </Fieldset>

        <Fieldset title="Ceremonia">
          <InputField
            label="Eyebrow"
            value={config.ceremonyEyebrow}
            onChange={(value) => updateField("ceremonyEyebrow", value)}
          />
          <InputField
            label="Título"
            value={config.ceremonyTitle}
            onChange={(value) => updateField("ceremonyTitle", value)}
          />
          <TextAreaField
            label="Descripción"
            value={config.ceremonyDescription}
            onChange={(value) => updateField("ceremonyDescription", value)}
            rows={3}
          />
          <InputField
            label="Etiqueta tarjeta 1"
            value={config.ceremonyCardOneLabel}
            onChange={(value) => updateField("ceremonyCardOneLabel", value)}
          />
          <InputField
            label="Título tarjeta 1"
            value={config.ceremonyCardOneTitle}
            onChange={(value) => updateField("ceremonyCardOneTitle", value)}
          />
          <TextAreaField
            label="Descripción tarjeta 1"
            value={config.ceremonyCardOneDescription}
            onChange={(value) => updateField("ceremonyCardOneDescription", value)}
            rows={3}
          />
          <InputField
            label="Etiqueta tarjeta 2"
            value={config.ceremonyCardTwoLabel}
            onChange={(value) => updateField("ceremonyCardTwoLabel", value)}
          />
          <InputField
            label="Título tarjeta 2"
            value={config.ceremonyCardTwoTitle}
            onChange={(value) => updateField("ceremonyCardTwoTitle", value)}
          />
          <TextAreaField
            label="Descripción tarjeta 2"
            value={config.ceremonyCardTwoDescription}
            onChange={(value) => updateField("ceremonyCardTwoDescription", value)}
            rows={3}
          />
        </Fieldset>

        <Fieldset title="Cronograma">
          <InputField
            label="Eyebrow"
            value={config.timelineEyebrow}
            onChange={(value) => updateField("timelineEyebrow", value)}
          />
          <InputField
            label="Título"
            value={config.timelineTitle}
            onChange={(value) => updateField("timelineTitle", value)}
          />
          <TextAreaField
            label="Descripción"
            value={config.timelineDescription}
            onChange={(value) => updateField("timelineDescription", value)}
            rows={3}
          />
          <div className="flex flex-col gap-4">
            {config.timelineItems.map((item, index) => (
              <div
                key={`${item.time}-${index}`}
                className="rounded-2xl border border-border/70 bg-background/60 p-4"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <InputField
                    label="Hora"
                    value={item.time}
                    onChange={(value) => updateTimelineItem(index, "time", value)}
                  />
                  <InputField
                    label="Icono (emoji)"
                    value={item.icon}
                    onChange={(value) => updateTimelineItem(index, "icon", value)}
                  />
                </div>
                <InputField
                  label="Título"
                  value={item.title}
                  onChange={(value) => updateTimelineItem(index, "title", value)}
                />
                <TextAreaField
                  label="Descripción"
                  value={item.description}
                  onChange={(value) =>
                    updateTimelineItem(index, "description", value)
                  }
                  rows={3}
                />
                <InputField
                  label="Ubicación"
                  value={item.location}
                  onChange={(value) =>
                    updateTimelineItem(index, "location", value)
                  }
                />
                <button
                  type="button"
                  onClick={() => removeTimelineItem(index)}
                  className="mt-3 rounded-full border border-border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                >
                  Eliminar hito
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addTimelineItem}
            className="w-fit rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
          >
            Añadir hito
          </button>
        </Fieldset>

        <Fieldset title="Alojamiento">
          <InputField
            label="Eyebrow"
            value={config.stayEyebrow}
            onChange={(value) => updateField("stayEyebrow", value)}
            maxLength={FIELD_LIMITS.stayEyebrow}
          />
          <InputField
            label="Título"
            value={config.stayTitle}
            onChange={(value) => updateField("stayTitle", value)}
            maxLength={FIELD_LIMITS.stayTitle}
          />
          <TextAreaField
            label="Descripción"
            value={config.stayDescription}
            onChange={(value) => updateField("stayDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.stayDescription}
          />
          <InputField
            label="Texto del botón"
            value={config.stayLinkLabel}
            onChange={(value) => updateField("stayLinkLabel", value)}
            maxLength={FIELD_LIMITS.stayLinkLabel}
          />
          <div className="flex flex-col gap-4">
            {config.stayOptions.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="rounded-2xl border border-border/70 bg-background/60 p-4"
              >
                <InputField
                  label="Nombre"
                  value={item.name}
                  onChange={(value) => updateStayOption(index, "name", value)}
                />
                <TextAreaField
                  label="Descripción"
                  value={item.description}
                  onChange={(value) => updateStayOption(index, "description", value)}
                  rows={3}
                />
                <InputField
                  label="Distancia"
                  value={item.distance}
                  onChange={(value) => updateStayOption(index, "distance", value)}
                />
                <InputField
                  label="Link"
                  value={item.link}
                  onChange={(value) => updateStayOption(index, "link", value)}
                />
                <button
                  type="button"
                  onClick={() => removeStayOption(index)}
                  className="mt-3 rounded-full border border-border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                >
                  Eliminar alojamiento
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addStayOption}
            className="w-fit rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
          >
            Añadir alojamiento
          </button>
        </Fieldset>

        <Fieldset title="Regalos">
          <InputField
            label="Eyebrow"
            value={config.giftsEyebrow}
            onChange={(value) => updateField("giftsEyebrow", value)}
          />
          <InputField
            label="Título"
            value={config.giftsTitle}
            onChange={(value) => updateField("giftsTitle", value)}
          />
          <TextAreaField
            label="Descripción"
            value={config.giftsDescription}
            onChange={(value) => updateField("giftsDescription", value)}
            rows={3}
          />
          <InputField
            label="Título mesa de regalos"
            value={config.giftsRegistryTitle}
            onChange={(value) => updateField("giftsRegistryTitle", value)}
          />
          <TextAreaField
            label="Descripción mesa de regalos"
            value={config.giftsRegistryDescription}
            onChange={(value) => updateField("giftsRegistryDescription", value)}
            rows={3}
          />
          <InputField
            label="Botón mesa de regalos"
            value={config.giftsRegistryCtaLabel}
            onChange={(value) => updateField("giftsRegistryCtaLabel", value)}
          />
          <InputField
            label="Link mesa de regalos"
            value={config.giftLink}
            onChange={(value) => updateField("giftLink", value)}
          />
          <InputField
            label="Título transferencia"
            value={config.giftsBankTitle}
            onChange={(value) => updateField("giftsBankTitle", value)}
          />
          <TextAreaField
            label="Descripción transferencia"
            value={config.giftsBankDescription}
            onChange={(value) => updateField("giftsBankDescription", value)}
            rows={3}
          />
          <InputField
            label="Titulares cuenta bancaria"
            value={config.bankHolder}
            onChange={(value) => updateField("bankHolder", value)}
          />
          <InputField
            label="IBAN"
            value={config.bankIban}
            onChange={(value) => updateField("bankIban", value)}
          />
        </Fieldset>

        <Fieldset title="RSVP">
          <InputField
            label="Eyebrow"
            value={config.rsvpEyebrow}
            onChange={(value) => updateField("rsvpEyebrow", value)}
          />
          <InputField
            label="Título"
            value={config.rsvpTitle}
            onChange={(value) => updateField("rsvpTitle", value)}
          />
          <TextAreaField
            label="Descripción"
            value={config.rsvpDescription}
            onChange={(value) => updateField("rsvpDescription", value)}
            rows={3}
          />
          <InputField
            label="Texto antes del email"
            value={config.rsvpContactLead}
            onChange={(value) => updateField("rsvpContactLead", value)}
          />
          <InputField
            label="Texto antes del WhatsApp"
            value={config.rsvpContactWhatsappLead}
            onChange={(value) => updateField("rsvpContactWhatsappLead", value)}
          />
          <InputField
            label="Título de notas importantes"
            value={config.rsvpImportantTitle}
            onChange={(value) => updateField("rsvpImportantTitle", value)}
          />
          <div className="flex flex-col gap-3">
            {config.rsvpImportantNotes.map((note, index) => (
              <div key={`note-${index}`} className="flex flex-col gap-2">
                <TextAreaField
                  label={`Nota ${index + 1}`}
                  value={note}
                  onChange={(value) => updateRsvpNote(index, value)}
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => removeRsvpNote(index)}
                  className="w-fit rounded-full border border-border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                >
                  Eliminar nota
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRsvpNote}
            className="w-fit rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
          >
            Añadir nota
          </button>
        </Fieldset>

        <Fieldset title="Contacto">
          <InputField
            label="Email de contacto"
            value={config.contactEmail}
            onChange={(value) => updateField("contactEmail", value)}
          />
          <InputField
            label="Teléfono de contacto"
            value={config.contactPhone}
            onChange={(value) => updateField("contactPhone", value)}
          />
          <InputField
            label="Link WhatsApp"
            value={config.whatsappLink}
            onChange={(value) => updateField("whatsappLink", value)}
          />
          <InputField
            label="Título sección contacto"
            value={config.locationContactTitle}
            onChange={(value) => updateField("locationContactTitle", value)}
          />
          <InputField
            label="Etiqueta Email"
            value={config.locationEmailLabel}
            onChange={(value) => updateField("locationEmailLabel", value)}
          />
          <InputField
            label="Etiqueta Teléfono"
            value={config.locationPhoneLabel}
            onChange={(value) => updateField("locationPhoneLabel", value)}
          />
          <InputField
            label="Etiqueta WhatsApp"
            value={config.locationWhatsappLabel}
            onChange={(value) => updateField("locationWhatsappLabel", value)}
          />
          <InputField
            label="Texto del enlace WhatsApp"
            value={config.locationWhatsappActionLabel}
            onChange={(value) => updateField("locationWhatsappActionLabel", value)}
          />
        </Fieldset>

        <Fieldset title="Ubicación y contacto (sección final)">
          <InputField
            label="Eyebrow"
            value={config.locationEyebrow}
            onChange={(value) => updateField("locationEyebrow", value)}
          />
          <InputField
            label="Título"
            value={config.locationTitle}
            onChange={(value) => updateField("locationTitle", value)}
          />
          <TextAreaField
            label="Descripción"
            value={config.locationDescription}
            onChange={(value) => updateField("locationDescription", value)}
            rows={3}
          />
        </Fieldset>

        <Fieldset title="Footer">
          <InputField
            label="Eyebrow"
            value={config.footerEyebrow}
            onChange={(value) => updateField("footerEyebrow", value)}
          />
          <InputField
            label="Título"
            value={config.footerTitle}
            onChange={(value) => updateField("footerTitle", value)}
          />
          <InputField
            label="Botón"
            value={config.footerCtaLabel}
            onChange={(value) => updateField("footerCtaLabel", value)}
          />
          <InputField
            label="Texto legal"
            value={config.footerCopyright}
            onChange={(value) => updateField("footerCopyright", value)}
          />
          <p className="text-xs text-muted">
            Puedes usar {"{year}"} y {"{brandName}"} si quieres que se
            actualice automáticamente.
          </p>
          <InputField
            label="Texto secundario"
            value={config.footerMadeWith}
            onChange={(value) => updateField("footerMadeWith", value)}
          />
        </Fieldset>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setConfig(DEFAULT_PUBLIC_CONTENT)}
            className="rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
          >
            Restaurar valores base
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
        {message && <p className="text-xs text-primary">{message}</p>}
        {error && <p className="text-xs text-primary">{error}</p>}
      </form>
    </div>
  );
}

function Fieldset({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-surface px-5 py-5 shadow-[var(--shadow-soft)]">
      <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  maxLength?: number;
}) {
  const showCount = typeof maxLength === "number";
  const length = value.length;
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        <span>{label}</span>
        {showCount && (
          <span className="text-[0.65rem] tracking-[0.2em]">
            {length}/{maxLength}
          </span>
        )}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        className="rounded-full border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
}) {
  const showCount = typeof maxLength === "number";
  const length = value.length;
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        <span>{label}</span>
        {showCount && (
          <span className="text-[0.65rem] tracking-[0.2em]">
            {length}/{maxLength}
          </span>
        )}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        className="rounded-3xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
