import Image from "next/image";
import { CTAButton } from "@/components/CTAButton";
import type { Accommodation } from "@/components/admin/useAccommodations";
import { BedDouble, Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type StayListProps = {
  items: Accommodation[];
  linkLabel: string;
  showViewAll?: boolean;
  variant?: "default" | "minimal" | "compact";
};

export function StayList({ items, linkLabel, showViewAll, variant = "default" }: StayListProps) {
  const isMinimal = variant === "minimal";
  const isCompact = variant === "compact";
  
  return (
    <div className="flex flex-col gap-10 cursor-default">
      <div className={cn(
        "grid gap-4",
        isMinimal || isCompact ? "grid-cols-1 sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"
      )}>
        {items.map((stay, index) => (
          <div 
            key={stay.id || `stay-option-${index}`} 
            className={cn(
                "group relative flex overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-md",
                isCompact ? "h-40" : "flex-col justify-end h-72"
            )}
          >
            {stay.link ? (
               <a href={stay.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20">
                 <span className="sr-only">Reservar en {stay.name}</span>
               </a>
            ) : null}

            {/* Background Image */}
            <div 
               className="absolute inset-0 bg-muted/20 transition-transform duration-700 group-hover:scale-105"
            >
               {stay.imageUrl ? (
                 <Image 
                    src={stay.imageUrl} 
                    alt={stay.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw" 
                    className="object-cover" 
                 />
               ) : (
                 <div className="flex h-full w-full items-center justify-center bg-accent/30 text-muted/50">
                    <BedDouble className="h-12 w-12" />
                 </div>
               )}
            </div>
            
            {/* Overlay */}
            <div className={cn(
                "absolute inset-0 pointer-events-none",
                isCompact 
                    ? "bg-gradient-to-t from-black/80 via-black/20 to-transparent" 
                    : "bg-gradient-to-t from-black/70 via-black/30 to-transparent"
            )} />

            {/* Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
               {stay.priceRange && (
                  <div className="ml-auto rounded-full bg-black/40 backdrop-blur px-2.5 py-1 text-[9px] font-bold text-white">
                    {stay.priceRange}
                  </div>
               )}
            </div>

            {/* Content */}
            <div className={cn(
                "relative z-10 flex flex-col pointer-events-none",
                isCompact ? "p-4 justify-end h-full" : "p-6 items-center text-center"
            )}>
              <header className={cn(
                  "flex flex-col gap-0.5 text-white",
                  !isCompact && "items-center"
              )}>
                <span className={cn(
                    "uppercase tracking-widest text-white/70 font-bold",
                    isCompact ? "text-[8px]" : "text-[10px]"
                )}>{stay.type}</span>
                <h3 className={cn(
                    "font-serif !text-white",
                    isCompact ? "text-base leading-tight" : "text-2xl"
                )}>{stay.name}</h3>
                
                {(stay.distance) && (
                  <div className={cn(
                      "flex items-center gap-1.5 text-white/90",
                      isCompact ? "mt-1 text-[10px]" : "mt-2 text-xs justify-center"
                  )}>
                     {stay.distance && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {stay.distance}
                        </span>
                     )}
                  </div>
                )}
              </header>
            </div>
          </div>
        ))}
      </div>
      
      {showViewAll && (
        <div className="flex justify-center pt-4">
           <CTAButton
              href="/alojamientos"
              variant="primary"
              className="tracking-[0.2em] font-bold uppercase text-[10px] px-8"
              prefetch={false}
            >
              Ver todas las opciones de alojamiento
            </CTAButton>
        </div>
      )}
    </div>
  );
}
