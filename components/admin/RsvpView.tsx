"use client";

import { useEffect, useMemo, useState } from "react";
import { RsvpTable } from "./RsvpTable";
import { RsvpDetailDialog } from "./RsvpDetailDialog";
import { useRsvpData } from "./useRsvpData";
import type { RsvpRecord, RsvpStatus } from "./useRsvpData";
import { exportToCsv } from "@/lib/utils";

type AttendanceFilter = "all" | "attending" | "notAttending";
type ProcessedFilter = "all" | "processed" | "pending";
type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc";
type StatusFilter = "all" | RsvpStatus;

export function RsvpView() {
  const { records, isLoading, error, deleteRsvp, metrics } = useRsvpData();
  const [search, setSearch] = useState("");
  const [attendanceFilter, setAttendanceFilter] =
    useState<AttendanceFilter>("all");
  const [onlyPreboda, setOnlyPreboda] = useState(false);
  const [onlyTransport, setOnlyTransport] = useState(false);
  const [processedFilter, setProcessedFilter] =
    useState<ProcessedFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [selectedRecord, setSelectedRecord] = useState<RsvpRecord | null>(null);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    records.forEach((record) => {
      record.tags.forEach((tag) => set.add(tag));
    });
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b, "es"));
  }, [records]);

  const safeSelectedTag = useMemo(() => {
    if (selectedTag === "all") return "all";
    return availableTags.includes(selectedTag) ? selectedTag : "all";
  }, [availableTags, selectedTag]);

  const filtered = useMemo(() => {
    let result = records;
    const searchTerm = search.trim().toLowerCase();

    if (searchTerm) {
      result = result.filter((record) => {
        return (
          record.fullName.toLowerCase().includes(searchTerm) ||
          record.email.toLowerCase().includes(searchTerm) ||
          record.phone.toLowerCase().includes(searchTerm) ||
          (record.guestNames ?? "").toLowerCase().includes(searchTerm)
        );
      });
    }

    if (attendanceFilter === "attending") {
      result = result.filter((record) => record.attendance === "si");
    } else if (attendanceFilter === "notAttending") {
      result = result.filter((record) => record.attendance === "no");
    }

    if (statusFilter !== "all") {
      result = result.filter((record) => record.status === statusFilter);
    }

    if (onlyPreboda) {
      result = result.filter((record) => record.preboda === "si");
    }

    if (onlyTransport) {
      result = result.filter((record) => record.needsTransport === "si");
    }

    if (processedFilter === "processed") {
      result = result.filter((record) => record.processed);
    } else if (processedFilter === "pending") {
      result = result.filter((record) => !record.processed);
    }

    if (safeSelectedTag !== "all") {
      result = result.filter((record) => record.tags.includes(safeSelectedTag));
    }

    return result;
  }, [
    attendanceFilter,
    statusFilter,
    onlyPreboda,
    onlyTransport,
    processedFilter,
    safeSelectedTag,
    records,
    search,
  ]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    return arr.sort((a, b) => {
      if (sortOption === "name-asc" || sortOption === "name-desc") {
        const comparison = a.fullName.localeCompare(b.fullName, "es");
        return sortOption === "name-asc" ? comparison : -comparison;
      }

      const dateA = a.submittedAt?.toMillis() ?? 0;
      const dateB = b.submittedAt?.toMillis() ?? 0;
      if (sortOption === "date-asc") {
        return dateA - dateB;
      }
      return dateB - dateA;
    });
  }, [filtered, sortOption]);

  const isFilterActive = useMemo(() => {
    return (
      search.trim().length > 0 ||
      attendanceFilter !== "all" ||
      statusFilter !== "all" ||
      onlyPreboda ||
      onlyTransport ||
      processedFilter !== "all" ||
      safeSelectedTag !== "all" ||
      sortOption !== "date-desc"
    );
  }, [
    attendanceFilter,
    onlyPreboda,
    onlyTransport,
    processedFilter,
    search,
    safeSelectedTag,
    sortOption,
    statusFilter,
  ]);

  function handleClearFilters() {
    setSearch("");
    setAttendanceFilter("all");
    setOnlyPreboda(false);
    setOnlyTransport(false);
    setProcessedFilter("all");
    setStatusFilter("all");
    setSelectedTag("all");
    setSortOption("date-desc");
  }

  function handleExport() {
    const rows = sorted.map((record) => ({
      Nombre: record.fullName,
      Email: record.email,
      Teléfono: record.phone,
      Asistencia: record.attendance === "si" ? "Sí" : "No",
      Adultos: record.guests,
      "Acompañantes": record.guestNames ?? "",
      Preboda: record.preboda === "si" ? "Sí" : "No",
      "Transporte": record.needsTransport === "si" ? "Sí" : "No",
      "Plazas bus": record.transportSeats ?? 0,
      "Notas invitado": record.requests ?? "",
      "Notas internas": record.notes ?? "",
      Estado: record.status,
      Etiquetas: record.tags.join(" | "),
      Procesado: record.processed ? "Sí" : "No",
      Registrado: record.submittedAt
        ? new Date(record.submittedAt.toMillis()).toISOString()
        : "",
      "Actualizado": record.updatedAt
        ? new Date(record.updatedAt.toMillis()).toISOString()
        : "",
    }));

    exportToCsv(rows, `rsvps_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Bar - Compact */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="flex items-center justify-between rounded-[16px] border border-border/70 bg-surface px-4 py-2 shadow-[var(--shadow-soft)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Confirmados</p>
          <p className="text-xl font-semibold text-foreground">{metrics.attending}</p>
        </div>
        <div className="flex items-center justify-between rounded-[16px] border border-border/70 bg-surface px-4 py-2 shadow-[var(--shadow-soft)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Autobús</p>
          <div className="text-right">
            <p className="text-xl font-semibold text-foreground leading-none">{metrics.transportSeats}</p>
            <p className="text-[9px] text-muted uppercase tracking-wider">plazas</p>
          </div>
        </div>
         <div className="flex items-center justify-between rounded-[16px] border border-border/70 bg-surface px-4 py-2 shadow-[var(--shadow-soft)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Preboda</p>
          <p className="text-xl font-semibold text-foreground">{metrics.preboda}</p>
        </div>
        <div className="flex items-center justify-between rounded-[16px] border border-border/70 bg-surface px-4 py-2 shadow-[var(--shadow-soft)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Pendientes</p>
          <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">{metrics.statusCounts.pendiente}</p>
        </div>
      </div>

      {/* Search & Export Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar invitado..."
            className="w-full rounded-full border border-border/80 bg-surface px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.3em] text-muted hover:text-primary"
              onClick={() => setSearch("")}
            >
              limpiar
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
           <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
          >
            Exportar CSV
          </button>
        </div>
      </div>
      <RsvpTable
        records={sorted}
        isLoading={isLoading}
        error={error}
        showHeader={false}
        showFilters={false}
        onSelectRecord={setSelectedRecord}
        onDeleteRecord={deleteRsvp}
      />
      <RsvpDetailDialog
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition",
        active
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
