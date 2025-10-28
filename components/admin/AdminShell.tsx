"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { firebaseSignOut } from "@/lib/firebase-auth";
import { useAuth } from "@/components/admin/AuthContext";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/rsvps", label: "RSVPs" },
  { href: "/admin/transporte", label: "Transporte" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden w-64 flex-col bg-surface/95 px-6 py-8 shadow-lg shadow-black/5 md:flex">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
            Alba & Guille
          </p>
          <p className="mt-1 text-xl font-semibold">Panel de control</p>
        </div>
        <nav className="flex flex-col gap-2">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted hover:bg-accent hover:text-foreground",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => firebaseSignOut()}
          className="mt-auto rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
        >
          Cerrar sesión
        </button>
      </aside>
      <div className="flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/80 bg-surface/90 px-5 py-4 backdrop-blur md:hidden">
          <h1 className="text-sm font-semibold uppercase tracking-[0.4em] text-muted">
            Panel
          </h1>
          <button
            type="button"
            onClick={() => firebaseSignOut()}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
          >
            Salir
          </button>
        </header>
        <div className="sticky top-0 z-10 hidden border-b border-border/70 bg-background/80 backdrop-blur md:block">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Sesión activa
              </span>
              <span className="text-sm font-medium text-foreground">
                {user?.email ?? "Usuario sin correo"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => firebaseSignOut()}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
        <main className="mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
      </div>
    </div>
  );
}
