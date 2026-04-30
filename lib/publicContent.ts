import type { AccommodationType } from "@/components/admin/useAccommodations";

export type StayOption = {
  id: string;
  name: string;
  type: AccommodationType;
  description: string;
  distance: string;
  link: string;
  imageUrl?: string;
  hasBlock: boolean;
  priceRange?: string;
  capacity?: string;
};

export type PracticalItem = {
  icon: string;
  title: string;
  description: string;
};

export type RsvpFormCopy = {
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailError: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneError: string;
  attendanceLegend: string;
  attendanceYesLabel: string;
  attendanceNoLabel: string;
  guestsLabel: string;
  guestsPlaceholderYes: string;
  guestsPlaceholderNo: string;
  guestsHelper: string;
  guestsError: string;
  guestNamesLabel: string;
  guestNamesPlaceholder: string;
  prebodaLegend: string;
  prebodaYesLabel: string;
  prebodaNoLabel: string;
  prebodaNote: string;
  transportLegend: string;
  transportYesLabel: string;
  transportNoLabel: string;
  transportNote: string;
  transportSeatsLabel: string;
  transportSeatsPlaceholder: string;
  transportSeatsError: string;
  requestsLabel: string;
  requestsPlaceholder: string;
  submitLabel: string;
  submitLoadingLabel: string;
  successMessage: string;
};

export type MobileBarCopy = {
  confirmLabel: string;
  mapsLabel: string;
};

export type MapsModalCopy = {
  title: string;
  subtitle: string;
  weddingLabel: string;
  weddingNote: string;
  prebodaLabel: string;
  prebodaNote: string;
  prebodaWarning: string;
  closeLabel: string;
};

export type SectionConfig = {
  id: string;
  label: string;
  enabled: boolean;
  nav: boolean;
  order: number;
};

export type PublicContent = {
  noticeEnabled: boolean;
  noticeText: string;
  noticeCountdownEnabled: boolean;
  noticeCountdownTarget: string;
  brandName: string;
  headerCtaLabel: string;
  navWeddingLabel: string;
  navStayLabel: string;
  navGiftsLabel: string;
  navRsvpLabel: string;
  navDetailsLabel: string;
  navLocationLabel: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryCtaLabel: string;
  heroSecondaryCtaLabel: string;
  heroMapCtaLabel: string;
  heroStatDateLabel: string;
  heroStatLocationLabel: string;
  heroStatTimeLabel: string;
  heroStatTimeNote: string;
  eventDate: string;
  eventTimeRange: string;
  locationName: string;
  locationAddress: string;
  locationMapUrl: string;
  prebodaPlace: string;
  prebodaTime: string;
  prebodaAddress: string;
  prebodaMapUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactEmail2: string;
  contactPhone2: string;
  whatsappLink: string;
  giftLink: string;
  prebodaEyebrow: string;
  prebodaTitle: string;
  prebodaDescription: string;
  prebodaCardOneDescription: string;
  practicalEyebrow: string;
  practicalTitle: string;
  practicalDescription: string;
  practicalItems: PracticalItem[];
  stayEyebrow: string;
  stayTitle: string;
  stayDescription: string;
  stayLinkLabel: string;
  stayOptions: StayOption[];
  giftsEyebrow: string;
  giftsTitle: string;
  giftsDescription: string;
  giftsBankTitle: string;
  giftsBankDescription: string;
  rsvpEyebrow: string;
  rsvpTitle: string;
  rsvpDescription: string;
  rsvpContactLead: string;
  rsvpContactWhatsappLead: string;
  rsvpImportantTitle: string;
  rsvpImportantNotes: string[];
  rsvpForm: RsvpFormCopy;
  locationEyebrow: string;
  locationTitle: string;
  locationDescription: string;
  locationMapEmbedUrl: string;
  locationMapLabel: string;
  weddingMapsUrl: string;
  prebodaMapsUrl: string;
  weddingVenueName: string;
  prebodaVenueName: string;
  locationContactTitle: string;
  locationEmailLabel: string;
  locationPhoneLabel: string;
  locationWhatsappLabel: string;
  locationWhatsappActionLabel: string;
  footerEyebrow: string;
  footerTitle: string;
  footerCtaLabel: string;
  footerCopyright: string;
  footerMadeWith: string;
  heroBackgroundImages: string[];
  heroBackgroundIntervalMs: string;
  mobileBar: MobileBarCopy;
  faqEyebrow: string;
  faqTitle: string;
  faqDescription: string;
  faqItems: string;
  mapsModal: MapsModalCopy;
  sections: SectionConfig[];
  aiPersonalityInstruction: string;
};

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "preboda", label: "Preboda", enabled: true, nav: true, order: 1 },
  { id: "ubicacion", label: "La boda", enabled: true, nav: true, order: 2 },
  { id: "detalles", label: "Guía práctica", enabled: true, nav: true, order: 3 },
  { id: "alojamiento", label: "Alojamiento", enabled: true, nav: true, order: 4 },
  { id: "regalos", label: "Regalos", enabled: true, nav: true, order: 5 },
  { id: "asistencia", label: "Confirmar asistencia", enabled: true, nav: true, order: 6 },
];

