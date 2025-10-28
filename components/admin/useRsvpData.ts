"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export type RsvpStatus = "pendiente" | "contactado" | "confirmado";

export type RsvpRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  attendance: "si" | "no";
  guests: number;
  guestNames?: string;
  preboda?: "si" | "no";
  needsTransport?: "si" | "no";
  transportSeats?: number;
  requests?: string;
  submittedAt?: Timestamp | null;
  processed?: boolean;
  updatedAt?: Timestamp | null;
  updatedBy?: string | null;
  notes?: string;
  status: RsvpStatus;
  tags: string[];
  transportRouteId?: string | null;
  transportAssignedSeats?: number;
};

export type RsvpMetrics = {
  total: number;
  attending: number;
  notAttending: number;
  preboda: number;
  transportRequests: number;
  transportSeats: number;
  statusCounts: Record<RsvpStatus, number>;
  tagCounts: Record<string, number>;
};

export function useRsvpData(limitTo = 200) {
  const [records, setRecords] = useState<RsvpRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getFirestoreDb();
    const rsvpQuery = query(
      collection(db, "rsvps"),
      orderBy("submittedAt", "desc"),
      limit(limitTo),
    );

    const unsubscribe = onSnapshot(
      rsvpQuery,
      (snapshot) => {
        const nextRecords: RsvpRecord[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Record<string, unknown>;

          const statusValue =
            typeof data.status === "string" ? data.status.toLowerCase() : "";
          const status: RsvpStatus =
            statusValue === "contactado"
              ? "contactado"
              : statusValue === "confirmado"
                ? "confirmado"
                : "pendiente";

          const rawTags = Array.isArray(data.tags) ? (data.tags as unknown[]) : [];
          const tags = rawTags
            .filter((tag) => typeof tag === "string")
            .map((tag) => (tag as string).trim())
            .filter((tag) => tag.length > 0);

          nextRecords.push({
            id: doc.id,
            fullName: String(data.fullName ?? ""),
            email: String(data.email ?? ""),
            phone: String(data.phone ?? ""),
            attendance: (data.attendance === "si" ? "si" : "no") as
              | "si"
              | "no",
            guests: Number.isFinite(data.guests)
              ? Number(data.guests)
              : data.attendance === "si"
                ? 1
                : 0,
            guestNames: data.guestNames
              ? String(data.guestNames)
              : undefined,
            preboda:
              data.preboda === "si"
                ? "si"
                : data.preboda === "no"
                  ? "no"
                  : undefined,
            needsTransport:
              data.needsTransport === "si"
                ? "si"
                : data.needsTransport === "no"
                  ? "no"
                  : undefined,
            transportSeats: Number.isFinite(data.transportSeats)
              ? Number(data.transportSeats)
              : undefined,
            requests: data.requests ? String(data.requests) : undefined,
            submittedAt:
              (data.submittedAt as Timestamp | null | undefined) ?? null,
            processed:
              typeof data.processed === "boolean" ? data.processed : false,
            updatedAt:
              (data.updatedAt as Timestamp | null | undefined) ?? null,
            updatedBy:
              typeof data.updatedBy === "string" ? data.updatedBy : null,
            notes: data.notes ? String(data.notes) : undefined,
            status,
            tags,
            transportRouteId:
              typeof data.transportRouteId === "string"
                ? String(data.transportRouteId)
                : null,
            transportAssignedSeats: Number.isFinite(data.transportAssignedSeats)
              ? Number(data.transportAssignedSeats)
              : undefined,
          });
        });

        setRecords(nextRecords);
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Error leyendo RSVPs", snapshotError);
        setError(snapshotError);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [limitTo]);

  const metrics = useMemo<RsvpMetrics>(() => {
    return records.reduce<RsvpMetrics>(
      (acc, record) => {
        acc.total += 1;
        if (record.attendance === "si") {
          acc.attending += 1;
          acc.transportRequests += record.needsTransport === "si" ? 1 : 0;
          acc.preboda += record.preboda === "si" ? 1 : 0;
        } else {
          acc.notAttending += 1;
        }
        acc.statusCounts[record.status] += 1;
        record.tags.forEach((tag) => {
          acc.tagCounts[tag] = (acc.tagCounts[tag] ?? 0) + 1;
        });
        const seatContribution = record.transportAssignedSeats != null
          ? record.transportAssignedSeats
          : record.needsTransport === "si"
            ? record.transportSeats ?? 0
            : 0;
        acc.transportSeats += seatContribution;
        return acc;
      },
      {
        total: 0,
        attending: 0,
        notAttending: 0,
        preboda: 0,
        transportRequests: 0,
        transportSeats: 0,
        statusCounts: {
          pendiente: 0,
          contactado: 0,
          confirmado: 0,
        },
        tagCounts: {} as Record<string, number>,
      },
    );
  }, [records]);

  return { records, isLoading, error, metrics };
}
