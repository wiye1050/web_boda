// Componente cliente porque interactúa con Firestore y maneja estado de UI.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { firebaseClient } from "@/lib/firebase";
import { DEFAULT_PUBLIC_CONTENT, type RsvpFormCopy } from "@/lib/publicContent";
import { sendConfirmationEmail } from "@/app/actions/sendConfirmation";

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
  songRequest: string;
  hairMakeup?: boolean;
  reminderOptIn: boolean;
  acceptedTerms: boolean;
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
  songRequest: "",
  hairMakeup: false,
  reminderOptIn: false,
  acceptedTerms: false,
};

type RSVPFormProps = {
  importantTitle?: string;
  importantNotes?: string[];
  copy?: RsvpFormCopy;
};

type SubmittedSummary = {
  fullName: string;
  email: string;
  phone: string;
  attendance: YesNo;
  guests: number;
  needsTransport: YesNo;
};

const LOCAL_COOLDOWN_KEY = "rsvpLastSubmittedAt";
const COOLDOWN_MS = 60_000;

export function RSVPForm({
  importantTitle = DEFAULT_PUBLIC_CONTENT.rsvpImportantTitle,
  importantNotes = DEFAULT_PUBLIC_CONTENT.rsvpImportantNotes,
  copy = DEFAULT_PUBLIC_CONTENT.rsvpForm,
}: RSVPFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<RSVPStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [botField, setBotField] = useState("");
  const [submittedInfo, setSubmittedInfo] = useState<SubmittedSummary | null>(
    null,
  );
  const startedAt = useRef(Date.now());
  const lastSubmittedAt = useRef<number>(0);
  const radioBaseClasses =
    "inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm uppercase tracking-[0.15em] transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-[3px] focus-within:outline-primary sm:flex-1 sm:tracking-[0.2em]";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LOCAL_COOLDOWN_KEY);
    if (stored) {
      const parsed = Number.parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        lastSubmittedAt.current = parsed;
      }
    }
  }, []);

  const attending = form.attendance === "si";
  const guestsNumber = Number.parseInt(form.guests, 10);
  const seatsRequested = Number.parseInt(form.transportSeats, 10);
  const emailValue = form.email.trim();
  const emailValid =
    emailValue.length === 0 || /^[^@]+@[^@]+\.[^@]+$/.test(emailValue);

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
    const digitsOnly = form.phone.replace(/[^\d+]/g, "");
    return digitsOnly.length >= 8 && digitsOnly.length <= 25;
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
    emailValid &&
    phoneValid &&
    guestsValid &&
    seatsValid &&
    form.attendance !== null &&
    form.preboda !== null &&
    form.needsTransport !== null &&
    (form.needsTransport === "si"
      ? form.transportSeats.trim().length > 0 &&
        !Number.isNaN(seatsRequested) &&
        seatsRequested <= (Number.isNaN(guestsNumber) ? 0 : guestsNumber)
      : true) &&
    form.acceptedTerms;

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
          next.preboda = "no";
          next.needsTransport = "no";
          next.transportSeats = "";
        }
        if (attendingValue === "si" && next.guests === "0") {
          next.guests = "";
        }
        if (attendingValue === "si") {
          next.preboda = next.preboda ?? "no";
          next.needsTransport = next.needsTransport ?? "no";
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

    if (botField.trim().length > 0) {
      setStatus("error");
      const msg = "No pudimos enviar el formulario. Inténtalo de nuevo en unos segundos.";
      setErrorMessage(msg);
      toast.error(msg);
      setTimeout(() => setStatus("idle"), 6000);
      return;
    }

    if (Date.now() - startedAt.current < 2500) {
      setStatus("error");
      const msg = "Espera unos segundos y vuelve a intentarlo.";
      setErrorMessage(msg);
      toast.error(msg);
      setTimeout(() => setStatus("idle"), 6000);
      return;
    }

    const now = Date.now();
    if (now - lastSubmittedAt.current < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (now - lastSubmittedAt.current)) / 1000);
      setStatus("error");
      const msg = `Hemos recibido un envío reciente. Espera ${remaining} segundos antes de volver a intentarlo.`;
      setErrorMessage(msg);
      toast.error(msg);
      setTimeout(() => setStatus("idle"), 6000);
      return;
    }

    if (!isValid || status === "loading") {
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const db = firebaseClient.getFirestore();
      const phoneDigits = form.phone.replace(/[^\d+]/g, "");
      const editToken = Math.random().toString(36).slice(2, 10);

      await addDoc(collection(db, "rsvps"), {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: phoneDigits,
        attendance: form.attendance!, // asegurado por validación previa
        guests: attending ? guestsNumber : 0,
        guestNames: form.guestNames.trim(),
        preboda: form.preboda ?? "no",
        needsTransport: form.needsTransport ?? "no",
        transportSeats:
          form.needsTransport === "si"
            ? Math.min(seatsRequested, Math.max(guestsNumber, 1))
            : 0,
        requests: form.requests.trim(),
        songRequest: form.songRequest.trim(),
        hairMakeup: Boolean(form.hairMakeup),
        reminderOptIn: Boolean(form.reminderOptIn),
        editToken,
        submittedAt: serverTimestamp(),
        source: "web",
      });

      setStatus("success");
      setSubmittedInfo({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: phoneDigits,
        attendance: form.attendance!,
        guests: attending ? guestsNumber : 0,
        needsTransport: form.needsTransport ?? "no",
      });
      toast.success("¡Confirmación recibida correctamente!");
      setForm(INITIAL_STATE);
      lastSubmittedAt.current = Date.now();
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          LOCAL_COOLDOWN_KEY,
          String(lastSubmittedAt.current),
        );
      }

      // Enviar email de confirmación (no bloqueante)
      await sendConfirmationEmail({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        guests: attending ? guestsNumber : 0,
        attendance: form.attendance!,
        transport: form.needsTransport === "si" ? "si" : "no",
      });
    } catch (error) {
      console.error("Error guardando RSVP", error);
      setStatus("error");

      if (error instanceof Error) {
        const msg = error.message.includes("Faltan variables")
          ? "Parece que hay un problema de configuración. Escríbenos por WhatsApp mientras lo solucionamos."
          : "No pudimos guardar tu respuesta. Inténtalo de nuevo en unos minutos o contáctanos directamente.";
        setErrorMessage(msg);
        toast.error(msg);
      } else {
        const msg = "No pudimos guardar tu respuesta. Inténtalo de nuevo en unos minutos o contáctanos directamente.";
        setErrorMessage(msg);
        toast.error(msg);
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
      <label className="sr-only">
        No completar
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={botField}
          onChange={(event) => setBotField(event.target.value)}
        />
      </label>
      <div className="grid gap-6 md:grid-cols-2">
        {submittedInfo && status === "success" && (
          <div className="md:col-span-2 flex flex-col items-center justify-center gap-4 rounded-[24px] border border-emerald-400/40 bg-emerald-500/10 p-8 text-center shadow-sm transition-all animate-in fade-in zoom-in duration-500">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-800">
                ¡Gracias {submittedInfo.fullName.split(" ")[0]}!
              </h3>
              <p className="mt-2 text-sm text-emerald-700">
                Hemos recibido tu confirmación correctamente.
              </p>
            </div>
            
            <div className="mt-2 w-full max-w-sm rounded-xl bg-white/60 p-4 text-emerald-900 shadow-sm border border-emerald-200/50">
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between border-b border-emerald-200/50 pb-2">
                  <span className="font-semibold">Asistencia:</span>
                  <span>{submittedInfo.attendance === "si" ? "Sí, asistiré" : "No podré asistir"}</span>
                </li>
                 {submittedInfo.attendance === "si" && (
                   <>
                    <li className="flex justify-between border-b border-emerald-200/50 pb-2">
                      <span className="font-semibold">Adultos:</span>
                      <span>{submittedInfo.guests}</span>
                    </li>
                    <li className="flex justify-between pt-1">
                      <span className="font-semibold">Transporte:</span>
                      <span>{submittedInfo.needsTransport === "si" ? "Sí" : "No"}</span>
                    </li>
                   </>
                 )}
              </ul>
            </div>

             <p className="mt-2 text-xs text-emerald-600/80">
              Te hemos enviado un email con el resumen.
            </p>
          </div>
        )}
        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            {copy.fullNameLabel}
          </span>
          <input
            name="fullName"
            autoComplete="name"
            required
            value={form.fullName}
            onChange={(event) => handleChange("fullName", event.target.value)}
            placeholder={copy.fullNamePlaceholder}
            className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            {copy.emailLabel}
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder={copy.emailPlaceholder}
            className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {!emailValid && form.email.length > 0 && (
            <span className="text-xs text-primary">
              {copy.emailError}
            </span>
          )}
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            {copy.phoneLabel}
          </span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder={copy.phonePlaceholder}
            className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {!phoneValid && form.phone.length > 0 && (
            <span className="text-xs text-primary">
              {copy.phoneError}
            </span>
          )}
        </label>

        <fieldset className="flex flex-col gap-4 rounded-[20px] border border-border/80 bg-surface px-5 py-5 text-left shadow-sm">
          <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            {copy.attendanceLegend}
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
                {value === "si"
                  ? copy.attendanceYesLabel
                  : copy.attendanceNoLabel}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {attending && (
        <div className="grid gap-6">
          <label className="flex flex-col gap-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              {copy.guestsLabel}
            </span>
            <input
              name="guests"
              inputMode="numeric"
              min={1}
              required
              value={form.guests}
              onChange={(event) => handleChange("guests", event.target.value)}
              placeholder={copy.guestsPlaceholderYes}
              className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-xs text-muted">{copy.guestsHelper}</span>
            {showGuestError && (
              <span className="text-xs text-primary">
                {copy.guestsError}
              </span>
            )}
          </label>
        </div>
      )}
      {attending && (
        <div
          id="rsvp-advanced"
          className="grid gap-6 rounded-[24px] border border-border/80 bg-surface/90 p-6 md:grid-cols-2"
        >
          <label className="flex flex-col gap-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              {copy.guestNamesLabel}
            </span>
            <textarea
              name="guestNames"
              value={form.guestNames}
              onChange={(event) => handleChange("guestNames", event.target.value)}
              rows={3}
              placeholder={copy.guestNamesPlaceholder}
              className="min-h-[100px] rounded-3xl border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              disabled={!attending}
          />
        </label>

        <label className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-left text-sm text-foreground">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border bg-background accent-primary"
            checked={form.reminderOptIn}
            onChange={(event) => handleChange("reminderOptIn", event.target.checked)}
          />
          <span>
            Quiero recordatorio antes de la boda (usaremos tu teléfono o email).
          </span>
        </label>
          <fieldset className="flex flex-col gap-4 rounded-[20px] border border-border/80 bg-surface px-5 py-5 text-left shadow-sm">
            <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              {copy.prebodaLegend}
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
                  {value === "si" ? copy.prebodaYesLabel : copy.prebodaNoLabel}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted">{copy.prebodaNote}</p>
          </fieldset>

          <fieldset className="flex flex-col gap-4 rounded-[20px] border border-border/80 bg-surface px-5 py-5 text-left shadow-sm">
            <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              {copy.transportLegend}
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
                    ? copy.transportYesLabel
                    : copy.transportNoLabel}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted">{copy.transportNote}</p>
          </fieldset>

          {form.needsTransport === "si" && (
            <label className="flex flex-col gap-2 text-left md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                {copy.transportSeatsLabel}
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
                placeholder={copy.transportSeatsPlaceholder}
                className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              {showSeatsError && (
                <span className="text-xs text-primary">
                  {copy.transportSeatsError}
                </span>
              )}
            </label>
          )}

          <label className="flex flex-col gap-2 text-left md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              {copy.requestsLabel}
            </span>
            <textarea
              name="requests"
              value={form.requests}
              onChange={(event) => handleChange("requests", event.target.value)}
              rows={4}
              placeholder={copy.requestsPlaceholder}
              className="min-h-[160px] rounded-3xl border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
        </div>
      )}

      {attending && (
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
           <label className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-left text-sm text-foreground md:flex-1">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border bg-background accent-primary"
              checked={form.hairMakeup || false}
              onChange={(event) => handleChange("hairMakeup", event.target.checked)}
            />
            <span>
              Me interesa el servicio de <span className="font-semibold text-primary">peluquería o maquillaje</span> (te contactaremos para darte detalles).
            </span>
          </label>
           
          <label className="flex flex-col gap-2 text-left md:flex-1">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              <span role="img" aria-hidden>🎵</span> Una canción que no puede faltar
            </span>
            <input
              name="songRequest"
              value={form.songRequest}
              onChange={(event) => handleChange("songRequest", event.target.value)}
              placeholder="Ej: Flying Free, Paquito el Chocolatero..."
              className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 text-center">
        <label className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-left text-sm text-foreground">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border bg-background accent-primary"
            checked={form.acceptedTerms}
            onChange={(event) =>
              handleChange("acceptedTerms", event.target.checked)
            }
          />
          <span className="text-xs sm:text-sm">
            Entiendo que esta es una celebración{" "}
            <span className="font-semibold text-primary">
              exclusivamente para adultos
            </span>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={!isValid || status === "loading"}
          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto sm:tracking-[0.25em]"
        >
          {status === "loading" ? copy.submitLoadingLabel : copy.submitLabel}
        </button>
        {status === "success" && (
          <p className="text-sm text-foreground">{copy.successMessage}</p>
        )}
        {status === "error" && errorMessage && (
          <p className="text-sm text-primary">{errorMessage}</p>
        )}
      </div>

      <div className="rounded-[20px] border border-border/80 bg-accent/70 px-5 py-4 text-left text-xs text-muted">
        <p className="font-semibold uppercase tracking-[0.3em] text-muted">
          {importantTitle}
        </p>
        <ul className="mt-3 space-y-2 text-foreground/90">
          {importantNotes.map((note, index) => (
            <li key={`${index}-${note}`}>· {note}</li>
          ))}
        </ul>
      </div>
    </form>
  );
}
