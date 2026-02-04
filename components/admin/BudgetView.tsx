"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useBudget,
  type BudgetItem,
  type BudgetStatus,
} from "@/components/admin/useBudget";
import { formatCurrency } from "./utils/formatCurrency";
import { KPICards } from "./KPICards";
import { BudgetChart } from "./BudgetChart";

const STATUS_OPTIONS: Array<{ value: BudgetStatus; label: string }> = [
  { value: "planeado", label: "Planeado" },
  { value: "comprometido", label: "Comprometido" },
  { value: "pagado", label: "Pagado" },
];

export function BudgetView() {
  const {
    items,
    totals,
    isLoading,
    error,
    addBudgetItem,
    updateBudgetItem,
    removeBudgetItem,
  } = useBudget();

  const [concept, setConcept] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<BudgetStatus>("planeado");
  const [estimate, setEstimate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, BudgetItem[]>();
    items.forEach((item) => {
      const key = item.category ?? "Otros";
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(item);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [items]);

  async function handleAddItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!concept.trim()) {
      setFormError("Escribe un concepto.");
      return;
    }

    try {
      await addBudgetItem({
        concept: concept.trim(),
        category: category || undefined,
        status,
        estimate: estimate ? Number(estimate) : undefined,
      });
      setConcept("");
      setCategory("");
      setStatus("planeado");
      setEstimate("");
      setFormError(null);
    } catch (err) {
      console.error(err);
      setFormError("No se pudo crear la partida.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Presupuesto</h1>
          <p className="text-sm text-muted">
            Controla el presupuesto estimado, comprometido y pagado.
          </p>
        </div>
        <div />
      </header>

      <KPICards totals={totals} />
      
      <BudgetChart items={items} />

      <section className="rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold">Añadir partida</h2>
        <form
          onSubmit={handleAddItem}
          className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_150px]"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Concepto
            </label>
            <input
              value={concept}
              onChange={(event) => setConcept(event.target.value)}
              placeholder="Ej. Decoración floral"
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Categoría
            </label>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Logística, Proveedores, etc."
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Estado
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as BudgetStatus)}
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Estimado (€)
            </label>
            <input
              value={estimate}
              onChange={(event) => setEstimate(event.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              inputMode="numeric"
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex justify-end md:justify-end">
            <button
              type="submit"
              className="w-full rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30 md:w-auto"
            >
              Añadir
            </button>
          </div>
        </form>
        {formError && <p className="mt-2 text-xs text-primary">{formError}</p>}
      </section>

      {error && <p className="text-xs text-primary">{error}</p>}

      <section className="flex flex-col gap-4">
        {groupedByCategory.length === 0 ? (
          <p className="text-sm text-muted">
            Aún no tienes partidas registradas. Añade la primera arriba.
          </p>
        ) : (
          groupedByCategory.map(([categoryKey, list]) => (
            <BudgetGroup
              key={categoryKey}
              title={categoryKey}
              items={list}
              updateBudgetItem={updateBudgetItem}
              removeBudgetItem={removeBudgetItem}
            />
          ))
        )}
      </section>
    </div>
  );
}

function BudgetGroup({
  title,
  items,
  updateBudgetItem,
  removeBudgetItem,
}: {
  title: string;
  items: BudgetItem[];
  updateBudgetItem: (id: string, data: Partial<BudgetItem>) => Promise<void>;
  removeBudgetItem: (id: string) => Promise<void>;
}) {
  const subtotal = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.estimate += item.estimate ?? 0;
        acc.actual += item.actual ?? 0;
        acc.paid += item.paid ?? 0;
        return acc;
      },
      { estimate: 0, actual: 0, paid: 0 },
    );
  }, [items]);

  return (
    <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-muted">
          <span>Estimado {formatCurrency(subtotal.estimate)}</span>
          <span>Ejecutado {formatCurrency(subtotal.actual)}</span>
          <span>Pagado {formatCurrency(subtotal.paid)}</span>
        </div>
      </header>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <BudgetCard
            key={item.id}
            item={item}
            updateBudgetItem={updateBudgetItem}
            removeBudgetItem={removeBudgetItem}
          />
        ))}
      </div>
    </article>
  );
}

function BudgetCard({
  item,
  updateBudgetItem,
  removeBudgetItem,
}: {
  item: BudgetItem;
  updateBudgetItem: (id: string, data: Partial<BudgetItem>) => Promise<void>;
  removeBudgetItem: (id: string) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function updateField(field: keyof BudgetItem, value: BudgetItem[keyof BudgetItem]) {
    setIsSaving(true);
    try {
      await updateBudgetItem(item.id, { [field]: value });
      setLocalError(null);
    } catch (err) {
      console.error(err);
      setLocalError("No se pudo actualizar la partida.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove() {
    const confirmation = window.confirm(`¿Eliminar la partida ${item.concept}?`);
    if (!confirmation) return;
    setIsSaving(true);
    try {
      await removeBudgetItem(item.id);
      setLocalError(null);
    } catch (err) {
      console.error(err);
      setLocalError("No se pudo eliminar la partida.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h4 className="text-base font-semibold text-foreground">{item.concept}</h4>
          {item.notes && <p className="text-xs text-muted">Notas: {item.notes}</p>}
        </div>
        <div className="flex w-full flex-col gap-3 lg:max-w-sm">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Estado
            <select
              value={item.status}
              onChange={(event) => updateField("status", event.target.value as BudgetStatus)}
              disabled={isSaving}
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <AmountField
            label="Estimado (€)"
            defaultValue={item.estimate}
            onBlur={(value) => updateField("estimate", value)}
            disabled={isSaving}
          />
          <AmountField
            label="Ejecutado (€)"
            defaultValue={item.actual}
            onBlur={(value) => updateField("actual", value)}
            disabled={isSaving}
          />
          <AmountField
            label="Pagado (€)"
            defaultValue={item.paid}
            onBlur={(value) => updateField("paid", value)}
            disabled={isSaving}
          />
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Fecha límite
            <input
              defaultValue={item.dueDate ?? ""}
              onBlur={(event) => updateField("dueDate", event.target.value || undefined)}
              type="date"
              disabled={isSaving}
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Notas
            <textarea
              defaultValue={item.notes ?? ""}
              onBlur={(event) => updateField("notes", event.target.value || undefined)}
              rows={3}
              disabled={isSaving}
              className="rounded-2xl border border-border/80 bg-background px-4 py-2 text-xs text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isSaving}
            className="self-end rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary disabled:opacity-60"
          >
            Eliminar
          </button>
          {localError && <p className="text-xs text-primary">{localError}</p>}
        </div>
      </div>
    </div>
  );
}

function AmountField({
  label,
  defaultValue,
  onBlur,
  disabled,
}: {
  label: string;
  defaultValue?: number;
  onBlur: (value: number | undefined) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState(defaultValue != null ? String(defaultValue) : "");

  useEffect(() => {
    const next = defaultValue != null ? String(defaultValue) : "";
    if (value !== next) {
      setValue(next);
    }
  }, [defaultValue, value]);

  return (
    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
      {label}
      <input
        value={value}
        onChange={(event) => {
          const next = event.target.value.replace(/[^0-9]/g, "");
          setValue(next);
        }}
        onBlur={() => {
          onBlur(value ? Number(value) : undefined);
        }}
        disabled={disabled}
        inputMode="numeric"
        className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