export const DEFAULT_PUBLIC_CONTENT: PublicContent = {
  noticeEnabled: true,
  noticeText: "¡Nos casamos!",
  noticeCountdownEnabled: true,
  noticeCountdownTarget: "2026-09-12T13:30:00",
  brandName: "Alba & Guille",
  headerCtaLabel: "Confirmar asistencia",
  navWeddingLabel: "La boda",
  navStayLabel: "Alojamiento",
  navGiftsLabel: "Regalos",
  navRsvpLabel: "Confirmar asistencia",
  navDetailsLabel: "Detalles",
  navLocationLabel: "Ubicación",
  heroEyebrow: "",
  heroTitle: "Alba & Guille",
  heroDescription:
    "Porque no hay mejor excusa para juntaros a todos",
  heroPrimaryCtaLabel: "Confirmar asistencia",
  heroSecondaryCtaLabel: "Ver horarios",
  heroMapCtaLabel: "Ver ubicación",
  heroStatDateLabel: "Fecha",
  heroStatLocationLabel: "Lugar",
  heroStatTimeLabel: "Horario",
  heroStatTimeNote: "niños bienvenidos",
  eventDate: "12 de septiembre · 2026",
  eventTimeRange: "14:00 — 02:00",
  locationName: "Finca El Casar · Ponferrada",
  locationAddress: "Cabañas Raras, León",
  locationMapUrl: "",
  prebodaPlace: "Casino Rooftop Ponferrada",
  prebodaTime: "11 de septiembre · 19:30",
  prebodaAddress: "Calle del Reloj, 11, 24401 Ponferrada, León",
  prebodaMapUrl: "",
  contactEmail: "guillemenendez1050@gmail.com",
  contactEmail2: "varelamaciasalba@gmail.com",
  contactPhone: "+34 696 408 689",
  contactPhone2: "+34 695 438 798",
  whatsappLink: "https://wa.me/34696408689",
  giftLink: "",
  prebodaEyebrow: "Preboda",
  prebodaTitle: "La Víspera",
  prebodaDescription:
    "La excusa perfecta para vernos dos veces",
  prebodaCardOneDescription:
    "Un brindis para calentar motores.",

  practicalEyebrow: "",
  practicalTitle: "Detalles",
  practicalDescription:
    "Lo esencial para venir tranquilo/a y disfrutar el día.",
  practicalItems: [
    {
      icon: "🚗",
      title: "Accesos y parking",
      description:
        "La finca está a 10 minutos del centro. Hay parking dentro del recinto.",
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Pequeños invitados",
      description:
        "Aunque la celebración está pensada para adultos, vuestros hijos son bienvenidos a compartir este día con nosotros.",
    },
    {
      icon: "🕒",
      title: "Llegada con tiempo",
      description:
        "Llega 20 minutos antes para aparcar y acomodarte.",
    },
    {
      icon: "🚌",
      title: "Transporte disponible",
      description:
        "Si necesitas bus, indícalo en el formulario.",
    },
    {
      icon: "🍽️",
      title: "Alergias y menús",
      description:
        "Cuéntanos alergias o intolerancias en el formulario.",
    },
  ],
  stayEyebrow: "Alojamiento",
  stayTitle: "Opciones cerca de la finca",
  stayDescription:
    "Te dejamos algunas opciones cercanas para dormir cómodamente.",
  stayLinkLabel: "Ver mapa",
  stayOptions: [],
  giftsEyebrow: "Regalos",
  giftsTitle: "Tu presencia es el mejor regalo",
  giftsDescription:
    "Si quieres tener un detalle, aquí tienes algunas opciones.",
  giftsBankTitle: "Regalo privado",
  giftsBankDescription:
    "Si prefieres un detalle directo, escríbenos y te contamos.",
  rsvpEyebrow: "Confirmar asistencia",
  rsvpTitle: "Confirma tu asistencia",
  rsvpDescription:
    "Completa el formulario para confirmar si vienes.",
  rsvpContactLead: "Si prefieres, escríbenos a",
  rsvpContactWhatsappLead: "o por WhatsApp al",
  rsvpImportantTitle: "Importante",
  rsvpImportantNotes: [
    "Los niños son bienvenidos. La finca cuenta con espacios abiertos para que disfruten con seguridad (siempre bajo supervisión).",
    "Si tienes alergias o intolerancias, cuéntanoslo para coordinarlo con el equipo de cocina.",
    "Confirmaciones abiertas hasta el 15 de agosto. Después intentaremos acomodar cambios pero no podemos garantizarlo.",
  ],
  rsvpForm: {
    fullNameLabel: "Nombre completo",
    fullNamePlaceholder: "¿Quién confirma?",
    emailLabel: "Email",
    emailPlaceholder: "Opcional",
    emailError: "Revisa el email (ej. nombre@email.com).",
    phoneLabel: "Teléfono de contacto",
    phonePlaceholder: "+34 600 000 000",
    phoneError: "Revisa el número (8-15 dígitos).",
    attendanceLegend: "¿Vas a venir?",
    attendanceYesLabel: "Sí, ahí estaré",
    attendanceNoLabel: "No podré ir",
    guestsLabel: "¿Cuántas personas vendréis?",
    guestsPlaceholderYes: "Contando adultos y niños",
    guestsPlaceholderNo: "Selecciona tu asistencia primero",
    guestsHelper: "Máximo 6 personas por invitación. Si sois más, cuéntanoslo.",
    guestsError: "Indica un número válido de asistentes.",
    guestNamesLabel: "Nombres de acompañantes (opcional)",
    guestNamesPlaceholder: "Ej: Marta (pareja), Juan (colega)",
    prebodaLegend: "¿Nos acompañas a la preboda (11 de septiembre)?",
    prebodaYesLabel: "¡Claro!",
    prebodaNoLabel: "No podré ir",
    prebodaNote: "Viernes 11/09 · 19:30 · Casino Rooftop Ponferrada.",
    transportLegend: "¿Necesitas traslado?",
    transportYesLabel: "Sí, quiero bus",
    transportNoLabel: "No, iremos por nuestra cuenta",
    transportNote:
      "Organizaremos bus desde Ponferrada si hay suficientes plazas.",
    transportSeatsLabel: "¿Cuántas plazas de bus necesitáis?",
    transportSeatsPlaceholder: "Ej: 2",
    transportSeatsError: "Indica un número de plazas válido (≤ asistentes).",
    requestsLabel: "Comentarios o necesidades especiales",
    requestsPlaceholder:
      "Intolerancias, alergias, algo a tener en cuenta...",
    submitLabel: "Enviar respuesta",
    submitLoadingLabel: "Guardando...",
    successMessage:
      "¡Gracias! Recibimos tu confirmación. Te escribiremos pronto con más detalles.",
  },

  locationEyebrow: "Cómo llegar",
  locationTitle: "Ubicación y contacto",
  locationDescription:
    "Si necesitas ayuda con rutas o transporte, escríbenos.",
  locationMapEmbedUrl: "",
  locationMapLabel: "Abrir en Maps",
  weddingMapsUrl: "",
  prebodaMapsUrl: "",
  weddingVenueName: "Finca El Casar",
  prebodaVenueName: "Casino Rooftop",
  locationContactTitle: "Contacta con nosotros",
  locationEmailLabel: "Email",
  locationPhoneLabel: "Teléfono",
  locationWhatsappLabel: "WhatsApp",
  locationWhatsappActionLabel: "Abrir chat",
  footerEyebrow: "Nos vemos en el gran día",
  footerTitle: "Gracias por acompañarnos",
  footerCtaLabel: "Confirmar asistencia",
  footerCopyright:
    "© {year} {brandName}. Todos los derechos reservados.",
  footerMadeWith: "Hecho con amor.",
  heroBackgroundImages: [
    "/photos/hero/boda1.jpeg",
    "/photos/hero/boda2.jpg",
  ],
  heroBackgroundIntervalMs: "8000",
  mobileBar: {
    confirmLabel: "Confirmar",
    mapsLabel: "Maps",
  },
  mapsModal: {
    title: "Abrir ubicación en Maps",
    subtitle: "Elige el evento. La boda es en la ubicación principal.",
    weddingLabel: "Boda (principal)",
    weddingNote: "Ceremonia y banquete",
    prebodaLabel: "Preboda",
    prebodaNote: "Evento del viernes",
    prebodaWarning: "No es la ubicación de la boda",
    closeLabel: "Cerrar",
  },
  faqEyebrow: "FAQ",
  faqTitle: "Preguntas frecuentes",
  faqDescription: "Resolvemos las dudas más comunes.",
  faqItems: "[]",
  sections: DEFAULT_SECTIONS,
  aiPersonalityInstruction: "Eres el asistente oficial de la boda de Alba y Guille. Tu tono debe ser amable, cercano y servicial. Responde siempre en castellano. Sé conciso y asegúrate de reflejar la emoción de los novios por compartir este día con sus invitados.",
};

