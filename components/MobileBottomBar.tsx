"use client";

import { useRef, useState, useEffect } from "react";
import { MapsChooserModal } from "@/components/MapsChooserModal";
import { DEFAULT_PUBLIC_CONTENT, type MapsModalCopy } from "@/lib/publicContent";
import { Sparkles, Map, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isHidden, setIsHidden] = useState(false);
  const canOpen = Boolean(wedding?.url);
  const mapsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const target = document.getElementById("asistencia");
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsHidden(entries[0].isIntersecting);
      },
      {
        root: null,
        threshold: 0.15,
        rootMargin: "0px",
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  async function handleShare() {
    window.dispatchEvent(new CustomEvent("wb-pause-music"));
    setShareMessage(null);
    const targetUrl =
      shareUrl ||
      (typeof window !== "undefined" ? window.location.href : "https://ayg2026.vercel.app/");
    const payload = {
      title: shareTitle,
      text: shareText,
      url: targetUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Share failed", error);
        }
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
      <div
        className={cn(
          "fixed left-[50%] z-50 w-[94%] max-w-[420px] sm:hidden transition-transform duration-700 ease-in-out",
          isHidden ? "pointer-events-none opacity-0" : "opacity-100"
        )}
        style={{
          bottom: `calc(24px + env(safe-area-inset-bottom, 0px))`,
          transform: isHidden ? "translate(-50%, 120%)" : "translate(-50%, 0)",
        }}
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] px-2 py-2 flex items-center justify-between gap-2 shadow-2xl border border-white/60">
          <a
            href={confirmHref}
            className="flex-1 flex min-h-[52px] items-center justify-center rounded-full bg-foreground px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg active:scale-95 transition-all hover:bg-foreground/90 whitespace-nowrap"
          >
            {confirmLabel}
          </a>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('open-chat'))}
              aria-label="Abrir Asistente IA"
              className="flex min-h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-accent/10 transition-all active:scale-95 hover:bg-accent/20 border border-accent/20"
            >
              <Sparkles className="h-[18px] w-[18px] text-accent" strokeWidth={2} />
            </button>
            <button
              ref={mapsButtonRef}
              type="button"
              disabled={!canOpen}
              aria-label={mapsLabel}
              onClick={() => {
                window.dispatchEvent(new CustomEvent("wb-pause-music"));
                setIsOpen(true);
              }}
              className="flex min-h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white/40 transition-all active:scale-95 disabled:opacity-50 hover:bg-white/60 border border-white/20"
            >
              <Map className="h-[20px] w-[20px] text-foreground" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Compartir"
              className="flex min-h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white/40 transition-all active:scale-95 hover:bg-white/60 border border-white/20"
            >
              {shareMessage ? (
                <Check className="h-[20px] w-[20px] text-secondary animate-pulse" strokeWidth={1.5} />
              ) : (
                <Share2 className="h-[20px] w-[20px] text-foreground" strokeWidth={1.5} />
              )}
            </button>
          </div>
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
