"use client";
import { useMemo } from "react";
import type { RsvpMetrics } from "./useRsvpData";
import { Users, Bus, Utensils, CircleAlert } from "lucide-react";

type AdminStatsProps = {
  metrics: RsvpMetrics;
};

export function AdminStats({ metrics }: AdminStatsProps) {
  const attendanceRate = useMemo(() => {
    if (metrics.total === 0) return "0%";
    return `${Math.round((metrics.attending / metrics.total) * 100)}%`;
  }, [metrics.attending, metrics.total]);

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Confirmados"
        value={metrics.attending}
        total={metrics.total}
        subtext="asistentes"
        icon={<Users className="h-3 w-3 text-primary" />}
      />
      
      <StatCard
        label="Autobús"
        value={metrics.transportSeats}
        subtext="plazas"
        icon={<Bus className="h-3 w-3 text-blue-500" />}
      />

      <StatCard
        label="Pendientes"
        value={metrics.statusCounts.pendiente}
        subtext="sin responder"
        icon={<CircleAlert className="h-3 w-3 text-amber-500" />}
      />

      <StatCard
        label="Preboda"
        value={metrics.preboda}
        subtext="asistentes"
        icon={<Utensils className="h-3 w-3 text-purple-500" />}
      />
    </section>
  );
}

function StatCard({
  label,
  value,
  total,
  subtext,
  icon,
}: {
  label: string;
  value: number | string;
  total?: number;
  subtext: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-0.5 rounded-[14px] border border-border/60 bg-surface px-3 py-2.5 shadow-sm transition-all hover:border-primary/20">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">{label}</span>
        {icon}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="text-xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {total !== undefined && (
          <span className="text-[9px] text-muted-foreground">/ {total}</span>
        )}
      </div>
    </div>
  );
}
