"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { getFirestoreDb } from "@/lib/firebase";
import {
  DEFAULT_SECTIONS,
  mergeSections,
  parseSections,
  type SectionConfig,
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
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
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
          const merged = mergeSections(DEFAULT_SECTIONS, parseSections(data.sections));
          setSections(normalizeOrders(sortSections(merged)));
        } else {
          setSections(normalizeOrders(sortSections(DEFAULT_SECTIONS)));
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
    () => normalizeOrders(sortSections(sections)),
    [sections],
  );

  function updateSection(id: string, patch: Partial<SectionConfig>) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, ...patch } : section,
      ),
    );
  }

  function moveSection(id: string, direction: "up" | "down") {
    const ordered = sortSections(sections);
    const index = ordered.findIndex((section) => section.id === id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;
    const swapped = [...ordered];
    [swapped[index], swapped[targetIndex]] = [
      swapped[targetIndex],
      swapped[index],
    ];
    setSections(normalizeOrders(swapped));
  }

  function handleRestoreDefaults() {
    setSections(normalizeOrders(sortSections(DEFAULT_SECTIONS)));
    setMessage(null);
    setError(null);
  }

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const invalidLabel = sortedSections.find(
      (section) => section.nav && section.label.trim().length === 0,
    );
    if (invalidLabel) {
      setError("El texto del menú no puede estar vacío si está visible.");
      setIsSaving(false);
      return;
    }

    try {
      const db = getFirestoreDb();
      await setDoc(
        doc(db, "config", "general"),
        { sections: sortedSections },
        { merge: true },
      );
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
          Activa o desactiva secciones, controla el orden y el texto del menú sin
          editar JSON.
        </p>
      </header>

      <section className="overflow-hidden rounded-[24px] border border-border/70 bg-surface/95 shadow-[var(--shadow-soft)]">
        <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr_1fr_0.6fr] gap-4 border-b border-border/70 px-5 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          <span>Sección</span>
          <span>Visible</span>
          <span>Menú</span>
          <span>Texto menú</span>
          <span>Orden</span>
        </div>
        <div className="divide-y divide-border/70">
          {sortedSections.map((section) => (
            <div
              key={section.id}
              className="grid grid-cols-[1.1fr_0.7fr_0.7fr_1fr_0.6fr] items-center gap-4 px-5 py-4"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {SECTION_LABELS[section.id] ?? section.id}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  {section.id}
                </p>
              </div>
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
          ))}
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
