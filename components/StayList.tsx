import { CTAButton } from "@/components/CTAButton";
import type { StayOption } from "@/lib/publicContent";

type StayListProps = {
  items: StayOption[];
  linkLabel: string;
};

export function StayList({ items, linkLabel }: StayListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {items.map((stay) => (
        <article
          key={stay.name}
          className="flex h-full flex-col rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 sm:p-6"
        >
          <header className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">{stay.name}</h3>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              {stay.distance}
            </span>
          </header>
          <p className="mt-4 text-sm text-muted">{stay.description}</p>
          <CTAButton
            href={stay.link}
            variant="ghost"
            className="mt-auto w-fit"
            prefetch={false}
          >
            {linkLabel}
          </CTAButton>
        </article>
      ))}
    </div>
  );
}
