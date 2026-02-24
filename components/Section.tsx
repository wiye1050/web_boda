import type { ReactNode } from "react";
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
  children: ReactNode;
};

const backgroundClassMap: Record<SectionBackground, string> = {
  default: "bg-transparent relative z-0",
  surface: "relative z-10 bg-surface before:content-[''] before:pointer-events-none before:absolute before:-top-24 before:left-0 before:w-full before:h-24 before:bg-gradient-to-b before:from-transparent before:to-surface after:content-[''] after:pointer-events-none after:absolute after:-bottom-24 after:left-0 after:w-full after:h-24 after:bg-gradient-to-b after:from-surface after:to-transparent",
  accent: "relative z-10 bg-accent-bg before:content-[''] before:pointer-events-none before:absolute before:-top-24 before:left-0 before:w-full before:h-24 before:bg-gradient-to-b before:from-transparent before:to-accent-bg after:content-[''] after:pointer-events-none after:absolute after:-bottom-24 after:left-0 after:w-full after:h-24 after:bg-gradient-to-b after:from-accent-bg after:to-transparent",
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
  children,
}: SectionProps) {
  const headingId = title && id ? `${id}-heading` : undefined;
  const descriptionId = description && id ? `${id}-description` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className={[
        "relative w-full py-[calc(var(--spacing-section)*0.75)] sm:py-[var(--spacing-section)]",
        backgroundClassMap[background],
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:gap-8 sm:px-8">
        {(eyebrow || title || description) && (
          <header
            className={[
              "flex w-full flex-col gap-4",
              alignmentClassMap[align],
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {eyebrow && (
              <FadeIn delay={0.1}>
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
                  {eyebrow}
                </span>
              </FadeIn>
            )}
            {title && (
              <FadeIn delay={0.2}>
                <h2 id={headingId} className="font-serif text-3xl md:text-5xl tracking-tight text-foreground/90 mb-4">
                  {title}
                </h2>
              </FadeIn>
            )}
            {description && (
              <FadeIn delay={0.3}>
                <p
                  id={descriptionId}
                  className={[
                    "text-base text-muted max-w-2xl",
                    align === "center" ? "mx-auto" : "md:max-w-3xl",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {description}
                </p>
              </FadeIn>
            )}
          </header>
        )}
        <FadeIn>
          <div className="grid gap-8">{children}</div>
        </FadeIn>
      </div>
    </section>
  );
}
