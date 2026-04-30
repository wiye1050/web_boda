"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Map as MapIcon, MousePointer2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MapboxMap = dynamic(() => import("@/components/MapboxMap").then(mod => mod.MapboxMap), { ssr: false });

export function MapInteractive({ 
  mapboxToken, 
  embedUrl,
  category = "all"
}: { 
  mapboxToken?: string; 
  embedUrl?: string;
  category?: "all" | "accommodation" | "tourism" | "hair" | "makeup"
}) {
  const [isMapActive, setIsMapActive] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] glass shadow-premium h-[420px] lg:h-[500px]">
      {!isMapActive && (
        <div 
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[2px] cursor-pointer group/shield"
          onClick={() => setIsMapActive(true)}
        >
          <div className="flex flex-col items-center gap-4 rounded-3xl glass px-8 py-6 shadow-2xl group-hover/shield:scale-105 transition-transform duration-500">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <MapIcon className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-foreground">Mapa Interactivo</p>
              <p className="text-xs text-foreground/50 flex items-center justify-center gap-1.5 mt-1">
                <MousePointer2 className="h-3 w-3" /> Toca para explorar
              </p>
            </div>
          </div>
        </div>
      )}
      
      {isMapActive && (
        <button 
          onClick={() => setIsMapActive(false)}
          className="absolute top-6 left-6 z-20 flex h-12 w-12 items-center justify-center rounded-full glass shadow-lg hover:scale-110 transition-all text-foreground bg-white/80"
        >
          <X className="h-6 w-6" />
        </button>
      )}
      
      <div className={cn("h-full w-full transition-all duration-700", !isMapActive && "pointer-events-none opacity-60 grayscale-[50%]")}>
        <Suspense fallback={<div className="h-full w-full bg-muted animate-pulse" />}>
          {isMapActive ? (
            mapboxToken ? (
              <MapboxMap category={category} />
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null
          ) : (
            <div className="h-full w-full bg-muted/20" />
          )}
        </Suspense>
      </div>
    </div>
  );
}
