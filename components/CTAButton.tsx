import Link from "next/link";
import type { ReactNode } from "react";

type CTAButtonVariant = "primary" | "outline" | "ghost";

type CTAButtonProps = {
  href: string;
  children: ReactNode;
  variant?: CTAButtonVariant;
  className?: string;
  prefetch?: boolean;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-[0.18em] uppercase transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variantClasses: Record<CTAButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/30 focus-visible:outline-primary",
  outline:
    "border border-border bg-transparent text-foreground hover:border-primary/60 hover:text-primary focus-visible:outline-primary",
  ghost:
    "bg-transparent text-foreground hover:text-primary hover:bg-accent/60 focus-visible:outline-primary",
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  className,
  prefetch,
}: CTAButtonProps) {
  const combinedClassName = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={combinedClassName} prefetch={prefetch}>
      {children}
    </Link>
  );
}
