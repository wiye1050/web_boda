"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export function AmbientMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay appearance so it doesn't clash with the envelope
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const audio = new Audio("/audio/cancion.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audio.addEventListener("canplaythrough", () => setReady(true));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 z-40 transition-all duration-500 sm:bottom-8 sm:left-8",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <button
        onClick={toggle}
        disabled={!ready}
        aria-label={playing ? "Silenciar música" : "Reproducir música ambiente"}
        title={playing ? "Silenciar" : "Reproducir música"}
        className={cn(
          "group relative flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition-all",
          playing
            ? "bg-foreground border-foreground text-white hover:bg-foreground/80"
            : "bg-surface/90 border-border/50 text-muted hover:border-primary/30 hover:text-foreground",
          !ready && "opacity-40 cursor-wait"
        )}
      >
        {playing ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}

        {/* Pulsing ring when playing */}
        {playing && (
          <span className="absolute inset-0 rounded-full animate-ping bg-foreground/20 pointer-events-none" />
        )}

        {/* Tooltip */}
        <span className="absolute left-12 whitespace-nowrap rounded-full border border-border/30 bg-surface/95 px-3 py-1 text-[10px] tracking-widest uppercase text-muted shadow-sm opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
          {playing ? "Silenciar" : "Música"}
        </span>
      </button>

      {/* First-time hint */}
      {!playing && ready && (
        <div className="absolute left-12 bottom-0 flex items-center gap-1 whitespace-nowrap rounded-full border border-accent/20 bg-accent-bg px-3 py-1 text-[9px] tracking-widest uppercase text-accent-strong shadow-sm animate-pulse pointer-events-none">
          <Music className="h-2.5 w-2.5" />
          Música ambiente
        </div>
      )}
    </div>
  );
}
