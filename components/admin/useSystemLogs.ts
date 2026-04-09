"use client";

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export type SystemLog = {
  id: string;
  type: "email_error" | "email_failure" | "system_error";
  message: string;
  details?: string;
  timestamp: Timestamp;
  recipient?: string;
  guestName?: string;
  rsvpId?: string;
};

export function useSystemLogs(limitTo = 10) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getFirestoreDb();
    const logsQuery = query(
      collection(db, "system_logs"),
      orderBy("timestamp", "desc"),
      limit(limitTo)
    );

    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        const nextLogs: SystemLog[] = [];
        snapshot.forEach((doc) => {
          nextLogs.push({ id: doc.id, ...doc.data() } as SystemLog);
        });
        setLogs(nextLogs);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching system logs:", error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [limitTo]);

  return { logs, isLoading };
}
