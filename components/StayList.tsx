import Image from "next/image";
import { CTAButton } from "@/components/CTAButton";
import type { Accommodation } from "@/components/admin/useAccommodations";
import { BedDouble, Check, MapPin } from "lucide-react";

type StayListProps = {
  items: Accommodation[];
  linkLabel: string;
  showViewAll?: boolean;
};

export function StayList({ items, linkLabel, showViewAll }: StayListProps) {
  return (
    <div className="flex flex-col gap-10 cursor-default">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((stay, index) => (
          <div key={stay.id || `stay-option-${index}`} className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
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
                 <Image src={stay.imageUrl} alt={stay.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" className="object-cover" />
               ) : (
                 <div className="flex h-full w-full items-center justify-center bg-accent/30 text-muted/50">
                    <BedDouble className="h-16 w-16" />
                 </div>
               )}
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

            {/* Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
               {stay.hasBlock && (
                  <div className="flex items-center gap-1 rounded-full bg-primary/95 backdrop-blur px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                    <Check className="h-3.5 w-3.5" />
                    <span>Bloqueo Especial</span>
                  </div>
               )}
               {stay.priceRange && (
                  <div className="ml-auto rounded-full bg-black/40 backdrop-blur px-3 py-1.5 text-xs font-bold text-white">
                    {stay.priceRange}
                  </div>
               )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col p-6 pointer-events-none items-center text-center">
              <header className="flex flex-col gap-1 text-white items-center">
                <span className="text-[10px] uppercase tracking-widest text-white/80 font-bold">{stay.type}</span>
                <h3 className="text-2xl font-serif text-white">{stay.name}</h3>
                
                {(stay.distance || stay.capacity) && (
                  <div className="mt-2 flex items-center justify-center gap-3 text-xs text-white/90">
                     {stay.distance && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {stay.distance}
                        </span>
                     )}
                     {stay.distance && stay.capacity && <span className="opacity-50">•</span>}
                     {stay.capacity && <span>{stay.capacity}</span>}
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
