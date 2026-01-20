"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { firebaseSignOut } from "@/lib/firebase-auth";
import { useAuth } from "@/components/admin/AuthContext";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/plan", label: "Plan" },
  { href: "/admin/proveedores", label: "Proveedores" },
  { href: "/admin/presupuesto", label: "Presupuesto" },
  { href: "/admin/rsvps", label: "RSVPs" },
  { href: "/admin/transporte", label: "Transporte" },
  { href: "/admin/secciones", label: "Secciones" },
  { href: "/admin/privado", label: "Privado" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
      if (event.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          "button, a, input, textarea, select, [tabindex]:not([tabindex='-1'])",
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

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
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-expanded={isMenuOpen}
            aria-controls="admin-mobile-menu"
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
          >
            Menú
          </button>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
            >
              Ver web
            </Link>
            <button
              type="button"
              onClick={() => firebaseSignOut()}
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
            >
              Salir
            </button>
          </div>
        </header>
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40 flex md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de administración"
          >
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={closeMenu}
              className="absolute inset-0 bg-black/45"
            />
            <aside
              ref={drawerRef}
              id="admin-mobile-menu"
              className="relative h-full w-72 max-w-[85vw] bg-surface px-5 py-6 shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
                    Alba & Guille
                  </p>
                  <p className="mt-1 text-lg font-semibold">Panel</p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeMenu}
                  className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                >
                  Cerrar
                </button>
                </div>
              <nav className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={closeMenu}
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
                onClick={() => {
                  closeMenu();
                  firebaseSignOut();
                }}
                className="mt-6 w-full rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
              >
                Cerrar sesión
              </button>
            </aside>
          </div>
        )}
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
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
              >
                Ver web
              </Link>
              <button
                type="button"
                onClick={() => firebaseSignOut()}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
        <main className="mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
      </div>
    </div>
  );
}
