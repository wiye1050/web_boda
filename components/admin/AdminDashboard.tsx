"use client";

import { AdminStats } from "./AdminStats";
import { RsvpTable } from "./RsvpTable";
import { useRsvpData } from "./useRsvpData";
import { DashboardWidgets } from "./DashboardWidgets";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function AdminDashboard() {
  const { records, isLoading, error, metrics } = useRsvpData();

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* 1. Mini KPIs */}
      <AdminStats metrics={metrics} />

      {/* 2. Widgets Grid (Countdown, Actions, Tasks) */}
      <DashboardWidgets />

      {/* 3. Recent RSVPs Table */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Últimas confirmaciones
          </h2>
          <Link 
            href="/admin/rsvps" 
            className="group flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-primary hover:underline"
          >
            Ver todas
            <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        
        <RsvpTable
          records={records.slice(0, 5)}
          isLoading={isLoading}
          error={error}
          showHeader={false}
          showFilters={false}
          // Assuming compact style is default now in RsvpTable optimizations
        />
      </section>
    </div>
  );
}
