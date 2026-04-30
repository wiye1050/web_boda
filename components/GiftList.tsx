"use client";

import { CTAButton } from "@/components/CTAButton";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { motion } from "framer-motion";

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
          className="flex w-full max-w-3xl flex-col gap-4 rounded-[var(--radius-card)] border border-border/80 bg-surface/90 p-4 sm:p-6 text-center items-center"
        >
          {gift.title && <h3 className="text-xl font-semibold">{gift.title}</h3>}
          {gift.description && <p className="text-sm text-muted">{gift.description}</p>}
          {gift.details &&
            (gift.hideDetails ? (
              <FlipCard details={gift.details} />
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
      
      // Haptic feedback for Android
      if (typeof window !== "undefined" && window.navigator.vibrate) {
        window.navigator.vibrate(40);
      }
      
      toast.success("IBAN copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <li className="flex w-full items-center justify-center gap-3 rounded-lg bg-background/50 px-4 py-3 border border-border/50">
      <span className="font-mono text-[10px] sm:text-[13px] tracking-normal sm:tracking-widest whitespace-nowrap">{text}</span>
      <button
        onClick={handleCopy}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-muted-foreground transition-all hover:bg-primary hover:text-white hover:scale-105 active:scale-95 shadow-sm border border-border/40"
        aria-label="Copiar IBAN"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </li>
  );
}

function FlipCard({ details }: { details: string[] }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full max-w-sm h-32 cursor-pointer mx-auto group"
      style={{ perspective: "1000px" }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-accent/10 border border-border/70 p-4 transition-colors group-hover:bg-accent/20"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="font-semibold uppercase tracking-[0.2em] text-muted text-sm text-center">
            Haz clic aquí
          </span>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-surface border border-border/40 shadow-[var(--shadow-soft)] p-2"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <ul className="flex flex-col items-center gap-2 w-full text-sm text-foreground/90">
            {details.map((detail) => (
              <CopyableDetail key={detail} text={detail} />
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
