"use client";

import { useEffect, useMemo, useState } from "react";

function formatRemaining(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return "¡Es hoy!";
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

export function Countdown({ target }: { target: string }) {
  const targetDate = useMemo(() => {
    const parsed = Date.parse(target);
    return Number.isFinite(parsed) ? new Date(parsed) : null;
  }, [target]);

  const [label, setLabel] = useState(() =>
    targetDate ? formatRemaining(targetDate) : "",
  );

  useEffect(() => {
    if (!targetDate) return;
    const update = () => setLabel(formatRemaining(targetDate));
    update();
    const id = window.setInterval(update, 30000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  if (!targetDate || !label) return null;

  return (
    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[0.75rem] font-semibold text-amber-100">
      Faltan {label}
    </span>
  );
}
