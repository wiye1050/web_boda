"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const AUDIO_SRC = "/audio/cancion_1.mp3";
const PREF_KEY = "wb_music_pref"; // "yes" | "no"

export function AmbientMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  // Load audio and set up listeners
  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0;
    audio.addEventListener("canplaythrough", () => setReady(true));
    audioRef.current = audio;

    const handleVisibilityChange = () => {
      if (document.hidden && audioRef.current) {
        audioRef.current.pause();
        setPlaying(false);
      }
    };

    const handlePageHide = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlaying(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      audio.pause();
      audio.src = "";
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
    };
  }, []);

  // Show banner after 2.5s if no preference saved yet
  useEffect(() => {
    const pref = sessionStorage.getItem(PREF_KEY);
    if (pref === "yes") {
      // Already said yes this session - show button only
      setButtonVisible(true);
      return;
    }
    if (pref === "no") {
      setButtonVisible(true);
      return;
    }
    const t = setTimeout(() => setShowBanner(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Fade audio volume in/out
  const fadeIn = (audio: HTMLAudioElement) => {
    audio.volume = 0;
    const step = () => {
      if (audio.volume < 0.33) {
        audio.volume = Math.min(audio.volume + 0.02, 0.33);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  const handleYes = () => {
    sessionStorage.setItem(PREF_KEY, "yes");
    setShowBanner(false);
    setButtonVisible(true);
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => {
      setPlaying(true);
      fadeIn(audio);
    }).catch(() => {});
  };

  const handleNo = () => {
    sessionStorage.setItem(PREF_KEY, "no");
    setShowBanner(false);
    setButtonVisible(true);
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => {
        setPlaying(true);
        fadeIn(audio);
      }).catch(() => {});
    }
  };

  return (
    <>
      {/* Consent banner */}
      {showBanner && (
        <div
          className="fixed bottom-28 sm:bottom-6 left-1/2 -translate-x-1/2 z-[70] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 sm:gap-3 rounded-full border border-border/40 bg-surface/95 px-4 py-2 sm:px-5 sm:py-3 shadow-lg backdrop-blur-sm pointer-events-auto">
            <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-accent-strong" />
            <span className="text-[11px] sm:text-sm font-sans text-foreground/80 whitespace-nowrap">
              ¿Música de fondo?
            </span>
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={handleYes}
                className="rounded-full bg-accent-strong px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white transition hover:opacity-80 disabled:opacity-40"
              >
                Sí
              </button>
              <button
                onClick={handleNo}
                className="rounded-full border border-border/60 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/60 transition hover:text-foreground"
              >
                <span className="hidden sm:inline">No, gracias</span>
                <span className="sm:hidden">No</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      {buttonVisible && (
        <div className="fixed bottom-24 left-4 z-40 sm:bottom-10 sm:left-10">
          <button
            onClick={toggle}
            disabled={!ready}
            aria-label={playing ? "Silenciar música" : "Reproducir música ambiente"}
            title={playing ? "Silenciar" : "Reproducir música"}
            className={cn(
              "group relative flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all duration-500",
              playing
                ? "bg-accent/10 border-accent/20 text-accent hover:bg-accent/20"
                : "bg-surface/40 border-border/20 text-muted/60 hover:text-foreground hover:bg-surface/80",
              !ready && "opacity-20 cursor-wait"
            )}
          >
            {playing ? (
              <Volume2 className="h-3.5 w-3.5" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
            {playing && (
              <span className="absolute inset-0 rounded-full animate-ping bg-accent/10 pointer-events-none" />
            )}
            <span className="absolute left-10 whitespace-nowrap rounded-full border border-border/10 bg-surface/90 px-2 py-0.5 text-[9px] tracking-widest uppercase text-muted/80 shadow-sm opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
              {playing ? "Silenciar" : "Música"}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
