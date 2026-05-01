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
    return (
      <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2", className)}>
        {items.map((item, index) => (
          <div 
            key={`${item.title}-${index}`} 
            className={cn(
              "group flex items-start gap-4 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default",
              "bg-white/60 backdrop-blur-sm border border-accent/10 shadow-sm"
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/5 text-accent/80 transition-transform group-hover:scale-110">
              {(() => {
                const IconComponent = ICON_MAP[item.icon];
                if (IconComponent) {
                  return <IconComponent size={20} strokeWidth={1.5} />;
                }
                return <span className="text-xl leading-none">{item.icon}</span>;
              })()}
            </div>
            <div className="flex flex-col text-left">
              <h4 className="font-serif text-xl text-foreground/90 tracking-tight mb-1">{item.title}</h4>
              <p className="text-sm font-serif italic leading-relaxed text-muted/80">{item.description}</p>
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
          className="flex h-full flex-col gap-4 rounded-[var(--radius-card)] glass p-8 text-center items-center shadow-premium"
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
          <h3 className="text-xl font-serif font-medium">{item.title}</h3>
          <p className="text-sm text-muted leading-relaxed">{item.description}</p>
        </article>
      ))}
    </div>
  );
}
