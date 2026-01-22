"use client";

import { useRef, useState } from "react";
import { MapsChooserModal } from "@/components/MapsChooserModal";
import { DEFAULT_PUBLIC_CONTENT, type MapsModalCopy } from "@/lib/publicContent";

type LocationOption = {
  name: string;
  url: string;
};

type MobileBottomBarProps = {
  confirmHref?: string;
  wedding: LocationOption | null;
  preboda: LocationOption | null;
  weddingVenueName?: string;
  confirmLabel?: string;
  mapsLabel?: string;
  mapsModalCopy?: MapsModalCopy;
  shareTitle?: string;
  shareText?: string;
  shareUrl?: string;
};

export function MobileBottomBar({
  confirmHref = "#asistencia",
  wedding,
  preboda,
  weddingVenueName,
  confirmLabel = DEFAULT_PUBLIC_CONTENT.mobileBar.confirmLabel,
  mapsLabel = DEFAULT_PUBLIC_CONTENT.mobileBar.mapsLabel,
  mapsModalCopy = DEFAULT_PUBLIC_CONTENT.mapsModal,
  shareTitle = "Alba & Guille | Nuestra boda",
  shareText = "Consulta horarios, ubicación y confirma tu asistencia.",
  shareUrl,
}: MobileBottomBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const canOpen = Boolean(wedding?.url);
  const mapsButtonRef = useRef<HTMLButtonElement>(null);

  async function handleShare() {
    setShareMessage(null);
    const targetUrl =
      shareUrl ||
      (typeof window !== "undefined" ? window.location.href : "https://web-boda-delta.vercel.app/");
    const payload = {
      title: shareTitle,
      text: shareText,
      url: targetUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch (error) {
        console.error("Share cancelled or failed", error);
      }
      return;
    }
    if (navigator.clipboard && targetUrl) {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setShareMessage("Enlace copiado");
        setTimeout(() => setShareMessage(null), 2000);
      } catch (error) {
        console.error("No se pudo copiar el enlace", error);
        setShareMessage("No se pudo copiar el enlace");
        setTimeout(() => setShareMessage(null), 2000);
      }
    }
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-surface/90 px-4 py-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-3 gap-3 pb-[env(safe-area-inset-bottom)]">
          <a
            href={confirmHref}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg shadow-primary/30"
          >
            {confirmLabel}
          </a>
          <button
            ref={mapsButtonRef}
            type="button"
            disabled={!canOpen}
            onClick={() => setIsOpen(true)}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-border/80 bg-surface px-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mapsLabel}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-border/80 bg-surface px-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
          >
            Compartir
          </button>
        </div>
        {shareMessage && (
          <p className="mt-2 text-center text-[0.7rem] uppercase tracking-[0.2em] text-muted">
            {shareMessage}
          </p>
        )}
      </div>
      <MapsChooserModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          mapsButtonRef.current?.focus();
        }}
        wedding={wedding}
        preboda={preboda}
        weddingVenueName={weddingVenueName}
        copy={mapsModalCopy}
      />
    </>
  );
}
