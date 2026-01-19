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
};

export function MobileBottomBar({
  confirmHref = "#asistencia",
  wedding,
  preboda,
  weddingVenueName,
  confirmLabel = DEFAULT_PUBLIC_CONTENT.mobileBar.confirmLabel,
  mapsLabel = DEFAULT_PUBLIC_CONTENT.mobileBar.mapsLabel,
  mapsModalCopy = DEFAULT_PUBLIC_CONTENT.mapsModal,
}: MobileBottomBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const canOpen = Boolean(wedding?.url);
  const mapsButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-surface/90 px-4 py-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex w-full max-w-6xl gap-3 pb-[env(safe-area-inset-bottom)]">
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
        </div>
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
