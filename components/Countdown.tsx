"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

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

export function Countdown({ target, className }: { target: string; className?: string }) {
  const targetDate = useMemo(() => {
    const parsed = Date.parse(target);
    return Number.isFinite(parsed) ? new Date(parsed) : null;
  }, [target]);

  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  const triggerCelebration = () => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // since particles fall down, start a bit higher than random
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#FFD700", "#ec4899", "#8b5cf6", "#f43f5e", "#10b981", "#3b82f6"] 
      });
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#FFD700", "#ec4899", "#8b5cf6", "#f43f5e", "#10b981", "#3b82f6"] 
      });
    }, 250);
  };

  useEffect(() => {
    if (!targetDate) return;
    
    // Initial update
    setTimeLeft(getTimeLeft(targetDate));

    const timer = setInterval(() => {
      const left = getTimeLeft(targetDate);
      setTimeLeft(left);

      if (left.total <= 0) {
        clearInterval(timer);
        // Only trigger if we just hit zero (avoid re-triggering on mount if already past)
        if (left.total > -1000) { 
             triggerCelebration();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  function handleManualConfetti() {
    // Realistic look
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  if (!targetDate || !timeLeft) return null;

  // Time's up state
  if (timeLeft.total <= 0) {
     return (
        <button 
          onClick={triggerCelebration}
          type="button"
          className={cn(
             "animate-in fade-in zoom-in duration-500",
             "relative flex items-center gap-2 overflow-hidden rounded-full bg-primary/90 px-6 py-2 shadow-lg transition-all hover:scale-105 hover:bg-primary",
             className
          )}
        >
           <span className="text-sm font-bold uppercase tracking-widest text-primary-foreground drop-shadow-sm">
             ¡Es hoy! 💍
           </span>
           <span className="animate-bounce">🎉</span>
        </button>
     );
  }

  return (
    <button
      onClick={handleManualConfetti}
      type="button"
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-full border border-current/10 bg-black/5 backdrop-blur-md px-5 py-2 shadow-sm transition-all hover:bg-black/10 hover:border-current/20 hover:scale-105 active:scale-95 cursor-pointer",
        className
      )}
      title="Haz clic para celebrar por adelantado 🎉"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
      
      <span className="hidden sm:inline-block text-[0.65rem] font-bold uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">
        Faltan
      </span>
      
      <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-bold text-inherit tabular-nums tracking-wide drop-shadow-sm">
         <div className="flex flex-col items-center leading-none">
            <span>{timeLeft.days}</span>
            <span className="text-[0.5rem] font-sans font-normal opacity-60">d</span>
         </div>
         <span className="opacity-40 mb-2">:</span>
         <div className="flex flex-col items-center leading-none">
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[0.5rem] font-sans font-normal opacity-60">h</span>
         </div>
         <span className="opacity-40 mb-2">:</span>
         <div className="flex flex-col items-center leading-none">
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[0.5rem] font-sans font-normal opacity-60">m</span>
         </div>
         <span className="opacity-40 mb-2">:</span>
         <div className="flex flex-col items-center leading-none">
            <span className={cn("inline-block w-[1.2em] text-center", timeLeft.seconds < 10 && "text-primary")}>{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[0.5rem] font-sans font-normal opacity-60">s</span>
         </div>
      </div>
    </button>
  );
}
