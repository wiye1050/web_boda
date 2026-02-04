"use client";

import { motion } from "framer-motion";
import type { TimelineItem } from "@/lib/publicContent";
import { 
  Heart, 
  GlassWater, 
  Utensils, 
  Music, 
  Bus, 
  Camera, 
  Church, 
  Moon,
  MapPin,
  Clock
} from "lucide-react";

type TimelineProps = {
  items: TimelineItem[];
};

import Image from "next/image";

// Map icon strings (emojis or keywords) to icon image paths
function getIcon(iconStr: string) {
  const lower = iconStr.toLowerCase();
  
  let iconSrc = "/icons/rings.png"; // default
  let altText = "Icono";

  if (lower.includes("ceremo") || lower.includes("💍") || lower.includes("sí") || lower.includes("si, eq")) {
    iconSrc = "/icons/rings.png";
    altText = "Anillos";
  } else if (lower.includes("cocktail") || lower.includes("còctel") || lower.includes("🍸") || lower.includes("🍹") || lower.includes("aperitivo") || lower.includes("vermu") || lower.includes("vermú") || lower.includes("vino") || lower.includes("bienvenida")) {
    iconSrc = "/icons/glasses.png";
    altText = "Copas Brindis";
  } else if (lower.includes("cena") || lower.includes("banquete") || lower.includes("🍽") || lower.includes("tierrina") || lower.includes("viñas") || lower.includes("comida") || lower.includes("almuerzo")) {
    iconSrc = "/icons/plate.png";
    altText = "Plato y Cubiertos";
  } else if (lower.includes("fiesta") || lower.includes("baile") || lower.includes("🎉") || lower.includes("🕺") || lower.includes("barra") || lower.includes("libre") || lower.includes("dj")) {
    iconSrc = "/icons/disco.png";
    altText = "Bola de discoteca";
  } else if (lower.includes("bus") || lower.includes("transporte") || lower.includes("🚌") || lower.includes("salida") || lower.includes("llegada")) {
    iconSrc = "/icons/car-front.png";
    altText = "Coche";
  } else if (lower.includes("despedida") || lower.includes("fin") || lower.includes("recena") || lower.includes("🌙")) {
     // TODO: Replace with "car back" when available. Using front for now as placeholder.
     // User asked for "car back" for despedida.
    iconSrc = "/icons/car-front.png";
    altText = "Coche despedida";
  }

  return (
    <div className="relative h-14 w-14">
      <Image 
        src={iconSrc} 
        alt={altText} 
        fill
        className="object-contain p-2" 
        sizes="56px"
      />
    </div>
  );
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Vertical line - Desktop (Centered) */}
      <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/30 to-transparent md:block" />
      
      {/* Vertical line - Mobile (Left side) */}
      <div className="absolute left-8 block h-full w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent md:hidden" />

      <div className="relative flex flex-col gap-16 md:gap-24">
        {items.map((item, index) => {
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
              className={`relative flex flex-col gap-6 md:flex-row md:items-center ${
                isEven ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Content Side */}
              <div className="ml-16 flex-1 md:ml-0 md:w-1/2">
                <div
                  className={`group relative flex flex-col gap-2 rounded-2xl border border-border/40 bg-white/50 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-md transition-all hover:bg-white/80 hover:shadow-md ${
                    isEven
                      ? "md:text-left"
                      : "md:items-end md:text-right"
                  }`}
                >
                    {/* Time Badge */}
                    <div className={`mb-1 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary w-fit ${
                        !isEven && "md:flex-row-reverse" 
                    }`}>
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </div>

                  <h3 className="text-xl font-bold font-serif text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  
                  {item.location && (
                    <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ${
                        !isEven && "md:flex-row-reverse"
                    }`}>
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Center Icon/Dot */}
              <div className="absolute left-8 flex -translate-x-1/2 items-center justify-center md:static md:left-auto md:translate-x-0 z-10">
                <motion.div 
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-white shadow-lg shadow-primary/10 ring-1 ring-border"
                >
                  {getIcon(item.icon || item.title)}
                </motion.div>
              </div>

              {/* Spacer for the other side (Desktop only) */}
              <div className="hidden flex-1 md:block md:w-1/2" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
