"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if user has already seen the video this session
    const seen = sessionStorage.getItem("wb_save_the_date_seen");
    if (!seen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("wb_save_the_date_seen", "true");
    if (onClose) onClose();
    // Dispatch event to AmbientMusic
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.2 }}
            className="relative w-full max-w-5xl aspect-video md:aspect-[16/9] overflow-hidden rounded-3xl shadow-2xl bg-black"
          >
            {/* Video Element */}
            <video
              ref={videoRef}
              src={videoSrc}
              className="h-full w-full object-cover cursor-pointer"
              autoPlay
              muted={muted}
              loop
              playsInline
              onClick={handleVideoClick}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={toggleMute}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <button
                onClick={handleClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
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
                transition={{ delay: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-accent/90 text-white px-6 py-3 rounded-full backdrop-blur-md shadow-lg pointer-events-none"
              >
                <Play className="h-4 w-4 fill-current" />
                <span className="text-xs font-bold uppercase tracking-widest">Activar sonido</span>
              </motion.div>
            )}

            {/* Footer Text */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-medium">Save the Date</p>
              <h4 className="text-white text-lg md:text-2xl font-serif mt-1 italic">Alba & Guille</h4>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
