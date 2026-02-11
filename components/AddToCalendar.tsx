"use client";

import { getGoogleCalendarUrl, getIcsFileUrl, getOutlookCalendarUrl } from "@/lib/calendar";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type AddToCalendarProps = {
  event: {
    title: string;
    description: string;
    location: string;
    start: Date;
    end: Date;
  };
  variant?: "default" | "outline" | "ghost" | "hero";
  className?: string;
};

export function AddToCalendar({ event, className = "", variant = "default" }: AddToCalendarProps) {
  const googleUrl = getGoogleCalendarUrl(event);
  const outlookUrl = getOutlookCalendarUrl(event);
  
  const baseButtonStyles = "group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all active:scale-95";
  
  const variantStyles = {
    default: "border border-border/80 bg-surface/80 text-foreground hover:bg-surface hover:border-primary/50 hover:text-primary",
    outline: "border border-border bg-transparent text-foreground hover:bg-surface hover:text-primary",
    ghost: "bg-transparent text-foreground hover:bg-surface/50 hover:text-primary",
    hero: "rounded-full border border-white/20 bg-white/10 !text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 px-6"
  };

  const buttonClass = cn(baseButtonStyles, variantStyles[variant]);

  function handleIcsClick() {
    const url = getIcsFileUrl(event);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "wedding.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {variant !== "hero" && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Añadir al calendario
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          title="Añadir a Google Calendar"
        >
          <Calendar className="h-4 w-4 opacity-70 group-hover:opacity-100" />
          <span>{variant === "hero" ? "A mi calendario" : "Google"}</span>
        </a>
        
        {variant !== "hero" && (
          <>
            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
               title="Añadir a Outlook Calendar"
            >
              <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              <span>Outlook</span>
            </a>

            <button
              type="button"
              onClick={handleIcsClick}
              className={buttonClass}
               title="Descargar archivo .ics (Apple Calendar)"
            >
              <Download className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              <span>Archivo .ics</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
