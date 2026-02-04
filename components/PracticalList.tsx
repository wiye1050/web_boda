import type { PracticalItem } from "@/lib/publicContent";

type PracticalListProps = {
  items: PracticalItem[];
};

export function PracticalList({ items }: PracticalListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
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
