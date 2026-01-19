"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_PUBLIC_CONTENT, type MapsModalCopy } from "@/lib/publicContent";

type LocationOption = {
  name: string;
  url: string;
};

type MapsChooserModalProps = {
  open: boolean;
  onClose: () => void;
  wedding: LocationOption | null;
  preboda: LocationOption | null;
  weddingVenueName?: string;
  copy?: MapsModalCopy;
};

export function MapsChooserModal({
  open,
  onClose,
  wedding,
  preboda,
  weddingVenueName,
  copy = DEFAULT_PUBLIC_CONTENT.mapsModal,
}: MapsChooserModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          "button, a, input, textarea, select, [tabindex]:not([tabindex='-1'])",
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="maps-modal-title"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-t-[28px] border border-border/70 bg-surface/95 px-5 pb-[calc(env(safe-area-inset-bottom)_+_24px)] pt-5 shadow-[0_-20px_60px_rgba(0,0,0,0.35)] backdrop-blur"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="maps-modal-title"
              className="text-base font-semibold uppercase tracking-[0.3em] text-foreground"
            >
              {copy.title}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {copy.subtitle}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
          >
            {copy.closeLabel}
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {wedding && (
            <a
              href={wedding.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex flex-col gap-2 rounded-[20px] border border-primary/40 bg-primary/10 px-4 py-4 text-left transition hover:border-primary/70 hover:bg-primary/15"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground">
                {copy.weddingLabel}
              </span>
              <span className="text-sm text-muted">{copy.weddingNote}</span>
              {weddingVenueName && (
                <span className="text-xs text-muted">{weddingVenueName}</span>
              )}
            </a>
          )}
          {preboda && (
            <a
              href={preboda.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex flex-col gap-2 rounded-[20px] border border-border/80 bg-surface/80 px-4 py-4 text-left transition hover:border-primary/60"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground">
                {copy.prebodaLabel}
              </span>
              <span className="text-sm text-muted">{copy.prebodaNote}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                {copy.prebodaWarning}
              </span>
              {preboda.name && (
                <span className="text-xs text-muted">{preboda.name}</span>
              )}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
