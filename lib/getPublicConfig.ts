type ConfigResponse = {
  fields?: Record<
    string,
    {
      stringValue?: string;
    }
  >;
};

type PublicConfig = {
  eventDate: string;
  eventTimeRange: string;
  locationName: string;
  locationAddress: string;
  locationMapUrl: string;
  prebodaPlace: string;
  prebodaTime: string;
  contactEmail: string;
  contactPhone: string;
  whatsappLink: string;
  giftLink: string;
  bankHolder: string;
  bankIban: string;
};

const FALLBACK_CONFIG: PublicConfig = {
  eventDate: "12 de septiembre · 2025",
  eventTimeRange: "13:30 — 02:00",
  locationName: "Finca El Casar · Ponferrada",
  locationAddress: "Ponferrada, León",
  locationMapUrl: "",
  prebodaPlace: "Casino Rooftop Ponferrada",
  prebodaTime: "11 de septiembre · 19:30 h",
  contactEmail: "hola@nuestraboda.com",
  contactPhone: "+34 600 000 000",
  whatsappLink: "https://wa.me/34600000000",
  giftLink: "",
  bankHolder: "Alba Fernández & Guillermo García",
  bankIban: "ES00 0000 0000 0000 0000 0000",
};

function parseConfig(data: ConfigResponse | null | undefined): PublicConfig {
  if (!data?.fields) {
    return FALLBACK_CONFIG;
  }

  const read = (key: keyof PublicConfig) =>
    data.fields?.[key]?.stringValue ?? FALLBACK_CONFIG[key];

  return {
    eventDate: read("eventDate"),
    eventTimeRange: read("eventTimeRange"),
    locationName: read("locationName"),
    locationAddress: read("locationAddress"),
    locationMapUrl: read("locationMapUrl"),
    prebodaPlace: read("prebodaPlace"),
    prebodaTime: read("prebodaTime"),
    contactEmail: read("contactEmail"),
    contactPhone: read("contactPhone"),
    whatsappLink: read("whatsappLink"),
    giftLink: read("giftLink"),
    bankHolder: read("bankHolder"),
    bankIban: read("bankIban"),
  };
}

export async function getPublicConfig(): Promise<PublicConfig> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey) {
    return FALLBACK_CONFIG;
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/config/general?key=${apiKey}`;
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return FALLBACK_CONFIG;
    }

    const json = (await response.json()) as ConfigResponse;
    return parseConfig(json);
  } catch (error) {
    console.error("Error fetching public config", error);
    return FALLBACK_CONFIG;
  }
}

export type { PublicConfig };
