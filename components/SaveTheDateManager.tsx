"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SaveTheDateManagerProps {
  children: ReactNode;
}

export function SaveTheDateManager({ children }: SaveTheDateManagerProps) {
  const [isIntroSeen, setIsIntroSeen] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check session storage
    const seen = sessionStorage.getItem("wb_save_the_date_seen");
    setIsIntroSeen(!!seen);
    
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // While checking, show a black screen to prevent website flash
  if (isIntroSeen === null || !isReady) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black" aria-hidden="true" />
    );
  }

  return (
    <>
      {/* If not seen, the site content will be rendered but might be covered by the modal in page.tsx */}
      <motion.div
        initial={isIntroSeen ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  );
}
