"use client";

import { formatCurrency } from "./utils/formatCurrency";

type KPICardsProps = {
  totals: {
    estimate: number;
    actual: number;
    paid: number;
  };
};

export function KPICards({ totals }: KPICardsProps) {
  const pending = totals.actual - totals.paid;
  // If actual is 0 (not started), maybe use estimate? 
  // For now, let's stick to simple logic: Pending = Actual (committed) - Paid.
  // Or maybe Projected Pending = Estimate - Paid?
  // Let's stick to Committed Pending.

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        label="Estimado Total"
        value={totals.estimate}
        sublabel="Presupuesto inicial"
        color="text-muted"
      />
      <Card
        label="Comprometido"
        value={totals.actual}
        sublabel="Gastos confirmados"
        color="text-blue-600 dark:text-blue-400"
      />
      <Card
        label="Pagado"
        value={totals.paid}
        sublabel="Salida de caja"
        color="text-emerald-600 dark:text-emerald-400"
      />
      <Card
        label="Pendiente de Pago"
        value={pending > 0 ? pending : 0}
        sublabel="Comprometido - Pagado"
        color="text-amber-600 dark:text-amber-400"
      />
    </div>
  );
}

function Card({
  label,
  value,
  sublabel,
  color,
}: {
  label: string;
  value: number;
  sublabel: string;
  color: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border/60 bg-surface/50 p-5 shadow-sm transition hover:bg-surface/80">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>
        {formatCurrency(value)}
      </p>
      <p className="mt-1 text-xs text-muted/80">{sublabel}</p>
    </div>
  );
}
