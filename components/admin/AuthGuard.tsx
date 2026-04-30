"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";

export function AuthGuard({
  children,
  redirectTo = "/admin/login",
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  const isAuthorized = useMemo(() => isAdmin, [isAdmin]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace(`${redirectTo}?next=${encodeURIComponent(pathname)}`);
      setIsChecking(false);
      return;
    }

    if (!isAuthorized) {
      router.replace("/admin/no-autorizado");
      setIsChecking(false);
      return;
    }

    if (isChecking) {
      setIsChecking(false);
    }
  }, [isLoading, isAuthorized, pathname, redirectTo, router, user, isChecking]);

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
