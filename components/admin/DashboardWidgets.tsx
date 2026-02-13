"use client";

import { useEffect, useMemo, useState } from "react";
import { useWeddingTasks } from "./useWeddingTasks";
import {  Calendar, Check, Clock, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DashboardWidgets() {
  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
      {/* Columna Izquierda: Cuenta atrás y Accesos rápidos */}
      <div className="flex flex-col gap-4 lg:col-span-1">
        <CountdownWidget targetDate="2026-09-12T13:30:00" />
        <QuickActionsWidget />
      </div>

      {/* Columna Derecha: Tareas pendientes */}
      <div className="lg:col-span-2">
        <PendingTasksWidget />
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
    <div className="rounded-[16px] border border-border/60 bg-surface p-4 shadow-sm">
       <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Acciones</h3>
       <div className="flex flex-col gap-1.5">
         <Link 
          href="/admin/rsvps" 
          className="flex items-center justify-between rounded-lg bg-accent/40 px-3 py-2 text-xs font-medium transition hover:bg-accent hover:text-primary"
         >
           <span>Invitados</span>
           <ArrowRight size={12} className="opacity-50" />
         </Link>
         <Link 
          href="/admin/mesas" 
          className="flex items-center justify-between rounded-lg bg-accent/40 px-3 py-2 text-xs font-medium transition hover:bg-accent hover:text-primary"
         >
           <span>Mesas</span>
           <ArrowRight size={12} className="opacity-50" />
         </Link>
          <Link 
          href="/admin/galeria" 
          className="flex items-center justify-between rounded-lg bg-accent/40 px-3 py-2 text-xs font-medium transition hover:bg-accent hover:text-primary"
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
    <div className="flex h-full flex-col rounded-[16px] border border-border/60 bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          Tareas
        </h3>
        <Link 
          href="/admin/tareas" 
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
            href="/admin/tareas"
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-1.5 text-[10px] text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <Plus size={10} />
            Añadir
          </Link>
        </div>
      )}
    </div>
  );
}
