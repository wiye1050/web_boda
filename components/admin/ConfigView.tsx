"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

type ConfigState = {
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

const DEFAULT_CONFIG: ConfigState = {
  eventDate: "12 de septiembre · 2025",
  eventTimeRange: "13:30 — 02:00",
  locationName: "Finca El Casar · Ponferrada",
  locationAddress: "Camino de la Finca El Casar, Ponferrada",
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

export function ConfigView() {
  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const db = getFirestoreDb();
        const docRef = doc(db, "config", "general");
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<ConfigState>;
          setConfig({ ...DEFAULT_CONFIG, ...data });
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la configuración. Reintenta más tarde.");
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
      await setDoc(doc(db, "config", "general"), config, { merge: true });
      setMessage("Configuración guardada correctamente.");
    } catch (err) {
      console.error(err);
      setError("No pudimos guardar los cambios. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  const jsonPreview = useMemo(
    () => JSON.stringify(config, null, 2),
    [config],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(jsonPreview);
      setMessage("Copiado en el portapapeles.");
    } catch (err) {
      console.error(err);
      setError("No se pudo copiar. Copia manualmente el texto.");
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
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
          Configuración
        </p>
        <h1 className="text-3xl font-semibold">Datos compartidos del sitio</h1>
        <p className="max-w-2xl text-sm text-muted">
          Edita aquí los textos y enlaces clave que luego podrás sincronizar en
          la web pública. Copia el JSON para usarlo en despliegues o integrarlo
          en scripts automatizados.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-6">
          <Fieldset title="Boda">
            <InputField
              label="Fecha"
              value={config.eventDate}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, eventDate: value }))
              }
            />
            <InputField
              label="Horario"
              value={config.eventTimeRange}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, eventTimeRange: value }))
              }
            />
            <InputField
              label="Lugar (nombre)"
              value={config.locationName}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, locationName: value }))
              }
            />
            <InputField
              label="Dirección"
              value={config.locationAddress}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, locationAddress: value }))
              }
            />
            <InputField
              label="Link Google Maps"
              value={config.locationMapUrl}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, locationMapUrl: value }))
              }
            />
          </Fieldset>

          <Fieldset title="Preboda & contacto">
            <InputField
              label="Lugar preboda"
              value={config.prebodaPlace}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, prebodaPlace: value }))
              }
            />
            <InputField
              label="Horario preboda"
              value={config.prebodaTime}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, prebodaTime: value }))
              }
            />
            <InputField
              label="Email contacto"
              type="email"
              value={config.contactEmail}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, contactEmail: value }))
              }
            />
            <InputField
              label="Teléfono contacto"
              value={config.contactPhone}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, contactPhone: value }))
              }
            />
            <InputField
              label="Link WhatsApp"
              value={config.whatsappLink}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, whatsappLink: value }))
              }
            />
          </Fieldset>

          <Fieldset title="Regalos">
            <InputField
              label="Link mesa de regalos"
              value={config.giftLink}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, giftLink: value }))
              }
            />
            <InputField
              label="Titulares cuenta bancaria"
              value={config.bankHolder}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, bankHolder: value }))
              }
            />
            <InputField
              label="IBAN"
              value={config.bankIban}
              onChange={(value) =>
                setConfig((prev) => ({ ...prev, bankIban: value }))
              }
            />
          </Fieldset>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setConfig(DEFAULT_CONFIG)}
              className="rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
            >
              Restaurar valores base
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
          {message && <p className="text-xs text-primary">{message}</p>}
          {error && <p className="text-xs text-primary">{error}</p>}
        </div>

        <aside className="flex flex-col gap-4 rounded-[24px] border border-border/80 bg-surface px-5 py-6 shadow-[var(--shadow-soft)]">
          <header className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
              Preview JSON
            </h2>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-full border border-border px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
            >
              Copiar
            </button>
          </header>
          <pre className="max-h-[520px] overflow-auto rounded-2xl bg-background/60 p-4 text-xs text-muted">
            {jsonPreview}
          </pre>
          <p className="text-xs text-muted">
            Puedes pegar este JSON en scripts o configuraciones para mantener el
            sitio público sincronizado. Próximamente conectaremos estos datos
            directamente con la web.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Fieldset({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-surface px-5 py-5 shadow-[var(--shadow-soft)]">
      <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-full border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
