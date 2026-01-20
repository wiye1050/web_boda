"use client";

import { useMemo, useState } from "react";
import {
  useWeddingTasks,
  type TaskStatus,
  type WeddingTask,
} from "@/components/admin/useWeddingTasks";

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en-progreso", label: "En progreso" },
  { value: "completada", label: "Completada" },
];

const DEFAULT_PLAN: Array<{
  title: string;
  description?: string;
  monthLabel: string;
  dueDate?: string;
  category?: string;
}> = [
  {
    title: "Definir presupuesto inicial",
    monthLabel: "12 meses antes",
    description: "Acordar presupuesto total y distribución por partidas.",
    category: "Finanzas",
  },
  {
    title: "Visita a la finca",
    monthLabel: "11 meses antes",
    description: "Segunda visita con familia para resolver dudas logísticas.",
    category: "Logística",
  },
  {
    title: "Cerrar proveedor de catering",
    monthLabel: "10 meses antes",
    description: "Firmar contrato con menú inicial y condiciones de pago.",
    category: "Proveedores",
  },
  {
    title: "Enviar save the date",
    monthLabel: "8 meses antes",
    description: "Comunicar fecha y ciudad a los invitados clave.",
    category: "Invitados",
  },
  {
    title: "Elegir traje y vestido",
    monthLabel: "6 meses antes",
    category: "Moda",
  },
  {
    title: "Diseñar seating provisional",
    monthLabel: "1 mes antes",
    category: "Invitados",
  },
  {
    title: "Confirmar timeline con proveedores",
    monthLabel: "2 semanas antes",
    category: "Logística",
  },
  {
    title: "Preparar kit emergencia bodas",
    monthLabel: "1 semana antes",
    description: "Incluye costurero, analgésicos, tiritas, maquillaje.",
    category: "Logística",
  },
];

export function TasksView() {
  const { groupedByMonth, isLoading, error, addTask, updateTask, removeTask } =
    useWeddingTasks();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskMonth, setNewTaskMonth] = useState("Próximos pasos");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("pendiente");
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const monthOptions = useMemo(() => {
    const base = groupedByMonth.map((group) => group.month);
    const set = new Set<string>(base);
    set.add("Próximos pasos");
    set.add("Semana de la boda");
    set.add("Post boda");
    return Array.from(set.values());
  }, [groupedByMonth]);

  async function handleAddTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTaskTitle.trim()) {
      setLocalError("Escribe un título para la tarea.");
      return;
    }

    try {
      await addTask({
        title: newTaskTitle.trim(),
        description: "",
        status: newTaskStatus,
        monthLabel: newTaskMonth,
        category: newTaskCategory || undefined,
      });
      setNewTaskTitle("");
      setNewTaskCategory("");
      setNewTaskStatus("pendiente");
      setLocalError(null);
    } catch (err) {
      console.error(err);
      setLocalError("No se pudo crear la tarea.");
    }
  }

  async function handleCreateDefaultPlan() {
    setCreatingPlan(true);
    try {
      await Promise.all(
        DEFAULT_PLAN.map((task) =>
          addTask({
            title: task.title,
            description: task.description,
            status: "pendiente",
            monthLabel: task.monthLabel,
            category: task.category,
          }),
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingPlan(false);
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
          <h1 className="text-3xl font-semibold">Plan maestro</h1>
          <p className="text-sm text-muted">
            Organiza tareas, responsables y tiempos clave hasta el gran día.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCreateDefaultPlan}
            disabled={creatingPlan}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary disabled:opacity-60"
          >
            {creatingPlan ? "Creando plan..." : "Cargar plan sugerido"}
          </button>
        </div>
      </header>

      <section className="rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold">Añadir nueva tarea</h2>
        <form
          onSubmit={handleAddTask}
          className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.6fr)_150px]"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Tarea
            </label>
            <input
              value={newTaskTitle}
              onChange={(event) => setNewTaskTitle(event.target.value)}
              placeholder="Ej. Reservar hotel invitados"
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Momento
            </label>
            <select
              value={newTaskMonth}
              onChange={(event) => setNewTaskMonth(event.target.value)}
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Estado
            </label>
            <select
              value={newTaskStatus}
              onChange={(event) => setNewTaskStatus(event.target.value as TaskStatus)}
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
              Categoría (opcional)
            </label>
            <input
              value={newTaskCategory}
              onChange={(event) => setNewTaskCategory(event.target.value)}
              placeholder="Logística, Invitados..."
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              type="submit"
              className="w-full rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30 md:w-auto"
            >
              Añadir
            </button>
          </div>
        </form>
        {localError && <p className="mt-2 text-xs text-primary">{localError}</p>}
      </section>

      {error && <p className="text-xs text-primary">{error}</p>}

      <section className="flex flex-col gap-4">
        {groupedByMonth.length === 0 ? (
          <p className="text-sm text-muted">
            Aún no tienes tareas registradas. Crea una manualmente o carga el plan sugerido.
          </p>
        ) : (
          groupedByMonth.map((group) => (
            <TaskGroup
              key={group.month}
              title={group.month}
              tasks={group.tasks}
              updateTask={updateTask}
              removeTask={removeTask}
            />
          ))
        )}
      </section>
    </div>
  );
}

