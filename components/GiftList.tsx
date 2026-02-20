"use client";

import { CTAButton } from "@/components/CTAButton";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
    <div className="flex flex-wrap justify-center gap-6">
      {gifts.map((gift) => (
        <article
          key={gift.title}
          className="flex w-full max-w-3xl flex-col gap-4 rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 sm:p-6 text-center"
        >
          <h3 className="text-xl font-semibold">{gift.title}</h3>
          <p className="text-sm text-muted">{gift.description}</p>
          {gift.details &&
            (gift.hideDetails ? (
              <details className="rounded-xl border border-border/70 bg-accent/10 px-4 py-3 text-sm text-foreground/90">
                <summary className="cursor-pointer font-semibold uppercase tracking-[0.2em] text-muted">
                  Ver datos bancarios
                </summary>
                <ul className="mt-3 space-y-2">
                  {gift.details.map((detail) => (
                    <CopyableDetail key={detail} text={detail} />
                  ))}
                </ul>
              </details>
            ) : (
              <ul className="flex flex-col items-center gap-2 rounded-xl bg-surface border border-border/40 p-6 text-sm text-foreground/90 shadow-[var(--shadow-soft)]">
                {gift.details.map((detail) => (
                  <CopyableDetail key={detail} text={detail} />
                ))}
              </ul>
            ))}
          {gift.action && (
            <div className="mt-4 flex justify-center">
              <CTAButton href={gift.action.href} variant="outline" prefetch={false}>
                {gift.action.label}
              </CTAButton>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function CopyableDetail({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("IBAN copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <li className="flex w-full items-center justify-between gap-3 rounded-lg bg-background/50 px-4 py-3 border border-border/50">
      <span className="font-mono text-base tracking-wide sm:text-lg">{text}</span>
      <button
        onClick={handleCopy}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted-foreground transition-all hover:bg-primary hover:text-white hover:scale-105 active:scale-95 shadow-sm border border-border/40"
        aria-label="Copiar IBAN"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </li>
  );
}
