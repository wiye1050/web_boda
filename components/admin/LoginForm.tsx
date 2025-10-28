"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { emailPasswordSignIn } from "@/lib/firebase-auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await emailPasswordSignIn({ email, password });
      const next = searchParams.get("next") ?? "/admin";
      router.replace(next);
    } catch (err) {
      console.error(err);
      setError("No pudimos iniciar sesión. Revisa tus credenciales.");
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6 rounded-[24px] border border-border/80 bg-surface/95 p-8 shadow-[var(--shadow-soft)]"
    >
      <div className="flex flex-col gap-2 text-left">
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-muted"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@tuboda.com"
          className="rounded-full border border-border/80 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="flex flex-col gap-2 text-left">
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-muted"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Ingresa tu contraseña"
          className="rounded-full border border-border/80 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>
      {error && <p className="text-xs text-primary">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Accediendo..." : "Entrar"}
      </button>
    </form>
  );
}
