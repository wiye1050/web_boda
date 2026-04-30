import type { PracticalItem } from "@/lib/publicContent";
import { cn } from "@/lib/utils";
import { Car, Ban, Clock, Bus, Utensils, Info } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  "🚗": Car,
  "🔞": Ban,
  "🕒": Clock,
  "🚌": Bus,
  "🍽️": Utensils,
};

type PracticalListProps = {
  items: PracticalItem[];
  variant?: "card" | "strip";
  className?: string;
};

export function PracticalList({ items, variant = "card", className }: PracticalListProps) {
  if (variant === "strip") {
    // Definimos una paleta de colores suaves para los "botones"
    const bgColors = [
      "bg-accent-bg/40 hover:bg-accent-bg/60", // Rosa palo / Crema
      "bg-emerald-50/60 hover:bg-emerald-100/70", // Verde agua
      "bg-blue-50/60 hover:bg-blue-100/70", // Azul suave
      "bg-amber-50/60 hover:bg-amber-100/70", // Arena / Oro suave
    ];

    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1", className)}>
        {items.map((item, index) => (
          <div 
            key={`${item.title}-${index}`} 
            className={cn(
              "group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default",
              bgColors[index % bgColors.length]
            )}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm transition-transform group-hover:rotate-6 text-primary/80">
              {(() => {
                const IconComponent = ICON_MAP[item.icon];
                if (IconComponent) {
                  return <IconComponent size={24} strokeWidth={1.5} />;
                }
                return <span className="text-2xl leading-none">{item.icon}</span>;
              })()}
            </div>
            <div className="flex flex-col text-left">
              <h4 className="font-semibold text-foreground text-sm tracking-tight">{item.title}</h4>
              <p className="text-[11px] leading-tight text-muted/80">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap justify-center gap-6", className)}>
      {items.map((item, index) => (
        <article
          key={`${item.title}-${index}`}
          className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 shadow-[var(--shadow-soft)] sm:p-6 w-full flex-none sm:w-[calc(50%-1.5rem)] md:w-[calc(33.333%-1.5rem)] max-w-sm text-center items-center"
        >
          <div className="text-primary/70 mb-2">
            {(() => {
              const IconComponent = ICON_MAP[item.icon];
              if (IconComponent) {
                return <IconComponent size={28} strokeWidth={1.5} />;
              }
              return <span className="text-3xl leading-none">{item.icon}</span>;
            })()}
          </div>
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="text-sm text-muted">{item.description}</p>
        </article>
      ))}
    </div>
  );
}
