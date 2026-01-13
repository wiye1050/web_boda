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

export type BudgetStatus = "planeado" | "comprometido" | "pagado";

export type BudgetItem = {
  id: string;
  concept: string;
  category?: string;
  estimate?: number;
  actual?: number;
  paid?: number;
  status: BudgetStatus;
  vendorId?: string;
  dueDate?: string;
  notes?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export function useBudget() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestoreDb();
    const budgetRef = collection(db, "budget");
    const budgetQuery = query(budgetRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      budgetQuery,
      (snapshot) => {
        const nextItems: BudgetItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          nextItems.push({
            id: docSnap.id,
            concept: String(data.concept ?? "Concepto"),
            category: data.category ? String(data.category) : undefined,
            estimate: Number.isFinite(data.estimate) ? Number(data.estimate) : undefined,
            actual: Number.isFinite(data.actual) ? Number(data.actual) : undefined,
            paid: Number.isFinite(data.paid) ? Number(data.paid) : undefined,
            status:
              data.status === "comprometido" || data.status === "pagado"
                ? (data.status as BudgetStatus)
                : "planeado",
            vendorId: data.vendorId ? String(data.vendorId) : undefined,
            dueDate: data.dueDate ? String(data.dueDate) : undefined,
            notes: data.notes ? String(data.notes) : undefined,
            createdAt: data.createdAt
              ? new Date((data.createdAt as { toMillis: () => number }).toMillis())
              : null,
            updatedAt: data.updatedAt
              ? new Date((data.updatedAt as { toMillis: () => number }).toMillis())
              : null,
          });
        });
        setItems(nextItems);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError("No se pudo cargar el presupuesto.");
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.estimate += item.estimate ?? 0;
        acc.actual += item.actual ?? 0;
        acc.paid += item.paid ?? 0;
        return acc;
      },
      { estimate: 0, actual: 0, paid: 0 },
    );
  }, [items]);

  async function addBudgetItem(input: Omit<BudgetItem, "id" | "createdAt" | "updatedAt">) {
    const db = getFirestoreDb();
    const budgetRef = collection(db, "budget");
    const payload: Record<string, unknown> = {
      concept: input.concept,
      status: input.status,
      createdAt: serverTimestamp(),
    };

    if (input.category) payload.category = input.category;
    if (input.estimate != null) payload.estimate = input.estimate;
    if (input.actual != null) payload.actual = input.actual;
    if (input.paid != null) payload.paid = input.paid;
    if (input.vendorId) payload.vendorId = input.vendorId;
    if (input.dueDate) payload.dueDate = input.dueDate;
    if (input.notes) payload.notes = input.notes;

    await addDoc(budgetRef, payload);
  }

  async function updateBudgetItem(itemId: string, data: Partial<BudgetItem>) {
    const db = getFirestoreDb();
    const itemRef = doc(db, "budget", itemId);
    const payload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    Object.entries(data).forEach(([key, value]) => {
      payload[key] = value === undefined ? null : value;
    });

    await updateDoc(itemRef, payload);
  }

  async function removeBudgetItem(itemId: string) {
    const db = getFirestoreDb();
    await deleteDoc(doc(db, "budget", itemId));
  }

  return {
    items,
    totals,
    isLoading,
    error,
    addBudgetItem,
    updateBudgetItem,
    removeBudgetItem,
  };
}
