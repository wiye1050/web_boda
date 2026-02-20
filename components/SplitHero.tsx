"use client";

import { motion } from "framer-motion";
import { HeroSlideshow } from "./HeroSlideshow";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { ArrowDown } from "lucide-react";

type SplitHeroProps = {
  config: {
    heroTitle: string;
    heroDescription: string;
    eventDate: string; // e.g. "12 de septiembre · 2026"
    eventTimeRange: string;
    heroStatTimeNote: string;
    locationName: string;
    locationAddress: string;
    locationMapUrl: string;
    brandName: string;
    heroEyebrow: string;
  };
  images: string[];
};

export function SplitHero({ config, images }: SplitHeroProps) {
  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden lg:flex-row">
      {/* LEFT: Content Side (Desktop) / Bottom (Mobile) */}
      <div className="order-2 flex flex-1 flex-col justify-center bg-background px-6 py-12 text-center lg:order-1 lg:w-[30%] lg:px-10 lg:text-left xl:px-12">
        
        {/* Main Title Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
        >
          <div className="space-y-2">
            <h1 className="font-display text-[3.5rem] font-medium leading-[0.95] tracking-tight text-foreground sm:text-[5rem] lg:text-[4.5rem] xl:text-[6rem]">
              {config.heroTitle}
            </h1>
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted">
              {config.heroEyebrow || "Nos casamos"}
            </p>
          </div>

          {/* Divider line */}
          <div className="mx-auto h-px w-24 bg-border lg:mx-0" />

          {/* Important Details Grid */}
          <div className="flex flex-col gap-8 pt-4 lg:flex-row lg:flex-wrap lg:gap-12">
            
            {/* Date Block */}
            <div className="flex flex-col gap-1">
              <span className="font-serif text-lg italic text-muted-foreground">
                ¿Cuándo?
              </span>
              <p className="text-xl font-medium text-foreground">
                {config.eventDate}
              </p>
              <p className="text-sm text-muted">
                {config.eventTimeRange}
              </p>
              <div className="mt-2">
                 <a
                    href={getGoogleCalendarUrl({
                      title: config.brandName || "Boda Alba & Guille",
                      description: config.heroDescription,
                      location: `${config.locationName}, ${config.locationAddress}`,
                      start: new Date("2026-09-12T13:30:00"),
                      end: new Date("2026-09-13T02:00:00"),
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                 >
                    <span>Añadir al calendario</span>
                 </a>
              </div>
            </div>

            {/* Location Block */}
            <div className="flex flex-col gap-1">
              <span className="font-serif text-lg italic text-muted-foreground">
                ¿Dónde?
              </span>
              <p className="text-xl font-medium text-foreground">
                {config.locationName}
              </p>
              <p className="max-w-[250px] text-sm text-muted lg:mx-0">
                {config.locationAddress}
              </p>
              {config.locationMapUrl && (
                <a
                  href={config.locationMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-foreground lg:justify-start"
                >
                  Ver mapa
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1, duration: 1 }}
           className="absolute bottom-6 left-0 right-0 hidden justify-center lg:flex"
        >
             <ArrowDown className="animate-bounce text-muted/50" size={24} />
        </motion.div>
      </div>

      {/* RIGHT: Image Side (Desktop) / Top (Mobile) */}
      <div className="relative order-1 h-[72vh] w-full flex-1 overflow-hidden lg:order-2 lg:h-auto">
        <HeroSlideshow
          images={images}
          intervalMs={6000}
          className="absolute inset-0 h-full w-full"
          imageClassName="object-[50%_25%]"
        />
        {/* Desktop Gradient Overlay (Left) */}
        <div className="absolute inset-y-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-surface to-transparent lg:block" />

        {/* Right Gradient Overlay */}
        <div className="absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-surface to-transparent" />

        {/* Top Gradient Overlay */}
        <div className="absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-surface to-transparent" />
        
        {/* Bottom Gradient Overlay (visible on all screens) */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-surface to-transparent" />
      </div>
    </section>
  );
}
