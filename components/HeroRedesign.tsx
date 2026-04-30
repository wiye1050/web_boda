"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { ChevronDown, Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    let ticking = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768 || !containerRef.current) return;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth - 0.5) * 20;
          const y = (e.clientY / window.innerHeight - 0.5) * 20;
          
          if (containerRef.current) {
            containerRef.current.style.setProperty("--mouse-x", `${x}px`);
            containerRef.current.style.setProperty("--mouse-y", `${y}px`);
            containerRef.current.style.setProperty("--rotate-x", `${-y * 0.1}deg`);
            containerRef.current.style.setProperty("--rotate-y", `${x * 0.1}deg`);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animación del pincel
  const brushStrokes = [
    { id: 1, mask: "/images/masks/brush_stroke_1.png", delay: 1.5, duration: 12, scale: 1.8, rotate: -15, startPos: "0% 0%", endPos: "40% 40%" },
    { id: 2, mask: "/images/masks/brush_stroke_2.png", delay: 4.5, duration: 14, scale: 2.2, rotate: 165, startPos: "100% 100%", endPos: "60% 60%" },
    { id: 3, mask: "/images/masks/brush.png", delay: 8.0, duration: 18, scale: 3.5, rotate: 10, startPos: "50% 100%", endPos: "50% 50%" },
  ];  return (
    <header 
      ref={containerRef}
      className="relative min-h-[100dvh] w-full flex flex-col items-center px-4 pt-24 pb-12 overflow-hidden [--mouse-x:0px] [--mouse-y:0px] [--rotate-x:0deg] [--rotate-y:0deg]"
    >
      {/* Premium Light Leak Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-accent/5 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] bg-primary/5 blur-[100px] rounded-full animate-pulse-slow delay-700" />
      </div>

      {/* Seccion Superior: Nombres y Fecha */}
      <div className="z-10 flex flex-col items-center w-full">
        <div className="relative pt-8 mb-4">
          <h1 className="text-6xl md:text-[8rem] font-serif tracking-tighter leading-[0.85] text-center">
            <span className="relative z-10 flex flex-col md:flex-row justify-center items-center gap-y-2 md:gap-x-16">
              <motion.span 
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={isLoaded ? { 
                  opacity: 1, 
                  y: 0, 
                  filter: "blur(0px)",
                  transition: { duration: 3.5, ease: [0.16, 1, 0.3, 1], delay: 0.8 } 
                } : {}}
                className="relative text-shimmer-gold will-change-[transform,opacity,filter] transform-gpu"
              >
                Alba
              </motion.span>
              
              <motion.span 
                initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
                animate={isLoaded ? { 
                  opacity: 0.7, 
                  scale: 1,
                  rotate: 0,
                  transition: { duration: 4, ease: [0.16, 1, 0.3, 1], delay: 2.2 }
                } : {}}
                className="text-accent font-script text-[5.5rem] sm:text-[7.5rem] md:text-[8.5rem] lg:text-[11rem] drop-shadow-sm -translate-y-1 md:-translate-y-2 -my-2 md:my-0 z-20 will-change-transform transform-gpu"
              >
                &
              </motion.span> 
              
              <motion.span 
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={isLoaded ? { 
                  opacity: 1, 
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 3.5, ease: [0.16, 1, 0.3, 1], delay: 1.5 }
                } : {}}
                className="relative text-shimmer-gold will-change-[transform,opacity,filter] transform-gpu"
              >
                Guille
              </motion.span>
            </span>
          </h1>
        </div>

        {/* Fecha centelleante */}
        <div className="h-8 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : {}}
            transition={{ delay: 4.5, duration: 2 }}
          >
            <ScrambleText 
              text="12 · SEPTIEMBRE · 2026" 
              delay={4.5} 
              duration={2}
              className="font-sans text-[10px] md:text-xs text-foreground font-bold tracking-[0.4em] uppercase"
            />
          </motion.div>
        </div>
      </div>

      {/* Seccion Central: Ilustracion */}
      <div className="relative w-full flex justify-center py-4 z-0">
        <div 
          className="relative w-full max-w-[340px] md:max-w-[650px] h-[55vh] md:h-[70vh] min-h-[480px] md:min-h-[850px] transition-transform duration-1000 ease-out will-change-transform"
          style={{
            transform: `translate3d(var(--mouse-x), var(--mouse-y), 0) rotateX(var(--rotate-x)) rotateY(var(--rotate-y))`,
          }}
        >
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
                initial={{ 
                  maskSize: "0% 0%", 
                  WebkitMaskSize: "0% 0%" 
                }}
                animate={isLoaded ? { 
                  maskSize: "450% 450%",
                  WebkitMaskSize: "450% 450%",
                } : {}}
                transition={{ 
                  delay: stroke.delay, 
                  duration: stroke.duration, 
                  ease: "easeInOut" 
                }}
                className="h-full w-full relative"
                style={{
                  WebkitMaskImage: `url('${stroke.mask}')`,
                  maskImage: `url('${stroke.mask}')`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
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
        </div>
      </div>

      {/* Seccion Inferior: Subtext & CTA */}
      <div className="z-10 w-full flex flex-col items-center pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { 
            opacity: 1, 
            y: 0,
            transition: { delay: 6.5, duration: 2 } 
          } : {}}
          className="flex flex-col items-center gap-8 max-w-xl"
        >
          <div className="relative px-8">
            <p className="text-foreground/70 font-serif font-light leading-relaxed text-base md:text-xl italic text-center">
              &ldquo;{config.heroDescription || "Dos caminos que se unen, una historia por escribir y mil momentos para compartir con vosotros."}&rdquo;
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
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
            
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("wb-open-save-the-date"))}
              className="px-8 py-4 rounded-full text-[10px] md:text-xs tracking-[0.3em] font-bold uppercase text-foreground hover:text-accent transition-all flex items-center gap-2"
            >
              <Play size={12} className="text-accent" />
              Ver Vídeo
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={isLoaded ? { 
          opacity: 1,
          y: [0, 10, 0],
          transition: { 
            opacity: { delay: 8.5, duration: 1 },
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
