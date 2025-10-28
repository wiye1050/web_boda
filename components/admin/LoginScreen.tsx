"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/admin/AuthContext";
import { LoginForm } from "@/components/admin/LoginForm";

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      const next = searchParams.get("next") ?? "/admin";
      router.replace(next);
    }
  }, [isLoading, router, searchParams, user]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
          Alba & Guille
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Acceso privado</h1>
        <p className="mt-3 text-sm text-muted">
          Introduce tus credenciales para gestionar RSVP, logística y notas
          internas de la boda.
        </p>
      </div>
      {isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
