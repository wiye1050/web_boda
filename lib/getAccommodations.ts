import { type Accommodation, type AccommodationType } from "@/components/admin/useAccommodations";

// Using the same structure as getPublicConfig
type ConfigResponse = {
  documents?: {
    name: string;
    fields: Record<string, FirestoreValue>;
    createTime: string;
    updateTime: string;
  }[];
};

type FirestoreValue = {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  nullValue?: null;
  timestampValue?: string;
};

function parseFirestoreValue(value: FirestoreValue | undefined): unknown {
  if (!value) return undefined;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.timestampValue !== undefined) return new Date(value.timestampValue);
  if (value.nullValue === null) return null;
  return undefined;
}

import { cache } from "react";

export const getAccommodations = cache(async (): Promise<Accommodation[]> => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  
  if (!projectId || !apiKey) {
    return [];
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/accommodations?key=${apiKey}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Failed to fetch accommodations:", response.status, response.statusText);
      return [];
    }

    const json = (await response.json()) as ConfigResponse;
    const docs = json.documents || [];

    const accommodations: Accommodation[] = docs.map((doc) => {
      const id = doc.name.split("/").pop() || "";
      const fields = doc.fields || {};
      
      return {
        id,
        name: String(parseFirestoreValue(fields.name) || "Alojamiento"),
        type: (parseFirestoreValue(fields.type) as AccommodationType) || "Hotel",
        hasBlock: Boolean(parseFirestoreValue(fields.hasBlock)),
        capacity: fields.capacity ? String(parseFirestoreValue(fields.capacity)) : undefined,
        distance: fields.distance ? String(parseFirestoreValue(fields.distance)) : undefined,
        priceRange: fields.priceRange ? String(parseFirestoreValue(fields.priceRange)) : undefined,
        link: fields.link ? String(parseFirestoreValue(fields.link)) : undefined,
        imageUrl: fields.imageUrl ? String(parseFirestoreValue(fields.imageUrl)) : undefined,
        notes: fields.notes ? String(parseFirestoreValue(fields.notes)) : undefined,
        createdAt: fields.createdAt ? (parseFirestoreValue(fields.createdAt) as Date) : null,
        updatedAt: fields.updatedAt ? (parseFirestoreValue(fields.updatedAt) as Date) : null,
      };
    });

    return accommodations;

  } catch (error) {
    console.error("Error fetching accommodations:", error);
    return [];
  }
});
