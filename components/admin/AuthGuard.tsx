"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";

const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function isEmailAllowed(email: string | null | undefined) {
  if (!email) return false;
  if (allowedEmails.length === 0) return true;
  return allowedEmails.includes(email.toLowerCase());
}

export function AuthGuard({
  children,
  redirectTo = "/admin/login",
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  const isAuthorized = useMemo(
    () => !!user && isEmailAllowed(user.email),
    [user],
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace(`${redirectTo}?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isAuthorized) {
      router.replace("/admin/no-autorizado");
      return;
    }

    setIsChecking(false);
  }, [isLoading, isAuthorized, pathname, redirectTo, router, user]);

  if (isLoading || isChecking) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-muted">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="text-sm uppercase tracking-[0.3em]">Verificando acceso</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
