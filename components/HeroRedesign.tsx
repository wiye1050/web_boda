"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { ChevronDown } from "lucide-react";

type HeroRedesignProps = {
  config: {
    heroTitle: string;
    heroDescription: string;
    eventDate: string;
    locationName: string;
    locationAddress: string;
  };
};

export function HeroRedesign({ config }: HeroRedesignProps) {
  return (
    <header className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-32 pb-32 bg-background overflow-hidden">


      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center gap-8 md:gap-12"
      >
        {/* Names & Date Header */}
        <div className="flex flex-col items-center gap-2 md:gap-4">
          <h1 className="font-script text-6xl md:text-8xl lg:text-9xl text-foreground font-normal leading-tight">
            Alba <span className="text-accent italic">&</span> Guille
          </h1>
          <div className="h-px w-16 md:w-24 bg-accent/20 my-1 md:my-2" />
          <h2 className="font-serif text-lg md:text-xl lg:text-2xl text-muted/80 tracking-[0.3em] font-light">
            12 de Septiembre · 2026
          </h2>
        </div>

        {/* Central Illustration */}
        <div className="relative w-full flex justify-center mt-2 mb-2 md:mt-4 md:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
            className="relative w-full max-w-[420px] md:max-w-[550px] h-[65vh] min-h-[580px] md:min-h-[750px] mix-blend-multiply [&>img]:object-contain [&>img]:object-center"
            style={{
              // Fallback inline style for Webkit support, but the actual responsive magic happens via CSS Variables or utility classes
              WebkitMaskImage: "radial-gradient(ellipse 90% 140% at center, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
              maskImage: "radial-gradient(ellipse 90% 140% at center, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)"
            }}
          >
            <Image
              src="/photos/hero/hero_ilustracion.png"
              alt="Ilustración Alba y Guille"
              fill
              className="scale-[0.98] md:scale-100"
              priority
            />
          </motion.div>
        </div>

        {/* Poetic Subtext */}
        <div className="flex flex-col items-center gap-6 max-w-lg">
          <p className="text-foreground/80 font-sans font-light leading-relaxed text-sm md:text-base italic px-4">
            &ldquo;{config.heroDescription || "Dos caminos que se unen, una historia por escribir y mil momentos para compartir con vosotros."}&rdquo;
          </p>

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
            className="inline-block relative overflow-hidden bg-accent text-white px-8 py-3 rounded-full text-[10px] md:text-xs tracking-[0.25em] hover:bg-accent/90 transition-all duration-300 uppercase font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Añadir al Calendario
          </a>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-secondary/40"
      >
        <ChevronDown size={32} strokeWidth={1} />
      </motion.div>
    </header>
  );
}
