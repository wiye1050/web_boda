// Componente cliente porque interactúa con Firestore y maneja estado de UI.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { firebaseClient } from "@/lib/firebase";
import { DEFAULT_PUBLIC_CONTENT, type RsvpFormCopy } from "@/lib/publicContent";
import { sendConfirmationEmail } from "@/app/actions/sendConfirmation";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

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
  dietary: string;
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
  dietary: "",
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
    form.acceptedTerms &&
    (form.needsTransport === "si"
      ? form.transportSeats.trim().length > 0 &&
        !Number.isNaN(seatsRequested) &&
        seatsRequested <= Math.max(Number.isNaN(guestsNumber) ? 0 : guestsNumber, 1)
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
        attendance: form.attendance!,
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
        dietary: form.dietary.trim(),
        hairMakeup: Boolean(form.hairMakeup),
        reminderOptIn: Boolean(form.reminderOptIn),
        acceptedTerms: true,
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
      
      if (form.attendance === "si") {
        const colors = ["#8b7e74", "#d4af37", "#b89d7b", "#f8f5f2", "#5b634a"];
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors });
        setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.55 }, colors }), 400);
      }
      setForm(INITIAL_STATE);
      lastSubmittedAt.current = Date.now();
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          LOCAL_COOLDOWN_KEY,
          String(lastSubmittedAt.current),
        );
      }

      try {
        await sendConfirmationEmail({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          guests: attending ? guestsNumber : 0,
          attendance: form.attendance!,
          transport: form.needsTransport === "si" ? "si" : "no",
        });
      } catch (emailError) {
        console.error("Error enviando email de confirmación", emailError);
      }
    } catch (error) {
      console.error("Error guardando RSVP", error);
      setStatus("error");

      const msg = "No pudimos guardar tu respuesta. Inténtalo de nuevo en unos minutos o contáctanos directamente.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setTimeout(() => setStatus("idle"), 6000);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-[var(--radius-card)] border border-border/70 bg-surface/95 p-8 shadow-[var(--shadow-soft)] text-center"
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

      {submittedInfo && status === "success" ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-[32px] border border-emerald-400/30 bg-emerald-500/5 p-10 text-center shadow-sm animate-in fade-in zoom-in duration-500">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-emerald-900">¡Gracias {submittedInfo.fullName.split(" ")[0]}!</h3>
            <p className="mt-2 text-base text-emerald-700/80">Hemos recibido tu respuesta correctamente.</p>
          </div>
          <div className="w-full max-w-sm rounded-[24px] bg-white/40 p-6 text-emerald-900 shadow-sm border border-emerald-200/40 backdrop-blur-sm">
            <ul className="space-y-3 text-sm text-center">
              <li className="flex justify-between border-b border-emerald-200/30 pb-3">
                <span className="font-medium text-emerald-700">Asistencia:</span>
                <span className="font-bold">{submittedInfo.attendance === "si" ? "Sí, asistiré" : "No podré asistir"}</span>
              </li>
              {submittedInfo.attendance === "si" && (
                <>
                  <li className="flex justify-between border-b border-emerald-200/30 pb-3">
                    <span className="font-medium text-emerald-700">Adultos:</span>
                    <span className="font-bold">{submittedInfo.guests}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium text-emerald-700">Transporte:</span>
                    <span className="font-bold">{submittedInfo.needsTransport === "si" ? "Sí" : "No"}</span>
                  </li>
                </>
              )}
            </ul>
          </div>
          <p className="text-xs text-emerald-600/70 italic">Te hemos enviado un email con el resumen.</p>
          <button
            type="button"
            onClick={() => { setSubmittedInfo(null); setStatus("idle"); }}
            className="mt-4 text-xs font-semibold uppercase tracking-widest text-emerald-700 hover:underline"
          >
            Enviar otra respuesta
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{copy.fullNameLabel}</span>
              <input 
                name="fullName" 
                autoComplete="name" 
                required 
                value={form.fullName} 
                onChange={(e) => handleChange("fullName", e.target.value)} 
                placeholder={copy.fullNamePlaceholder} 
                className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 text-center" 
              />
            </label>
            <label className="flex flex-col gap-2 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{copy.emailLabel}</span>
              <input 
                type="email" 
                name="email" 
                autoComplete="email" 
                value={form.email} 
                onChange={(e) => handleChange("email", e.target.value)} 
                placeholder={copy.emailPlaceholder} 
                className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 text-center" 
              />
              {!emailValid && form.email.length > 0 && <span className="text-xs text-primary">{copy.emailError}</span>}
            </label>
            <label className="flex flex-col gap-2 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{copy.phoneLabel}</span>
              <input 
                type="tel" 
                name="phone" 
                autoComplete="tel" 
                required 
                value={form.phone} 
                onChange={(e) => handleChange("phone", e.target.value)} 
                placeholder={copy.phonePlaceholder} 
                className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 text-center" 
              />
              {!phoneValid && form.phone.length > 0 && <span className="text-xs text-primary">{copy.phoneError}</span>}
            </label>
            <fieldset className="flex flex-col gap-4 rounded-[20px] border border-border/80 bg-surface px-5 py-5 text-center shadow-sm">
              <legend className="mx-auto text-xs font-semibold uppercase tracking-[0.3em] text-muted">{copy.attendanceLegend}</legend>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap justify-center">
                {["si", "no"].map((val) => (
                  <label 
                    key={val} 
                    className={radioBaseClasses + " min-w-[140px] " + (form.attendance === val ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-surface text-muted hover:border-primary/60 hover:text-primary")}
                  >
                    <input 
                      className="sr-only" 
                      type="radio" 
                      name="attendance" 
                      value={val} 
                      checked={form.attendance === val} 
                      onChange={(e) => handleChange("attendance", e.target.value as FormState["attendance"])} 
                    />
                    {val === "si" ? copy.attendanceYesLabel : copy.attendanceNoLabel}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {attending && (
            <div className="grid gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-center">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{copy.guestsLabel}</span>
                  <input name="guests" inputMode="numeric" min={1} required value={form.guests} onChange={(e) => handleChange("guests", e.target.value)} placeholder={copy.guestsPlaceholderYes} className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 text-center" />
                  <span className="text-xs text-muted">{copy.guestsHelper}</span>
                  {showGuestError && <span className="text-xs text-primary">{copy.guestsError}</span>}
                </label>
                <label className="flex flex-col gap-2 text-center">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{copy.guestNamesLabel}</span>
                  <textarea name="guestNames" value={form.guestNames} onChange={(e) => handleChange("guestNames", e.target.value)} rows={2} placeholder={copy.guestNamesPlaceholder} className="min-h-[60px] rounded-[24px] border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 text-center" />
                </label>
              </div>

              <div id="rsvp-advanced" className="grid gap-6 rounded-[32px] border border-border/80 bg-surface/50 p-6 md:grid-cols-2 text-center">
                <fieldset className="flex flex-col gap-4 rounded-[20px] border border-border/80 bg-surface px-4 py-4 text-center">
                  <legend className="mx-auto text-xs font-semibold uppercase tracking-[0.3em] text-muted">{copy.prebodaLegend}</legend>
                  <div className="flex gap-2 justify-center">
                    {["si", "no"].map((val) => (
                      <label key={val} className={radioBaseClasses + " flex-1 " + (form.preboda === val ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-surface text-muted")}>
                        <input className="sr-only" type="radio" name="preboda" value={val} checked={form.preboda === val} onChange={(e) => handleChange("preboda", e.target.value as FormState["preboda"])} />
                        {val === "si" ? "Sí" : "No"}
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted">{copy.prebodaNote}</p>
                </fieldset>

                <fieldset className="flex flex-col gap-4 rounded-[20px] border border-border/80 bg-surface px-4 py-4 text-center">
                  <legend className="mx-auto text-xs font-semibold uppercase tracking-[0.3em] text-muted">{copy.transportLegend}</legend>
                  <div className="flex gap-2 justify-center">
                    {["no", "si"].map((val) => (
                      <label key={val} className={radioBaseClasses + " flex-1 " + (form.needsTransport === val ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-surface text-muted")}>
                        <input className="sr-only" type="radio" name="needsTransport" value={val} checked={form.needsTransport === val} onChange={(e) => handleChange("needsTransport", e.target.value as FormState["needsTransport"])} />
                        {val === "si" ? "Sí" : "No"}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {form.needsTransport === "si" && (
                  <label className="flex flex-col gap-2 text-center md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{copy.transportSeatsLabel}</span>
                    <input name="transportSeats" inputMode="numeric" min={1} required value={form.transportSeats} onChange={(e) => handleChange("transportSeats", e.target.value)} placeholder={copy.transportSeatsPlaceholder} className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 text-center mx-auto max-w-[200px]" />
                    {showSeatsError && <span className="text-xs text-primary">{copy.transportSeatsError}</span>}
                  </label>
                )}

                <label className="flex flex-col gap-2 text-center md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Restricciones alimenticias</span>
                  <textarea name="dietary" value={form.dietary} onChange={(e) => handleChange("dietary", e.target.value)} rows={2} placeholder="Alergias, veganismo..." className="rounded-[24px] border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 text-center" />
                </label>
                
                <label className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm text-left">
                  <input type="checkbox" className="mt-1 h-4 w-4 rounded border-border bg-background accent-primary" checked={form.hairMakeup || false} onChange={(e) => handleChange("hairMakeup", e.target.checked)} />
                  <span className="text-xs text-muted-foreground">Me interesa el servicio de <span className="font-semibold text-primary">peluquería o maquillaje</span>.</span>
                </label>

                <label className="flex flex-col gap-2 text-center md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">🎵 Una canción imprescindible</span>
                  <input name="songRequest" value={form.songRequest} onChange={(e) => handleChange("songRequest", e.target.value)} placeholder="Ej: Flying Free..." className="rounded-full border border-border/80 bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 text-center" />
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-6">
            <label className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 px-5 py-4 text-sm text-left max-w-lg cursor-pointer transition-colors hover:bg-background/80">
              <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-border bg-background accent-primary" checked={form.acceptedTerms} onChange={(e) => handleChange("acceptedTerms", e.target.checked)} />
              <span className="text-xs text-muted-foreground leading-relaxed">Acepto que Alba & Guille guarden mis datos para la organización de la boda según la política de privacidad.</span>
            </label>

            <div className="flex flex-col items-center gap-4 w-full">
              <button type="submit" disabled={!isValid || status === "loading"} className="inline-flex w-full items-center justify-center rounded-full bg-primary px-10 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto">
                {status === "loading" ? copy.submitLoadingLabel : copy.submitLabel}
              </button>
              {status === "error" && errorMessage && <p className="text-sm text-primary font-medium">{errorMessage}</p>}
            </div>
          </div>
        </>
      )}

      <div className="rounded-[24px] border border-border/80 bg-accent/5 px-6 py-5 text-center text-xs">
        <p className="font-semibold uppercase tracking-[0.3em] text-muted">{importantTitle}</p>
        <ul className="mt-4 space-y-2 text-foreground/80">
          {importantNotes.map((note, idx) => (
            <li key={idx} className="flex items-start justify-center gap-2">
              <span className="text-primary">·</span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
