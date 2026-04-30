import Image from "next/image";
import { CTAButton } from "@/components/CTAButton";
import type { Accommodation } from "@/components/admin/useAccommodations";
import { BedDouble, Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type StayListProps = {
  items: Accommodation[];
  linkLabel: string;
  showViewAll?: boolean;
  variant?: "default" | "minimal" | "compact" | "detailed";
};

export function StayList({ items, linkLabel, showViewAll, variant = "default" }: StayListProps) {
  const isMinimal = variant === "minimal";
  const isCompact = variant === "compact";
  const isDetailed = variant === "detailed";
  
  return (
    <div className="flex flex-col gap-10 cursor-default">
      <div className={cn(
        "grid gap-6",
        isMinimal || isCompact ? "grid-cols-1 sm:grid-cols-2" : 
        isDetailed ? "grid-cols-1 md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"
      )}>
        {items.map((stay, index) => (
          <div 
            key={stay.id || `stay-option-${index}`} 
            className={cn(
                "group relative flex overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-md",
                isCompact ? "h-40" : 
                isDetailed ? "flex-col h-auto border border-border/40" : "flex-col justify-end h-72"
            )}
          >
            {stay.link && !isDetailed ? (
               <a href={stay.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20">
                 <span className="sr-only">Reservar en {stay.name}</span>
               </a>
            ) : null}

            {/* Background Image / Header Image */}
            <div 
               className={cn(
                 "relative bg-muted/20 transition-transform duration-700",
                 isDetailed ? "h-64 overflow-hidden" : "absolute inset-0 group-hover:scale-105"
               )}
            >
               {stay.imageUrl ? (
                 <Image 
                    src={stay.imageUrl} 
                    alt={stay.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw" 
                    className={cn(
                      "object-cover",
                      isDetailed && "group-hover:scale-105 transition-transform duration-700"
                    )} 
                 />
               ) : (
                 <div className="flex h-full w-full items-center justify-center bg-accent/30 text-muted/50">
                    <BedDouble className="h-12 w-12" />
                 </div>
               )}
               
               {/* Overlay for non-detailed variants */}
               {!isDetailed && (
                 <div className={cn(
                     "absolute inset-0 pointer-events-none",
                     isCompact 
                         ? "bg-gradient-to-t from-black/80 via-black/20 to-transparent" 
                         : "bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                 )} />
               )}

               {/* Price Badge on Image for detailed, or top right for others */}
               {stay.priceRange && (
                  <div className={cn(
                    "absolute top-3 right-3 rounded-full bg-black/40 backdrop-blur px-2.5 py-1 text-[9px] font-bold text-white z-10",
                  )}>
                    {stay.priceRange}
                  </div>
               )}
            </div>

            {/* Content */}
            <div className={cn(
                "relative z-10 flex flex-col",
                isCompact ? "p-4 justify-end h-full pointer-events-none" : 
                isDetailed ? "p-8 items-start text-left bg-surface flex-1" : "p-6 items-center text-center pointer-events-none"
            )}>
              <header className={cn(
                  "flex flex-col gap-1 w-full",
                  !isCompact && !isDetailed && "items-center"
              )}>
                <span className={cn(
                    "uppercase tracking-widest font-bold",
                    isCompact ? "text-[8px] text-white/70" : 
                    isDetailed ? "text-[10px] text-accent" : "text-[10px] text-white/70"
                )}>{stay.type}</span>
                
                <h3 className={cn(
                    "font-serif",
                    isCompact ? "text-base leading-tight !text-white" : 
                    isDetailed ? "text-2xl text-foreground/90 mt-1" : "text-2xl !text-white"
                )}>{stay.name}</h3>
                
                {(stay.distance) && (
                  <div className={cn(
                      "flex items-center gap-1.5",
                      isCompact ? "mt-1 text-[10px] text-white/90" : 
                      isDetailed ? "mt-2 text-sm text-muted" : "mt-2 text-xs justify-center text-white/90"
                  )}>
                     {stay.distance && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {stay.distance}
                        </span>
                     )}
                  </div>
                )}
              </header>

              {isDetailed && stay.notes && (
                <div className="mt-8 pt-8 border-t border-border/40 w-full">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent mb-4 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" />
                    Información Importante
                  </h4>
                  <p className="text-sm text-muted/80 leading-relaxed whitespace-pre-line italic">
                    {stay.notes}
                  </p>
                </div>
              )}

              {isDetailed && stay.link && (
                <div className="mt-8 w-full">
                   <CTAButton
                      href={stay.link}
                      variant="primary"
                      className="w-full tracking-[0.2em] font-bold uppercase text-[10px]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {linkLabel}
                    </CTAButton>
                </div>
              )}
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
