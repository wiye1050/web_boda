"use client";

import { AdminStats } from "./AdminStats";
import { RsvpTable } from "./RsvpTable";
import { useRsvpData } from "./useRsvpData";

export function AdminDashboard() {
  const { records, isLoading, error, metrics } = useRsvpData();

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
          Bienvenido
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">
            Panel principal de la boda
          </h1>
          <p className="max-w-2xl text-sm text-muted">
            Consulta de un vistazo el avance de confirmaciones, la asistencia a
            la preboda y la logística de transporte. Estos datos se actualizan en
            tiempo real desde Firestore.
          </p>
        </div>
      </header>

      <AdminStats metrics={metrics} />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Últimas confirmaciones</h2>
        <RsvpTable
          records={records.slice(0, 8)}
          isLoading={isLoading}
          error={error}
          showHeader={false}
          showFilters={false}
        />
      </section>
    </div>
  );
}
