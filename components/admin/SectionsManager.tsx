"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { getFirestoreDb } from "@/lib/firebase";
import {
  DEFAULT_PUBLIC_CONTENT,
  normalizePublicContent,
  serializePublicContent,
  type FaqItem,
  type PracticalItem,
  type PublicContent,
  type SectionConfig,
  type StayOption,
  type TimelineItem,
} from "@/lib/publicContent";

const SECTION_LABELS: Record<string, string> = {
  preboda: "Preboda",
  ceremonia: "La boda",
  detalles: "Detalles prácticos",
  cronograma: "Cronograma",
  alojamiento: "Alojamiento",
  regalos: "Regalos",
  faq: "FAQ",
  asistencia: "Confirmar asistencia",
  ubicacion: "Ubicación",
};

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

const EMPTY_PRACTICAL_ITEM: PracticalItem = {
  icon: "",
  title: "",
  description: "",
};

const EMPTY_FAQ_ITEM: FaqItem = {
  question: "",
  answer: "",
};

function sortSections(sections: SectionConfig[]) {
  return [...sections].sort((a, b) => {
    const orderDiff = a.order - b.order;
    if (orderDiff !== 0) return orderDiff;
    return a.id.localeCompare(b.id, "es");
  });
}

function normalizeOrders(sections: SectionConfig[]) {
  return sections.map((section, index) => ({
    ...section,
    order: index + 1,
  }));
}

