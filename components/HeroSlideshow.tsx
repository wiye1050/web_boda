"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type HeroSlideshowProps = {
  images: string[];
  intervalMs?: number;
  className?: string; // Container class
  imageClassName?: string; // Image specific class (e.g. object position)
};

export function HeroSlideshow({
  images,
  intervalMs = 8000,
  className,
  imageClassName,
}: HeroSlideshowProps) {
  const [index, setIndex] = useState(0);
  const [invalidImages, setInvalidImages] = useState<string[]>([]);

  const normalizedImages = useMemo(
    () => images.filter((src) => typeof src === "string" && src.trim().length > 0),
    [images],
  );

  const availableImages = useMemo(
    () => normalizedImages.filter((src) => !invalidImages.includes(src)),
    [invalidImages, normalizedImages],
  );

  useEffect(() => {
    if (availableImages.length < 2) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % availableImages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [availableImages.length, intervalMs]);

  const handleImageError = (src: string) => {
    setInvalidImages((prev) => (prev.includes(src) ? prev : [...prev, src]));
  };

  if (availableImages.length === 0) return null;

  return (
    <div
      className={[
        "absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.img
          key={availableImages[index]}
          src={availableImages[index]}
          alt=""
          initial={{ opacity: 0, scale: 1.0 }}
          animate={{ opacity: 1, scale: 1.1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.5, ease: "easeInOut" },
            scale: { duration: intervalMs / 1000 + 1, ease: "linear" }, // Move slightly longer than interval to avoid stop
          }}
          className={`absolute inset-0 h-full w-full object-cover ${imageClassName ?? ""}`}
          onError={() => handleImageError(availableImages[index])}
        />
      </AnimatePresence>
      
      {/* Overlay gradiente oscuro solicitado */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60" />
    </div>
  );
}

