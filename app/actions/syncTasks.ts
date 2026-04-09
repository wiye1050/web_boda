"use server";

import { syncTaskToGoogle } from "@/lib/googleApi";
import { adminDb } from "@/lib/firebase-admin";

export async function syncPendingTasksAction() {
  try {
    const tasksRef = adminDb.collection("tasks");
    const snapshot = await tasksRef.where("status", "==", "pendiente").get();

    if (snapshot.empty) {
      return { success: true, message: "No hay tareas pendientes para sincronizar." };
    }

    let syncedCount = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      await syncTaskToGoogle({
        title: data.title,
        notes: data.notes || data.description,
        due: data.dueDate,
      });
      syncedCount++;
    }

    return { success: true, message: `Se han sincronizado ${syncedCount} tareas con Google Tasks.` };
  } catch (error: any) {
    console.error("Error in syncPendingTasksAction:", error);
    return { success: false, error: error.message };
  }
}
