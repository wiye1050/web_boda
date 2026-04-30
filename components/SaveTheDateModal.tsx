"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface SaveTheDateModalProps {
  videoSrc?: string;
  onClose?: () => void;
}

export function SaveTheDateModal({ 
  videoSrc = "/media/save-the-date.mp4",
  onClose 
}: SaveTheDateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if user has already seen the video (localStorage for "only once ever")
    const seen = localStorage.getItem("wb_save_the_date_seen_v1");
    if (!seen) {
      setIsOpen(true);
    }
  }, []);

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200, colors: ["#a67c00", "#f8f5f2", "#8b7e74"] };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("wb_save_the_date_seen_v1", "true");
    if (onClose) onClose();
    
    // Transition effect
    fireConfetti();
    
    // Dispatch event to AmbientMusic or other components
    window.dispatchEvent(new CustomEvent("wb-video-closed"));
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(!muted);
    setHasInteracted(true);
  };

  const handleVideoClick = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
    }
    setHasInteracted(true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  // Listen for custom event to re-open video
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("wb-open-save-the-date", handleOpen);
    return () => window.removeEventListener("wb-open-save-the-date", handleOpen);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-0 md:p-8 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full md:h-auto md:max-w-5xl md:aspect-video overflow-hidden md:rounded-[2.5rem] shadow-2xl bg-black"
          >
            {/* Video Element */}
            <video
              ref={videoRef}
              src={videoSrc}
              className="h-full w-full object-cover cursor-pointer"
              autoPlay
              muted={muted}
              playsInline
              onEnded={handleClose}
              onTimeUpdate={handleTimeUpdate}
              onClick={handleVideoClick}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full z-30">
              <motion.div 
                className="h-full bg-accent"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="absolute top-6 right-6 flex gap-3 z-40">
              <button
                onClick={toggleMute}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xl border border-white/10 transition hover:bg-white/20 active:scale-90"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <button
                onClick={handleClose}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xl border border-white/10 transition hover:bg-white/20 active:scale-90"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Interaction Reminder */}
            {!hasInteracted && muted && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/10 text-white px-8 py-4 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl pointer-events-none z-40"
              >
                <Play className="h-4 w-4 fill-current text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Toca para activar sonido</span>
              </motion.div>
            )}

            {/* Footer Text */}
            <div className="absolute bottom-10 left-10 text-left pointer-events-none z-30 hidden md:block">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-medium mb-1">Nuestra Boda</p>
              <h4 className="text-white text-3xl font-serif italic">Save the Date</h4>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