export function SectionsManager() {
  const [content, setContent] = useState<PublicContent>(DEFAULT_PUBLIC_CONTENT);
  const [openSections, setOpenSections] = useState<string[]>([]);
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
          const normalized = normalizePublicContent(data);
          setContent({
            ...normalized,
            sections: normalizeOrders(sortSections(normalized.sections)),
          });
        } else {
          setContent(DEFAULT_PUBLIC_CONTENT);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las secciones.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const sortedSections = useMemo(
    () => normalizeOrders(sortSections(content.sections)),
    [content.sections],
  );

  function toggleSection(id: string) {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function updateSection(id: string, patch: Partial<SectionConfig>) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === id ? { ...section, ...patch } : section,
      ),
    }));
  }

  function moveSection(id: string, direction: "up" | "down") {
    const ordered = sortSections(content.sections);
    const index = ordered.findIndex((section) => section.id === id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;
    const swapped = [...ordered];
    [swapped[index], swapped[targetIndex]] = [
      swapped[targetIndex],
      swapped[index],
    ];
    setContent((prev) => ({
      ...prev,
      sections: normalizeOrders(swapped),
    }));
  }

  function updateField<K extends keyof PublicContent>(
    key: K,
    value: PublicContent[K],
  ) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function updateTimelineItem(
    index: number,
    field: keyof TimelineItem,
    value: string,
  ) {
    setContent((prev) => {
      const next = [...prev.timelineItems];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, timelineItems: next };
    });
  }

  function addTimelineItem() {
    setContent((prev) => ({
      ...prev,
      timelineItems: [...prev.timelineItems, { ...EMPTY_TIMELINE_ITEM }],
    }));
  }

  function removeTimelineItem(index: number) {
    setContent((prev) => ({
      ...prev,
      timelineItems: prev.timelineItems.filter((_, idx) => idx !== index),
    }));
  }

  function updateStayOption(
    index: number,
    field: keyof StayOption,
    value: string,
  ) {
    setContent((prev) => {
      const next = [...prev.stayOptions];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, stayOptions: next };
    });
  }

  function addStayOption() {
    setContent((prev) => ({
      ...prev,
      stayOptions: [...prev.stayOptions, { ...EMPTY_STAY_OPTION }],
    }));
  }

  function removeStayOption(index: number) {
    setContent((prev) => ({
      ...prev,
      stayOptions: prev.stayOptions.filter((_, idx) => idx !== index),
    }));
  }

  function updatePracticalItem(
    index: number,
    field: keyof PracticalItem,
    value: string,
  ) {
    setContent((prev) => {
      const next = [...prev.practicalItems];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, practicalItems: next };
    });
  }

  function addPracticalItem() {
    setContent((prev) => ({
      ...prev,
      practicalItems: [...prev.practicalItems, { ...EMPTY_PRACTICAL_ITEM }],
    }));
  }

  function removePracticalItem(index: number) {
    setContent((prev) => ({
      ...prev,
      practicalItems: prev.practicalItems.filter((_, idx) => idx !== index),
    }));
  }

  function updateFaqItem(
    index: number,
    field: keyof FaqItem,
    value: string,
  ) {
    setContent((prev) => {
      const next = [...prev.faqItems];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, faqItems: next };
    });
  }

  function addFaqItem() {
    setContent((prev) => ({
      ...prev,
      faqItems: [...prev.faqItems, { ...EMPTY_FAQ_ITEM }],
    }));
  }

  function removeFaqItem(index: number) {
    setContent((prev) => ({
      ...prev,
      faqItems: prev.faqItems.filter((_, idx) => idx !== index),
    }));
  }

  function updateRsvpNote(index: number, value: string) {
    setContent((prev) => {
      const next = [...prev.rsvpImportantNotes];
      next[index] = value;
      return { ...prev, rsvpImportantNotes: next };
    });
  }

  function addRsvpNote() {
    setContent((prev) => ({
      ...prev,
      rsvpImportantNotes: [...prev.rsvpImportantNotes, ""],
    }));
  }

  function removeRsvpNote(index: number) {
    setContent((prev) => ({
      ...prev,
      rsvpImportantNotes: prev.rsvpImportantNotes.filter((_, idx) => idx !== index),
    }));
  }

  function handleRestoreDefaults() {
    setContent(DEFAULT_PUBLIC_CONTENT);
    setOpenSections([]);
    setMessage(null);
    setError(null);
  }

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const normalizedSections = normalizeOrders(sortSections(content.sections));
    const invalidLabel = normalizedSections.find(
      (section) => section.nav && section.label.trim().length === 0,
    );
    if (invalidLabel) {
      setError("El texto del menú no puede estar vacío si está visible.");
      setIsSaving(false);
      return;
    }

    try {
      const db = getFirestoreDb();
      const payload = serializePublicContent({
        ...content,
        sections: normalizedSections,
      });
      await setDoc(doc(db, "config", "general"), payload, { merge: true });
      setContent((prev) => ({ ...prev, sections: normalizedSections }));
      setMessage("Secciones guardadas correctamente.");
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
        <h1 className="text-3xl font-semibold">Gestionar secciones</h1>
        <p className="max-w-2xl text-sm text-muted">
          Activa o desactiva secciones, controla el orden y edita el contenido de
          cada bloque sin tocar JSON.
        </p>
      </header>

      <section className="overflow-hidden rounded-[24px] border border-border/70 bg-surface/95 shadow-[var(--shadow-soft)]">
        <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr_1fr_0.7fr] gap-4 border-b border-border/70 px-5 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          <span>Sección</span>
          <span>Visible</span>
          <span>Menú</span>
          <span>Texto menú</span>
          <span>Orden</span>
        </div>
        <div className="divide-y divide-border/70">
          {sortedSections.map((section) => {
            const isOpen = openSections.includes(section.id);
            return (
              <div key={section.id} className="px-5 py-4">
                <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr_1fr_0.7fr] items-center gap-4">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isOpen}
                    className="group flex items-start gap-3 text-left"
                  >
                    <span
                      className={[
                        "mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/70 text-xs text-muted transition",
                        isOpen ? "rotate-180 border-primary/60 text-primary" : "",
                        "group-hover:border-primary/60 group-hover:text-primary",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      ▾
                    </span>
                    <span>
                      <p className="text-sm font-semibold text-foreground">
                        {SECTION_LABELS[section.id] ?? section.id}
                      </p>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        {section.id}
                      </p>
                    </span>
                  </button>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(event) =>
                        updateSection(section.id, {
                          enabled: event.target.checked,
                        })
                      }
                    />
                    <span>{section.enabled ? "Sí" : "No"}</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={section.nav}
                      onChange={(event) =>
                        updateSection(section.id, {
                          nav: event.target.checked,
                        })
                      }
                    />
                    <span>{section.nav ? "Sí" : "No"}</span>
                  </label>
                  <input
                    value={section.label}
                    onChange={(event) =>
                      updateSection(section.id, { label: event.target.value })
                    }
                    className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Texto del menú"
                  />
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted">
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, "up")}
                      className="rounded-full border border-border px-2 py-1 transition hover:border-primary/60 hover:text-primary"
                      aria-label="Subir sección"
                    >
                      ↑
                    </button>
                    <span>{section.order}</span>
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, "down")}
                      className="rounded-full border border-border px-2 py-1 transition hover:border-primary/60 hover:text-primary"
                      aria-label="Bajar sección"
                    >
                      ↓
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-6 grid gap-6 rounded-[20px] border border-border/70 bg-background/60 p-5">
                    {section.id === "preboda" && (
                      <div className="grid gap-4">
                        <InputField
                          label="Eyebrow"
                          value={content.prebodaEyebrow}
                          onChange={(value) => updateField("prebodaEyebrow", value)}
                        />
                        <InputField
                          label="Título"
                          value={content.prebodaTitle}
                          onChange={(value) => updateField("prebodaTitle", value)}
                        />
                        <TextAreaField
                          label="Descripción"
                          value={content.prebodaDescription}
                          onChange={(value) =>
                            updateField("prebodaDescription", value)
                          }
                        />
                        <InputField
                          label="Horario"
                          value={content.prebodaTime}
                          onChange={(value) => updateField("prebodaTime", value)}
                        />
                        <InputField
                          label="Lugar"
                          value={content.prebodaPlace}
                          onChange={(value) => updateField("prebodaPlace", value)}
                        />
                        <InputField
                          label="Link mapa preboda"
                          value={content.prebodaMapUrl}
                          onChange={(value) => updateField("prebodaMapUrl", value)}
                        />
                        <InputField
                          label="Etiqueta tarjeta 1"
                          value={content.prebodaCardOneLabel}
                          onChange={(value) =>
                            updateField("prebodaCardOneLabel", value)
                          }
                        />
                        <InputField
                          label="Botón tarjeta 1"
                          value={content.prebodaCardOneCtaLabel}
                          onChange={(value) =>
                            updateField("prebodaCardOneCtaLabel", value)
                          }
                        />
                        <InputField
                          label="Etiqueta tarjeta 2"
                          value={content.prebodaCardTwoLabel}
                          onChange={(value) =>
                            updateField("prebodaCardTwoLabel", value)
                          }
                        />
                        <InputField
                          label="Título tarjeta 2"
                          value={content.prebodaCardTwoTitle}
                          onChange={(value) =>
                            updateField("prebodaCardTwoTitle", value)
                          }
                        />
                        <TextAreaField
                          label="Descripción tarjeta 2"
                          value={content.prebodaCardTwoDescription}
                          onChange={(value) =>
                            updateField("prebodaCardTwoDescription", value)
                          }
                        />
                      </div>
                    )}

                    {section.id === "ceremonia" && (
                      <div className="grid gap-4">
                        <InputField
                          label="Eyebrow"
                          value={content.ceremonyEyebrow}
                          onChange={(value) => updateField("ceremonyEyebrow", value)}
                        />
                        <InputField
                          label="Título"
                          value={content.ceremonyTitle}
                          onChange={(value) => updateField("ceremonyTitle", value)}
                        />
                        <TextAreaField
                          label="Descripción"
                          value={content.ceremonyDescription}
                          onChange={(value) =>
                            updateField("ceremonyDescription", value)
                          }
                        />
                        <InputField
                          label="Etiqueta tarjeta 1"
                          value={content.ceremonyCardOneLabel}
                          onChange={(value) =>
                            updateField("ceremonyCardOneLabel", value)
                          }
                        />
                        <InputField
                          label="Título tarjeta 1"
                          value={content.ceremonyCardOneTitle}
                          onChange={(value) =>
                            updateField("ceremonyCardOneTitle", value)
                          }
                        />
                        <TextAreaField
                          label="Descripción tarjeta 1"
                          value={content.ceremonyCardOneDescription}
                          onChange={(value) =>
                            updateField("ceremonyCardOneDescription", value)
                          }
                        />
                        <InputField
                          label="Etiqueta tarjeta 2"
                          value={content.ceremonyCardTwoLabel}
                          onChange={(value) =>
                            updateField("ceremonyCardTwoLabel", value)
                          }
                        />
                        <InputField
                          label="Título tarjeta 2"
                          value={content.ceremonyCardTwoTitle}
                          onChange={(value) =>
                            updateField("ceremonyCardTwoTitle", value)
                          }
                        />
                        <TextAreaField
                          label="Descripción tarjeta 2"
                          value={content.ceremonyCardTwoDescription}
                          onChange={(value) =>
                            updateField("ceremonyCardTwoDescription", value)
                          }
                        />
                      </div>
                    )}

                    {section.id === "detalles" && (
                      <div className="grid gap-6">
                        <InputField
                          label="Eyebrow"
                          value={content.practicalEyebrow}
                          onChange={(value) =>
                            updateField("practicalEyebrow", value)
                          }
                        />
                        <InputField
                          label="Título"
                          value={content.practicalTitle}
                          onChange={(value) =>
                            updateField("practicalTitle", value)
                          }
                        />
                        <TextAreaField
                          label="Descripción"
                          value={content.practicalDescription}
                          onChange={(value) =>
                            updateField("practicalDescription", value)
                          }
                        />
                        <div className="grid gap-4">
                          {content.practicalItems.map((item, index) => (
                            <div
                              key={`${item.title}-${index}`}
                              className="grid gap-3 rounded-2xl border border-border/70 bg-surface/70 p-4"
                            >
                              <div className="grid gap-3 sm:grid-cols-2">
                                <InputField
                                  label="Icono"
                                  value={item.icon}
                                  onChange={(value) =>
                                    updatePracticalItem(index, "icon", value)
                                  }
                                />
                                <InputField
                                  label="Título"
                                  value={item.title}
                                  onChange={(value) =>
                                    updatePracticalItem(index, "title", value)
                                  }
                                />
                              </div>
                              <TextAreaField
                                label="Descripción"
                                value={item.description}
                                onChange={(value) =>
                                  updatePracticalItem(index, "description", value)
                                }
                              />
                              <button
                                type="button"
                                onClick={() => removePracticalItem(index)}
                                className="w-fit rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                              >
                                Eliminar
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addPracticalItem}
                            className="w-fit rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                          >
                            Añadir detalle
                          </button>
                        </div>
                      </div>
                    )}

                    {section.id === "cronograma" && (
                      <div className="grid gap-6">
                        <InputField
                          label="Eyebrow"
                          value={content.timelineEyebrow}
                          onChange={(value) =>
                            updateField("timelineEyebrow", value)
                          }
                        />
                        <InputField
                          label="Título"
                          value={content.timelineTitle}
                          onChange={(value) => updateField("timelineTitle", value)}
                        />
                        <TextAreaField
                          label="Descripción"
                          value={content.timelineDescription}
                          onChange={(value) =>
                            updateField("timelineDescription", value)
                          }
                        />
                        <div className="grid gap-4">
                          {content.timelineItems.map((item, index) => (
                            <div
                              key={`${item.time}-${index}`}
                              className="grid gap-3 rounded-2xl border border-border/70 bg-surface/70 p-4"
                            >
                              <div className="grid gap-3 sm:grid-cols-2">
                                <InputField
                                  label="Hora"
                                  value={item.time}
                                  onChange={(value) =>
                                    updateTimelineItem(index, "time", value)
                                  }
                                />
                                <InputField
                                  label="Icono"
                                  value={item.icon}
                                  onChange={(value) =>
                                    updateTimelineItem(index, "icon", value)
                                  }
                                />
                              </div>
                              <InputField
                                label="Título"
                                value={item.title}
                                onChange={(value) =>
                                  updateTimelineItem(index, "title", value)
                                }
                              />
                              <TextAreaField
                                label="Descripción"
                                value={item.description}
                                onChange={(value) =>
                                  updateTimelineItem(index, "description", value)
                                }
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
                                className="w-fit rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                              >
                                Eliminar
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addTimelineItem}
                            className="w-fit rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                          >
                            Añadir hito
                          </button>
                        </div>
                      </div>
                    )}

                    {section.id === "alojamiento" && (
                      <div className="grid gap-6">
                        <InputField
                          label="Eyebrow"
                          value={content.stayEyebrow}
                          onChange={(value) => updateField("stayEyebrow", value)}
                        />
                        <InputField
                          label="Título"
                          value={content.stayTitle}
                          onChange={(value) => updateField("stayTitle", value)}
                        />
                        <TextAreaField
                          label="Descripción"
                          value={content.stayDescription}
                          onChange={(value) => updateField("stayDescription", value)}
                        />
                        <InputField
                          label="Texto botón mapa"
                          value={content.stayLinkLabel}
                          onChange={(value) => updateField("stayLinkLabel", value)}
                        />
                        <div className="grid gap-4">
                          {content.stayOptions.map((item, index) => (
                            <div
                              key={`${item.name}-${index}`}
                              className="grid gap-3 rounded-2xl border border-border/70 bg-surface/70 p-4"
                            >
                              <InputField
                                label="Nombre"
                                value={item.name}
                                onChange={(value) =>
                                  updateStayOption(index, "name", value)
                                }
                              />
                              <TextAreaField
                                label="Descripción"
                                value={item.description}
                                onChange={(value) =>
                                  updateStayOption(index, "description", value)
                                }
                              />
                              <div className="grid gap-3 sm:grid-cols-2">
                                <InputField
                                  label="Distancia"
                                  value={item.distance}
                                  onChange={(value) =>
                                    updateStayOption(index, "distance", value)
                                  }
                                />
                                <InputField
                                  label="Link"
                                  value={item.link}
                                  onChange={(value) =>
                                    updateStayOption(index, "link", value)
                                  }
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeStayOption(index)}
                                className="w-fit rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                              >
                                Eliminar
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addStayOption}
                            className="w-fit rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                          >
                            Añadir alojamiento
                          </button>
                        </div>
                      </div>
                    )}

                    {section.id === "regalos" && (
                      <div className="grid gap-4">
                        <InputField
                          label="Eyebrow"
                          value={content.giftsEyebrow}
                          onChange={(value) => updateField("giftsEyebrow", value)}
                        />
                        <InputField
                          label="Título"
                          value={content.giftsTitle}
                          onChange={(value) => updateField("giftsTitle", value)}
                        />
                        <TextAreaField
                          label="Descripción"
                          value={content.giftsDescription}
                          onChange={(value) =>
                            updateField("giftsDescription", value)
                          }
                        />
                        <InputField
                          label="Mesa de regalos: título"
                          value={content.giftsRegistryTitle}
                          onChange={(value) =>
                            updateField("giftsRegistryTitle", value)
                          }
                        />
                        <TextAreaField
                          label="Mesa de regalos: descripción"
                          value={content.giftsRegistryDescription}
                          onChange={(value) =>
                            updateField("giftsRegistryDescription", value)
                          }
                        />
                        <InputField
                          label="Mesa de regalos: botón"
                          value={content.giftsRegistryCtaLabel}
                          onChange={(value) =>
                            updateField("giftsRegistryCtaLabel", value)
                          }
                        />
                        <InputField
                          label="Mesa de regalos: link"
                          value={content.giftLink}
                          onChange={(value) => updateField("giftLink", value)}
                        />
                        <InputField
                          label="Regalo privado: título"
                          value={content.giftsBankTitle}
                          onChange={(value) => updateField("giftsBankTitle", value)}
                        />
                        <TextAreaField
                          label="Regalo privado: descripción"
                          value={content.giftsBankDescription}
                          onChange={(value) =>
                            updateField("giftsBankDescription", value)
                          }
                        />
                      </div>
                    )}

                    {section.id === "faq" && (
                      <div className="grid gap-6">
                        <InputField
                          label="Eyebrow"
                          value={content.faqEyebrow}
                          onChange={(value) => updateField("faqEyebrow", value)}
                        />
                        <InputField
                          label="Título"
                          value={content.faqTitle}
                          onChange={(value) => updateField("faqTitle", value)}
                        />
                        <TextAreaField
                          label="Descripción"
                          value={content.faqDescription}
                          onChange={(value) =>
                            updateField("faqDescription", value)
                          }
                        />
                        <div className="grid gap-4">
                          {content.faqItems.map((item, index) => (
                            <div
                              key={`${item.question}-${index}`}
                              className="grid gap-3 rounded-2xl border border-border/70 bg-surface/70 p-4"
                            >
                              <InputField
                                label="Pregunta"
                                value={item.question}
                                onChange={(value) =>
                                  updateFaqItem(index, "question", value)
                                }
                              />
                              <TextAreaField
                                label="Respuesta"
                                value={item.answer}
                                onChange={(value) =>
                                  updateFaqItem(index, "answer", value)
                                }
                              />
                              <button
                                type="button"
                                onClick={() => removeFaqItem(index)}
                                className="w-fit rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                              >
                                Eliminar
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addFaqItem}
                            className="w-fit rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                          >
                            Añadir pregunta
                          </button>
                        </div>
                      </div>
                    )}

                    {section.id === "asistencia" && (
                      <div className="grid gap-6">
                        <InputField
                          label="Eyebrow"
                          value={content.rsvpEyebrow}
                          onChange={(value) => updateField("rsvpEyebrow", value)}
                        />
                        <InputField
                          label="Título"
                          value={content.rsvpTitle}
                          onChange={(value) => updateField("rsvpTitle", value)}
                        />
                        <TextAreaField
                          label="Descripción"
                          value={content.rsvpDescription}
                          onChange={(value) =>
                            updateField("rsvpDescription", value)
                          }
                        />
                        <InputField
                          label="Texto contacto (email)"
                          value={content.rsvpContactLead}
                          onChange={(value) =>
                            updateField("rsvpContactLead", value)
                          }
                        />
                        <InputField
                          label="Texto contacto (WhatsApp)"
                          value={content.rsvpContactWhatsappLead}
                          onChange={(value) =>
                            updateField("rsvpContactWhatsappLead", value)
                          }
                        />
                        <InputField
                          label="Título notas importantes"
                          value={content.rsvpImportantTitle}
                          onChange={(value) =>
                            updateField("rsvpImportantTitle", value)
                          }
                        />
                        <div className="grid gap-4">
                          {content.rsvpImportantNotes.map((note, index) => (
                            <div
                              key={`${note}-${index}`}
                              className="grid gap-2 rounded-2xl border border-border/70 bg-surface/70 p-4"
                            >
                              <TextAreaField
                                label={`Nota ${index + 1}`}
                                value={note}
                                onChange={(value) => updateRsvpNote(index, value)}
                              />
                              <button
                                type="button"
                                onClick={() => removeRsvpNote(index)}
                                className="w-fit rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                              >
                                Eliminar
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addRsvpNote}
                            className="w-fit rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                          >
                            Añadir nota
                          </button>
                        </div>
                      </div>
                    )}

                    {section.id === "ubicacion" && (
                      <div className="grid gap-4">
                        <InputField
                          label="Eyebrow"
                          value={content.locationEyebrow}
                          onChange={(value) =>
                            updateField("locationEyebrow", value)
                          }
                        />
                        <InputField
                          label="Título"
                          value={content.locationTitle}
                          onChange={(value) => updateField("locationTitle", value)}
                        />
                        <TextAreaField
                          label="Descripción"
                          value={content.locationDescription}
                          onChange={(value) =>
                            updateField("locationDescription", value)
                          }
                        />
                        <InputField
                          label="Nombre ubicación"
                          value={content.locationName}
                          onChange={(value) => updateField("locationName", value)}
                        />
                        <TextAreaField
                          label="Dirección"
                          value={content.locationAddress}
                          onChange={(value) =>
                            updateField("locationAddress", value)
                          }
                        />
                        <InputField
                          label="Link mapa"
                          value={content.locationMapUrl}
                          onChange={(value) => updateField("locationMapUrl", value)}
                        />
                        <InputField
                          label="Texto botón mapa"
                          value={content.locationMapLabel}
                          onChange={(value) =>
                            updateField("locationMapLabel", value)
                          }
                        />
                        <InputField
                          label="Maps: URL Boda"
                          value={content.weddingMapsUrl}
                          onChange={(value) =>
                            updateField("weddingMapsUrl", value)
                          }
                        />
                        <InputField
                          label="Maps: URL Preboda"
                          value={content.prebodaMapsUrl}
                          onChange={(value) =>
                            updateField("prebodaMapsUrl", value)
                          }
                        />
                        <InputField
                          label="Nombre ubicación boda"
                          value={content.weddingVenueName}
                          onChange={(value) =>
                            updateField("weddingVenueName", value)
                          }
                        />
                        <InputField
                          label="Nombre ubicación preboda"
                          value={content.prebodaVenueName}
                          onChange={(value) =>
                            updateField("prebodaVenueName", value)
                          }
                        />
                        <InputField
                          label="Título contacto"
                          value={content.locationContactTitle}
                          onChange={(value) =>
                            updateField("locationContactTitle", value)
                          }
                        />
                        <InputField
                          label="Email contacto"
                          value={content.contactEmail}
                          onChange={(value) => updateField("contactEmail", value)}
                        />
                        <InputField
                          label="Teléfono contacto"
                          value={content.contactPhone}
                          onChange={(value) => updateField("contactPhone", value)}
                        />
                        <InputField
                          label="WhatsApp link"
                          value={content.whatsappLink}
                          onChange={(value) => updateField("whatsappLink", value)}
                        />
                        <InputField
                          label="Etiqueta Email"
                          value={content.locationEmailLabel}
                          onChange={(value) =>
                            updateField("locationEmailLabel", value)
                          }
                        />
                        <InputField
                          label="Etiqueta Teléfono"
                          value={content.locationPhoneLabel}
                          onChange={(value) =>
                            updateField("locationPhoneLabel", value)
                          }
                        />
                        <InputField
                          label="Etiqueta WhatsApp"
                          value={content.locationWhatsappLabel}
                          onChange={(value) =>
                            updateField("locationWhatsappLabel", value)
                          }
                        />
                        <InputField
                          label="Texto acción WhatsApp"
                          value={content.locationWhatsappActionLabel}
                          onChange={(value) =>
                            updateField("locationWhatsappActionLabel", value)
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRestoreDefaults}
          className="rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
        >
          Restaurar valores por defecto
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        {label}
      </span>
      <input
        id={inputId}
        name={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-full border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const textareaId = useId();
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        {label}
      </span>
      <textarea
        id={textareaId}
        name={textareaId}
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-3xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
