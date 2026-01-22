"use client";

type DividerProps = {
  label?: string;
  className?: string;
};

export function Divider({ label = "A & G", className = "" }: DividerProps) {
  return (
    <div className={["flex items-center justify-center gap-3", className].join(" ").trim()}>
      <span className="h-px w-16 bg-border/70" aria-hidden />
      <span className="rounded-full border border-border/60 bg-surface/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-muted shadow-sm">
        {label}
      </span>
      <span className="h-px w-16 bg-border/70" aria-hidden />
    </div>
  );
}
