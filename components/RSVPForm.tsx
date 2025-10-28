// Componente cliente porque interactúa con Firestore y maneja estado de UI.
"use client";

import { useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firebaseClient } from "@/lib/firebase";

type RSVPStatus = "idle" | "loading" | "success" | "error";

type YesNo = "si" | "no";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  attendance: YesNo | null;
  guests: string;
  guestNames: string;
  preboda: YesNo | null;
  needsTransport: YesNo | null;
  transportSeats: string;
  requests: string;
};

const INITIAL_STATE: FormState = {
  fullName: "",
  email: "",
  phone: "",
  attendance: null,
  guests: "",
  guestNames: "",
  preboda: null,
  needsTransport: null,
  transportSeats: "",
  requests: "",
};

export function RSVPForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<RSVPStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const radioBaseClasses =
    "inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm uppercase tracking-[0.2em] transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-[3px] focus-within:outline-primary sm:flex-1";

  const attending = form.attendance === "si";
  const guestsNumber = Number.parseInt(form.guests, 10);
  const seatsRequested = Number.parseInt(form.transportSeats, 10);

  const guestsValid = useMemo(() => {
    if (form.attendance === null) return false;
    if (!Number.isInteger(guestsNumber)) {
      return form.attendance === "no";
    }
    if (form.attendance === "no") {
      return guestsNumber === 0;
    }
    return guestsNumber >= 1 && guestsNumber <= 6;
  }, [form.attendance, guestsNumber]);

  const phoneValid = useMemo(() => {
    const digitsOnly = form.phone.replace(/\D/g, "");
    return digitsOnly.length >= 8 && digitsOnly.length <= 15;
  }, [form.phone]);

  const seatsValid = useMemo(() => {
    if (form.needsTransport !== "si") return true;
    if (!Number.isInteger(seatsRequested)) return false;
    if (seatsRequested < 1) return false;
    return seatsRequested <= Math.max(Number.isNaN(guestsNumber) ? 0 : guestsNumber, 1);
  }, [form.needsTransport, seatsRequested, guestsNumber]);

  const showGuestError =
    form.attendance === "si" && form.guests !== "" && !guestsValid;
  const showSeatsError =
    form.needsTransport === "si" &&
    form.transportSeats !== "" &&
    !seatsValid;

  const isValid =
    form.fullName.trim().length > 2 &&
    /^[^@]+@[^@]+\.[^@]+$/.test(form.email.trim()) &&
    phoneValid &&
    guestsValid &&
    seatsValid &&
    form.attendance !== null &&
    form.preboda !== null &&
    form.needsTransport !== null &&
    (form.needsTransport === "si"
      ? form.transportSeats.trim().length > 0 && !Number.isNaN(seatsRequested)
      : true);

  function handleChange<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((prev) => {
      const cleanNumeric = (input: string) => input.replace(/[^0-9]/g, "");
      const next: FormState = {
        ...prev,
        [field]:
          field === "guests" || field === "transportSeats"
            ? cleanNumeric(String(value))
            : value,
      };

      if (field === "attendance") {
        const attendingValue = value as YesNo | null;
        next.attendance = attendingValue;
        if (attendingValue === "no") {
          next.guests = "0";
          next.guestNames = "";
          next.needsTransport = "no";
          next.transportSeats = "";
        }
        if (attendingValue === "si" && next.guests === "0") {
          next.guests = "";
        }
      }

      if (field === "needsTransport") {
        const transportValue = value as YesNo | null;
        next.needsTransport = transportValue;
        if (transportValue === "no") {
          next.transportSeats = "";
        }
      }

      if (field === "guests") {
        const numericGuests = cleanNumeric(String(value));
        const attendanceState = next.attendance;
        next.guests =
          attendanceState === "si"
            ? numericGuests
            : attendanceState === "no"
              ? "0"
              : numericGuests;
        if (
          Number.parseInt(next.transportSeats, 10) >
          Number.parseInt(next.guests || "0", 10)
        ) {
          next.transportSeats = next.guests || "";
        }
      }

      if (field === "transportSeats") {
        const numericSeats = cleanNumeric(String(value));
        next.transportSeats =
          numericSeats === "" ? "0" : numericSeats.slice(0, 2);
      }

      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid || status === "loading") {
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const db = firebaseClient.getFirestore();

      await addDoc(collection(db, "rsvps"), {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        attendance: form.attendance!, // asegurado por validación previa
        guests: attending ? guestsNumber : 0,
        guestNames: form.guestNames.trim(),
        preboda: form.preboda!, // asegurado por validación previa
        needsTransport: form.needsTransport!, // asegurado por validación previa
        transportSeats:
          form.needsTransport === "si"
            ? Math.min(seatsRequested, Math.max(guestsNumber, 1))
            : 0,
        requests: form.requests.trim(),
        submittedAt: serverTimestamp(),
        source: "web",
      });

      setStatus("success");
      setForm(INITIAL_STATE);
    } catch (error) {
      console.error("Error guardando RSVP", error);
      setStatus("error");

      if (error instanceof Error) {
        setErrorMessage(
          error.message.includes("Faltan variables")
            ? "Parece que hay un problema de configuración. Escríbenos por WhatsApp mientras lo solucionamos."
            : "No pudimos guardar tu respuesta. Inténtalo de nuevo en unos minutos o contáctanos directamente.",
        );
      } else {
        setErrorMessage(
          "No pudimos guardar tu respuesta. Inténtalo de nuevo en unos minutos o contáctanos directamente.",
        );
      }
    } finally {
      setTimeout(() => setStatus("idle"), 6000);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-[var(--radius-card)] border border-border/70 bg-surface/95 p-8 shadow-[var(--shadow-soft)]"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Nombre completo
          </span>
          <input
            name="fullName"
            autoComplete="name"
            required
            value={form.fullName}
            onChange={(event) => handleChange("fullName", event.target.value)}
            placeholder="¿Quién confirma?"
            className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="Te enviaremos recordatorios"
            className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Teléfono de contacto
          </span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder="+34 600 000 000"
            className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {!phoneValid && form.phone.length > 0 && (
            <span className="text-xs text-primary">
              Revisa el número (8-15 dígitos).
            </span>
          )}
        </label>

        <fieldset className="flex flex-col gap-4 rounded-[20px] border border-border/80 bg-surface px-5 py-5 text-left shadow-sm">
          <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            ¿Vas a venir?
          </legend>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {["si", "no"].map((value) => (
              <label
                key={value}
                className={[
                  radioBaseClasses,
                  "min-w-[160px]",
                  form.attendance === value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-surface text-muted hover:border-primary/60 hover:text-primary",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="attendance"
                  value={value}
                  checked={form.attendance === value}
                  onChange={(event) =>
                    handleChange(
                      "attendance",
                      event.target.value as FormState["attendance"],
                    )
                  }
                />
                {value === "si" ? "Sí, ahí estaré" : "No podré ir"}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            ¿Cuántos adultos vienen?
          </span>
          <input
            name="guests"
            inputMode="numeric"
            min={attending ? 1 : 0}
            required={attending}
            value={form.guests}
            onChange={(event) => handleChange("guests", event.target.value)}
            placeholder={
              attending ? "Incluyéndote" : "Selecciona tu asistencia primero"
            }
            className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            disabled={!attending}
          />
          <span className="text-xs text-muted">
            Máximo 6 adultos por invitación. Si sois más, cuéntanoslo abajo.
          </span>
          {showGuestError && (
            <span className="text-xs text-primary">
              Indica un número válido de asistentes.
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Nombres de acompañantes (opcional)
          </span>
          <textarea
            name="guestNames"
            value={form.guestNames}
            onChange={(event) => handleChange("guestNames", event.target.value)}
            rows={3}
            placeholder="Ej: Marta (pareja), Juan (colega)"
            className="min-h-[100px] rounded-3xl border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            disabled={!attending}
          />
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <fieldset className="flex flex-col gap-4 rounded-[20px] border border-border/80 bg-surface px-5 py-5 text-left shadow-sm">
          <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            ¿Nos acompañas a la preboda (11 de septiembre)?
          </legend>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {["si", "no"].map((value) => (
              <label
                key={value}
                className={[
                  radioBaseClasses,
                  "min-w-[160px]",
                  form.preboda === value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-surface text-muted hover:border-primary/60 hover:text-primary",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="preboda"
                  value={value}
                  checked={form.preboda === value}
                  onChange={(event) =>
                    handleChange(
                      "preboda",
                      event.target.value as FormState["preboda"],
                    )
                  }
                />
                {value === "si" ? "¡Claro!" : "No podré ir"}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted">
            Viernes 11/09 · 19:30 · Casino Rooftop Ponferrada.
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded-[20px] border border-border/80 bg-surface px-5 py-5 text-left shadow-sm">
          <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            ¿Necesitas traslado?
          </legend>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {["no", "si"].map((value) => (
              <label
                key={value}
                className={[
                  radioBaseClasses,
                  "min-w-[160px]",
                  form.needsTransport === value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-surface text-muted hover:border-primary/60 hover:text-primary",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="needsTransport"
                  value={value}
                  checked={form.needsTransport === value}
                  onChange={(event) =>
                    handleChange(
                      "needsTransport",
                      event.target.value as FormState["needsTransport"],
                    )
                  }
                />
                {value === "si"
                  ? "Sí, avísenme los horarios"
                  : "No, iremos por nuestra cuenta"}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted">
            Organizaremos bus desde Ponferrada si hay suficientes plazas.
          </p>
        </fieldset>
      </div>

      {form.needsTransport === "si" && (
        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            ¿Cuántas plazas de bus necesitáis?
          </span>
          <input
            name="transportSeats"
            inputMode="numeric"
            min={1}
            max={attending && !Number.isNaN(guestsNumber) ? guestsNumber : undefined}
            required
            value={form.transportSeats}
            onChange={(event) =>
              handleChange("transportSeats", event.target.value)
            }
            placeholder="Ej: 2"
            className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {showSeatsError && (
            <span className="text-xs text-primary">
              Indica un número de plazas válido (≤ asistentes).
            </span>
          )}
        </label>
      )}

      <label className="flex flex-col gap-2 text-left">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Comentarios o necesidades especiales
        </span>
        <textarea
          name="requests"
          value={form.requests}
          onChange={(event) => handleChange("requests", event.target.value)}
          rows={4}
          placeholder="Intolerancias, alergias, canciones que no pueden faltar..."
          className="min-h-[160px] rounded-3xl border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <div className="flex flex-col items-center gap-4 text-center">
        <button
          type="submit"
          disabled={!isValid || status === "loading"}
          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
        >
          {status === "loading" ? "Guardando..." : "Enviar respuesta"}
        </button>
        {status === "success" && (
          <p className="text-sm text-foreground">
            ¡Gracias! Recibimos tu confirmación. Te escribiremos pronto con más
            detalles.
          </p>
        )}
        {status === "error" && errorMessage && (
          <p className="text-sm text-primary">{errorMessage}</p>
        )}
      </div>

      <div className="rounded-[20px] border border-border/80 bg-accent/70 px-5 py-4 text-left text-xs text-muted">
        <p className="font-semibold uppercase tracking-[0.3em] text-muted">
          Información importante
        </p>
        <ul className="mt-3 space-y-2 text-foreground/90">
          <li>
            · Evento solo para adultos (mayores de 18). Si necesitas referencias
            de canguros en Ponferrada, escríbenos y te ayudamos.
          </li>
          <li>
            · Si tienes alergias o intolerancias, cuéntanoslo para coordinarlo
            con el equipo de cocina.
          </li>
          <li>
            · Confirmaciones abiertas hasta el 15 de agosto. Después intentaremos
            acomodar cambios pero no podemos garantizarlo.
          </li>
        </ul>
      </div>
    </form>
  );
}
