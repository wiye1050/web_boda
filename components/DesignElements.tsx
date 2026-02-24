"use client";

import Image from "next/image";

export function FloralOrnament({ className = "", position = "top-left", opacity = 0.2 }: { className?: string, position?: "top-left" | "top-right" | "bottom-left" | "bottom-right", opacity?: number }) {
  const positionClasses = {
    "top-left": "top-0 left-0 -translate-x-10 -translate-y-10 rotate-180",
    "top-right": "top-20 right-0 translate-x-10",
    "bottom-left": "bottom-20 left-0 -translate-x-10 rotate-12",
    "bottom-right": "bottom-0 right-0 translate-x-10 translate-y-10",
  };

  return (
    <div className={`absolute pointer-events-none select-none outline-floral ${positionClasses[position]} ${className}`} style={{ opacity }}>
      <Image
        src="/floral-ornament.png"
        alt="Decoración floral magnolia"
        width={384}
        height={384}
        className="w-64 md:w-96 transition-opacity"
      />
    </div>
  );
}



export function BrushPhoto({ src, alt, className = "" }: { src: string, alt: string, className?: string }) {
  return (
    <div className={`relative w-64 h-64 md:w-96 md:h-96 mx-auto mask-brush bg-gray-200 flex items-center justify-center overflow-hidden shadow-2xl ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transform scale-110"
      />
    </div>
  );
}
