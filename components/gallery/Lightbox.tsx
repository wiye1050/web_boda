"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

type LightboxProps = {
  src: string | null;
  alt?: string;
  onClose: () => void;
};

export function Lightbox({ src, alt = "Full size", onClose }: LightboxProps) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <button
            className="absolute right-4 top-4 p-2 text-white/50 transition hover:text-white"
            onClick={onClose}
          >
            <X size={32} />
          </button>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative h-[90vh] w-[90vw] overflow-hidden rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
