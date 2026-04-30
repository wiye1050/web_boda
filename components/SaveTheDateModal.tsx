"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react";
import confetti from "canvas-confetti";

interface SaveTheDateModalProps {
  videoSrc?: string;
  onClose?: () => void;
}

export function SaveTheDateModal({
  videoSrc = "/media/save-the-date.mp4",
  onClose,
}: SaveTheDateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pauseIconTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem("wb_save_the_date_seen_v1");
    if (!seen) {
      setIsOpen(true);
      // Notify other components (AmbientMusic) that the video is open
      window.dispatchEvent(new CustomEvent("wb-video-opened"));
    }
  }, []);

  // Show mute hint 2s after video starts
  useEffect(() => {
    if (!hasStarted) return;
    hintTimer.current = setTimeout(() => {
      if (muted) setShowHint(true);
    }, 2000);
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, [hasStarted, muted]);

  // Hide hint when user unmutes
  useEffect(() => {
    if (!muted) {
      setShowHint(false);
      if (hintTimer.current) clearTimeout(hintTimer.current);
    }
  }, [muted]);

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 200,
      colors: ["#a67c00", "#f8f5f2", "#8b7e74"],
    };
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("wb_save_the_date_seen_v1", "true");
    if (onClose) onClose();
    fireConfetti();
    window.dispatchEvent(new CustomEvent("wb-video-closed"));
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
    setMuted((prev) => !prev);
  };

  const handleStartVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    setHasStarted(true);
    video.play();
    setIsPlaying(true);
  };

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
      // Show pause icon briefly
      setShowPauseIcon(true);
      if (pauseIconTimer.current) clearTimeout(pauseIconTimer.current);
      pauseIconTimer.current = setTimeout(() => setShowPauseIcon(false), 1500);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  // Listen for custom event to re-open video
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      window.dispatchEvent(new CustomEvent("wb-video-opened"));
    };
    window.addEventListener("wb-open-save-the-date", handleOpen);
    return () =>
      window.removeEventListener("wb-open-save-the-date", handleOpen);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-0 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.03, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-full w-full items-center justify-center md:h-auto md:max-w-5xl"
          >
            {/* Video — object-contain so nothing is cropped */}
            <video
              ref={videoRef}
              src={videoSrc}
              className="h-full w-full cursor-pointer object-contain md:max-h-[85vh] md:rounded-[2rem]"
              muted={muted}
              playsInline
              preload="metadata"
              onEnded={handleClose}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onClick={hasStarted ? handleVideoClick : undefined}
            />

            {/* Overlay gradients */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 md:rounded-[2rem]" />

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/10 md:rounded-b-[2rem]">
              <motion.div
                className="h-full bg-white/60"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Splash screen — shown before user presses play */}
            <AnimatePresence>
              {!hasStarted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.4 } }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-black/60 backdrop-blur-sm md:rounded-[2rem]"
                >
                  <motion.button
                    onClick={handleStartVideo}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition hover:bg-white/20"
                    aria-label="Reproducir vídeo"
                  >
                    <Play className="h-8 w-8 translate-x-1 fill-white text-white" />
                  </motion.button>
                  <p className="text-xs text-white/40 font-medium tracking-wide">Toca para ver el vídeo</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center play/pause icon — shows on pause (only after started) */}
            <AnimatePresence>
              {(!isPlaying || showPauseIcon) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                    {isPlaying ? (
                      <Pause className="h-7 w-7 text-white" />
                    ) : (
                      <Play className="h-7 w-7 translate-x-0.5 fill-white text-white" />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls — top right */}
            <div className="absolute right-4 top-4 z-40 flex gap-2 md:right-6 md:top-6">
              <button
                onClick={toggleMute}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-90"
                aria-label={muted ? "Activar sonido" : "Silenciar"}
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-90"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mute hint — fades out after interaction */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.4 }}
                  className="pointer-events-none absolute bottom-10 left-1/2 z-40 -translate-x-1/2"
                >
                  <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-6 py-3 backdrop-blur-md">
                    <Volume2 className="h-3.5 w-3.5 text-white/70" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                      Toca 🔊 para activar sonido
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
