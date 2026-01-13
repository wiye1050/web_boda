import {
  DEFAULT_PUBLIC_CONTENT,
  normalizePublicContent,
  type PublicContent,
} from "@/lib/publicContent";

type ConfigResponse = {
  fields?: Record<
    string,
    {
      stringValue?: string;
    }
  >;
};

function parseConfig(data: ConfigResponse | null | undefined): PublicContent {
  if (!data?.fields) {
    return DEFAULT_PUBLIC_CONTENT;
  }

  const rawEntries = Object.entries(data.fields).map(([key, value]) => [
    key,
    value?.stringValue,
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
