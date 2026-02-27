"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function MediaCountdownClient({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(targetDate);
    setTime(getTimeLeft(target));
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!time) return null;

  const units = [
    { label: "Días", value: time.days },
    { label: "Horas", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Seg", value: time.seconds },
  ];

  return (
    <>
      {units.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1 rounded-2xl border border-border/50 bg-surface px-3 py-3 shadow-sm"
        >
          <span className="font-display text-2xl font-bold text-foreground">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted">
            {label}
          </span>
        </div>
      ))}
    </>
  );
}