type UpdateTaskFn = (taskId: string, data: Partial<WeddingTask>) => Promise<void>;
type RemoveTaskFn = (taskId: string) => Promise<void>;

function TaskGroup({
  title,
  tasks,
  updateTask,
  removeTask,
}: {
  title: string;
  tasks: WeddingTask[];
  updateTask: UpdateTaskFn;
  removeTask: RemoveTaskFn;
}) {
  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const statusOrder: Record<TaskStatus, number> = {
        pendiente: 0,
        "en-progreso": 1,
        completada: 2,
      };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return a.title.localeCompare(b.title, "es");
    });
  }, [tasks]);

  return (
    <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-muted">
          {tasks.length} tareas
        </span>
      </header>
      <div className="mt-4 grid gap-3">
        {sorted.map((task) => (
          <TaskCard key={task.id} task={task} updateTask={updateTask} removeTask={removeTask} />
        ))}
      </div>
    </article>
  );
}

function TaskCard({
  task,
  updateTask,
  removeTask,
}: {
  task: WeddingTask;
  updateTask: UpdateTaskFn;
  removeTask: RemoveTaskFn;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = event.target.value as TaskStatus;
    setIsSaving(true);
    try {
      await updateTask(task.id, { status: newStatus });
      setLocalError(null);
    } catch (err) {
      console.error(err);
      setLocalError("No se pudo actualizar la tarea.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove() {
    const confirmation = window.confirm("¿Eliminar esta tarea?");
    if (!confirmation) return;
    setIsSaving(true);
    try {
      await removeTask(task.id);
      setLocalError(null);
    } catch (err) {
      console.error(err);
      setLocalError("No se pudo eliminar la tarea.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-semibold text-foreground">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-muted">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-muted">
            {task.category && (
              <span className="rounded-full bg-accent/80 px-2 py-1 text-foreground/80">
                {task.category}
              </span>
            )}
            {task.dueDate && (
              <span className="rounded-full bg-border/60 px-2 py-1">
                {new Date(task.dueDate).toLocaleDateString("es-ES")}
              </span>
            )}
            {task.assignee && (
              <span className="rounded-full bg-border/60 px-2 py-1">
                {task.assignee}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={task.status}
            onChange={handleStatusChange}
            disabled={isSaving}
            className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isSaving}
            className="rounded-full border border-border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary disabled:opacity-60"
          >
            Eliminar
          </button>
        </div>
      </div>
      {localError && <p className="mt-2 text-xs text-primary">{localError}</p>}
    </div>
  );
}
