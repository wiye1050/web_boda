"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { ArrowDown } from "lucide-react";
import Image from "next/image";

type HeroFloatingGalleryProps = {
  config: {
    heroTitle: string;
    heroDescription: string;
    eventDate: string;
    eventTimeRange: string;
    locationName: string;
    locationAddress: string;
  };
  localImages: string[]; // Paths to images in public/
};

// SLOT SYSTEM CONFIGURATION
const CYCLE_INTERVAL_MS = 6000; // Time between slot changes
const FADE_DURATION = 2; // Slow fade in/out

// 4 Fixed Slots - RESPONSIVE SAFE ZONES
// Uses % for position to scale with viewport
// Uses vmin for size to never exceed screen bounds vertically or horizontally
const SLOTS = [
  { id: "top-left", top: "30%", left: "18%", rotation: -6 },
  { id: "bottom-left", top: "60%", left: "12%", rotation: 4 },
  { id: "top-right", top: "25%", left: "82%", rotation: 5 },
  { id: "bottom-right", top: "58%", left: "88%", rotation: -3 },
];

export function HeroFloatingGallery({ config, localImages }: HeroFloatingGalleryProps) {
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (localImages.length === 0) return;

    // Cycle through slots sequentially
    const interval = setInterval(() => {
      setActiveSlotIndex((prev) => (prev + 1) % SLOTS.length);
      setCurrentImageIndex((prev) => (prev + 1) % localImages.length);
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [localImages]);

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden bg-background">
      {/* BACKGROUND LAYER - SLOTS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
           {/* We render distinct images for slots to persist? No, user wants them to appear/disappear. */}
           {/* Let's render the Current Slot's Image */}
           <motion.div
              key={`${activeSlotIndex}-${currentImageIndex}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: FADE_DURATION, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: SLOTS[activeSlotIndex].top,
                left: SLOTS[activeSlotIndex].left,
                transform: `translate(-50%, -50%) rotate(${SLOTS[activeSlotIndex].rotation}deg)`,
                // RESPONSIVE SIZING MATH:
                // 25vmin = 25% of smaller screen dimension (safe on mobile landscape and portrait)
                width: "25vmin", 
                maxWidth: "380px", // Hard cap for huge screens
                minWidth: "180px", // Don't get too small on mobile
                // Height constraints to prevent bottom clipping
                maxHeight: "35vh", 
                aspectRatio: "3/4", 
              }}
              // Added border/frame style: bg-white p-3 shadow-xl
              className="z-10 flex items-center justify-center p-3 sm:p-4 bg-white shadow-2xl skew-y-1"
            >
              <div className="relative w-full h-full bg-neutral-100 overflow-hidden"> 
                <Image
                  src={localImages[currentImageIndex % localImages.length]}
                  alt="Memory"
                  fill
                  className="object-contain" // Contain ensures full visibility inside frame
                  sizes="(max-width: 768px) 300px, 450px"
                  priority
                />
              </div>
            </motion.div>
            
            {/* Secondary Image (Previous Slot) to keep screen populated? */}
            {/* User said "Appear... Disappear". Sequential single focus is safest for "No Overlap". */}
            {/* But purely 1 image might be too empty. Let's try 2 alternating diagonals. */}
            
        </AnimatePresence>
        
        {/* Render a SECOND persistent layer for the "Previous" slot to overlap gracefully? */}
        {/* No, AnimatePresence handles the exit. The exiting image will fade out while new one fades in. */}
        {/* With "mode='wait'", one leaves THEN one enters. */}
        {/* With default mode, they overlap in time (crossfade). This is what we want. */}
      </div>

      {/* CONTENT LAYER - Centered & Safe - CLEAN STYLE (No BG) */}
      <div className="relative z-20 flex h-full min-h-[90vh] flex-col items-center justify-center px-4 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.2 }}
           className="flex flex-col items-center gap-6 p-8"
        >
          {/* Eyebrow */}
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">
            12 · SEPT · 2026
          </span>

          {/* Main Title */}
          <h1 className="font-display text-[4.5rem] leading-[0.9] text-foreground sm:text-[6rem] lg:text-[8rem] drop-shadow-sm">
            {config.heroTitle}
          </h1>

          {/* Description */}
          <p className="max-w-lg font-sans text-lg font-light text-foreground/80 sm:text-2xl">
            {config.heroDescription}
          </p>

          <div className="h-px w-16 bg-primary/30 my-2" />

          {/* Location */}
             <div className="flex flex-col gap-1">
                <p className="font-display text-2xl text-primary-strong">
                   {config.locationName}
                </p>
                <p className="text-sm text-foreground/60">{localImages.length > 0 ? "Galería en vivo" : config.locationAddress}</p>
             </div>

           {/* CTA */}
           <div className="mt-6">
              <a
                href={getGoogleCalendarUrl({
                  title: "Boda Alba & Guille",
                  description: config.heroDescription,
                  location: `${config.locationName}, ${config.locationAddress}`,
                  start: new Date("2026-09-12T13:30:00"),
                  end: new Date("2026-09-13T02:00:00"),
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-transform hover:scale-105 shadow-lg shadow-primary/20"
              >
                Añadir al Calendario
              </a>
            </div>
        </motion.div>
      </div>

       {/* Scroll Indicator */}
       <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 2, duration: 1 }}
           className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
             <ArrowDown className="animate-bounce text-primary/50" size={24} />
       </motion.div>
    </section>
  );
}
