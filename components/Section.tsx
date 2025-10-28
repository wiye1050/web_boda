import type { ReactNode } from "react";

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
  default: "bg-transparent",
  surface: "bg-surface/90 backdrop-blur-sm",
  accent: "bg-accent/90 backdrop-blur-sm",
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
  align = "left",
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
        "relative w-full py-[var(--spacing-section)]",
        backgroundClassMap[background],
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 sm:px-8">
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
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 id={headingId} className="font-display">
                {title}
              </h2>
            )}
            {description && (
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
            )}
          </header>
        )}
        <div className="grid gap-8">{children}</div>
      </div>
    </section>
  );
}
