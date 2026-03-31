"use client";

import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
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
  const [animationPhase, setAnimationPhase] = useState<"drawing" | "coloring" | "finished">("drawing");

  useEffect(() => {
    setIsLoaded(true);
    
    // Secuencia de animación (Watercolor style)
    const runAnimation = async () => {
      // 1. Fase de Revelado (Máscara)
      setTimeout(() => {
        setAnimationPhase("coloring");
      }, 3500); // 3.5s de dibujo inicial
      
      // 2. Transición final a color vibrante
      setTimeout(() => {
        setAnimationPhase("finished");
      }, 5500);
    };

    runAnimation();
  }, []);

  return (
    <header className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-32 pb-32 bg-[#fdfdfd] overflow-hidden">
      {/* Texture Layer (Paper style) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
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
                transition: { delay: 4.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }
              }
            }}
            className="group relative font-script text-6xl md:text-8xl lg:text-9xl text-foreground font-normal leading-tight px-4"
          >
            <span className="relative z-10">Alba <span className="text-accent italic">&</span> Guille</span>
            <motion.div 
              initial={{ x: "-100%", opacity: 0 }}
              animate={animationPhase === "finished" ? { 
                x: "100%", 
                opacity: [0, 0.4, 0],
                transition: { delay: 1, duration: 2, repeat: Infinity, repeatDelay: 4 } 
              } : {}}
              className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-accent/30 to-transparent skew-x-[-20deg]"
            />
          </motion.h1>

          {/* Separator */}
          <motion.div 
            variants={{
              hidden: { scaleX: 0, opacity: 0 },
              visible: { 
                scaleX: 1, 
                opacity: 1,
                transition: { delay: 5, duration: 1, ease: "easeOut" }
              }
            }}
            className="h-px w-16 md:w-24 bg-accent/20 my-1 md:my-2 origin-center" 
          />
          
          {/* Date Container (Stabilized Height to prevent CLS) */}
          <div className="h-10 md:h-12 flex items-center justify-center">
            <motion.h2 
              variants={{
                hidden: { opacity: 0, letterSpacing: "1.2em" },
                visible: { 
                  opacity: 1, 
                  letterSpacing: "0.2em",
                  transition: { delay: 6.5, duration: 4, ease: [0.33, 1, 0.68, 1] }
                }
              }}
              className="font-serif text-lg md:text-xl lg:text-2xl text-muted/80 font-light whitespace-nowrap"
            >
              12 de Septiembre · 2026
            </motion.h2>
          </div>
        </div>

        {/* Central Illustration with Whiteboard Drawing Effect */}
        <div className="relative w-full flex justify-center mt-2 mb-2 md:mt-4 md:mb-6">
          <motion.div 
            animate={isLoaded ? {
              scale: [1, 1.05],
              transition: { duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }
            } : {}}
            className="relative w-full max-w-[420px] md:max-w-[550px] h-[65vh] min-h-[580px] md:min-h-[750px] mix-blend-multiply"
          >
            
            {/* Layer 1: The Sketch (Black & White, Contrast) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isLoaded ? { 
                opacity: animationPhase === "drawing" || animationPhase === "coloring" ? 1 : 0.4,
                transition: { duration: 1.5 }
              } : {}}
              className="absolute inset-0 z-0"
              style={{
                filter: "grayscale(1) contrast(1.4) brightness(1.05)",
              }}
            >
               {/* Animated Mask for Drawing Effect */}
               <motion.div
                  initial={{ maskSize: "0% 0%" }}
                  animate={isLoaded ? { 
                    maskSize: "180% 180%",
                    transition: { duration: 5, ease: "easeInOut" }
                  } : {}}
                  className="w-full h-full relative"
                  style={{
                    WebkitMaskImage: "url('/images/masks/brush.png')",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskImage: "url('/images/masks/brush.png')",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                  }}
               >
                <Image
                  src="/photos/hero/hero_ilustracion.png"
                  alt="Boceto"
                  fill
                  className="object-contain object-center"
                  priority
                />
               </motion.div>
            </motion.div>

            {/* Layer 2: The Color (Original) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={animationPhase !== "drawing" ? { 
                opacity: 1,
                transition: { duration: 2.5, ease: "easeOut" }
              } : {}}
              className="absolute inset-0 z-10"
            >
              <Image
                src="/photos/hero/hero_ilustracion.png"
                alt="Ilustración"
                fill
                className="object-contain object-center"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Poetic Subtext */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { delay: 6, duration: 1 }
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
            opacity: { delay: 7, duration: 1 },
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
