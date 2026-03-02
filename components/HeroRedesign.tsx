"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Animación del pincel: Varias pinceladas que se revelan en secuencia
  const brushStrokes = [
    { id: 1, mask: "/images/masks/brush_stroke_1.png", delay: 0.2, duration: 1.5, scale: 1.2, rotate: 0, position: "center" },
    { id: 2, mask: "/images/masks/brush_stroke_2.png", delay: 0.8, duration: 1.8, scale: 1.5, rotate: 180, position: "center" },
    { id: 3, mask: "/images/masks/brush.png", delay: 1.5, duration: 2, scale: 2.5, rotate: 45, position: "center" },
  ];

  return (
    <header className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-32 pb-32 bg-background overflow-hidden">
      
      <motion.div 
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center gap-8 md:gap-12"
      >
        {/* Names & Date Header */}
        <div className="flex flex-col items-center gap-2 md:gap-4">
          <motion.h1 
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { delay: 3.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }
              }
            }}
            className="group relative font-script text-6xl md:text-8xl lg:text-9xl text-foreground font-normal leading-tight px-4"
          >
            <span className="relative z-10">Alba <span className="text-accent italic">&</span> Guille</span>
            {/* Shimmer Effect */}
            <motion.div 
              initial={{ x: "-100%", opacity: 0 }}
              animate={isLoaded ? { 
                x: "100%", 
                opacity: [0, 0.4, 0],
                transition: { delay: 4.5, duration: 2, repeat: Infinity, repeatDelay: 4 } 
              } : {}}
              className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-accent/30 to-transparent skew-x-[-20deg]"
            />
          </motion.h1>

          <motion.div 
            variants={{
              hidden: { scaleX: 0, opacity: 0 },
              visible: { 
                scaleX: 1, 
                opacity: 1,
                transition: { delay: 3.8, duration: 1, ease: "easeOut" }
              }
            }}
            className="h-px w-16 md:w-24 bg-accent/20 my-1 md:my-2 origin-center" 
          />

          <motion.h2 
            variants={{
              hidden: { opacity: 0, letterSpacing: "1em" },
              visible: { 
                opacity: 1, 
                letterSpacing: "0.3em",
                transition: { delay: 4, duration: 1.5, ease: "easeOut" }
              }
            }}
            className="font-serif text-lg md:text-xl lg:text-2xl text-muted/80 font-light"
          >
            12 de Septiembre · 2026
          </motion.h2>
        </div>

        {/* Central Illustration with Multi-Brush Reveal */}
        <div className="relative w-full flex justify-center mt-2 mb-2 md:mt-4 md:mb-6">
          <div className="relative w-full max-w-[420px] md:max-w-[550px] h-[65vh] min-h-[580px] md:min-h-[750px] mix-blend-multiply">
            
            {/* Capas de Pinceladas Coincidentes */}
            {brushStrokes.map((stroke) => (
              <motion.div
                key={stroke.id}
                initial={{ opacity: 0 }}
                animate={isLoaded ? { 
                  opacity: 1,
                  transition: { delay: stroke.delay }
                } : {}}
                className="absolute inset-0"
                style={{
                  WebkitMaskImage: `url('${stroke.mask}')`,
                  maskImage: `url('${stroke.mask}')`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: stroke.position,
                  maskPosition: stroke.position,
                  WebkitMaskSize: "0% 0%",
                  maskSize: "0% 0%",
                }}
              >
                <motion.div
                  animate={isLoaded ? { 
                    WebkitMaskSize: ["0% 0%", "150% 150%", "400% 400%"],
                    maskSize: ["0% 0%", "150% 150%", "400% 400%"],
                    transition: { delay: stroke.delay, duration: stroke.duration, ease: "easeInOut" }
                  } : {}}
                  className="h-full w-full"
                  style={{
                    WebkitMaskImage: `url('${stroke.mask}')`,
                    maskImage: `url('${stroke.mask}')`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: stroke.position,
                    maskPosition: stroke.position,
                  }}
                >
                  <Image
                    src="/photos/hero/hero_ilustracion.png"
                    alt="Ilustración Alba y Guille"
                    fill
                    className="object-contain object-center"
                    priority
                  />
                </motion.div>
              </motion.div>
            ))}

            {/* Slow Ken Burns Effect on the whole container */}
            <motion.div
              animate={isLoaded ? {
                scale: [1, 1.05, 1],
                transition: { duration: 25, repeat: Infinity, ease: "linear" }
              } : {}}
              className="absolute inset-0 -z-10 bg-background/5"
            />
          </div>
        </div>

        {/* Poetic Subtext */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { delay: 4.8, duration: 1 }
            }
          }}
          className="flex flex-col items-center gap-6 max-w-lg"
        >
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
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={isLoaded ? { 
          opacity: 1,
          y: [0, 8, 0],
          transition: { 
            opacity: { delay: 6, duration: 1 },
            y: { duration: 2, repeat: Infinity }
          }
        } : {}}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-secondary/40"
      >
        <ChevronDown size={32} strokeWidth={1} />
      </motion.div>
    </header>
  );
}