function normalizeString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function safeJsonParse(raw: unknown): unknown | null {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function parseStayOptions(raw: unknown): StayOption[] {
  const parsed = Array.isArray(raw) ? raw : safeJsonParse(raw);
  if (!Array.isArray(parsed)) {
    return DEFAULT_PUBLIC_CONTENT.stayOptions;
  }

  const cleaned = parsed
    .map((item) => (item && typeof item === "object" ? item : {}))
    .map((item) => {
      const record = item as Record<string, unknown>;
      return {
        id: normalizeString(record.id, ""),
        name: normalizeString(record.name, ""),
        type: normalizeString(record.type, "Hotel") as AccommodationType,
        description: normalizeString(record.description, ""),
        distance: normalizeString(record.distance, ""),
        link: normalizeString(record.link, ""),
        imageUrl: normalizeString(record.imageUrl, ""),
        hasBlock: Boolean(record.hasBlock),
        priceRange: normalizeString(record.priceRange, ""),
        capacity: normalizeString(record.capacity, ""),
      };
    })
    .filter(
      (item) => item.name || item.description || item.distance || item.link,
    );

  return cleaned.length > 0 ? cleaned : DEFAULT_PUBLIC_CONTENT.stayOptions;
}

export function parseStringArray(
  raw: unknown,
  fallback: string[],
  allowEmpty = false,
): string[] {
  const parsed = Array.isArray(raw) ? raw : safeJsonParse(raw);
  if (!Array.isArray(parsed)) {
    return fallback;
  }

  const cleaned = parsed
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  if (cleaned.length > 0) {
    return cleaned;
  }
  return allowEmpty ? [] : fallback;
}

export function parseStringList(raw: unknown): string[] {
  return parseStringArray(raw, DEFAULT_PUBLIC_CONTENT.rsvpImportantNotes);
}

export function parsePracticalItems(raw: unknown): PracticalItem[] {
  const parsed = Array.isArray(raw) ? raw : safeJsonParse(raw);
  if (!Array.isArray(parsed)) {
    return DEFAULT_PUBLIC_CONTENT.practicalItems;
  }
  if (parsed.length === 0) {
    return [];
  }

  const cleaned = parsed
    .map((item) => (item && typeof item === "object" ? item : {}))
    .map((item) => {
      const record = item as Record<string, unknown>;
      return {
        icon: normalizeString(record.icon, ""),
        title: normalizeString(record.title, ""),
        description: normalizeString(record.description, ""),
      };
    })
    .filter((item) => item.icon || item.title || item.description);

  // Force-include critical items (Accesos and Solo Adultos) if not present
  const defaults = DEFAULT_PUBLIC_CONTENT.practicalItems;
  const criticalTitles = ["Accesos y parking", "Solo adultos", "Llegada con tiempo"];
  
  // Filter out any DB items that duplicate our critical titles to avoid double listing
  const filteredCleaned = cleaned.filter(item => !criticalTitles.includes(item.title));

  // Find the critical items from defaults
  const criticalItems = defaults.filter(item => criticalTitles.includes(item.title));

  // Combine: Critical Defaults First + Remaining DB Items
  // Note: "Solo adultos" and "Niños bienvenidos" are excluded from the UI list as per user request for subtleness
  const combined = [...criticalItems, ...filteredCleaned].filter(
    (item) => !item.title.toLowerCase().includes("niños") && !item.title.toLowerCase().includes("adultos")
  );

  return combined.length > 0 ? combined : defaults.filter(
    (item) => !item.title.toLowerCase().includes("niños") && !item.title.toLowerCase().includes("adultos")
  );
}



export function parseSections(raw: unknown): SectionConfig[] {
  const parsed = Array.isArray(raw) ? raw : safeJsonParse(raw);
  if (!Array.isArray(parsed)) {
    return DEFAULT_PUBLIC_CONTENT.sections;
  }

  const cleaned = parsed
    .map((item) => (item && typeof item === "object" ? item : {}))
    .map((item) => {
      const record = item as Record<string, unknown>;
      return {
        id: normalizeString(record.id, "").trim(),
        label: normalizeString(record.label, "").trim(),
        enabled: Boolean(record.enabled),
        nav: Boolean(record.nav),
        order: Number.isFinite(record.order) ? Number(record.order) : 0,
      };
    })
    .filter((item) => item.id.length > 0);

  return cleaned.length > 0 ? cleaned : DEFAULT_PUBLIC_CONTENT.sections;
}

function normalizeStringMap<T extends Record<string, string>>(
  raw: unknown,
  defaults: T,
): T {
  if (!raw || typeof raw !== "object") {
    return { ...defaults };
  }
  const record = raw as Record<string, unknown>;
  const next: Record<string, string> = {};
  Object.keys(defaults).forEach((key) => {
    next[key] = normalizeString(record[key], defaults[key]);
  });
  return next as T;
}

export function mergeSections(
  defaults: SectionConfig[],
  incoming: SectionConfig[],
): SectionConfig[] {
  const byId = new Map<string, SectionConfig>();
  defaults.forEach((section) => {
    byId.set(section.id, section);
  });
  incoming.forEach((section) => {
    if (!section.id) return;
    const base = byId.get(section.id);
    byId.set(section.id, {
      id: section.id,
      label: section.label || base?.label || section.id,
      enabled:
        typeof section.enabled === "boolean"
          ? section.enabled
          : base?.enabled ?? true,
      nav:
        typeof section.nav === "boolean"
          ? section.nav
          : base?.nav ?? true,
      order: Number.isFinite(section.order)
        ? section.order
        : base?.order ?? 0,
    });
  });

  return Array.from(byId.values())
    .map((section) => ({
      ...section,
      label: section.label || section.id,
      order: Number.isFinite(section.order) ? section.order : 0,
    }))
    .sort((a, b) => a.order - b.order);
}

export function normalizePublicContent(
  data: Record<string, unknown>,
): PublicContent {
  return {
    noticeEnabled:
      typeof data.noticeEnabled === "boolean"
        ? data.noticeEnabled
        : DEFAULT_PUBLIC_CONTENT.noticeEnabled,
    noticeText: normalizeString(
      data.noticeText,
      DEFAULT_PUBLIC_CONTENT.noticeText,
    ),
    noticeCountdownEnabled:
      typeof data.noticeCountdownEnabled === "boolean"
        ? data.noticeCountdownEnabled
        : DEFAULT_PUBLIC_CONTENT.noticeCountdownEnabled,
    noticeCountdownTarget: normalizeString(
      data.noticeCountdownTarget,
      DEFAULT_PUBLIC_CONTENT.noticeCountdownTarget,
    ),
    brandName: normalizeString(data.brandName, DEFAULT_PUBLIC_CONTENT.brandName),
    headerCtaLabel: normalizeString(
      data.headerCtaLabel,
      DEFAULT_PUBLIC_CONTENT.headerCtaLabel,
    ),
    navWeddingLabel: normalizeString(
      data.navWeddingLabel,
      DEFAULT_PUBLIC_CONTENT.navWeddingLabel,
    ),
    navStayLabel: normalizeString(
      data.navStayLabel,
      DEFAULT_PUBLIC_CONTENT.navStayLabel,
    ),
    navGiftsLabel: normalizeString(
      data.navGiftsLabel,
      DEFAULT_PUBLIC_CONTENT.navGiftsLabel,
    ),
    navRsvpLabel: normalizeString(
      data.navRsvpLabel,
      DEFAULT_PUBLIC_CONTENT.navRsvpLabel,
    ),
    navDetailsLabel: normalizeString(
      data.navDetailsLabel,
      DEFAULT_PUBLIC_CONTENT.navDetailsLabel,
    ),
    navLocationLabel: normalizeString(
      data.navLocationLabel,
      DEFAULT_PUBLIC_CONTENT.navLocationLabel,
    ),
    heroEyebrow: normalizeString(
      data.heroEyebrow,
      DEFAULT_PUBLIC_CONTENT.heroEyebrow,
    ),
    heroTitle: normalizeString(
      data.heroTitle,
      DEFAULT_PUBLIC_CONTENT.heroTitle,
    ),
    heroDescription: normalizeString(
      data.heroDescription,
      DEFAULT_PUBLIC_CONTENT.heroDescription,
    ),
    heroPrimaryCtaLabel: normalizeString(
      data.heroPrimaryCtaLabel,
      DEFAULT_PUBLIC_CONTENT.heroPrimaryCtaLabel,
    ),
    heroSecondaryCtaLabel: normalizeString(
      data.heroSecondaryCtaLabel,
      DEFAULT_PUBLIC_CONTENT.heroSecondaryCtaLabel,
    ),
    heroMapCtaLabel: normalizeString(
      data.heroMapCtaLabel,
      DEFAULT_PUBLIC_CONTENT.heroMapCtaLabel,
    ),
    heroStatDateLabel: normalizeString(
      data.heroStatDateLabel,
      DEFAULT_PUBLIC_CONTENT.heroStatDateLabel,
    ),
    heroStatLocationLabel: normalizeString(
      data.heroStatLocationLabel,
      DEFAULT_PUBLIC_CONTENT.heroStatLocationLabel,
    ),
    heroStatTimeLabel: normalizeString(
      data.heroStatTimeLabel,
      DEFAULT_PUBLIC_CONTENT.heroStatTimeLabel,
    ),
    heroStatTimeNote: normalizeString(
      data.heroStatTimeNote,
      DEFAULT_PUBLIC_CONTENT.heroStatTimeNote,
    ),
    eventDate: normalizeString(
      data.eventDate,
      DEFAULT_PUBLIC_CONTENT.eventDate,
    ),
    eventTimeRange: normalizeString(
      data.eventTimeRange,
      DEFAULT_PUBLIC_CONTENT.eventTimeRange,
    ),
    locationName: normalizeString(
      data.locationName,
      DEFAULT_PUBLIC_CONTENT.locationName,
    ),
    locationAddress: normalizeString(
      data.locationAddress,
      DEFAULT_PUBLIC_CONTENT.locationAddress,
    ),
    locationMapUrl: normalizeString(
      data.locationMapUrl,
      DEFAULT_PUBLIC_CONTENT.locationMapUrl,
    ),
    prebodaPlace: normalizeString(
      data.prebodaPlace,
      DEFAULT_PUBLIC_CONTENT.prebodaPlace,
    ),
    prebodaTime: normalizeString(
      data.prebodaTime,
      DEFAULT_PUBLIC_CONTENT.prebodaTime,
    ),
    prebodaAddress: normalizeString(
      data.prebodaAddress,
      DEFAULT_PUBLIC_CONTENT.prebodaAddress,
    ),
    prebodaMapUrl: normalizeString(
      data.prebodaMapUrl,
      DEFAULT_PUBLIC_CONTENT.prebodaMapUrl,
    ),
    whatsappLink: normalizeString(
      data.whatsappLink,
      DEFAULT_PUBLIC_CONTENT.whatsappLink,
    ),
    giftLink: normalizeString(
      data.giftLink,
      DEFAULT_PUBLIC_CONTENT.giftLink,
    ),
    prebodaEyebrow: normalizeString(
      data.prebodaEyebrow,
      DEFAULT_PUBLIC_CONTENT.prebodaEyebrow,
    ),
    prebodaTitle: normalizeString(
      data.prebodaTitle,
      DEFAULT_PUBLIC_CONTENT.prebodaTitle,
    ),
    prebodaDescription: normalizeString(
      data.prebodaDescription,
      DEFAULT_PUBLIC_CONTENT.prebodaDescription,
    ),
    prebodaCardOneDescription: normalizeString(
      data.prebodaCardOneDescription,
      DEFAULT_PUBLIC_CONTENT.prebodaCardOneDescription,
    ),

    practicalEyebrow: normalizeString(
      data.practicalEyebrow,
      DEFAULT_PUBLIC_CONTENT.practicalEyebrow,
    ),
    practicalTitle: normalizeString(
      data.practicalTitle,
      DEFAULT_PUBLIC_CONTENT.practicalTitle,
    ),
    practicalDescription: normalizeString(
      data.practicalDescription,
      DEFAULT_PUBLIC_CONTENT.practicalDescription,
    ),
    practicalItems: parsePracticalItems(data.practicalItems),
    stayEyebrow: normalizeString(
      data.stayEyebrow,
      DEFAULT_PUBLIC_CONTENT.stayEyebrow,
    ),
    stayTitle: normalizeString(
      data.stayTitle,
      DEFAULT_PUBLIC_CONTENT.stayTitle,
    ),
    stayDescription: normalizeString(
      data.stayDescription,
      DEFAULT_PUBLIC_CONTENT.stayDescription,
    ),
    stayLinkLabel: normalizeString(
      data.stayLinkLabel,
      DEFAULT_PUBLIC_CONTENT.stayLinkLabel,
    ),
    stayOptions: parseStayOptions(data.stayOptions),
    giftsEyebrow: normalizeString(
      data.giftsEyebrow,
      DEFAULT_PUBLIC_CONTENT.giftsEyebrow,
    ),
    giftsTitle: normalizeString(
      data.giftsTitle,
      DEFAULT_PUBLIC_CONTENT.giftsTitle,
    ),
    giftsDescription: normalizeString(
      data.giftsDescription,
      DEFAULT_PUBLIC_CONTENT.giftsDescription,
    ),

    giftsBankTitle: normalizeString(
      data.giftsBankTitle,
      DEFAULT_PUBLIC_CONTENT.giftsBankTitle,
    ),
    giftsBankDescription: normalizeString(
      data.giftsBankDescription,
      DEFAULT_PUBLIC_CONTENT.giftsBankDescription,
    ),
    rsvpEyebrow: normalizeString(
      data.rsvpEyebrow,
      DEFAULT_PUBLIC_CONTENT.rsvpEyebrow,
    ),
    rsvpTitle: normalizeString(
      data.rsvpTitle,
      DEFAULT_PUBLIC_CONTENT.rsvpTitle,
    ),
    rsvpDescription: normalizeString(
      data.rsvpDescription,
      DEFAULT_PUBLIC_CONTENT.rsvpDescription,
    ),
    rsvpContactLead: normalizeString(
      data.rsvpContactLead,
      DEFAULT_PUBLIC_CONTENT.rsvpContactLead,
    ),
    rsvpContactWhatsappLead: normalizeString(
      data.rsvpContactWhatsappLead,
      DEFAULT_PUBLIC_CONTENT.rsvpContactWhatsappLead,
    ),
    rsvpImportantTitle: normalizeString(
      data.rsvpImportantTitle,
      DEFAULT_PUBLIC_CONTENT.rsvpImportantTitle,
    ),
    rsvpImportantNotes: parseStringList(data.rsvpImportantNotes),
    rsvpForm: normalizeStringMap(
      data.rsvpForm,
      DEFAULT_PUBLIC_CONTENT.rsvpForm,
    ),

    locationEyebrow: normalizeString(
      data.locationEyebrow,
      DEFAULT_PUBLIC_CONTENT.locationEyebrow,
    ),
    locationTitle: normalizeString(
      data.locationTitle,
      DEFAULT_PUBLIC_CONTENT.locationTitle,
    ),
    locationDescription: normalizeString(
      data.locationDescription,
      DEFAULT_PUBLIC_CONTENT.locationDescription,
    ),
    locationMapEmbedUrl: normalizeString(
      data.locationMapEmbedUrl,
      DEFAULT_PUBLIC_CONTENT.locationMapEmbedUrl,
    ),
    locationMapLabel: normalizeString(
      data.locationMapLabel,
      DEFAULT_PUBLIC_CONTENT.locationMapLabel,
    ),
    weddingMapsUrl: normalizeString(
      data.weddingMapsUrl,
      DEFAULT_PUBLIC_CONTENT.weddingMapsUrl,
    ),
    prebodaMapsUrl: normalizeString(
      data.prebodaMapsUrl,
      DEFAULT_PUBLIC_CONTENT.prebodaMapsUrl,
    ),
    weddingVenueName: normalizeString(
      data.weddingVenueName,
      DEFAULT_PUBLIC_CONTENT.weddingVenueName,
    ),
    prebodaVenueName: normalizeString(
      data.prebodaVenueName,
      DEFAULT_PUBLIC_CONTENT.prebodaVenueName,
    ),
    locationContactTitle: normalizeString(
      data.locationContactTitle,
      DEFAULT_PUBLIC_CONTENT.locationContactTitle,
    ),
    locationEmailLabel: normalizeString(
      data.locationEmailLabel,
      DEFAULT_PUBLIC_CONTENT.locationEmailLabel,
    ),
    contactEmail: normalizeString(
      data.contactEmail,
      DEFAULT_PUBLIC_CONTENT.contactEmail,
    ),
    contactEmail2: normalizeString(
      data.contactEmail2,
      DEFAULT_PUBLIC_CONTENT.contactEmail2,
    ),
    locationPhoneLabel: normalizeString(
      data.locationPhoneLabel,
      DEFAULT_PUBLIC_CONTENT.locationPhoneLabel,
    ),
    contactPhone: normalizeString(
      data.contactPhone,
      DEFAULT_PUBLIC_CONTENT.contactPhone,
    ),
    contactPhone2: normalizeString(
      data.contactPhone2,
      DEFAULT_PUBLIC_CONTENT.contactPhone2,
    ),
    locationWhatsappLabel: normalizeString(
      data.locationWhatsappLabel,
      DEFAULT_PUBLIC_CONTENT.locationWhatsappLabel,
    ),
    locationWhatsappActionLabel: normalizeString(
      data.locationWhatsappActionLabel,
      DEFAULT_PUBLIC_CONTENT.locationWhatsappActionLabel,
    ),
    footerEyebrow: normalizeString(
      data.footerEyebrow,
      DEFAULT_PUBLIC_CONTENT.footerEyebrow,
    ),
    footerTitle: normalizeString(
      data.footerTitle,
      DEFAULT_PUBLIC_CONTENT.footerTitle,
    ),
    footerCtaLabel: normalizeString(
      data.footerCtaLabel,
      DEFAULT_PUBLIC_CONTENT.footerCtaLabel,
    ),
    footerCopyright: normalizeString(
      data.footerCopyright,
      DEFAULT_PUBLIC_CONTENT.footerCopyright,
    ),
    footerMadeWith: normalizeString(
      data.footerMadeWith,
      DEFAULT_PUBLIC_CONTENT.footerMadeWith,
    ),
    heroBackgroundImages:
      Object.prototype.hasOwnProperty.call(data, "heroBackgroundImages")
        ? parseStringArray(data.heroBackgroundImages, [], true)
        : DEFAULT_PUBLIC_CONTENT.heroBackgroundImages,
    heroBackgroundIntervalMs: normalizeString(
      data.heroBackgroundIntervalMs,
      DEFAULT_PUBLIC_CONTENT.heroBackgroundIntervalMs,
    ),
    mobileBar: normalizeStringMap(
      data.mobileBar,
      DEFAULT_PUBLIC_CONTENT.mobileBar,
    ),
    mapsModal: normalizeStringMap(
      data.mapsModal,
      DEFAULT_PUBLIC_CONTENT.mapsModal,
    ),
    faqEyebrow: normalizeString(data.faqEyebrow, DEFAULT_PUBLIC_CONTENT.faqEyebrow),
    faqTitle: normalizeString(data.faqTitle, DEFAULT_PUBLIC_CONTENT.faqTitle),
    faqDescription: normalizeString(data.faqDescription, DEFAULT_PUBLIC_CONTENT.faqDescription),
    faqItems: normalizeString(data.faqItems, DEFAULT_PUBLIC_CONTENT.faqItems),
    sections: mergeSections(
      DEFAULT_PUBLIC_CONTENT.sections,
      parseSections(data.sections),
    ),
    aiPersonalityInstruction: normalizeString(
      data.aiPersonalityInstruction,
      DEFAULT_PUBLIC_CONTENT.aiPersonalityInstruction
    ),
  };
}

export function serializePublicContent(content: PublicContent) {
  return {
    ...content,
    practicalItems: JSON.stringify(content.practicalItems),
    stayOptions: JSON.stringify(content.stayOptions),
    rsvpImportantNotes: JSON.stringify(content.rsvpImportantNotes),

    heroBackgroundImages: JSON.stringify(content.heroBackgroundImages),
    sections: content.sections,
  };
}
