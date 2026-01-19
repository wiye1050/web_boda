"use client";

import { useEffect, useMemo, useState } from "react";
import { RsvpTable } from "./RsvpTable";
import { RsvpDetailDialog } from "./RsvpDetailDialog";
import { useRsvpData } from "./useRsvpData";
import type { RsvpRecord, RsvpStatus } from "./useRsvpData";

type AttendanceFilter = "all" | "attending" | "notAttending";
type ProcessedFilter = "all" | "processed" | "pending";
type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc";
type StatusFilter = "all" | RsvpStatus;

export function RsvpView() {
  const { records, isLoading, error } = useRsvpData();
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

  useEffect(() => {
    if (selectedTag !== "all" && !availableTags.includes(selectedTag)) {
      setSelectedTag("all");
    }
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

    if (selectedTag !== "all") {
      result = result.filter((record) => record.tags.includes(selectedTag));
    }

    return result;
  }, [
    attendanceFilter,
    statusFilter,
    onlyPreboda,
    onlyTransport,
    processedFilter,
    selectedTag,
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
      selectedTag !== "all" ||
      sortOption !== "date-desc"
    );
  }, [
    attendanceFilter,
    onlyPreboda,
    onlyTransport,
    processedFilter,
    search,
    selectedTag,
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

    const header = Object.keys(rows[0] ?? { Nombre: "" });
    const csvContent = [
      header.join(","),
      ...rows.map((row) =>
        header
          .map((key) => `"${String(row[key as keyof typeof row]).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `rsvps_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">RSVPs</h1>
            <p className="text-sm text-muted">
              Busca por nombre, filtra por estado, preboda o transporte y
              exporta los datos para compartirlos con el equipo.
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">
              {sorted.length} de {records.length} resultados
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-xs">
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
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
            >
              Exportar CSV
            </button>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterPill
              label="Todos"
              active={attendanceFilter === "all"}
              onClick={() => setAttendanceFilter("all")}
            />
            <FilterPill
              label="Asisten"
              active={attendanceFilter === "attending"}
              onClick={() => setAttendanceFilter("attending")}
            />
            <FilterPill
              label="No asisten"
              active={attendanceFilter === "notAttending"}
              onClick={() => setAttendanceFilter("notAttending")}
            />
            <FilterPill
              label="Pendientes"
              active={statusFilter === "pendiente"}
              onClick={() =>
                setStatusFilter((prev) =>
                  prev === "pendiente" ? "all" : "pendiente",
                )
              }
            />
            <FilterPill
              label="Contactados"
              active={statusFilter === "contactado"}
              onClick={() =>
                setStatusFilter((prev) =>
                  prev === "contactado" ? "all" : "contactado",
                )
              }
            />
            <FilterPill
              label="Confirmados"
              active={statusFilter === "confirmado"}
              onClick={() =>
                setStatusFilter((prev) =>
                  prev === "confirmado" ? "all" : "confirmado",
                )
              }
            />
            <FilterPill
              label="Preboda"
              active={onlyPreboda}
              onClick={() => setOnlyPreboda((prev) => !prev)}
            />
            <FilterPill
              label="Transporte"
              active={onlyTransport}
              onClick={() => setOnlyTransport((prev) => !prev)}
            />
            <FilterPill
              label="Procesados"
              active={processedFilter === "processed"}
              onClick={() =>
                setProcessedFilter((prev) =>
                  prev === "processed" ? "all" : "processed",
                )
              }
            />
            <FilterPill
              label="Sin procesar"
              active={processedFilter === "pending"}
              onClick={() =>
                setProcessedFilter((prev) =>
                  prev === "pending" ? "all" : "pending",
                )
              }
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="tags"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-muted"
              >
                Etiqueta
              </label>
              <select
                id="tags"
                value={selectedTag}
                onChange={(event) => setSelectedTag(event.target.value)}
                className="rounded-full border border-border/80 bg-surface px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Todas</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-muted"
              >
                Ordenar por
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={(event) =>
                  setSortOption(event.target.value as SortOption)
                }
                className="rounded-full border border-border/80 bg-surface px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="date-desc">Fecha (reciente primero)</option>
                <option value="date-asc">Fecha (antiguo primero)</option>
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </header>
      <RsvpTable
        records={sorted}
        isLoading={isLoading}
        error={error}
        showHeader={false}
        showFilters={false}
        onSelectRecord={setSelectedRecord}
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
