"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { getFirestoreDb } from "@/lib/firebase";
import {
  DEFAULT_PUBLIC_CONTENT,
  normalizePublicContent,
  parseFaqItems,
  parsePracticalItems,
  parseStringArray,
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
  navDetailsLabel: 60,
  navLocationLabel: 60,
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
  weddingMapsUrl: 300,
  prebodaMapsUrl: 300,
  weddingVenueName: 120,
  prebodaVenueName: 120,
  prebodaPlace: 160,
  prebodaTime: 80,
  prebodaMapUrl: 300,
  contactEmail: 120,
  contactEmail2: 120,
  contactPhone: 40,
  contactPhone2: 40,
  whatsappLink: 200,
  giftLink: 200,
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
  practicalEyebrow: 120,
  practicalTitle: 200,
  practicalDescription: 800,
  practicalItems: 8000,
  noticeText: 280,
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
  faqEyebrow: 120,
  faqTitle: 200,
  faqDescription: 800,
  faqItems: 8000,
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
  heroBackgroundImages: 8000,
  heroBackgroundIntervalMs: 10,
};

const FIELD_LABELS: Record<string, string> = {
  brandName: "Nombre de la marca",
  headerCtaLabel: "Botón principal del menú",
  navWeddingLabel: "Menú: La boda",
  navTimelineLabel: "Menú: Cronograma",
  navStayLabel: "Menú: Alojamiento",
  navGiftsLabel: "Menú: Regalos",
  navRsvpLabel: "Menú: Confirmar asistencia",
  navDetailsLabel: "Menú: Detalles",
  navLocationLabel: "Menú: Ubicación",
  noticeText: "Aviso destacado",
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
  weddingMapsUrl: "Maps: URL Boda (Google Maps)",
  prebodaMapsUrl: "Maps: URL Preboda (Google Maps)",
  weddingVenueName: "Nombre ubicación boda",
  prebodaVenueName: "Nombre ubicación preboda",
  prebodaPlace: "Lugar preboda",
  prebodaTime: "Hora preboda",
  prebodaMapUrl: "Mapa preboda",
  contactEmail: "Email de contacto",
  contactEmail2: "Email secundario",
  contactPhone: "Teléfono de contacto",
  contactPhone2: "Teléfono secundario",
  whatsappLink: "Enlace de WhatsApp",
  giftLink: "Enlace regalos",
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
  practicalEyebrow: "Detalles: texto superior",
  practicalTitle: "Detalles: título",
  practicalDescription: "Detalles: descripción",
  practicalItems: "Detalles: lista",
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
  giftsBankTitle: "Regalos: privado título",
  giftsBankDescription: "Regalos: privado descripción",
  rsvpEyebrow: "Confirmar asistencia: texto superior",
  rsvpTitle: "Confirmar asistencia: título",
  rsvpDescription: "Confirmar asistencia: descripción",
  rsvpContactLead: "Confirmar asistencia: texto contacto",
  rsvpContactWhatsappLead: "Confirmar asistencia: texto WhatsApp",
  rsvpImportantTitle: "Confirmar asistencia: título importante",
  rsvpImportantNotes: "Confirmar asistencia: notas importantes",
  faqEyebrow: "FAQ: texto superior",
  faqTitle: "FAQ: título",
  faqDescription: "FAQ: descripción",
  faqItems: "FAQ: lista",
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
  heroBackgroundImages: "Hero: imágenes de fondo",
  heroBackgroundIntervalMs: "Hero: intervalo de fondo",
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
  const [savedConfig, setSavedConfig] = useState<PublicContent>(DEFAULT_PUBLIC_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [practicalItemsRaw, setPracticalItemsRaw] = useState(
    JSON.stringify(DEFAULT_PUBLIC_CONTENT.practicalItems, null, 2),
  );
  const [faqItemsRaw, setFaqItemsRaw] = useState(
    JSON.stringify(DEFAULT_PUBLIC_CONTENT.faqItems, null, 2),
  );
  const [heroImagesRaw, setHeroImagesRaw] = useState(
    JSON.stringify(DEFAULT_PUBLIC_CONTENT.heroBackgroundImages, null, 2),
  );
  const [practicalItemsError, setPracticalItemsError] = useState<string | null>(
    null,
  );
  const [faqItemsError, setFaqItemsError] = useState<string | null>(null);
  const [heroImagesError, setHeroImagesError] = useState<string | null>(null);

  function syncJsonFields(nextConfig: PublicContent) {
    setPracticalItemsRaw(JSON.stringify(nextConfig.practicalItems, null, 2));
    setFaqItemsRaw(JSON.stringify(nextConfig.faqItems, null, 2));
    setHeroImagesRaw(JSON.stringify(nextConfig.heroBackgroundImages, null, 2));
    setPracticalItemsError(null);
    setFaqItemsError(null);
    setHeroImagesError(null);
  }

  useEffect(() => {
    async function fetchConfig() {
      try {
        const db = getFirestoreDb();
        const docRef = doc(db, "config", "general");
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as Record<string, unknown>;
          const normalized = normalizePublicContent(data);
          setConfig(normalized);
          setSavedConfig(normalized);
          syncJsonFields(normalized);
        } else {
          setConfig(DEFAULT_PUBLIC_CONTENT);
          setSavedConfig(DEFAULT_PUBLIC_CONTENT);
          syncJsonFields(DEFAULT_PUBLIC_CONTENT);
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

  function parseJsonArrayInput(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) {
      return { value: [] as unknown[] };
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        return { error: "Debe ser un array JSON." };
      }
      return { value: parsed };
    } catch {
      return { error: "JSON inválido." };
    }
  }

  function handlePracticalItemsChange(value: string) {
    setPracticalItemsRaw(value);
    const parsed = parseJsonArrayInput(value);
    if (parsed.error) {
      setPracticalItemsError(parsed.error);
      return;
    }
    setPracticalItemsError(null);
    setConfig((prev) => ({
      ...prev,
      practicalItems: parsePracticalItems(parsed.value),
    }));
  }

  function handleFaqItemsChange(value: string) {
    setFaqItemsRaw(value);
    const parsed = parseJsonArrayInput(value);
    if (parsed.error) {
      setFaqItemsError(parsed.error);
      return;
    }
    setFaqItemsError(null);
    setConfig((prev) => ({
      ...prev,
      faqItems: parseFaqItems(parsed.value),
    }));
  }

  function handleHeroImagesChange(value: string) {
    setHeroImagesRaw(value);
    const parsed = parseJsonArrayInput(value);
    if (parsed.error) {
      setHeroImagesError(parsed.error);
      return;
    }
    if (!parsed.value) {
      setHeroImagesError("JSON inválido.");
      return;
    }
    const hasInvalid = parsed.value.some((item) => typeof item !== "string");
    if (hasInvalid) {
      setHeroImagesError("Solo se permiten strings en la lista.");
      return;
    }
    setHeroImagesError(null);
    setConfig((prev) => ({
      ...prev,
      heroBackgroundImages: parseStringArray(parsed.value, [], true),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const practicalParsed = parseJsonArrayInput(practicalItemsRaw);
    if (practicalParsed.error) {
      setError(`Detalles prácticos: ${practicalParsed.error}`);
      setIsSaving(false);
      return;
    }
    const faqParsed = parseJsonArrayInput(faqItemsRaw);
    if (faqParsed.error) {
      setError(`FAQ: ${faqParsed.error}`);
      setIsSaving(false);
      return;
    }
    const heroParsed = parseJsonArrayInput(heroImagesRaw);
    if (heroParsed.error) {
      setError(`Hero imágenes: ${heroParsed.error}`);
      setIsSaving(false);
      return;
    }
    if (!heroParsed.value) {
      setError("Hero imágenes: JSON inválido.");
      setIsSaving(false);
      return;
    }
    if (heroParsed.value.some((item) => typeof item !== "string")) {
      setError("Hero imágenes: solo se permiten strings en la lista.");
      setIsSaving(false);
      return;
    }

    const nextConfig: PublicContent = {
      ...config,
      practicalItems: parsePracticalItems(practicalParsed.value),
      faqItems: parseFaqItems(faqParsed.value),
      heroBackgroundImages: parseStringArray(heroParsed.value, [], true),
    };

    const validationErrors = validateConfig(nextConfig);
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
      const payload = serializePublicContent(nextConfig);
      await setDoc(doc(db, "config", "general"), payload);
      setConfig(nextConfig);
      setSavedConfig(nextConfig);
      syncJsonFields(nextConfig);
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

  const savedJson = useMemo(
    () => ({
      practicalItems: JSON.stringify(savedConfig.practicalItems, null, 2),
      faqItems: JSON.stringify(savedConfig.faqItems, null, 2),
      heroImages: JSON.stringify(savedConfig.heroBackgroundImages, null, 2),
    }),
    [savedConfig],
  );

  const hasUnsavedChanges = useMemo(() => {
    return (
      JSON.stringify(config) !== JSON.stringify(savedConfig) ||
      practicalItemsRaw !== savedJson.practicalItems ||
      faqItemsRaw !== savedJson.faqItems ||
      heroImagesRaw !== savedJson.heroImages
    );
  }, [
    config,
    faqItemsRaw,
    heroImagesRaw,
    practicalItemsRaw,
    savedConfig,
    savedJson,
  ]);
  const listLengths = useMemo(
    () => ({
      timelineItems: JSON.stringify(config.timelineItems).length,
      practicalItems: JSON.stringify(config.practicalItems).length,
      stayOptions: JSON.stringify(config.stayOptions).length,
      rsvpImportantNotes: JSON.stringify(config.rsvpImportantNotes).length,
      faqItems: JSON.stringify(config.faqItems).length,
      heroBackgroundImages: JSON.stringify(config.heroBackgroundImages).length,
    }),
    [config],
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

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

  function handleRestoreDefaults() {
    setConfig(DEFAULT_PUBLIC_CONTENT);
    syncJsonFields(DEFAULT_PUBLIC_CONTENT);
    setMessage(null);
    setError(null);
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
      {(message || error) && (
        <div
          className={[
            "rounded-[20px] border px-4 py-3 text-sm",
            error
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
          ].join(" ")}
        >
          {error ?? message}
        </div>
      )}
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
        {hasUnsavedChanges && (
          <div className="rounded-[20px] border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs uppercase tracking-[0.3em] text-amber-200">
            Tienes cambios sin guardar
          </div>
        )}
        <Fieldset title="Aviso destacado" tone="accent">
          <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-background accent-primary"
              checked={config.noticeEnabled}
              onChange={(event) => updateField("noticeEnabled", event.target.checked)}
            />
            Mostrar aviso en la parte superior
          </label>
          <TextAreaField
            label="Texto del aviso"
            value={config.noticeText}
            onChange={(value) => updateField("noticeText", value)}
            rows={3}
            maxLength={FIELD_LIMITS.noticeText}
          />
          <p className="text-xs text-muted">
            Úsalo para avisos rápidos (ej. “Si llueve, traed paraguas”).
          </p>
        </Fieldset>

        <Fieldset title="Marca y navegación" tone="rose">
          <InputField
            label="Nombre de la marca"
            value={config.brandName}
            onChange={(value) => updateField("brandName", value)}
            maxLength={FIELD_LIMITS.brandName}
          />
          <InputField
            label="Botón principal del menú"
            value={config.headerCtaLabel}
            onChange={(value) => updateField("headerCtaLabel", value)}
            maxLength={FIELD_LIMITS.headerCtaLabel}
          />
          <InputField
            label="Menú: La boda"
            value={config.navWeddingLabel}
            onChange={(value) => updateField("navWeddingLabel", value)}
            maxLength={FIELD_LIMITS.navWeddingLabel}
          />
          <InputField
            label="Menú: Cronograma"
            value={config.navTimelineLabel}
            onChange={(value) => updateField("navTimelineLabel", value)}
            maxLength={FIELD_LIMITS.navTimelineLabel}
          />
          <InputField
            label="Menú: Alojamiento"
            value={config.navStayLabel}
            onChange={(value) => updateField("navStayLabel", value)}
            maxLength={FIELD_LIMITS.navStayLabel}
          />
          <InputField
            label="Menú: Regalos"
            value={config.navGiftsLabel}
            onChange={(value) => updateField("navGiftsLabel", value)}
            maxLength={FIELD_LIMITS.navGiftsLabel}
          />
          <InputField
            label="Menú: Confirmar asistencia"
            value={config.navRsvpLabel}
            onChange={(value) => updateField("navRsvpLabel", value)}
            maxLength={FIELD_LIMITS.navRsvpLabel}
          />
          <InputField
            label="Menú: Detalles"
            value={config.navDetailsLabel}
            onChange={(value) => updateField("navDetailsLabel", value)}
            maxLength={FIELD_LIMITS.navDetailsLabel}
          />
          <InputField
            label="Menú: Ubicación"
            value={config.navLocationLabel}
            onChange={(value) => updateField("navLocationLabel", value)}
            maxLength={FIELD_LIMITS.navLocationLabel}
          />
        </Fieldset>

        <Fieldset title="Portada" tone="rose">
          <InputField
            label="Texto superior"
            value={config.heroEyebrow}
            onChange={(value) => updateField("heroEyebrow", value)}
            maxLength={FIELD_LIMITS.heroEyebrow}
          />
          <InputField
            label="Título principal"
            value={config.heroTitle}
            onChange={(value) => updateField("heroTitle", value)}
            maxLength={FIELD_LIMITS.heroTitle}
          />
          <TextAreaField
            label="Descripción principal"
            value={config.heroDescription}
            onChange={(value) => updateField("heroDescription", value)}
            rows={4}
            maxLength={FIELD_LIMITS.heroDescription}
          />
          <InputField
            label="Botón principal"
            value={config.heroPrimaryCtaLabel}
            onChange={(value) => updateField("heroPrimaryCtaLabel", value)}
            maxLength={FIELD_LIMITS.heroPrimaryCtaLabel}
          />
          <InputField
            label="Botón secundario"
            value={config.heroSecondaryCtaLabel}
            onChange={(value) => updateField("heroSecondaryCtaLabel", value)}
            maxLength={FIELD_LIMITS.heroSecondaryCtaLabel}
          />
          <InputField
            label="Botón de mapa"
            value={config.heroMapCtaLabel}
            onChange={(value) => updateField("heroMapCtaLabel", value)}
            maxLength={FIELD_LIMITS.heroMapCtaLabel}
          />
        </Fieldset>

        <Fieldset
          title="Hero: fondo dinámico"
          tone="rose"
          meta={`${listLengths.heroBackgroundImages}/${FIELD_LIMITS.heroBackgroundImages}`}
        >
          <TextAreaField
            label="Imágenes (JSON)"
            value={heroImagesRaw}
            onChange={handleHeroImagesChange}
            rows={5}
            maxLength={FIELD_LIMITS.heroBackgroundImages}
          />
          <p className="text-xs text-muted">
            Usa rutas de /public. Ejemplo: <code>[&quot;/photos/hero/01.webp&quot;]</code>.
          </p>
          {heroImagesError && (
            <p className="text-xs text-primary">{heroImagesError}</p>
          )}
          <InputField
            label="Intervalo (ms)"
            value={config.heroBackgroundIntervalMs}
            onChange={(value) => updateField("heroBackgroundIntervalMs", value)}
            maxLength={FIELD_LIMITS.heroBackgroundIntervalMs}
          />
        </Fieldset>

        <Fieldset title="Datos del evento" tone="sand">
          <InputField
            label="Fecha"
            value={config.eventDate}
            onChange={(value) => updateField("eventDate", value)}
            maxLength={FIELD_LIMITS.eventDate}
          />
          <InputField
            label="Horario"
            value={config.eventTimeRange}
            onChange={(value) => updateField("eventTimeRange", value)}
            maxLength={FIELD_LIMITS.eventTimeRange}
          />
          <InputField
            label="Etiqueta: Fecha"
            value={config.heroStatDateLabel}
            onChange={(value) => updateField("heroStatDateLabel", value)}
            maxLength={FIELD_LIMITS.heroStatDateLabel}
          />
          <InputField
            label="Etiqueta: Lugar"
            value={config.heroStatLocationLabel}
            onChange={(value) => updateField("heroStatLocationLabel", value)}
            maxLength={FIELD_LIMITS.heroStatLocationLabel}
          />
          <InputField
            label="Etiqueta: Horario"
            value={config.heroStatTimeLabel}
            onChange={(value) => updateField("heroStatTimeLabel", value)}
            maxLength={FIELD_LIMITS.heroStatTimeLabel}
          />
          <InputField
            label="Nota de horario (opcional)"
            value={config.heroStatTimeNote}
            onChange={(value) => updateField("heroStatTimeNote", value)}
            maxLength={FIELD_LIMITS.heroStatTimeNote}
          />
        </Fieldset>

        <Fieldset title="Ubicación principal" tone="sand">
          <InputField
            label="Nombre del lugar"
            value={config.locationName}
            onChange={(value) => updateField("locationName", value)}
            maxLength={FIELD_LIMITS.locationName}
          />
          <TextAreaField
            label="Dirección"
            value={config.locationAddress}
            onChange={(value) => updateField("locationAddress", value)}
            rows={2}
            maxLength={FIELD_LIMITS.locationAddress}
          />
          <InputField
            label="Link Google Maps"
            value={config.locationMapUrl}
            onChange={(value) => updateField("locationMapUrl", value)}
            maxLength={FIELD_LIMITS.locationMapUrl}
          />
          <InputField
            label="Texto del botón de mapa"
            value={config.locationMapLabel}
            onChange={(value) => updateField("locationMapLabel", value)}
            maxLength={FIELD_LIMITS.locationMapLabel}
          />
          <InputField
            label="Maps: URL Boda (Google Maps)"
            value={config.weddingMapsUrl}
            onChange={(value) => updateField("weddingMapsUrl", value)}
            maxLength={FIELD_LIMITS.weddingMapsUrl}
          />
          <InputField
            label="Maps: URL Preboda (Google Maps)"
            value={config.prebodaMapsUrl}
            onChange={(value) => updateField("prebodaMapsUrl", value)}
            maxLength={FIELD_LIMITS.prebodaMapsUrl}
          />
          <InputField
            label="Nombre ubicación boda"
            value={config.weddingVenueName}
            onChange={(value) => updateField("weddingVenueName", value)}
            maxLength={FIELD_LIMITS.weddingVenueName}
          />
          <InputField
            label="Nombre ubicación preboda"
            value={config.prebodaVenueName}
            onChange={(value) => updateField("prebodaVenueName", value)}
            maxLength={FIELD_LIMITS.prebodaVenueName}
          />
        </Fieldset>

        <Fieldset title="Preboda" tone="slate">
          <InputField
            label="Eyebrow"
            value={config.prebodaEyebrow}
            onChange={(value) => updateField("prebodaEyebrow", value)}
            maxLength={FIELD_LIMITS.prebodaEyebrow}
          />
          <InputField
            label="Título"
            value={config.prebodaTitle}
            onChange={(value) => updateField("prebodaTitle", value)}
            maxLength={FIELD_LIMITS.prebodaTitle}
          />
          <TextAreaField
            label="Descripción"
            value={config.prebodaDescription}
            onChange={(value) => updateField("prebodaDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.prebodaDescription}
          />
          <InputField
            label="Horario preboda"
            value={config.prebodaTime}
            onChange={(value) => updateField("prebodaTime", value)}
            maxLength={FIELD_LIMITS.prebodaTime}
          />
          <InputField
            label="Lugar preboda"
            value={config.prebodaPlace}
            onChange={(value) => updateField("prebodaPlace", value)}
            maxLength={FIELD_LIMITS.prebodaPlace}
          />
          <InputField
            label="Link mapa preboda (opcional)"
            value={config.prebodaMapUrl}
            onChange={(value) => updateField("prebodaMapUrl", value)}
            maxLength={FIELD_LIMITS.prebodaMapUrl}
          />
          <InputField
            label="Etiqueta tarjeta 1"
            value={config.prebodaCardOneLabel}
            onChange={(value) => updateField("prebodaCardOneLabel", value)}
            maxLength={FIELD_LIMITS.prebodaCardOneLabel}
          />
          <InputField
            label="Botón tarjeta 1"
            value={config.prebodaCardOneCtaLabel}
            onChange={(value) => updateField("prebodaCardOneCtaLabel", value)}
            maxLength={FIELD_LIMITS.prebodaCardOneCtaLabel}
          />
          <InputField
            label="Etiqueta tarjeta 2"
            value={config.prebodaCardTwoLabel}
            onChange={(value) => updateField("prebodaCardTwoLabel", value)}
            maxLength={FIELD_LIMITS.prebodaCardTwoLabel}
          />
          <InputField
            label="Título tarjeta 2"
            value={config.prebodaCardTwoTitle}
            onChange={(value) => updateField("prebodaCardTwoTitle", value)}
            maxLength={FIELD_LIMITS.prebodaCardTwoTitle}
          />
          <TextAreaField
            label="Descripción tarjeta 2"
            value={config.prebodaCardTwoDescription}
            onChange={(value) => updateField("prebodaCardTwoDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.prebodaCardTwoDescription}
          />
        </Fieldset>

        <Fieldset title="Ceremonia" tone="slate">
          <InputField
            label="Eyebrow"
            value={config.ceremonyEyebrow}
            onChange={(value) => updateField("ceremonyEyebrow", value)}
            maxLength={FIELD_LIMITS.ceremonyEyebrow}
          />
          <InputField
            label="Título"
            value={config.ceremonyTitle}
            onChange={(value) => updateField("ceremonyTitle", value)}
            maxLength={FIELD_LIMITS.ceremonyTitle}
          />
          <TextAreaField
            label="Descripción"
            value={config.ceremonyDescription}
            onChange={(value) => updateField("ceremonyDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.ceremonyDescription}
          />
          <InputField
            label="Etiqueta tarjeta 1"
            value={config.ceremonyCardOneLabel}
            onChange={(value) => updateField("ceremonyCardOneLabel", value)}
            maxLength={FIELD_LIMITS.ceremonyCardOneLabel}
          />
          <InputField
            label="Título tarjeta 1"
            value={config.ceremonyCardOneTitle}
            onChange={(value) => updateField("ceremonyCardOneTitle", value)}
            maxLength={FIELD_LIMITS.ceremonyCardOneTitle}
          />
          <TextAreaField
            label="Descripción tarjeta 1"
            value={config.ceremonyCardOneDescription}
            onChange={(value) => updateField("ceremonyCardOneDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.ceremonyCardOneDescription}
          />
          <InputField
            label="Etiqueta tarjeta 2"
            value={config.ceremonyCardTwoLabel}
            onChange={(value) => updateField("ceremonyCardTwoLabel", value)}
            maxLength={FIELD_LIMITS.ceremonyCardTwoLabel}
          />
          <InputField
            label="Título tarjeta 2"
            value={config.ceremonyCardTwoTitle}
            onChange={(value) => updateField("ceremonyCardTwoTitle", value)}
            maxLength={FIELD_LIMITS.ceremonyCardTwoTitle}
          />
          <TextAreaField
            label="Descripción tarjeta 2"
            value={config.ceremonyCardTwoDescription}
            onChange={(value) => updateField("ceremonyCardTwoDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.ceremonyCardTwoDescription}
          />
        </Fieldset>

        <Fieldset
          title="Detalles prácticos"
          meta={`${listLengths.practicalItems}/${FIELD_LIMITS.practicalItems}`}
          tone="accent"
        >
          <InputField
            label="Eyebrow"
            value={config.practicalEyebrow}
            onChange={(value) => updateField("practicalEyebrow", value)}
            maxLength={FIELD_LIMITS.practicalEyebrow}
          />
          <InputField
            label="Título"
            value={config.practicalTitle}
            onChange={(value) => updateField("practicalTitle", value)}
            maxLength={FIELD_LIMITS.practicalTitle}
          />
          <TextAreaField
            label="Descripción"
            value={config.practicalDescription}
            onChange={(value) => updateField("practicalDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.practicalDescription}
          />
          <TextAreaField
            label="Lista de detalles (JSON)"
            value={practicalItemsRaw}
            onChange={handlePracticalItemsChange}
            rows={6}
            maxLength={FIELD_LIMITS.practicalItems}
          />
          <p className="text-xs text-muted">
            Formato: <code>[{"{"}icon:&quot;🕒&quot;, title:&quot;Llegada&quot;, description:&quot;...&quot;{"}"}]</code>.
          </p>
          {practicalItemsError && (
            <p className="text-xs text-primary">{practicalItemsError}</p>
          )}
        </Fieldset>

        <Fieldset
          title="Cronograma"
          meta={`${listLengths.timelineItems}/${FIELD_LIMITS.timelineItems}`}
          tone="accent"
        >
          <InputField
            label="Eyebrow"
            value={config.timelineEyebrow}
            onChange={(value) => updateField("timelineEyebrow", value)}
            maxLength={FIELD_LIMITS.timelineEyebrow}
          />
          <InputField
            label="Título"
            value={config.timelineTitle}
            onChange={(value) => updateField("timelineTitle", value)}
            maxLength={FIELD_LIMITS.timelineTitle}
          />
          <TextAreaField
            label="Descripción"
            value={config.timelineDescription}
            onChange={(value) => updateField("timelineDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.timelineDescription}
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

        <Fieldset
          title="Alojamiento"
          meta={`${listLengths.stayOptions}/${FIELD_LIMITS.stayOptions}`}
          tone="sand"
        >
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

        <Fieldset title="Regalos" tone="rose">
          <InputField
            label="Eyebrow"
            value={config.giftsEyebrow}
            onChange={(value) => updateField("giftsEyebrow", value)}
            maxLength={FIELD_LIMITS.giftsEyebrow}
          />
          <InputField
            label="Título"
            value={config.giftsTitle}
            onChange={(value) => updateField("giftsTitle", value)}
            maxLength={FIELD_LIMITS.giftsTitle}
          />
          <TextAreaField
            label="Descripción"
            value={config.giftsDescription}
            onChange={(value) => updateField("giftsDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.giftsDescription}
          />
          <InputField
            label="Título regalo privado"
            value={config.giftsBankTitle}
            onChange={(value) => updateField("giftsBankTitle", value)}
            maxLength={FIELD_LIMITS.giftsBankTitle}
          />
          <TextAreaField
            label="Descripción regalo privado"
            value={config.giftsBankDescription}
            onChange={(value) => updateField("giftsBankDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.giftsBankDescription}
          />
        </Fieldset>

        <Fieldset
          title="Confirmar asistencia"
          meta={`${listLengths.rsvpImportantNotes}/${FIELD_LIMITS.rsvpImportantNotes}`}
          tone="accent"
        >
          <InputField
            label="Eyebrow"
            value={config.rsvpEyebrow}
            onChange={(value) => updateField("rsvpEyebrow", value)}
            maxLength={FIELD_LIMITS.rsvpEyebrow}
          />
          <InputField
            label="Título"
            value={config.rsvpTitle}
            onChange={(value) => updateField("rsvpTitle", value)}
            maxLength={FIELD_LIMITS.rsvpTitle}
          />
          <TextAreaField
            label="Descripción"
            value={config.rsvpDescription}
            onChange={(value) => updateField("rsvpDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.rsvpDescription}
          />
          <InputField
            label="Texto antes del email"
            value={config.rsvpContactLead}
            onChange={(value) => updateField("rsvpContactLead", value)}
            maxLength={FIELD_LIMITS.rsvpContactLead}
          />
          <InputField
            label="Texto antes del WhatsApp"
            value={config.rsvpContactWhatsappLead}
            onChange={(value) => updateField("rsvpContactWhatsappLead", value)}
            maxLength={FIELD_LIMITS.rsvpContactWhatsappLead}
          />
          <InputField
            label="Título de notas importantes"
            value={config.rsvpImportantTitle}
            onChange={(value) => updateField("rsvpImportantTitle", value)}
            maxLength={FIELD_LIMITS.rsvpImportantTitle}
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

        <Fieldset
          title="FAQ"
          meta={`${listLengths.faqItems}/${FIELD_LIMITS.faqItems}`}
          tone="accent"
        >
          <InputField
            label="Eyebrow"
            value={config.faqEyebrow}
            onChange={(value) => updateField("faqEyebrow", value)}
            maxLength={FIELD_LIMITS.faqEyebrow}
          />
          <InputField
            label="Título"
            value={config.faqTitle}
            onChange={(value) => updateField("faqTitle", value)}
            maxLength={FIELD_LIMITS.faqTitle}
          />
          <TextAreaField
            label="Descripción"
            value={config.faqDescription}
            onChange={(value) => updateField("faqDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.faqDescription}
          />
          <TextAreaField
            label="Preguntas (JSON)"
            value={faqItemsRaw}
            onChange={handleFaqItemsChange}
            rows={6}
            maxLength={FIELD_LIMITS.faqItems}
          />
          <p className="text-xs text-muted">
            Formato: <code>[{"{"}question:&quot;...?&quot;, answer:&quot;...&quot;{"}"}]</code>.
          </p>
          {faqItemsError && (
            <p className="text-xs text-primary">{faqItemsError}</p>
          )}
        </Fieldset>

        <Fieldset title="Contacto" tone="sand">
          <InputField
            label="Email de contacto"
            value={config.contactEmail}
            onChange={(value) => updateField("contactEmail", value)}
            maxLength={FIELD_LIMITS.contactEmail}
          />
          <InputField
            label="Email secundario"
            value={config.contactEmail2}
            onChange={(value) => updateField("contactEmail2", value)}
            maxLength={FIELD_LIMITS.contactEmail2}
          />
          <InputField
            label="Teléfono de contacto"
            value={config.contactPhone}
            onChange={(value) => updateField("contactPhone", value)}
            maxLength={FIELD_LIMITS.contactPhone}
          />
          <InputField
            label="Teléfono secundario"
            value={config.contactPhone2}
            onChange={(value) => updateField("contactPhone2", value)}
            maxLength={FIELD_LIMITS.contactPhone2}
          />
          <InputField
            label="Link WhatsApp"
            value={config.whatsappLink}
            onChange={(value) => updateField("whatsappLink", value)}
            maxLength={FIELD_LIMITS.whatsappLink}
          />
          <InputField
            label="Título sección contacto"
            value={config.locationContactTitle}
            onChange={(value) => updateField("locationContactTitle", value)}
            maxLength={FIELD_LIMITS.locationContactTitle}
          />
          <InputField
            label="Etiqueta Email"
            value={config.locationEmailLabel}
            onChange={(value) => updateField("locationEmailLabel", value)}
            maxLength={FIELD_LIMITS.locationEmailLabel}
          />
          <InputField
            label="Etiqueta Teléfono"
            value={config.locationPhoneLabel}
            onChange={(value) => updateField("locationPhoneLabel", value)}
            maxLength={FIELD_LIMITS.locationPhoneLabel}
          />
          <InputField
            label="Etiqueta WhatsApp"
            value={config.locationWhatsappLabel}
            onChange={(value) => updateField("locationWhatsappLabel", value)}
            maxLength={FIELD_LIMITS.locationWhatsappLabel}
          />
          <InputField
            label="Texto del enlace WhatsApp"
            value={config.locationWhatsappActionLabel}
            onChange={(value) => updateField("locationWhatsappActionLabel", value)}
            maxLength={FIELD_LIMITS.locationWhatsappActionLabel}
          />
        </Fieldset>

        <Fieldset title="Ubicación y contacto (sección final)" tone="sand">
          <InputField
            label="Eyebrow"
            value={config.locationEyebrow}
            onChange={(value) => updateField("locationEyebrow", value)}
            maxLength={FIELD_LIMITS.locationEyebrow}
          />
          <InputField
            label="Título"
            value={config.locationTitle}
            onChange={(value) => updateField("locationTitle", value)}
            maxLength={FIELD_LIMITS.locationTitle}
          />
          <TextAreaField
            label="Descripción"
            value={config.locationDescription}
            onChange={(value) => updateField("locationDescription", value)}
            rows={3}
            maxLength={FIELD_LIMITS.locationDescription}
          />
        </Fieldset>

        <Fieldset title="Footer">
          <InputField
            label="Eyebrow"
            value={config.footerEyebrow}
            onChange={(value) => updateField("footerEyebrow", value)}
            maxLength={FIELD_LIMITS.footerEyebrow}
          />
          <InputField
            label="Título"
            value={config.footerTitle}
            onChange={(value) => updateField("footerTitle", value)}
            maxLength={FIELD_LIMITS.footerTitle}
          />
          <InputField
            label="Botón"
            value={config.footerCtaLabel}
            onChange={(value) => updateField("footerCtaLabel", value)}
            maxLength={FIELD_LIMITS.footerCtaLabel}
          />
          <InputField
            label="Texto legal"
            value={config.footerCopyright}
            onChange={(value) => updateField("footerCopyright", value)}
            maxLength={FIELD_LIMITS.footerCopyright}
          />
          <p className="text-xs text-muted">
            Puedes usar {"{year}"} y {"{brandName}"} si quieres que se
            actualice automáticamente.
          </p>
          <InputField
            label="Texto secundario"
            value={config.footerMadeWith}
            onChange={(value) => updateField("footerMadeWith", value)}
            maxLength={FIELD_LIMITS.footerMadeWith}
          />
        </Fieldset>

        <div className="sticky bottom-4 z-10 -mx-4 rounded-[28px] border border-border/70 bg-surface/95 px-4 py-4 shadow-[var(--shadow-soft)] sm:mx-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
            >
              Restaurar valores base
            </button>
            <button
              type="submit"
              disabled={isSaving || !hasUnsavedChanges}
              className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Guardando..."
                : hasUnsavedChanges
                  ? "Guardar cambios"
                  : "Sin cambios"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Fieldset({
  children,
  title,
  meta,
  tone = "default",
  defaultOpen = true,
}: {
  children: ReactNode;
  title: string;
  meta?: ReactNode;
  tone?: "default" | "rose" | "sand" | "slate" | "accent";
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const toneClass =
    tone === "rose"
      ? "border-primary/20 bg-primary/5"
      : tone === "sand"
        ? "border-amber-200/40 bg-amber-50/10"
        : tone === "slate"
          ? "border-border/60 bg-background/60"
          : tone === "accent"
            ? "border-accent-strong/30 bg-accent/20"
            : "border-border/70 bg-surface";

  return (
    <fieldset
      className={`flex flex-col gap-4 rounded-[24px] border px-5 py-4 shadow-[var(--shadow-soft)] ${toneClass}`}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-[0.3em] text-muted"
      >
        <span>{title}</span>
        <span className="flex items-center gap-2 text-[0.65rem] tracking-[0.2em]">
          {meta && <span>{meta}</span>}
          <span className="text-base">{open ? "▾" : "▸"}</span>
        </span>
      </button>
      {open && <div className="flex flex-col gap-4">{children}</div>}
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
  const inputId = useId();
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
        id={inputId}
        name={inputId}
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
  const textareaId = useId();
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
        id={textareaId}
        name={textareaId}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        className="rounded-3xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
