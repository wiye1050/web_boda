export type PrivateContent = {
  bankHolder: string;
  bankIban: string;
  adminEmails: string[];
  adminUids: string[];
};

export const DEFAULT_PRIVATE_CONTENT: PrivateContent = {
  bankHolder: "",
  bankIban: "",
  adminEmails: [],
  adminUids: [],
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

export function normalizePrivateContent(
  data: Record<string, unknown>,
): PrivateContent {
  return {
    bankHolder: normalizeString(data.bankHolder),
    bankIban: normalizeString(data.bankIban),
    adminEmails: normalizeStringArray(data.adminEmails),
    adminUids: normalizeStringArray(data.adminUids),
  };
}
