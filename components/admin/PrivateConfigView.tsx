"use client";

import { useEffect, useId, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { getFirestoreDb } from "@/lib/firebase";
import {
  DEFAULT_PRIVATE_CONTENT,
  normalizePrivateContent,
  type PrivateContent,
} from "@/lib/privateContent";

const FIELD_LIMITS = {
  bankHolder: 200,
  bankIban: 40,
  adminEmails: 2000,
  adminUids: 2000,
};

export function PrivateConfigView() {
  const [config, setConfig] = useState<PrivateContent>(DEFAULT_PRIVATE_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const db = getFirestoreDb();
        const docRef = doc(db, "private_config", "general");
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as Record<string, unknown>;
          setConfig(normalizePrivateContent(data));
        } else {
          setConfig(DEFAULT_PRIVATE_CONTENT);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información privada.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const db = getFirestoreDb();
      await setDoc(doc(db, "private_config", "general"), {
        bankHolder: config.bankHolder.trim(),
        bankIban: config.bankIban.trim(),
        adminEmails: config.adminEmails,
        adminUids: config.adminUids,
      });
      setMessage("Datos privados guardados correctamente.");
    } catch (err) {
      console.error(err);
      if (err instanceof FirebaseError) {
        setError(
          `No pudimos guardar. Código: ${err.code}. ${err.message ?? ""}`.trim(),
        );
      } else if (err instanceof Error) {
        setError(`No pudimos guardar: ${err.message}`);
      } else {
        setError("No pudimos guardar los cambios. Intenta de nuevo.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {(message || error) && (
        <div
          className={[
            "rounded-[20px] border px-4 py-3 text-sm",
            error
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
          ].join(" ")}
        >
          {error ?? message}
        </div>
      )}
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
          Contenido privado
        </p>
        <h1 className="text-3xl font-semibold">Datos bancarios</h1>
        <p className="max-w-2xl text-sm text-muted">
          Esta información solo se guarda para el equipo y no se muestra en la web
          pública.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <InputField
          label="Titulares"
          value={config.bankHolder}
          onChange={(value) => setConfig((prev) => ({ ...prev, bankHolder: value }))}
          maxLength={FIELD_LIMITS.bankHolder}
        />
        <InputField
          label="IBAN"
          value={config.bankIban}
          onChange={(value) => setConfig((prev) => ({ ...prev, bankIban: value }))}
          maxLength={FIELD_LIMITS.bankIban}
        />
        <TextAreaField
          label="Admins (emails separados por coma)"
          value={config.adminEmails.join(", ")}
          onChange={(value) =>
            setConfig((prev) => ({
              ...prev,
              adminEmails: value
                .split(",")
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean),
            }))
          }
          maxLength={FIELD_LIMITS.adminEmails}
        />
        <TextAreaField
          label="Admins (UIDs opcionales, separados por coma)"
          value={config.adminUids.join(", ")}
          onChange={(value) =>
            setConfig((prev) => ({
              ...prev,
              adminUids: value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            }))
          }
          maxLength={FIELD_LIMITS.adminUids}
        />
        <button
          type="submit"
          disabled={isSaving}
          className="w-fit rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  const inputId = useId();
  const showCount = typeof maxLength === "number";
  const length = value.length;

  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        <span>{label}</span>
        {showCount && (
          <span className="text-[0.65rem] tracking-[0.2em]">
            {length}/{maxLength}
          </span>
        )}
      </span>
      <input
        id={inputId}
        name={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        className="rounded-full border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  const inputId = useId();
  const showCount = typeof maxLength === "number";
  const length = value.length;

  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        <span>{label}</span>
        {showCount && (
          <span className="text-[0.65rem] tracking-[0.2em]">
            {length}/{maxLength}
          </span>
        )}
      </span>
      <textarea
        id={inputId}
        name={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        rows={3}
        className="rounded-2xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
