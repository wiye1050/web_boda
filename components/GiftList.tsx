import { CTAButton } from "@/components/CTAButton";

export type GiftOption = {
  title: string;
  description: string;
  action?: { label: string; href: string };
  details?: string[];
  hideDetails?: boolean;
};

type GiftListProps = {
  gifts: GiftOption[];
};

export function GiftList({ gifts }: GiftListProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {gifts.map((gift) => (
        <article
          key={gift.title}
          className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 sm:p-6"
        >
          <h3 className="text-xl font-semibold">{gift.title}</h3>
          <p className="text-sm text-muted">{gift.description}</p>
          {gift.details &&
            (gift.hideDetails ? (
              <details className="rounded-xl border border-border/70 bg-accent/40 px-4 py-3 text-sm text-foreground/90">
                <summary className="cursor-pointer font-semibold uppercase tracking-[0.2em] text-muted">
                  Ver datos bancarios
                </summary>
                <ul className="mt-3 space-y-2">
                  {gift.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </details>
            ) : (
              <ul className="space-y-2 rounded-xl bg-accent/80 p-4 text-sm text-foreground/90">
                {gift.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ))}
          {gift.action && (
            <CTAButton href={gift.action.href} variant="outline" prefetch={false}>
              {gift.action.label}
            </CTAButton>
          )}
        </article>
      ))}
    </div>
  );
}
