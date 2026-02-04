"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { toast } from "sonner";

export type TableConfig = {
  id: string;
  name: string;
  type: "presidential" | "round";
  capacity: number;
  x: number;
  y: number;
};

export type RoomObject = {
  id: string;
  type: "zone" | "element"; 
  category: "dining" | "cocktail" | "ceremony" | "dj" | "entrance" | "pillar" | "tree";
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  color?: string; // For zones
};

// --- Cabañas Raras Layout Defaults (Gallery Only) ---
const INITIAL_TABLES: TableConfig[] = [
  // Presidential centered at the top of the gallery
  { id: "table-0", name: "Presidencial", type: "presidential", capacity: 10, x: 300, y: 50 },
  
  // Guest tables arranged in 2 columns inside the gallery
  ...Array.from({ length: 14 }).map((_, i) => {
    const col = i % 2; 
    const row = Math.floor(i / 2);
    return {
      id: `table-${i + 1}`,
      name: `Mesa ${i + 1}`,
      type: "round" as const,
      capacity: 10,
      x: 180 + col * 280, // Slightly wider column spacing for better breathing room
      y: 250 + row * 200, // Reduced vertical spacing (was 220) to fit better
    };
  }),
];

const INITIAL_OBJECTS: RoomObject[] = [
  // ZONA ÚNICA: Galería Acristalada (Comida)
  {
    id: "zone-gallery",
    type: "zone",
    category: "dining",
    label: "Galería Acristalada",
    x: 50, // Moved to top-left
    y: 20,
    width: 650,
    height: 1800, // Increased height significantly (was 1200) to ensure everything fits
    color: "bg-stone-50/80 border-stone-200", // New "Stone" texture color base
  },
  // Removed external zones (Patio, Garden) and objects (DJ, Entrance) as requested
];

export function useSeatingData() {
  const [tables, setTables] = useState<TableConfig[]>(INITIAL_TABLES);
  const [objects, setObjects] = useState<RoomObject[]>(INITIAL_OBJECTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getFirestoreDb();
    const docRef = doc(db, "private_config", "seating");

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.tables) setTables(data.tables as TableConfig[]);
        if (data.objects) setObjects(data.objects as RoomObject[]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateTableName = async (tableId: string, newName: string) => {
    const newTables = tables.map((t) =>
      t.id === tableId ? { ...t, name: newName } : t
    );
    setTables(newTables);
    saveData(newTables, objects);
  };

  const updateTablePosition = async (tableId: string, x: number, y: number) => {
    const newTables = tables.map((t) =>
      t.id === tableId ? { ...t, x, y } : t
    );
    setTables(newTables);
    await saveData(newTables, objects);
  };
  
  const updateObjectPosition = async (objectId: string, x: number, y: number) => {
      const newObjects = objects.map(o => 
          o.id === objectId ? { ...o, x, y } : o
      );
      setObjects(newObjects);
      await saveData(tables, newObjects);
  };

  const saveData = async (newTables: TableConfig[], newObjects: RoomObject[]) => {
    try {
      const db = getFirestoreDb();
      await setDoc(
        doc(db, "private_config", "seating"),
        { tables: newTables, objects: newObjects },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving seating config", error);
      toast.error("Error al guardar cambios");
    }
  };

  return { tables, objects, isLoading, updateTableName, updateTablePosition, updateObjectPosition };
}
