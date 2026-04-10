"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%^&*()_+";

const ScrambleText = ({ text, delay = 0, duration = 2, className = "" }: { text: string, delay?: number, duration?: number, className?: string }) => {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    let frame: number;
    const startTime = Date.now() + (delay * 1000);
    
    const animate = () => {
      const now = Date.now();
      if (now < startTime) {
        frame = requestAnimationFrame(animate);
        return;
      }
      
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      const scrambled = text.split("").map((char, i) => {
        if (char === " " || char === "·") return char;
        if (progress >= (i / text.length)) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");
      
      setDisplayText(scrambled);
      
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [text, delay, duration]);

  return <span className={className}>{displayText}</span>;
};

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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animación del pincel
  const brushStrokes = [
    { id: 1, mask: "/images/masks/brush_stroke_1.png", delay: 0.8, duration: 5, scale: 1.2, rotate: 0, position: "center" },
    { id: 2, mask: "/images/masks/brush_stroke_2.png", delay: 1.8, duration: 6, scale: 1.5, rotate: 180, position: "center" },
    { id: 3, mask: "/images/masks/brush.png", delay: 3, duration: 8, scale: 2.5, rotate: 45, position: "center" },
  ];

  return (
    <header className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 md:pt-28 md:pb-28 overflow-hidden">
      
      {/* Premium Light Leak Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-olive/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center gap-6 md:gap-10"
      >
        {/* Names & Date Header */}
        <div className="flex flex-col items-center gap-1 md:gap-3">
          <motion.h1 
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.5, duration: 2, ease: [0.22, 1, 0.36, 1] }
              }
            }}
            className="font-serif text-[5rem] sm:text-[7rem] md:text-8xl lg:text-[11rem] text-foreground font-medium leading-[0.8] px-4 tracking-[-0.02em] mt-8 md:mt-12 drop-shadow-md"
          >
            <span className="relative z-10 flex flex-col md:flex-row justify-center items-center gap-y-2 md:gap-x-12">
               <span className="relative">Alba</span>
               <span className="text-accent/90 font-script text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[13rem] drop-shadow-lg -translate-y-2 md:-translate-y-4 -my-6 md:my-0">&amp;</span> 
               <span className="relative">Guille</span>
            </span>
          </motion.h1>

          {/* Date Container */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: { 
                opacity: 1, 
                scale: 1,
                transition: { delay: 2.5, duration: 1.2 }
              }
            }}
            className="mt-6 md:mt-8 px-6 py-2 glass rounded-full"
          >
            <ScrambleText 
              text="12 · SEPTIEMBRE · 2026" 
              delay={3.2} 
              duration={2}
              className="font-sans text-[10px] md:text-xs text-foreground font-bold tracking-[0.4em] uppercase"
            />
          </motion.div>
        </div>

        {/* Central Illustration with Parallax */}
        <div className="relative w-full flex justify-center mt-0 mb-0">
          <motion.div 
            className="relative w-full max-w-[340px] md:max-w-[600px] h-[50vh] md:h-[65vh] min-h-[420px] md:min-h-[750px] mix-blend-multiply transition-transform duration-700 ease-out"
            style={{
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) rotateX(${-mousePos.y * 0.1}deg) rotateY(${mousePos.x * 0.1}deg)`,
            }}
          >
            {/* Capas de Pinceladas */}
            {brushStrokes.map((stroke) => (
              <motion.div
                key={stroke.id}
                initial={{ opacity: 0 }}
                animate={isLoaded ? { 
                  opacity: 1,
                  transition: { delay: stroke.delay }
                } : {}}
                className="absolute inset-0"
              >
                <motion.div
                  animate={isLoaded ? { 
                    maskSize: ["0% 0%", "150% 150%", "450% 450%"],
                    transition: { delay: stroke.delay, duration: stroke.duration, ease: [0.16, 1, 0.3, 1] }
                  } : {} as any}
                  className="h-full w-full relative overflow-hidden"
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
          </motion.div>
        </div>

        {/* Poetic Subtext & CTA */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1,
              y: 0,
              transition: { delay: 5, duration: 1.5 }
            }
          }}
          className="flex flex-col items-center gap-8 max-w-xl -mt-6 md:-mt-12"
        >
          <div className="relative px-8 py-4">
            <div className="absolute inset-0 bg-accent/5 blur-xl rounded-full" />
            <p className="relative text-foreground/70 font-serif font-light leading-relaxed text-base md:text-xl italic px-4">
              &ldquo;{config.heroDescription || "Dos caminos que se unen, una historia por escribir y mil momentos para compartir con vosotros."}&rdquo;
            </p>
          </div>

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
            className="inline-block px-12 py-5 rounded-full bg-foreground text-white text-[10px] md:text-xs tracking-[0.3em] font-bold uppercase shadow-premium hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
          >
            Guardar la Fecha
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={isLoaded ? { 
          opacity: 1,
          y: [0, 10, 0],
          transition: { 
            opacity: { delay: 6.5, duration: 1 },
            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }
        } : {}}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-muted/30"
      >
        <ChevronDown size={36} strokeWidth={1} />
      </motion.div>
    </header>
  );
}
