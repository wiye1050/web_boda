"use client";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type HeroFloatingGalleryProps = {
  config: {
    heroTitle: string;
    heroDescription: string;
    eventDate: string;
    eventTimeRange: string;
    locationName: string;
    locationAddress: string;
  };
  localImages: string[];
};

const CYCLE_INTERVAL_MS = 6000;
const FADE_DURATION = 2;

const SLOTS = [
  { id: "top-left", top: "20%", left: "18%", rotation: -6 },
  { id: "bottom-left", top: "80%", left: "18%", rotation: 4 },
  { id: "top-right", top: "20%", left: "82%", rotation: 5 },
  { id: "bottom-right", top: "82%", left: "82%", rotation: -3 },
];

export function HeroFloatingGallery({ config, localImages }: HeroFloatingGalleryProps) {
  const [leftImageIndex, setLeftImageIndex] = useState(0);
  const [rightImageIndex, setRightImageIndex] = useState(1);
  const [transitionSide, setTransitionSide] = useState<"left" | "right">("left");

  useEffect(() => {
    if (localImages.length < 2) return;

    const interval = setInterval(() => {
      if (transitionSide === "left") {
        // Find next index for left that's not currently on right
        setLeftImageIndex((prev) => {
          let next = (prev + 1) % localImages.length;
          if (next === rightImageIndex) next = (next + 1) % localImages.length;
          return next;
        });
        setTransitionSide("right");
      } else {
        // Find next index for right that's not currently on left
        setRightImageIndex((prev) => {
          let next = (prev + 1) % localImages.length;
          if (next === leftImageIndex) next = (next + 1) % localImages.length;
          return next;
        });
        setTransitionSide("left");
      }
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [localImages, transitionSide, leftImageIndex, rightImageIndex]);

  return (
    <header className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-32 pb-10 bg-background overflow-hidden">
      {/* 3-Column Layout Container */}
      <div className="absolute inset-0 flex w-full h-full z-0 overflow-hidden pointer-events-none px-4 md:px-12">
        
        {/* Left Column - Photo */}
        <div className="hidden md:flex flex-1 relative overflow-hidden items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`left-${leftImageIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-full h-full max-w-[450px] lg:max-w-[500px] flex items-center justify-center p-4"
            >
              <div className="relative w-full h-full max-h-[70vh]">
                <Image
                  src={localImages[leftImageIndex % localImages.length]}
                  alt="Gallery Left"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top drop-shadow-sm rounded-[2rem]"
                  priority
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Center Column - Safe Zone for Text */}
        <div className="flex-[2] min-w-0" aria-hidden="true" />

        {/* Right Column - Photo */}
        <div className="hidden md:flex flex-1 relative overflow-hidden items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`right-${rightImageIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-full h-full max-w-[450px] lg:max-w-[500px] flex items-center justify-center p-4"
            >
              <div className="relative w-full h-full max-h-[70vh]">
                <Image
                  src={localImages[rightImageIndex % localImages.length]}
                  alt="Gallery Right"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top drop-shadow-sm rounded-[2rem]"
                  priority
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="fade-up relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">

        <div className="mb-6 relative">
          <h1 className="!font-script text-6xl md:text-8xl lg:text-9xl text-foreground font-light tracking-normal drop-shadow-sm">
            Alba <span className="text-accent mx-2">&</span> Guille
          </h1>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 mb-12 w-full">
          <h2 className="!font-script text-4xl md:text-5xl lg:text-7xl text-accent tracking-normal font-light mt-2">
            12 de septiembre de 2026
          </h2>
        </div>

        <p className="text-black max-w-lg mx-auto mb-10 font-sans font-medium leading-relaxed text-sm italic">
          &ldquo;{config.heroDescription || "Tenemos el lugar, tenemos la fecha y tenemos las ganas... ¡Sólo nos faltas tú para hacerlo inolvidable!"}&rdquo;
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
          className="group relative overflow-hidden bg-accent text-white px-10 py-3 rounded-full text-[10px] tracking-[0.2em] hover:shadow-lg transition-all duration-300 uppercase font-bold"
        >
          <span className="relative z-10">Añadir al Calendario</span>
          <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></div>
        </a>
      </div>

    </header>
  );
}
