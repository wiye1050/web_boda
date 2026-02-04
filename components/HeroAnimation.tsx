"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export function HeroAnimation({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo-ish
      }
    },
  };

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-[calc(var(--spacing-section)*0.75)] sm:gap-10 sm:px-8 sm:py-[calc(var(--spacing-section)*1.2)]"
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }
    },
  };

  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
