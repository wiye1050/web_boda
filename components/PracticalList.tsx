import type { PracticalItem } from "@/lib/publicContent";
import { cn } from "@/lib/utils";

type PracticalListProps = {
  items: PracticalItem[];
  variant?: "card" | "strip";
  className?: string;
};

export function PracticalList({ items, variant = "card", className }: PracticalListProps) {
  if (variant === "strip") {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8 border-t border-border/40 pt-8 mt-8", className)}>
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="flex flex-col items-center text-center gap-2">
            <span className="text-3xl grayscale opacity-80" role="img" aria-hidden>
              {item.icon}
            </span>
            <h4 className="font-medium text-foreground">{item.title}</h4>
            <p className="text-xs text-muted max-w-[200px]">{item.description}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6 md:grid-cols-3", className)}>
      {items.map((item, index) => (
        <article
          key={`${item.title}-${index}`}
          className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 shadow-[var(--shadow-soft)] sm:p-6"
        >
          <span className="text-2xl" role="img" aria-hidden>
            {item.icon}
          </span>
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="text-sm text-muted">{item.description}</p>
        </article>
      ))}
    </div>
  );
}
