"use client";

import { useEffect, useState } from "react";
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

export type AccommodationType = "Hotel" | "Casa Rural" | "Apartamento" | "Otro";

export type Accommodation = {
  id: string;
  name: string;
  type: AccommodationType;
  capacity?: string;
  distance?: string;
  priceRange?: string; // e.g., "€", "€€", "€€€"
  link?: string;
  imageUrl?: string;
  hasBlock: boolean;
  notes?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  order?: number; // Optional for manual sorting
};

export function useAccommodations() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestoreDb();
    const accommodationsRef = collection(db, "accommodations");
    // Sort by type by default, or you could add an 'order' field if manual sorting is needed
    const accommodationsQuery = query(accommodationsRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      accommodationsQuery,
      (snapshot) => {
        const nextAccommodations: Accommodation[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          nextAccommodations.push({
            id: docSnap.id,
            name: String(data.name || "Alojamiento"),
            type: (data.type as AccommodationType) || "Hotel",
            capacity: data.capacity ? String(data.capacity) : undefined,
            distance: data.distance ? String(data.distance) : undefined,
            priceRange: data.priceRange ? String(data.priceRange) : undefined,
            link: data.link ? String(data.link) : undefined,
            imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
            hasBlock: Boolean(data.hasBlock),
            notes: data.notes ? String(data.notes) : undefined,
            createdAt: data.createdAt
              ? new Date((data.createdAt as { toMillis: () => number }).toMillis())
              : null,
            updatedAt: data.updatedAt
              ? new Date((data.updatedAt as { toMillis: () => number }).toMillis())
              : null,
          });
        });
        setAccommodations(nextAccommodations);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching accommodations:", err);
        setError("No se pudieron cargar los alojamientos.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  async function addAccommodation(input: Omit<Accommodation, "id" | "createdAt" | "updatedAt">) {
    const db = getFirestoreDb();
    const accommodationsRef = collection(db, "accommodations");

    const payload: Record<string, unknown> = {
      name: input.name,
      type: input.type,
      hasBlock: input.hasBlock,
      createdAt: serverTimestamp(),
    };

    if (input.capacity) payload.capacity = input.capacity;
    if (input.distance) payload.distance = input.distance;
    if (input.priceRange) payload.priceRange = input.priceRange;
    if (input.link) payload.link = input.link;
    if (input.imageUrl) payload.imageUrl = input.imageUrl;
    if (input.notes) payload.notes = input.notes;

    await addDoc(accommodationsRef, payload);
  }

  async function updateAccommodation(id: string, data: Partial<Accommodation>) {
    const db = getFirestoreDb();
    const docRef = doc(db, "accommodations", id);
    
    const payload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    Object.entries(data).forEach(([key, value]) => {
      payload[key] = value === undefined ? null : value;
    });

    await updateDoc(docRef, payload);
  }

  async function removeAccommodation(id: string) {
    const db = getFirestoreDb();
    await deleteDoc(doc(db, "accommodations", id));
  }

  return {
    accommodations,
    isLoading,
    error,
    addAccommodation,
    updateAccommodation,
    removeAccommodation,
  };
}
