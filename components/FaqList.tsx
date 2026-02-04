import type { FaqItem } from "@/lib/publicContent";

type FaqListProps = {
  items: FaqItem[];
};

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      {items.map((item, index) => (
        <details
          key={`${item.question}-${index}`}
          className="rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-5 shadow-[var(--shadow-soft)]"
        >
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.2em] text-muted sm:tracking-[0.25em]">
            {item.question}
          </summary>
          <p className="mt-3 text-sm text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
