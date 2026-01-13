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

export type VendorStatus = "pendiente" | "contratado" | "pagado";
export type VendorCategory =
  | "catering"
  | "fotografia"
  | "video"
  | "musica"
  | "decoracion"
  | "floristeria"
  | "iluminacion"
  | "transporte"
  | "papeleria"
  | "officiant"
  | "otros";

export type Vendor = {
  id: string;
  name: string;
  category: VendorCategory;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  status: VendorStatus;
  costEstimate?: number;
  paidAmount?: number;
  notes?: string;
  paymentDueDate?: string;
  contractUrl?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestoreDb();
    const vendorsRef = collection(db, "vendors");
    const vendorsQuery = query(vendorsRef, orderBy("category", "asc"));

    const unsubscribe = onSnapshot(
      vendorsQuery,
      (snapshot) => {
        const nextVendors: Vendor[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          nextVendors.push({
            id: docSnap.id,
            name: String(data.name ?? "Proveedor"),
            category: (data.category as VendorCategory) ?? "otros",
            contactName: data.contactName ? String(data.contactName) : undefined,
            contactPhone: data.contactPhone ? String(data.contactPhone) : undefined,
            contactEmail: data.contactEmail ? String(data.contactEmail) : undefined,
            website: data.website ? String(data.website) : undefined,
            status:
              data.status === "contratado" || data.status === "pagado"
                ? (data.status as VendorStatus)
                : "pendiente",
            costEstimate: Number.isFinite(data.costEstimate)
              ? Number(data.costEstimate)
              : undefined,
            paidAmount: Number.isFinite(data.paidAmount)
              ? Number(data.paidAmount)
              : undefined,
            notes: data.notes ? String(data.notes) : undefined,
            paymentDueDate: data.paymentDueDate ? String(data.paymentDueDate) : undefined,
            contractUrl: data.contractUrl ? String(data.contractUrl) : undefined,
            createdAt: data.createdAt
              ? new Date((data.createdAt as { toMillis: () => number }).toMillis())
              : null,
            updatedAt: data.updatedAt
              ? new Date((data.updatedAt as { toMillis: () => number }).toMillis())
              : null,
          });
        });
        setVendors(nextVendors);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError("No se pudieron cargar los proveedores.");
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const totals = useMemo(() => {
    return vendors.reduce(
      (acc, vendor) => {
        acc.count += 1;
        acc.costEstimate += vendor.costEstimate ?? 0;
        acc.paidAmount += vendor.paidAmount ?? 0;
        if (vendor.status === "contratado") acc.hired += 1;
        if (vendor.status === "pagado") acc.paid += 1;
        return acc;
      },
      { count: 0, costEstimate: 0, paidAmount: 0, hired: 0, paid: 0 },
    );
  }, [vendors]);

  async function addVendor(input: Omit<Vendor, "id" | "createdAt" | "updatedAt">) {
    const db = getFirestoreDb();
    const vendorsRef = collection(db, "vendors");

    const payload: Record<string, unknown> = {
      name: input.name,
      category: input.category,
      status: input.status,
      createdAt: serverTimestamp(),
    };

    if (input.contactName) payload.contactName = input.contactName;
    if (input.contactPhone) payload.contactPhone = input.contactPhone;
    if (input.contactEmail) payload.contactEmail = input.contactEmail;
    if (input.website) payload.website = input.website;
    if (input.costEstimate != null) payload.costEstimate = input.costEstimate;
    if (input.paidAmount != null) payload.paidAmount = input.paidAmount;
    if (input.notes) payload.notes = input.notes;
    if (input.paymentDueDate) payload.paymentDueDate = input.paymentDueDate;
    if (input.contractUrl) payload.contractUrl = input.contractUrl;

    await addDoc(vendorsRef, payload);
  }

  async function updateVendor(vendorId: string, data: Partial<Vendor>) {
    const db = getFirestoreDb();
    const vendorRef = doc(db, "vendors", vendorId);
    const payload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    Object.entries(data).forEach(([key, value]) => {
      payload[key] = value === undefined ? null : value;
    });

    await updateDoc(vendorRef, payload);
  }

  async function removeVendor(vendorId: string) {
    const db = getFirestoreDb();
    await deleteDoc(doc(db, "vendors", vendorId));
  }

  return {
    vendors,
    totals,
    isLoading,
    error,
    addVendor,
    updateVendor,
    removeVendor,
  };
}
