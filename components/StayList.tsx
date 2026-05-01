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
                "group relative flex overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-accent/10 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md",
                isCompact ? "h-40" : 
                isDetailed ? "flex-col h-auto" : "flex-col justify-end h-72"
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
                 "relative bg-muted/10 transition-transform duration-700",
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
                 <div className="flex h-full w-full items-center justify-center bg-accent/5 text-accent/20">
                    <BedDouble className="h-10 w-10" />
                 </div>
               )}
               
               {/* Overlay for non-detailed variants */}
               {!isDetailed && (
                 <div className={cn(
                     "absolute inset-0 pointer-events-none",
                     "bg-gradient-to-t from-black/60 via-black/10 to-transparent"
                 )} />
               )}

               {/* Price Badge on Image for detailed, or top right for others */}
               {stay.priceRange && (
                  <div className={cn(
                    "absolute top-3 right-3 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold text-accent/90 z-10 shadow-sm border border-accent/5",
                  )}>
                    {stay.priceRange}
                  </div>
               )}
            </div>

            {/* Content */}
            <div className={cn(
                "relative z-10 flex flex-col",
                isCompact ? "p-5 justify-end h-full pointer-events-none" : 
                isDetailed ? "p-6 md:p-8 items-start text-left bg-white/40 flex-1" : "p-6 items-center text-center pointer-events-none"
            )}>
              <header className={cn(
                  "flex flex-col gap-1 w-full",
                  !isCompact && !isDetailed && "items-center"
              )}>
                <span className={cn(
                    "uppercase tracking-widest font-bold text-[9px]",
                    isCompact ? "text-white/80" : 
                    isDetailed ? "text-accent" : "text-white/80"
                )}>{stay.type}</span>
                
                <h3 className={cn(
                    "font-serif",
                    isCompact ? "text-xl leading-tight !text-white" : 
                    isDetailed ? "text-3xl text-foreground/90 mt-1" : "text-3xl !text-white"
                )}>{stay.name}</h3>
                
                {(stay.distance) && (
                  <div className={cn(
                      "flex items-center gap-1.5 font-serif italic",
                      isCompact ? "mt-1.5 text-xs text-white/90" : 
                      isDetailed ? "mt-2 text-sm text-muted" : "mt-2 text-xs justify-center text-white/90"
                  )}>
                     {stay.distance && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 opacity-70" />
                          {stay.distance}
                        </span>
                     )}
                  </div>
                )}
              </header>

              {isDetailed && stay.notes && (
                <div className="mt-8 pt-8 border-t border-accent/10 w-full">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent mb-4 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" />
                    Información Importante
                  </h4>
                  <p className="text-sm text-muted/80 leading-relaxed whitespace-pre-line italic font-serif">
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
