"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
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
  onDeleteRecord?: (id: string) => Promise<void>;
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
  onDeleteRecord,
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

  function handleExport() {
    const data = filteredRecords.map((record) => ({
      Nombre: record.fullName,
      Email: record.email,
      Teléfono: record.phone,
      Asistencia: record.attendance === "si" ? "Sí" : "No",
      Adultos: record.guests,
      Nombres_Acompañantes: record.guestNames,
      Preboda: record.preboda === "si" ? "Sí" : "No",
      Transporte: record.needsTransport === "si" ? "Sí" : "No",
      Plazas_Bus: record.transportSeats,
      Comentarios: record.requests,
      Notas_Internas: record.notes,
      Etiquetas: record.tags.join(", "),
      Estado: STATUS_TEXT[record.status],
      Procesado: record.processed ? "Sí" : "No",
      Actualizado_Por: record.updatedBy,
      Fecha_Registro: record.submittedAt?.toDate().toLocaleString() ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");
    XLSX.writeFile(workbook, "Boda_RSVP.xlsx");
  }

  return (
    <section className="flex flex-col gap-6">
      {showHeader && (
        <header className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </header>
      )}

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2">
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
          <div className="ml-auto">
            <button
              type="button"
              onClick={handleExport}
              className="rounded-full border border-emerald-600/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 transition hover:bg-emerald-500/20 active:translate-y-[1px]"
            >
              Exportar Excel
            </button>
          </div>
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
        <>
          {filteredRecords.length === 0 ? (
            <div className="rounded-[20px] border border-border/70 bg-surface/95 px-4 py-6 text-center text-sm text-muted shadow-[var(--shadow-soft)]">
              No hay registros que coincidan con el filtro seleccionado.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:hidden">
                {filteredRecords.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-[20px] border border-border/70 bg-surface/95 p-4 shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {record.fullName}
                        </p>
                        <p className="text-xs text-muted">
                          {record.email} · {record.phone}
                        </p>
                      </div>
                      <AttendanceBadge attending={record.attendance === "si"} />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-muted">
                      <span>Adultos: {record.guests}</span>
                      <span>Preboda: {record.preboda === "si" ? "Sí" : "No"}</span>
                      <span>
                        Transporte:{" "}
                        {record.needsTransport === "si"
                          ? `${record.transportSeats ?? 0} plazas`
                          : "No"}
                      </span>
                      <span>
                        Términos: {record.acceptedTerms ? "✅" : "❌"}
                      </span>
                    </div>
                    {(record.guestNames || record.requests) && (
                      <div className="mt-3 text-xs text-muted">
                        {record.guestNames && (
                          <p>Acompañantes: {record.guestNames}</p>
                        )}
                        {record.requests && <p>Notas: {record.requests}</p>}
                      </div>
                    )}
                    <div className="mt-3 text-xs text-muted">
                      <p>Estado: {record.status ?? "—"}</p>
                      <p>Registrado: {getRelativeTime(record.submittedAt)}</p>
                    </div>
                    {onSelectRecord && (
                      <button
                        type="button"
                        onClick={() => onSelectRecord(record)}
                        className="mt-4 w-full rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                      >
                        Gestionar
                      </button>
                    )}
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-[20px] border border-border/70 bg-surface/95 shadow-[var(--shadow-soft)] md:block">
                <table className="w-full divide-y divide-border/60 text-left text-sm">
                  <thead className="bg-accent/70 text-xs uppercase tracking-[0.3em] text-muted">
                    <tr>
                      <th className="px-4 py-3">Invitado</th>
                      <th className="px-4 py-3">Asistencia</th>
                      <th className="px-4 py-3 text-center" title="Preboda">🎉</th>
                      <th className="px-4 py-3 text-center" title="Transporte">🚌</th>
                      <th className="px-4 py-3 text-center">Adultos</th>
                      <th className="px-4 py-3">Registro</th>
                      <th className="px-4 py-3">Estado</th>
                      {onSelectRecord && (
                        <th className="px-4 py-3 text-right">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredRecords.map((record, index) => (
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
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {record.fullName}
                              </span>
                              {(record.requests || record.notes) && (
                                <span title="Tiene notas" className="cursor-help text-xs">📝</span>
                              )}
                            </div>
                            <span className="text-xs text-muted">
                              {record.email} · {record.phone}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <AttendanceBadge
                            attending={record.attendance === "si"}
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          {record.preboda === "si" ? (
                            <span title="Asiste a preboda">✅</span>
                          ) : (
                            <span className="text-muted/30">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {record.needsTransport === "si" ? (
                            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary" title={`Transporte: ${record.transportSeats} plazas`}>
                              {record.transportSeats}
                            </span>
                          ) : (
                             <span className="text-muted/30">—</span>
                          )}
                        </td>
                         <td className="px-4 py-4 text-center">
                            {record.guests}
                        </td>
                        <td className="px-4 py-4 text-xs text-muted">
                          {getRelativeTime(record.submittedAt)}
                        </td>
                         <td className="px-4 py-4">
                          <StatusDisplay
                            status={record.status}
                            processed={Boolean(record.processed)}
                          />
                        </td>
                        {onSelectRecord && (
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => onSelectRecord(record)}
                                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                              >
                                Ver
                              </button>
                              {onDeleteRecord && (
                                <DeleteButton
                                  onDelete={() => onDeleteRecord(record.id)}
                                />
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (confirming) {
      const timeout = setTimeout(() => setConfirming(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [confirming]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (confirming) {
          onDelete();
          setConfirming(false);
        } else {
          setConfirming(true);
        }
      }}
      className={[
        "flex w-[34px] items-center justify-center rounded-full border px-0 py-2 text-xs font-semibold transition dark:border-red-900/30",
        confirming
          ? "w-auto min-w-[34px] border-red-500 bg-red-500 px-3 text-white hover:bg-red-600 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
          : "border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10",
      ].join(" ")}
      title={confirming ? "Click para confirmar" : "Borrar registro"}
    >
      {confirming ? (
        <span className="whitespace-nowrap text-[10px] uppercase tracking-widest">
          ¿Borrar?
        </span>
      ) : (
        "🗑️"
      )}
    </button>
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

function getRelativeTime(timestamp: RsvpRecord["submittedAt"]) {
  if (!timestamp) return "—";
  const date = timestamp.toDate();
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "ahora";
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)}d`;

  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    day: "numeric",
  }).format(date);
}
