export type PrivateContent = {
  bankHolder: string;
  bankIban: string;
};

export const DEFAULT_PRIVATE_CONTENT: PrivateContent = {
  bankHolder: "",
  bankIban: "",
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function normalizePrivateContent(
  data: Record<string, unknown>,
): PrivateContent {
  return {
    bankHolder: normalizeString(data.bankHolder),
    bankIban: normalizeString(data.bankIban),
  };
}
