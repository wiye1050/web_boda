"use client";

import { useEffect } from "react";
import { CTAButton } from "@/components/CTAButton";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
         <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-10 w-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      
      <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Vaya, algo no ha salido como esperábamos
      </h2>
      <p className="mt-4 max-w-md text-muted">
        Ha ocurrido un error inesperado al cargar la página. No te preocupes, puedes intentar recargarla.
      </p>
      
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:scale-105 hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Intentar de nuevo
        </button>
        <CTAButton href="/" variant="outline">
          Volver al inicio
        </CTAButton>
      </div>

      <p className="mt-8 text-xs text-muted/60">
        Si el problema persiste, contacta con nosotros por WhatsApp.
      </p>
    </div>
  );
}
