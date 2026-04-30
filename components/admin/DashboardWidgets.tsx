"use client";

import { useEffect, useMemo, useState } from "react";
import { useWeddingTasks } from "./useWeddingTasks";
import { useSystemLogs } from "./useSystemLogs";
import { syncPendingTasksAction } from "@/app/actions/syncTasks";
import {  Calendar, Check, Clock, Plus, ArrowRight, AlertTriangle, MailWarning, RefreshCw, Settings, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function DashboardWidgets() {
  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
      {/* Columna Izquierda: Cuenta atrás y Accesos rápidos */}
      <div className="flex flex-col gap-4 lg:col-span-1">
        <CountdownWidget targetDate="2026-09-12T13:30:00" />
        <QuickActionsWidget />
        <SiteStatusWidget />
        <SystemLogsWidget />
      </div>

      {/* Columna Derecha: Tareas pendientes */}
      <div className="lg:col-span-2">
        <PendingTasksWidget />
      </div>
    </div>
  );
}

// ... existing CountdownWidget, QuickActionsWidget, PendingTasksWidget ...

function SystemLogsWidget() {
  const { logs, isLoading } = useSystemLogs(3);

  if (isLoading) return <div className="h-24 rounded-[16px] bg-accent/10 animate-pulse" />;
  if (logs.length === 0) return null;

  return (
    <div className="rounded-[16px] border border-red-200/50 bg-red-50/30 p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle size={14} className="text-red-500" />
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-red-900/70">Estado del Sistema</h3>
      </div>
      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <div key={log.id} className="flex flex-col gap-0.5 border-l-2 border-red-300 pl-2">
            <span className="text-[10px] font-semibold text-red-900 line-clamp-1">{log.message}</span>
            <span className="text-[9px] text-red-700/70 flex items-center gap-1">
              <MailWarning size={10} />
              {log.guestName || "Sistema"} · {log.timestamp?.toDate().toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


function CountdownWidget({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const calculate = () => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };

    calculate();
    const timer = setInterval(calculate, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="relative overflow-hidden rounded-[16px] border border-border/60 bg-gradient-to-br from-primary/5 to-surface p-4 shadow-sm">
      <div className="absolute right-3 top-3 text-primary/10">
        <Clock size={50} strokeWidth={1} />
      </div>
      <h3 className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">A la boda</h3>
      <div className="relative z-10 mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-foreground">{timeLeft.days}</span>
        <span className="text-xs text-muted-foreground">días</span>
      </div>
      <div className="relative z-10 mt-0.5 flex gap-2 text-[10px] text-muted-foreground">
        <span>{timeLeft.hours}h</span>
        <span>{timeLeft.minutes}m</span>
      </div>
      <div className="relative z-10 mt-3 h-1 w-full overflow-hidden rounded-full bg-border/40">
        <div className="h-full w-[45%] rounded-full bg-primary/60" /> 
      </div>
    </div>
  );
}

function QuickActionsWidget() {
  return (
    <div className="rounded-[16px] border border-border/60 bg-surface/60 backdrop-blur-md p-4 shadow-[var(--shadow-soft)]">
       <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Acciones</h3>
       <div className="flex flex-col gap-1.5">
         <Link 
          href="/admin/rsvps" 
          className="flex items-center justify-between rounded-lg bg-background/50 border border-border/20 px-3 py-2 text-xs font-medium transition hover:bg-accent hover:text-primary hover:border-primary/20"
         >
           <span>Invitados</span>
           <ArrowRight size={12} className="opacity-50" />
         </Link>
         <Link 
          href="/admin/organizacion" 
          className="flex items-center justify-between rounded-lg bg-background/50 border border-border/20 px-3 py-2 text-xs font-medium transition hover:bg-accent hover:text-primary hover:border-primary/20"
         >
           <span>Organización</span>
           <ArrowRight size={12} className="opacity-50" />
         </Link>
          <Link 
          href="/admin/galeria" 
          className="flex items-center justify-between rounded-lg bg-background/50 border border-border/20 px-3 py-2 text-xs font-medium transition hover:bg-accent hover:text-primary hover:border-primary/20"
         >
           <span>Fotos</span>
           <ArrowRight size={12} className="opacity-50" />
         </Link>
       </div>
    </div>
  )
}

function PendingTasksWidget() {
  const { tasks, isLoading } = useWeddingTasks();

  const pendingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === "pendiente")
      .slice(0, 3); // Top 3
  }, [tasks]);

  if (isLoading) return <div className="h-32 rounded-[16px] bg-accent/20 animate-pulse" />;

  return (
    <div className="flex h-full flex-col rounded-[16px] border border-border/60 bg-surface/60 backdrop-blur-md p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Tareas
          </h3>
          <SyncTasksButton />
        </div>
        <Link 
          href="/admin/organizacion" 
          className="text-[9px] font-semibold uppercase tracking-wider text-primary hover:underline"
        >
          Ver todas
        </Link>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted">
          <Check size={20} className="text-emerald-500/50" />
          <p className="text-xs">¡Todo al día!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-background/50 p-2.5 transition hover:border-primary/20 hover:bg-background"
            >
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted/30 text-transparent">
                 <div className="h-2 w-2 rounded-full bg-transparent" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-foreground">{task.title}</span>
                {task.dueDate && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar size={9} />
                    {task.dueDate}
                  </span>
                )}
              </div>
            </div>
          ))}
          <Link 
            href="/admin/organizacion"
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-1.5 text-[10px] text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <Plus size={10} />
            Gestión
          </Link>
        </div>
      )}
    </div>
  );
}

function SyncTasksButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncPendingTasksAction();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Error al sincronizar: " + result.error);
      }
    } catch (e) {
      toast.error("Error inesperado en la sincronización.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      title="Sincronizar tareas pendientes con Google Tasks"
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/50 text-accent-foreground transition hover:bg-accent hover:text-primary active:scale-95 disabled:opacity-50"
    >
      <RefreshCw size={10} className={isSyncing ? "animate-spin" : ""} />
    </button>
  );
}
function SiteStatusWidget() {
  // En una app real, esto vendría de un hook que lea de Firestore (colección config/public)
  // Por ahora mostramos los valores por defecto o simulados para dar feedback visual
  const config = {
    heroDescription: "Porque no hay mejor excusa para juntaros a todos",
    noticeEnabled: true,
    weddingDate: "12 Septiembre 2026",
  };

  return (
    <div className="rounded-[16px] border border-border/60 bg-surface/60 backdrop-blur-md p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Info de la Web</h3>
        <Settings size={12} className="text-muted/40" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-wider text-muted">Hero Description</span>
          <p className="text-[11px] leading-relaxed text-foreground/90 italic font-medium">
            "{config.heroDescription}"
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-border/30 pt-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-muted">Fecha</span>
            <span className="text-[10px] font-semibold">{config.weddingDate}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-muted">Aviso Superior</span>
            <span className={`text-[10px] font-semibold ${config.noticeEnabled ? 'text-emerald-600' : 'text-muted'}`}>
              {config.noticeEnabled ? 'Activado' : 'Desactivado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
