"use client";

import { useState, useEffect } from "react";
import { Countdown } from "@/components/Countdown";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CTAButton } from "./CTAButton";

type NavItem = {
  label: string;
  href: string;
};

type TopBarProps = {
  brandName?: string;
  navItems?: NavItem[];
  ctaLabel?: string;
  config: {
    noticeText: string;
    noticeCountdownTarget: string;
  };
};

export function TopBar({ 
  brandName = "Alba & Guille", 
  navItems = [], 
  ctaLabel = "Confirmar asistencia",
  config 
}: TopBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    document.documentElement.style.setProperty("--topbar-height", "4rem");

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <motion.div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out border-b",
          isScrolled || isMobileMenuOpen
            ? "bg-surface/90 backdrop-blur-md border-border/50 shadow-sm"
            : "bg-surface/5 backdrop-blur-sm border-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* LEFT: Brand + Countdown */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="#top"
              className="relative h-10 w-auto shrink-0 transition-opacity hover:opacity-80"
            >
              <img 
                 src="/logo-ag.png" 
                 alt={brandName} 
                 className="h-full w-auto object-contain"
              />
            </Link>

            <div className="h-5 w-px bg-border/40 hidden sm:block" />

            <div className="scale-100 origin-left opacity-90 hover:opacity-100 transition-opacity">
               <Countdown target={config.noticeCountdownTarget} className="bg-accent/30 border-accent-strong/20 text-foreground !py-1.5 !px-4 !gap-2 !h-auto text-sm" /> 
            </div>
          </div>

          {/* CENTER: Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 ml-16">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.15em] text-muted transition-colors hover:bg-black/5 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT: CTA + Mobile Menu Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block">
              <CTAButton
                href="#asistencia"
                variant="primary"
                className="!h-10 !px-6 !text-xs !py-0"
              >
                {ctaLabel}
              </CTAButton>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 hover:bg-accent/40 transition-colors lg:hidden"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-foreground transition-colors" />
              ) : (
                <Menu className="h-5 w-5 text-foreground transition-colors group-hover:text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/50 bg-surface/95 backdrop-blur lg:hidden overflow-hidden"
            >
              <nav className="flex flex-col p-4 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-widest text-foreground/80 hover:bg-accent/30 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
                 <div className="pt-2 mt-2 border-t border-border/30">
                    <CTAButton
                        href="#asistencia"
                        variant="primary"
                        className="w-full"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {ctaLabel}
                    </CTAButton>
                 </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
      
      {/* Spacer */}
      <div className="h-16 w-full" />
    </>
  );
}
