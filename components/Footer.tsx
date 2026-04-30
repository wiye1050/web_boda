"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type FooterProps = {
  brandName?: string;
  targetDate?: string;
};

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Footer({
  brandName = "Alba & Guille",
  targetDate = "2026-09-12T14:00:00",
}: FooterProps) {
  const parsedTarget = useMemo(() => {
    const parsed = Date.parse(targetDate);
    return Number.isFinite(parsed) ? new Date(parsed) : new Date("2026-09-12T14:00:00");
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState({ total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setTimeLeft(getTimeLeft(parsedTarget));
    
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(parsedTarget));
    }, 1000);
    return () => clearInterval(timer);
  }, [parsedTarget]);

  return (
    <footer className="relative mt-4 md:mt-20 pt-16 pb-32 md:pb-16 px-6 overflow-hidden">
      {/* Footer Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] aspect-[2/1] bg-foreground/5 blur-[120px] rounded-[100%] -z-10" />

      <div className="max-w-4xl mx-auto">
        <div className="glass-dark rounded-[3rem] p-10 md:p-16 shadow-premium border-white/5 flex flex-col items-center text-center">
          
          <div className="mb-12">
            <h3 className="font-serif text-3xl md:text-5xl text-white/90 mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              La cuenta atrás ha empezado
            </h3>
            <p className="text-[10px] md:text-xs tracking-[0.4em] text-white/40 uppercase font-sans">
              Nos vemos pronto
            </p>
          </div>

          {/* Countdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mb-16 w-full max-w-2xl">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-serif text-accent mb-2">{timeLeft.days}</span>
              <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase font-sans">Días</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/5 md:border-l-0">
              <span className="text-4xl md:text-6xl font-serif text-accent mb-2">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase font-sans">Horas</span>
            </div>
            <div className="flex flex-col items-center border-t border-white/5 md:border-t-0 pt-8 md:pt-0">
              <span className="text-4xl md:text-6xl font-serif text-accent mb-2">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase font-sans">Min</span>
            </div>
            <div className="flex flex-col items-center border-l border-t border-white/5 md:border-t-0 md:border-l-0 pt-8 md:pt-0">
              <span className="text-4xl md:text-6xl font-serif text-accent mb-2">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase font-sans">Seg</span>
            </div>
          </div>

          <div className="w-12 h-[1px] bg-white/10 mb-12" />

          {/* Bottom Text */}
          <div className="flex flex-col gap-6 items-center">
            <div className="text-[10px] tracking-[0.5em] text-white/40 uppercase leading-relaxed font-sans">
              Hecho por Alba y Guille
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[8px] tracking-[0.2em] text-foreground/20 uppercase font-sans">
             © 2026 - TODOS LOS DERECHOS RESERVADOS
           </p>
        </div>
      </div>
    </footer>
  );
}
