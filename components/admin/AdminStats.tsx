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
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Confirmados"
        value={metrics.attending}
        total={metrics.total}
        subtext="asistentes"
        icon={<Users className="h-4 w-4 text-primary" />}
      />
      
      <StatCard
        label="Autobús"
        value={metrics.transportSeats}
        subtext="plazas reservadas"
        icon={<Bus className="h-4 w-4 text-blue-500" />}
      />

      <StatCard
        label="Pendientes"
        value={metrics.statusCounts.pendiente}
        subtext="sin responder"
        icon={<CircleAlert className="h-4 w-4 text-amber-500" />}
      />

      <StatCard
        label="Preboda"
        value={metrics.preboda}
        subtext="asistentes"
        icon={<Utensils className="h-4 w-4 text-purple-500" />}
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
    <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-background/50 p-4 shadow-sm transition-all hover:border-border hover:bg-background">
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {total !== undefined && (
          <span className="text-xs text-muted-foreground">/ {total}</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground capitalize">{subtext}</p>
    </div>
  );
}
