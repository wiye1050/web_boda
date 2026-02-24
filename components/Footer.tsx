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
  targetDate = "2026-09-12T13:30:00",
}: FooterProps) {
  const parsedTarget = useMemo(() => {
    const parsed = Date.parse(targetDate);
    return Number.isFinite(parsed) ? new Date(parsed) : new Date("2026-09-12T13:30:00");
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState({ total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setTimeLeft(getTimeLeft(parsedTarget));
    
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(parsedTarget));
    }, 1000);
    return () => clearInterval(timer);
  }, [parsedTarget]);

  return (
    <footer className="bg-foreground text-white py-10 px-6 overflow-hidden relative">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">

        {/* Countdown */}
        <div className="flex space-x-6 md:space-x-12 mb-8 mt-2">
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-serif text-white font-medium mb-1">
              {timeLeft.days}
            </div>
            <div className="text-[9px] md:text-[11px] tracking-[0.2em] text-white/50 uppercase font-medium">Días</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-serif text-white font-medium mb-1">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[9px] md:text-[11px] tracking-[0.2em] text-white/50 uppercase font-medium">Horas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-serif text-white font-medium mb-1">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[9px] md:text-[11px] tracking-[0.2em] text-white/50 uppercase font-medium">Minutos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-serif text-white font-medium mb-1">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[9px] md:text-[11px] tracking-[0.2em] text-white/50 uppercase font-medium">Segundos</div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-white/10 mb-8" />

        {/* Bottom Text */}
        <div className="flex flex-col md:flex-row justify-between w-full text-[9px] tracking-[0.3em] font-medium text-white uppercase gap-4 opacity-100 hover:opacity-100">
          <span>© 2026 {brandName.toUpperCase()}</span>
          <span>Diseñado con amor para un día inolvidable</span>
        </div>
      </div>
    </footer>
  );
}
