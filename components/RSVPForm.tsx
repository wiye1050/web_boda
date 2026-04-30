// Componente cliente porque interactúa con Firestore y maneja estado de UI.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { firebaseClient } from "@/lib/firebase";
import { DEFAULT_PUBLIC_CONTENT, type RsvpFormCopy } from "@/lib/publicContent";
import { sendConfirmationEmail } from "@/app/actions/sendConfirmation";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
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
  dietary: string;
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
  dietary: "",
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
      const docRef = await addDoc(collection(db, "rsvps"), {
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
        dietary: form.dietary.trim(),
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

        // Feedback háptico premium si está disponible
        if (typeof window !== "undefined" && window.navigator.vibrate) {
          window.navigator.vibrate([50, 30, 50]);
        }
      }
      
      const formPayload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        guests: attending ? guestsNumber : 0,
        attendance: form.attendance!,
        transport: (form.needsTransport ?? "no") as "si" | "no",
        rsvpId: docRef.id
      };

      setForm(INITIAL_STATE);
      lastSubmittedAt.current = Date.now();
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          LOCAL_COOLDOWN_KEY,
          String(lastSubmittedAt.current),
        );
      }

      try {
        await sendConfirmationEmail(formPayload);
      } catch (e) {
        console.error("Non-critical email error:", e);
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
      className="mx-auto flex w-full max-w-3xl flex-col gap-8 md:gap-10 glass rounded-[3rem] p-6 md:p-14 shadow-premium text-center border-white/40"
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
        <div className="flex flex-col items-center justify-center gap-8 rounded-[2rem] bg-accent/5 p-10 text-center shadow-inner border border-accent/10 animate-in fade-in zoom-in duration-700">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/20 text-accent shadow-premium relative">
            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse" />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-12 w-12 z-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-3xl font-serif text-foreground">¡Gracias {submittedInfo.fullName.split(" ")[0]}!</h3>
            <p className="mt-3 text-sm tracking-wide text-foreground/60 max-w-xs mx-auto">Tu confirmación ha sido guardada con éxito en nuestra lista mágica.</p>
          </div>
          <div className="w-full max-w-sm rounded-[2rem] bg-white/40 p-8 text-foreground/80 shadow-premium border border-white/40 backdrop-blur-md">
            <ul className="space-y-4 text-sm text-center">
              <li className="flex justify-between border-b border-black/5 pb-4">
                <span className="font-sans font-semibold uppercase tracking-widest text-[11px] md:text-xs opacity-40">Asistencia</span>
                <span className="font-serif italic text-base">{submittedInfo.attendance === "si" ? "Estaré ahí" : "No podré"}</span>
              </li>
              {submittedInfo.attendance === "si" && (
                <>
                  <li className="flex justify-between border-b border-black/5 pb-4">
                    <span className="font-sans font-semibold uppercase tracking-widest text-[11px] md:text-xs opacity-40">Personas</span>
                    <span className="font-serif italic text-base">{submittedInfo.guests}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-sans font-semibold uppercase tracking-widest text-[11px] md:text-xs opacity-40">Bus</span>
                    <span className="font-serif italic text-base">{submittedInfo.needsTransport === "si" ? "Sí" : "No"}</span>
                  </li>
                </>
              )}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => { setSubmittedInfo(null); setStatus("idle"); }}
            className="mt-4 text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-accent hover:opacity-70 transition-opacity"
          >
            Editar respuesta
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:gap-10 md:grid-cols-2">
            <label className="flex flex-col gap-3 text-center">
              <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-foreground/50">{copy.fullNameLabel}</span>
              <input 
                name="fullName" 
                autoComplete="name" 
                required 
                value={form.fullName} 
                onChange={(e) => handleChange("fullName", e.target.value)} 
                placeholder={copy.fullNamePlaceholder} 
                className="placeholder:text-foreground/30 rounded-2xl border border-black/5 bg-white/40 px-6 py-4 text-sm text-foreground shadow-sm outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-accent/20 text-center font-serif italic text-lg lg:text-xl" 
              />
            </label>
            <label className="flex flex-col gap-3 text-center">
              <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-foreground/50">{copy.emailLabel}</span>
              <input 
                type="email" 
                name="email" 
                autoComplete="email" 
                inputMode="email"
                value={form.email} 
                onChange={(e) => handleChange("email", e.target.value)} 
                placeholder={copy.emailPlaceholder} 
                className="placeholder:text-foreground/30 rounded-2xl border border-black/5 bg-white/40 px-6 py-4 text-sm text-foreground shadow-sm outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-accent/20 text-center font-serif italic text-lg lg:text-xl" 
              />
              {!emailValid && form.email.length > 0 && <span className="text-xs text-primary">{copy.emailError}</span>}
            </label>
            <label className="flex flex-col gap-3 text-center">
              <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-foreground/50">{copy.phoneLabel}</span>
              <input 
                type="tel" 
                name="phone" 
                autoComplete="tel" 
                inputMode="tel"
                required 
                value={form.phone} 
                onChange={(e) => handleChange("phone", e.target.value)} 
                placeholder={copy.phonePlaceholder} 
                className="placeholder:text-foreground/30 rounded-2xl border border-black/5 bg-white/40 px-6 py-4 text-sm text-foreground shadow-sm outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-accent/20 text-center font-serif italic text-lg lg:text-xl" 
              />
              {!phoneValid && form.phone.length > 0 && <span className="text-xs text-primary">{copy.phoneError}</span>}
            </label>
            <fieldset className="flex flex-col gap-5 rounded-[2rem] border border-black/5 bg-white/20 px-6 py-6 text-center shadow-inner">
              <legend className="mx-auto text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-foreground/50 px-4">{copy.attendanceLegend}</legend>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap justify-center">
                {["si", "no"].map((val) => (
                  <label 
                    key={val} 
                    className={cn(
                      "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-6 py-4 text-xs uppercase tracking-[0.2em] transition-all cursor-pointer font-bold",
                      form.attendance === val 
                        ? "border-accent bg-accent text-white shadow-premium" 
                        : "border-black/5 bg-white/40 text-foreground/50 hover:bg-white/60"
                    )}
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
            <div className="grid gap-8 md:gap-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="grid gap-6 md:gap-10 md:grid-cols-2">
                <label className="flex flex-col gap-4 text-center">
                  <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-foreground/50">{copy.guestsLabel}</span>
                  <input name="guests" inputMode="numeric" min={1} required value={form.guests} onChange={(e) => handleChange("guests", e.target.value)} placeholder={copy.guestsPlaceholderYes} className="placeholder:text-foreground/30 rounded-2xl border border-black/5 bg-white/40 px-6 py-4 text-xl text-foreground font-serif italic shadow-sm outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-accent/20 text-center max-w-[120px] mx-auto" />
                  <span className="text-[11px] md:text-xs tracking-wider text-foreground/40">{copy.guestsHelper}</span>
                  {showGuestError && <span className="text-xs text-primary">{copy.guestsError}</span>}
                </label>
                <label className="flex flex-col gap-3 text-center">
                  <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-foreground/50">{copy.guestNamesLabel}</span>
                  <textarea name="guestNames" value={form.guestNames} onChange={(e) => handleChange("guestNames", e.target.value)} rows={2} placeholder={copy.guestNamesPlaceholder} className="min-h-[80px] rounded-[2rem] border border-black/5 bg-white/40 px-6 py-5 text-sm text-foreground font-serif italic shadow-sm outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-accent/20 text-center" />
                </label>
              </div>

              <div id="rsvp-advanced" className="grid gap-6 md:gap-10 rounded-[3rem] border border-black/5 bg-black/[0.02] p-6 md:p-8 md:grid-cols-2 text-center shadow-inner">
                <fieldset className="flex flex-col gap-5 rounded-[2rem] border border-black/5 bg-white/20 px-6 py-6 text-center">
                  <legend className="mx-auto text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-foreground/50 px-4">{copy.prebodaLegend}</legend>
                  <div className="flex gap-3 justify-center">
                    {["si", "no"].map((val) => (
                      <label key={val} className={cn(
                        "flex-1 rounded-xl border px-5 py-3 text-[11px] md:text-xs uppercase font-bold tracking-widest cursor-pointer transition-all",
                        form.preboda === val ? "border-accent bg-accent text-white shadow-premium" : "border-black/5 bg-white/40 text-foreground/40"
                      )}>
                        <input className="sr-only" type="radio" name="preboda" value={val} checked={form.preboda === val} onChange={(e) => handleChange("preboda", e.target.value as FormState["preboda"])} />
                        {val === "si" ? "Sí" : "No"}
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] md:text-xs text-foreground/40 italic leading-snug">{copy.prebodaNote}</p>
                </fieldset>

                <fieldset className="flex flex-col gap-5 rounded-[2rem] border border-black/5 bg-white/20 px-6 py-6 text-center">
                  <legend className="mx-auto text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-foreground/50 px-4">{copy.transportLegend}</legend>
                  <div className="flex gap-3 justify-center">
                    {["no", "si"].map((val) => (
                      <label key={val} className={cn(
                        "flex-1 rounded-xl border px-5 py-3 text-[11px] md:text-xs uppercase font-bold tracking-widest cursor-pointer transition-all",
                        form.needsTransport === val ? "border-accent bg-accent text-white shadow-premium" : "border-black/5 bg-white/40 text-foreground/40"
                      )}>
                        <input className="sr-only" type="radio" name="needsTransport" value={val} checked={form.needsTransport === val} onChange={(e) => handleChange("needsTransport", e.target.value as FormState["needsTransport"])} />
                        {val === "si" ? "Sí" : "No"}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {form.needsTransport === "si" && (
                  <label className="flex flex-col gap-4 text-center md:col-span-2 py-4">
                    <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-foreground/50">{copy.transportSeatsLabel}</span>
                    <input name="transportSeats" inputMode="numeric" min={1} required value={form.transportSeats} onChange={(e) => handleChange("transportSeats", e.target.value)} placeholder={copy.transportSeatsPlaceholder} className="placeholder:text-foreground/30 rounded-2xl border border-black/5 bg-white/40 px-6 py-4 text-xl text-foreground font-serif italic shadow-sm outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-accent/20 text-center mx-auto max-w-[140px]" />
                    {showSeatsError && <span className="text-xs text-primary">{copy.transportSeatsError}</span>}
                  </label>
                )}

                <label className="flex flex-col gap-4 text-center md:col-span-2">
                  <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-foreground/50">Restricciones alimenticias</span>
                  <textarea name="dietary" value={form.dietary} onChange={(e) => handleChange("dietary", e.target.value)} rows={2} placeholder="Alergias, veganismo..." className="rounded-[2rem] border border-black/5 bg-white/40 px-6 py-5 text-sm text-foreground font-serif italic shadow-sm outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-accent/20 text-center min-h-[100px]" />
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-8 md:gap-10">
            <label className="flex items-start gap-4 rounded-[2rem] border border-black/5 bg-black/[0.02] px-6 md:px-8 py-6 text-sm text-left max-w-xl cursor-pointer transition-all hover:bg-black/[0.04] shadow-inner group">
              <div className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white transition-all group-hover:border-accent/40 shadow-sm">
                <input type="checkbox" required className="peer sr-only" checked={form.acceptedTerms} onChange={(e) => handleChange("acceptedTerms", e.target.checked)} />
                <div className="absolute inset-0 rounded-lg bg-accent opacity-0 transition-opacity peer-checked:opacity-100" />
                <Check className="relative z-10 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
              </div>
              <span className="text-[11px] md:text-[12px] font-medium text-foreground/50 leading-relaxed uppercase tracking-widest">Acepto que Alba & Guille guarden mis datos para la organización de la boda según la <span className="text-foreground/80 underline underline-offset-4 decoration-accent/40">política de privacidad</span>.</span>
            </label>

            <div className="flex flex-col items-center gap-6 w-full">
              <button 
                type="submit" 
                disabled={!isValid || status === "loading"} 
                className={cn(
                  "relative inline-flex w-full items-center justify-center rounded-full bg-accent px-12 py-5 text-xs font-bold uppercase tracking-[0.4em] text-white transition-all shadow-premium active:scale-95 group md:w-auto",
                  (!isValid || status === "loading") ? "opacity-40 grayscale" : "hover:scale-[1.03] hover:-translate-y-1"
                )}
              >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transition-all duration-700 w-0 group-hover:w-full" />
                {status === "loading" ? copy.submitLoadingLabel : copy.submitLabel}
              </button>
              {status === "error" && errorMessage && <p className="text-xs text-primary font-bold tracking-widest uppercase">{errorMessage}</p>}
            </div>
          </div>
        </>
      )}

      <div className="rounded-[3rem] border border-black/5 bg-black/[0.03] px-8 py-8 text-center shadow-inner">
        <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.4em] text-foreground/40 mb-6">{importantTitle}</p>
        <ul className="space-y-4 text-xs">
          {importantNotes.map((note, idx) => (
            <li key={idx} className="flex items-center justify-center gap-4 text-foreground/60 italic font-serif text-base">
              <span className="h-[1px] w-4 bg-accent/30 hidden md:block" />
              {note}
              <span className="h-[1px] w-4 bg-accent/30 hidden md:block" />
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
