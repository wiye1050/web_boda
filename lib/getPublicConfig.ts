import {
  DEFAULT_PUBLIC_CONTENT,
  normalizePublicContent,
  type PublicContent,
} from "@/lib/publicContent";

type ConfigResponse = {
  fields?: Record<string, FirestoreValue>;
};

type FirestoreValue = {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  nullValue?: null;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
};

function parseFirestoreValue(value: FirestoreValue | undefined): unknown {
  if (!value) return undefined;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.nullValue === null) return null;
  if (value.arrayValue) {
    const values = value.arrayValue.values ?? [];
    return values.map((item) => parseFirestoreValue(item));
  }
  if (value.mapValue) {
    const fields = value.mapValue.fields ?? {};
    const entries = Object.entries(fields).map(([key, val]) => [
      key,
      parseFirestoreValue(val),
    ]);
    return Object.fromEntries(entries);
  }
  return undefined;
}

function parseConfig(data: ConfigResponse | null | undefined): PublicContent {
  if (!data?.fields) {
    return DEFAULT_PUBLIC_CONTENT;
  }

  const rawEntries = Object.entries(data.fields).map(([key, value]) => [
    key,
    parseFirestoreValue(value),
  ]);
  const rawData = Object.fromEntries(rawEntries) as Record<string, unknown>;
  return normalizePublicContent(rawData);
}

export async function getPublicConfig(): Promise<PublicContent> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey) {
    return DEFAULT_PUBLIC_CONTENT;
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/config/general?key=${apiKey}`;
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return DEFAULT_PUBLIC_CONTENT;
    }

    const json = (await response.json()) as ConfigResponse;
    return parseConfig(json);
  } catch (error) {
    console.error("Error fetching public config", error);
    return DEFAULT_PUBLIC_CONTENT;
  }
}

export type { PublicContent };
