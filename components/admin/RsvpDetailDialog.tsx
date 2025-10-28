"use client";

import { useEffect, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { RsvpRecord, RsvpStatus } from "./useRsvpData";
import { useAuth } from "@/components/admin/AuthContext";

type RsvpDetailDialogProps = {
  record: RsvpRecord | null;
  onClose: () => void;
};

const STATUS_OPTIONS: Array<{
  value: RsvpStatus;
  label: string;
  helper: string;
}> = [
  {
    value: "pendiente",
    label: "Pendiente",
    helper: "Todavía no se ha contactado al invitado.",
  },
  {
    value: "contactado",
    label: "Contactado",
    helper: "Ya hablaste con el invitado, queda cerrar detalles.",
  },
  {
    value: "confirmado",
    label: "Confirmado",
    helper: "Todo coordinado, listo para el gran día.",
  },
];

const TAG_SUGGESTIONS = [
  "familia",
  "amigos",
  "trabajo",
  "proveedor",
  "dietas",
  "transporte",
  "hotel",
  "mesa pendiente",
];

export function RsvpDetailDialog({ record, onClose }: RsvpDetailDialogProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState("");
  const [processed, setProcessed] = useState(false);
  const [status, setStatus] = useState<RsvpStatus>("pendiente");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(record?.notes ?? "");
    setProcessed(record?.processed ?? false);
    setStatus(record?.status ?? "pendiente");
    setSelectedTags(record?.tags ?? []);
    setNewTag("");
    setError(null);
    setIsSaving(false);
  }, [record]);

  if (!record) {
    return null;
  }

  const recordId = record.id;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setError(null);

    try {
      const db = getFirestoreDb();
      const docRef = doc(db, "rsvps", recordId);

      await updateDoc(docRef, {
        notes: notes.trim(),
        processed,
        status,
        tags: selectedTags.map((tag) => tag.trim()).filter(Boolean),
        updatedAt: serverTimestamp(),
        updatedBy: user?.email ?? null,
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar. Intenta de nuevo en unos segundos.");
    } finally {
      setIsSaving(false);
    }
  }

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const exists = selectedTags.some(
      (existing) => existing.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setNewTag("");
  }

  function removeTag(tag: string) {
    setSelectedTags((prev) =>
      prev.filter((existing) => existing.toLowerCase() !== tag.toLowerCase()),
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-2xl rounded-[24px] border border-border/80 bg-surface p-8 shadow-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Gestionar RSVP
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {record.fullName}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {record.email} · {record.phone}
            </p>
            {record.guestNames && (
              <p className="mt-1 text-xs text-muted">
                Acompañantes: {record.guestNames}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
          >
            Cerrar
          </button>
        </header>

        <div className="mt-6 grid gap-4 rounded-[20px] border border-border/70 bg-background/50 px-5 py-4 text-sm text-muted">
          <span>
            <strong className="font-semibold">Asistencia:</strong> {" "}
            {record.attendance === "si" ? "Sí" : "No"} · {record.guests} adultos
          </span>
          <span>
            <strong className="font-semibold">Preboda:</strong> {" "}
            {record.preboda === "si" ? "Confirma" : "No viene"}
          </span>
          <span>
            <strong className="font-semibold">Transporte:</strong> {" "}
            {record.needsTransport === "si"
              ? `${record.transportSeats ?? 0} plazas solicitadas`
              : "No requiere"}
          </span>
          {record.requests && (
            <span>
              <strong className="font-semibold">Notas invitado:</strong> {" "}
              {record.requests}
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="mt-6 flex flex-col gap-6">
          <label className="flex flex-col gap-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Estado del seguimiento
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as RsvpStatus)}
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted">
              {STATUS_OPTIONS.find((option) => option.value === status)?.helper}
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={processed}
              onChange={(event) => setProcessed(event.target.checked)}
              className="h-4 w-4 rounded border border-border/80 accent-primary"
            />
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
              RSVP procesado
            </span>
          </label>

          <label className="flex flex-col gap-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Notas internas
            </span>
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Añade observaciones, asignación de mesa, seguimiento, etc."
              className="rounded-3xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <div className="flex flex-col gap-3 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Etiquetas
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedTags.length === 0 && (
                <span className="text-xs uppercase tracking-[0.3em] text-muted">
                  Sin etiquetas
                </span>
              )}
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-accent/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/80"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-[0.65rem] uppercase tracking-[0.3em] text-muted hover:text-primary"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag(newTag);
                  }
                }}
                placeholder="Añadir etiqueta (Enter para guardar)"
                className="w-full rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => addTag(newTag)}
                className="mt-2 inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary sm:mt-0"
              >
                Añadir
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {TAG_SUGGESTIONS.map((tag) => {
                const active = selectedTags.some(
                  (existing) => existing.toLowerCase() === tag.toLowerCase(),
                );
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => (active ? removeTag(tag) : addTag(tag))}
                    className={[
                      "rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] transition",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted hover:border-primary/60 hover:text-primary",
                    ].join(" ")}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-xs text-primary">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
