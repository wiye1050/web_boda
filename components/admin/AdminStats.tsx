"use client";
import { useMemo } from "react";
import type { RsvpMetrics, RsvpStatus } from "./useRsvpData";

type AdminStatsProps = {
  metrics: RsvpMetrics;
};

const STATUS_LABELS: Record<RsvpStatus, string> = {
  pendiente: "Pendientes",
  contactado: "Contactados",
  confirmado: "Confirmados",
};

const STATUS_ACCENTS: Record<RsvpStatus, string> = {
  pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300",
  contactado: "bg-blue-100 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300",
  confirmado: "bg-primary/15 text-primary",
};

export function AdminStats({ metrics }: AdminStatsProps) {
  const attendanceRate = useMemo(() => {
    if (metrics.total === 0) return "0%";
    return `${Math.round((metrics.attending / metrics.total) * 100)}%`;
  }, [metrics.attending, metrics.total]);

  const topTags = useMemo(() => {
    return Object.entries(metrics.tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [metrics.tagCounts]);

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Confirmados"
          value={metrics.attending}
          description="Invitados que asistirán a la boda"
          accent="bg-primary/15 text-primary"
        />
        <StatCard
          label="Preboda"
          value={metrics.preboda}
          description="Confirmados para la noche previa"
          accent="bg-accent-strong/20 text-foreground"
        />
        <StatCard
          label="Plazas de bus"
          value={metrics.transportSeats}
          description={`${metrics.transportRequests} solicitudes de traslado`}
          accent="bg-muted/15 text-muted"
        />
        <StatCard
          label="Ratio asistencia"
          value={attendanceRate}
          description={`${metrics.attending} de ${metrics.total} respuestas`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(STATUS_LABELS) as RsvpStatus[]).map((status) => (
          <article
            key={status}
            className="rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
              {STATUS_LABELS[status]}
            </span>
            <p className="mt-4 flex items-center gap-3 text-3xl font-semibold text-foreground">
              {metrics.statusCounts[status]}
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]",
                  STATUS_ACCENTS[status],
                ].join(" ")}
              >
                {status}
              </span>
            </p>
            <p className="mt-2 text-xs text-muted">
              {status === "pendiente"
                ? "Invitados aún sin gestionar."
                : status === "contactado"
                  ? "Contactados pero a la espera de confirmar logística."
                  : "Todo listo para estos asistentes."}
            </p>
          </article>
        ))}

        <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
            Etiquetas destacadas
          </span>
          {topTags.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Aún no hay etiquetas asignadas. Añádelas desde cada RSVP para
              agrupar invitados.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {topTags.map(([tag, count]) => (
                <li key={tag} className="flex items-center justify-between">
                  <span className="rounded-full bg-accent/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/80">
                    {tag}
                  </span>
                  <span>{count}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: number | string;
  description: string;
  accent?: string;
}) {
  return (
    <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          {label}
        </span>
        <span
          className={[
            "text-3xl font-semibold",
            accent ?? "text-foreground",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {value}
        </span>
        <p className="text-xs text-muted">{description}</p>
      </div>
    </article>
  );
}
