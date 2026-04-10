"use client";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const half = Math.ceil(navItems.length / 2);
  const leftItems = navItems.slice(0, half);
  const rightItems = navItems.slice(half);

  return (
    <>
      <nav className={cn(
        "fixed left-0 right-0 z-[60] transition-all duration-700 pointer-events-none",
        isScrolled ? "top-3" : "top-6"
      )}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pointer-events-auto">
          <div className={cn(
            "glass rounded-full px-4 sm:px-10 py-3 shadow-premium transition-all duration-700 flex justify-between items-center",
            isScrolled ? "py-2.5 px-6 scale-[0.98] border-white/40" : "bg-white/30 backdrop-blur-md"
          )}>
            
            {/* LEFT: Nav Links (Desktop) */}
            <div className="hidden md:flex flex-1 justify-start space-x-8 lg:space-x-12">
              {leftItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative font-sans text-[10px] tracking-[0.3em] text-foreground/70 hover:text-foreground transition-colors uppercase font-bold"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-accent transition-all duration-300 group-hover:w-1/2" />
                </Link>
              ))}
            </div>

            {/* Placeholder for centering logo on mobile */}
            <div className="flex-1 md:hidden" />

            {/* CENTER: Logo */}
            <Link
              href={isHome ? "#top" : "/"}
              className="flex items-center justify-center relative group shrink-0"
            >
              <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
              <Image 
                src="/logo-ag.png" 
                alt="Alba & Guille Logo" 
                width={85}
                height={45}
                className="h-9 md:h-11 w-auto object-contain transition-all duration-500 group-hover:scale-110"
                priority
              />
            </Link>

            {/* RIGHT: Nav Links (Desktop) & Mobile Toggle */}
            <div className="flex-1 flex justify-end items-center gap-6">
              <div className="hidden md:flex space-x-8 lg:space-x-12">
                {rightItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative font-sans text-[10px] tracking-[0.3em] text-foreground/70 hover:text-foreground transition-colors uppercase font-bold"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-accent transition-all duration-300 group-hover:w-1/2" />
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-foreground/80 p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {isMobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              className="mx-auto max-w-5xl px-4 mt-3 md:hidden overflow-hidden pointer-events-auto"
            >
              <nav className="glass rounded-[2rem] p-6 shadow-premium border-white/20 flex flex-col gap-3">
                {navItems.map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-2xl px-5 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/70 hover:bg-white/40 hover:text-foreground transition-all"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Scroll indicator for the page top */}
      <div id="top-anchor" className="h-0 w-0" />
    </>
  );
}
