"use client";

import { motion } from "framer-motion";
import { HeroSlideshow } from "./HeroSlideshow";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { ArrowDown } from "lucide-react";
import { FadeIn } from "./FadeIn";

type HeroEditorialProps = {
  config: {
    heroTitle: string;
    heroDescription: string;
    eventDate: string;
    eventTimeRange: string;
    locationName: string;
    locationAddress: string;
    locationMapUrl: string;
    brandName: string;
    heroEyebrow: string;
  };
  images: string[];
};

export function HeroEditorial({ config, images }: HeroEditorialProps) {
  return (
    <section className="relative min-h-[95vh] w-full overflow-hidden bg-background px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* Main Container - The "Frame" comes from the padding of the section bg */}
      <div className="relative flex h-full min-h-[85vh] w-full flex-col overflow-hidden rounded-[32px] sm:rounded-[48px] lg:flex-row shadow-2xl shadow-stone-200/50 ring-1 ring-black/5">
        
        {/* BACKGROUND SLIDESHOW (The visual core) */}
        <div className="absolute inset-0 h-full w-full">
           <HeroSlideshow
            images={images}
            intervalMs={6000}
            className="h-full w-full"
            imageClassName="object-cover"
          />
          {/* Overlays for readable text */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/30 lg:to-transparent" />
        </div>

        {/* CONTENT LAYOUT - CENTERED */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-12 text-center text-white sm:px-10 lg:px-16 lg:pb-0">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6"
          >
            {/* Top Badge/Eyebrow */}
            <div className="flex w-fit items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/90">
                {config.heroEyebrow || "Save the Date"}
              </span>
            </div>

            {/* Main Title - Huge & Editorial */}
            <h1 className="font-display text-[4rem] font-medium leading-[0.9] tracking-tight text-white sm:text-[5.5rem] lg:text-[7.5rem] drop-shadow-md">
              {config.heroTitle}
            </h1>

            {/* Subtitle / Description */}
            <p className="max-w-xl font-sans text-lg font-light leading-relaxed text-white/90 sm:text-xl drop-shadow-sm">
              {config.heroDescription}
            </p>

            <div className="my-2 h-px w-24 bg-white/30" />

            {/* Details Grid (Date & Location) */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-12">
              <div>
                <p className="font-display text-2xl text-white">
                  {config.eventDate}
                </p>
                <p className="text-sm text-white/60">{config.eventTimeRange}</p>
              </div>
              <div className="hidden h-8 w-px bg-white/20 sm:block" />
              <div>
                <p className="font-display text-2xl text-white">
                  {config.locationName}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm text-white/60">{config.locationAddress}</p>
                </div>
              </div>
            </div>

            {/* CTA Actions - Calendar Only */}
            <div className="mt-8 flex justify-center">
              <a
                href={getGoogleCalendarUrl({
                  title: config.brandName || "Boda",
                  description: config.heroDescription,
                  location: `${config.locationName}, ${config.locationAddress}`,
                  start: new Date("2026-09-12T13:30:00"),
                  end: new Date("2026-09-13T02:00:00"),
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-full border border-white/30 bg-black/20 px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-white/10"
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
           transition={{ delay: 1.5, duration: 1 }}
           className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
             <ArrowDown className="animate-bounce text-white/50" size={24} />
        </motion.div>
      </div>
    </section>
  );
}
