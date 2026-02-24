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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    document.documentElement.style.setProperty("--topbar-height", "0rem");

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const half = Math.ceil(navItems.length / 2);
  const leftItems = navItems.slice(0, half);
  const rightItems = navItems.slice(half);

  return (
    <>
      <nav className={cn(
        "fixed top-6 left-0 right-0 z-50 transition-all duration-300 pointer-events-none",
        isScrolled ? "top-2" : "top-6"
      )}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-full px-4 sm:px-8 py-3 shadow-sm border border-gray-100 flex justify-between items-center transition-all">
            
            {/* LEFT: Nav Links (Desktop) */}
            <div className="hidden md:flex flex-1 justify-start space-x-6 lg:space-x-8">
              {leftItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-serif text-[10px] lg:text-[11px] tracking-[0.15em] text-foreground hover:text-primary transition-colors uppercase font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* CENTER: Logo */}
            <Link
              href={isHome ? "#top" : "/"}
              className="mx-4 md:mx-0 flex items-center justify-center relative group shrink-0"
            >
              <Image 
                src="/logo-ag.png" 
                alt="Alba & Guille Logo" 
                width={80}
                height={40}
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                priority
              />
            </Link>

            {/* RIGHT: Nav Links (Desktop) */}
            <div className="hidden md:flex flex-1 justify-end space-x-6 lg:space-x-8">
              {rightItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-serif text-[10px] lg:text-[11px] tracking-[0.15em] text-foreground hover:text-primary transition-colors uppercase font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-foreground ml-auto p-1"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
              className="mx-auto max-w-6xl px-4 mt-2 md:hidden overflow-hidden pointer-events-auto"
            >
              <nav className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-gray-100 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 text-xs font-bold uppercase tracking-widest text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                 <div className="pt-2 mt-2 border-t border-border/10">
                    <Link
                        href="#asistencia"
                        className="flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg transition-transform hover:scale-[1.02]"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {ctaLabel}
                    </Link>
                 </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Spacer - reduced since navbar is floating */}
      <div className="h-4 w-full" />
    </>
  );
}
