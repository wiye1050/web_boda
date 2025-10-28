"use client";

import { useMemo, useState } from "react";
import type { RsvpRecord, RsvpStatus } from "./useRsvpData";

type FilterOption = "all" | "attending" | "notAttending";

type RsvpTableProps = {
  records: RsvpRecord[];
  isLoading: boolean;
  error?: Error | null;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFilters?: boolean;
  onSelectRecord?: (record: RsvpRecord) => void;
};

export function RsvpTable({
  records,
  isLoading,
  error,
  title = "RSVPs",
  description = "Actualización en tiempo real desde Firestore. Se muestran las últimas respuestas.",
  showHeader = true,
  showFilters = true,
  onSelectRecord,
}: RsvpTableProps) {
  const [filter, setFilter] = useState<FilterOption>("all");

  const filteredRecords = useMemo(() => {
    if (filter === "attending") {
      return records.filter((record) => record.attendance === "si");
    }
    if (filter === "notAttending") {
      return records.filter((record) => record.attendance === "no");
    }
    return records;
  }, [filter, records]);

  return (
    <section className="flex flex-col gap-6">
      {showHeader && (
        <header className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </header>
      )}

      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Todos"
            isActive={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterButton
            label="Asisten"
            isActive={filter === "attending"}
            onClick={() => setFilter("attending")}
          />
          <FilterButton
            label="No asisten"
            isActive={filter === "notAttending"}
            onClick={() => setFilter("notAttending")}
          />
        </div>
      )}

      {error ? (
        <div className="rounded-[20px] border border-primary/40 bg-primary/10 px-4 py-6 text-center text-sm text-primary">
          Ocurrió un problema al sincronizar con Firestore. Reintenta recargando
          la página o revisa tu conexión.
        </div>
      ) : isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[20px] border border-border/70 bg-surface/95 shadow-[var(--shadow-soft)]">
          <table className="w-full min-w-[1000px] divide-y divide-border/60 text-left text-sm">
            <thead className="bg-accent/70 text-xs uppercase tracking-[0.3em] text-muted">
              <tr>
                <th className="px-4 py-3">Invitado</th>
                <th className="px-4 py-3">Asistencia</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Etiquetas</th>
                <th className="px-4 py-3">Adultos</th>
                <th className="px-4 py-3">Preboda</th>
                <th className="px-4 py-3">Traslado</th>
                <th className="px-4 py-3">Notas invitado</th>
                <th className="px-4 py-3">Notas internas</th>
                <th className="px-4 py-3">Registrado</th>
                <th className="px-4 py-3">Actualizado</th>
                {onSelectRecord && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={onSelectRecord ? 12 : 11}
                    className="px-4 py-8 text-center text-sm text-muted"
                  >
                    No hay registros que coincidan con el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={[
                      "transition-colors duration-150",
                      index % 2 === 0 ? "bg-background/40" : "bg-background/60",
                      "hover:bg-accent/40",
                    ].join(" ")}
                  >
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {record.fullName}
                        </span>
                        <span className="text-xs text-muted">
                          {record.email} · {record.phone}
                        </span>
                        {record.guestNames && (
                          <span className="mt-1 text-xs text-muted">
                            {record.guestNames}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <AttendanceBadge attending={record.attendance === "si"} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusDisplay
                        status={record.status}
                        processed={Boolean(record.processed)}
                        updatedBy={record.updatedBy}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <TagChips tags={record.tags} />
                    </td>
                    <td className="px-4 py-4">{record.guests}</td>
                    <td className="px-4 py-4">
                      <AttendanceBadge
                        attending={record.preboda === "si"}
                        trueLabel="Sí"
                        falseLabel="No"
                      />
                    </td>
                    <td className="px-4 py-4">
                      {record.needsTransport === "si" ? (
                        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                          {record.transportSeats ?? 0} plazas
                        </span>
                      ) : (
                        <span className="text-xs uppercase tracking-[0.3em] text-muted">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {record.requests ? (
                        <span className="text-xs text-muted">
                          {record.requests}
                        </span>
                      ) : (
                        <span className="text-xs uppercase tracking-[0.3em] text-muted">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {record.notes ? (
                        <span className="text-xs text-foreground">
                          {record.notes}
                        </span>
                      ) : (
                        <span className="text-xs uppercase tracking-[0.3em] text-muted">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted">
                      {formatTimestamp(record.submittedAt)}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted">
                      {formatTimestamp(record.updatedAt)}
                    </td>
                    {onSelectRecord && (
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectRecord(record)}
                          className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                        >
                          Gestionar
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={[
        "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition",
        isActive
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border text-muted hover:border-primary/60 hover:text-primary",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </button>
  );
}

function AttendanceBadge({
  attending,
  trueLabel = "Sí",
  falseLabel = "No",
}: {
  attending: boolean;
  trueLabel?: string;
  falseLabel?: string;
}) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]",
        attending
          ? "bg-primary/15 text-primary"
          : "bg-border/30 text-muted",
      ].join(" ")}
    >
      {attending ? trueLabel : falseLabel}
    </span>
  );
}

const STATUS_TEXT: Record<RsvpStatus, string> = {
  pendiente: "Pendiente",
  contactado: "Contactado",
  confirmado: "Confirmado",
};

const STATUS_CLASS: Record<RsvpStatus, string> = {
  pendiente:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300",
  contactado:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300",
  confirmado: "bg-primary/15 text-primary",
};

function StatusDisplay({
  status,
  processed,
  updatedBy,
}: {
  status: RsvpStatus;
  processed: boolean;
  updatedBy?: string | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className={[
          "inline-flex w-fit items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]",
          STATUS_CLASS[status],
        ].join(" ")}
      >
        {STATUS_TEXT[status]}
      </span>
      <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-muted">
        <span
          className={[
            "rounded-full px-2 py-0.5",
            processed
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
              : "bg-border/50 text-muted",
          ].join(" ")}
        >
          {processed ? "Procesado" : "Sin procesar"}
        </span>
        {updatedBy && <span>· {updatedBy}</span>}
      </div>
    </div>
  );
}

function TagChips({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return (
      <span className="text-xs uppercase tracking-[0.3em] text-muted">—</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-accent/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-foreground/80"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function formatTimestamp(timestamp: RsvpRecord["submittedAt"]) {
  try {
    if (!timestamp) return "—";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
}
