"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export type TaskStatus = "pendiente" | "en-progreso" | "completada";

export type WeddingTask = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  monthLabel?: string;
  status: TaskStatus;
  assignee?: string;
  notes?: string;
  category?: string;
  priority?: "alta" | "media" | "baja";
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export function useWeddingTasks() {
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestoreDb();
    const tasksRef = collection(db, "tasks");
    const tasksQuery = query(tasksRef, orderBy("dueDate", "asc"));

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const nextTasks: WeddingTask[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          nextTasks.push({
            id: docSnap.id,
            title: String(data.title ?? "Tarea"),
            description: data.description ? String(data.description) : undefined,
            dueDate: data.dueDate ? String(data.dueDate) : undefined,
            monthLabel: data.monthLabel ? String(data.monthLabel) : undefined,
            status:
              data.status === "en-progreso" || data.status === "completada"
                ? (data.status as TaskStatus)
                : "pendiente",
            assignee: data.assignee ? String(data.assignee) : undefined,
            notes: data.notes ? String(data.notes) : undefined,
            category: data.category ? String(data.category) : undefined,
            priority:
              data.priority === "alta" || data.priority === "baja"
                ? (data.priority as "alta" | "media" | "baja")
                : "media",
            createdAt: data.createdAt
              ? new Date((data.createdAt as { toMillis: () => number }).toMillis())
              : null,
            updatedAt: data.updatedAt
              ? new Date((data.updatedAt as { toMillis: () => number }).toMillis())
              : null,
          });
        });
        setTasks(nextTasks);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError("No se pudieron cargar las tareas.");
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  async function addTask(input: Omit<WeddingTask, "id" | "createdAt" | "updatedAt">) {
    const db = getFirestoreDb();
    const tasksRef = collection(db, "tasks");

    try {
      const payload: Record<string, unknown> = {
        title: input.title,
        status: input.status,
        priority: input.priority ?? "media",
        createdAt: serverTimestamp(),
      };

      if (input.description) payload.description = input.description;
      if (input.dueDate) payload.dueDate = input.dueDate;
      if (input.monthLabel) payload.monthLabel = input.monthLabel;
      if (input.assignee) payload.assignee = input.assignee;
      if (input.notes) payload.notes = input.notes;
      if (input.category) payload.category = input.category;

      await addDoc(tasksRef, payload);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function updateTask(taskId: string, data: Partial<WeddingTask>) {
    const db = getFirestoreDb();
    const taskRef = doc(db, "tasks", taskId);

    try {
      await updateDoc(taskRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function removeTask(taskId: string) {
    const db = getFirestoreDb();
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const groupedByMonth = useMemo(() => {
    const map = new Map<string, WeddingTask[]>();
    tasks.forEach((task) => {
      const key = task.monthLabel ?? "Otros";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(task);
    });
    return Array.from(map.entries()).map(([month, list]) => ({
      month,
      tasks: list,
    }));
  }, [tasks]);

  return {
    tasks,
    groupedByMonth,
    isLoading,
    error,
    addTask,
    updateTask,
    removeTask,
  };
}
