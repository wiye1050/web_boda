import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FadeIn } from "./FadeIn";

type SectionBackground = "default" | "surface" | "accent";
type SectionAlign = "left" | "center";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  background?: SectionBackground;
  align?: SectionAlign;
  className?: string;
  children: ReactNode;
  fineArt?: boolean;
  showDivider?: boolean;
};

const backgroundClassMap: Record<SectionBackground, string> = {
  default: "bg-transparent relative z-0",
  surface:
    "relative z-10 bg-surface before:absolute before:-inset-8 before:-z-10 before:rounded-[3rem] before:bg-gradient-to-b before:from-white/0 before:via-white before:to-white/0",
  accent:
    "relative z-10 bg-accent-bg before:absolute before:-inset-8 before:-z-10 before:rounded-[3rem] before:bg-gradient-to-b before:from-[#f3ede2]/0 before:via-[#f3ede2] before:to-[#f3ede2]/0",
};

const alignmentClassMap: Record<SectionAlign, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  background = "default",
  align = "center",
  className,
  children,
  fineArt = false,
  showDivider = false,
}: SectionProps) {
  const headingId = title && id ? `${id}-heading` : undefined;
  const descriptionId = description && id ? `${id}-description` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className={cn(
        "relative w-full py-16 md:py-[var(--spacing-section)] overflow-hidden",
        "flex flex-col items-center justify-center",
        backgroundClassMap[background],
        className
      )}
    >
      <div className={cn(
        "container relative z-10 flex w-full max-w-6xl flex-col px-4 sm:px-8",
        fineArt ? "gap-[var(--spacing-content-gap)]" : "gap-8"
      )}>
        {(eyebrow || title || description) && (
          <header
            className={cn(
              "flex w-full flex-col",
              fineArt ? "gap-4 md:gap-6" : "gap-4",
              alignmentClassMap[align]
            )}
          >
            {eyebrow && (
              <FadeIn delay={0.1}>
                <span className={cn(
                  fineArt 
                    ? "font-script text-2xl md:text-3xl text-accent/90 block -mb-2" 
                    : "text-xs font-semibold uppercase tracking-[0.4em] text-muted"
                )}>
                  {eyebrow}
                </span>
              </FadeIn>
            )}
            {title && (
              <FadeIn delay={0.2}>
                <h2 
                  id={headingId} 
                  className={cn(
                    fineArt
                      ? "font-serif text-4xl md:text-6xl tracking-tight text-foreground/90"
                      : "font-serif text-3xl md:text-5xl tracking-tight text-foreground/90 mb-4"
                  )}
                >
                  {title}
                </h2>
              </FadeIn>
            )}
            {description && (
              <FadeIn delay={0.3}>
                <p
                  id={descriptionId}
                  className={cn(
                    fineArt
                      ? "font-serif italic text-lg md:text-xl text-muted/80 leading-relaxed"
                      : "text-base text-muted",
                    "max-w-2xl",
                    align === "center" ? "mx-auto" : "md:max-w-3xl"
                  )}
                >
                  {description}
                </p>
              </FadeIn>
            )}
          </header>
        )}
        <FadeIn>
          <div className="w-full">{children}</div>
        </FadeIn>
      </div>

      {showDivider && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[1px] bg-foreground/10" />
      )}
    </section>
  );
}
