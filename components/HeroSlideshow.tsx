"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type HeroSlideshowProps = {
  images: string[];
  intervalMs?: number;
  className?: string;
};

const FADE_DURATION_MS = 1200;

export function HeroSlideshow({
  images,
  intervalMs = 8000,
  className,
}: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [invalidImages, setInvalidImages] = useState<string[]>([]);
  const currentIndexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizedImages = useMemo(
    () => images.filter((src) => typeof src === "string" && src.trim().length > 0),
    [images],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(media.matches);
    handleChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const availableImages = useMemo(
    () => normalizedImages.filter((src) => !invalidImages.includes(src)),
    [invalidImages, normalizedImages],
  );

  useEffect(() => {
    setInvalidImages([]);
  }, [normalizedImages]);

  useEffect(() => {
    if (availableImages.length === 0) return;
    setCurrentIndex(0);
    setNextIndex(availableImages.length > 1 ? 1 : 0);
    setIsFading(false);
    currentIndexRef.current = 0;
  }, [availableImages.length]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (availableImages.length < 2 || prefersReducedMotion) {
      return;
    }

    const intervalId = setInterval(() => {
      const next = (currentIndexRef.current + 1) % availableImages.length;
      setNextIndex(next);
      setIsFading(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex(next);
        setIsFading(false);
        currentIndexRef.current = next;
      }, FADE_DURATION_MS);
    }, Math.max(intervalMs, 2000));

    return () => {
      clearInterval(intervalId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [availableImages.length, intervalMs, prefersReducedMotion]);

  const hasImages = availableImages.length > 0;
  const currentImage = hasImages
    ? availableImages[currentIndex] ?? availableImages[0]
    : "";
  const upcomingImage = hasImages
    ? availableImages[nextIndex] ??
      availableImages[currentIndex] ??
      availableImages[0]
    : "";

  useEffect(() => {
    if (!upcomingImage) return;
    const image = new Image();
    image.src = upcomingImage;
  }, [upcomingImage]);

  const handleImageError = (src: string) => {
    setInvalidImages((prev) => (prev.includes(src) ? prev : [...prev, src]));
  };

  const isInitialImage = currentIndex === 0;

  if (!hasImages) {
    return null;
  }

  return (
    <div
      className={[
        "absolute inset-0 z-0 overflow-hidden pointer-events-none",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={currentImage}
        alt=""
        aria-hidden
        loading="eager"
        fetchPriority={isInitialImage ? "high" : "auto"}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out"
        style={{ opacity: isFading ? 0 : 1 }}
        onError={() => handleImageError(currentImage)}
      />
      <img
        src={upcomingImage}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out"
        style={{ opacity: isFading ? 1 : 0 }}
        onError={() => handleImageError(upcomingImage)}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(0,0,0,0.35),_transparent_55%),radial-gradient(circle_at_80%_20%,_rgba(0,0,0,0.15),_transparent_60%)]" />
    </div>
  );
}
