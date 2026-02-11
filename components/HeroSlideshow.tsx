"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type HeroSlideshowProps = {
  images: string[];
  intervalMs?: number;
  className?: string; // Container class
  imageClassName?: string; // Image specific class (e.g. object position)
};

const FADE_DURATION_MS = 1200;

export function HeroSlideshow({
  images,
  intervalMs = 8000,
  className,
  imageClassName,
}: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [invalidImages, setInvalidImages] = useState<string[]>([]);
  const currentIndexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizedImages = useMemo(
    () => images.filter((src) => typeof src === "string" && src.trim().length > 0),
    [images],
  );

  const availableImages = useMemo(
    () => normalizedImages.filter((src) => !invalidImages.includes(src)),
    [invalidImages, normalizedImages],
  );

  useEffect(() => {
    if (invalidImages.length > 0) {
      setInvalidImages([]);
    }
  }, [normalizedImages, invalidImages.length]);

  useEffect(() => {
    if (availableImages.length === 0) return;
    const clampedCurrent = Math.min(currentIndexRef.current, availableImages.length - 1);
    const nextSafe =
      availableImages.length > 1 ? (clampedCurrent + 1) % availableImages.length : 0;
    setCurrentIndex(clampedCurrent);
    setNextIndex(nextSafe);
    setIsFading(false);
    currentIndexRef.current = clampedCurrent;
  }, [availableImages.length]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (availableImages.length < 2) {
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
  }, [availableImages.length, intervalMs]);

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
    const image = new window.Image();
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
      <Image
        src={currentImage}
        alt=""
        aria-hidden
        priority={isInitialImage}
        fill
        sizes="100vw"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${imageClassName ?? ""}`}
        style={{ opacity: isFading ? 0 : 1 }}
        onError={() => handleImageError(currentImage)}
      />
      <Image
        src={upcomingImage}
        alt=""
        aria-hidden
        loading="lazy"
        fill
        sizes="100vw"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${imageClassName ?? ""}`}
        style={{ opacity: isFading ? 1 : 0 }}
        onError={() => handleImageError(upcomingImage)}
      />
    </div>
  );
}
