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
          className="flex w-full max-w-3xl flex-col gap-6 text-center items-center"
        >
          {gift.title && <h3 className="text-2xl font-serif font-medium">{gift.title}</h3>}
          {gift.description && <p className="text-sm text-muted leading-relaxed">{gift.description}</p>}
          {gift.details &&
            (gift.hideDetails ? (
              <FlipCard details={gift.details} />
            ) : (
              <ul className="flex flex-col items-center gap-2 rounded-xl p-6 text-sm text-foreground/90">
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
    <li className="flex w-full items-center justify-center gap-4">
      <span className="font-mono text-base sm:text-xl tracking-tight sm:tracking-tighter font-medium text-foreground">{text}</span>
      <button
        onClick={handleCopy}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-muted-foreground transition-all hover:bg-primary hover:text-white hover:scale-105 active:scale-95 border border-border/40"
        aria-label="Copiar IBAN"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </li>
  );
}

function FlipCard({ details }: { details: string[] }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <div 
        className="relative w-full aspect-[3/2] cursor-pointer group"
        style={{ perspective: "1500px" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front: Envelope Design */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#fdfaf6] border border-stone-200 shadow-2xl overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Envelope Flap Effect */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <svg viewBox="0 0 300 200" className="w-full h-full fill-none">
                <path 
                  d="M0 0 L150 100 L300 0" 
                  fill="#f9f6f1" 
                  stroke="#e7e4df" 
                  strokeWidth="1"
                />
                <path 
                  d="M0 200 L150 100 L300 200" 
                  fill="#fdfaf6" 
                  stroke="#e7e4df" 
                  strokeWidth="0.5"
                />
              </svg>
            </div>

            {/* Wax Seal */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 0 0px rgba(153, 27, 27, 0.2)",
                    "0 0 0 10px rgba(153, 27, 27, 0)",
                    "0 0 0 0px rgba(153, 27, 27, 0)"
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-14 h-14 rounded-full bg-red-800 flex items-center justify-center shadow-lg border-2 border-red-900/20 relative"
              >
                <div className="absolute inset-1 rounded-full border border-white/10" />
                <span className="text-white text-xl font-serif italic select-none">A&G</span>
              </motion.div>
              
              <div className="bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-stone-200/50">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-500">
                  Tocar para abrir
                </span>
              </div>
            </div>
          </div>

          {/* Back: Invitation Card */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#fdfaf6] border border-stone-200 shadow-2xl p-4 sm:p-8"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <ul className="flex flex-col items-center gap-3 w-full">
              {details.map((detail) => (
                <CopyableDetail key={detail} text={detail} />
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
