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
  className?: string;
};

export function AddToCalendar({ event, className = "" }: AddToCalendarProps) {
  const googleUrl = getGoogleCalendarUrl(event);
  const outlookUrl = getOutlookCalendarUrl(event);
  
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
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Añadir al calendario
      </span>
      <div className="flex flex-wrap gap-2">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-lg border border-border/80 bg-surface/80 px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-surface hover:border-primary/50 hover:text-primary active:scale-95"
          title="Añadir a Google Calendar"
        >
          <Calendar className="h-4 w-4 opacity-70 group-hover:opacity-100" />
          <span>Google</span>
        </a>
        
        <a
          href={outlookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-lg border border-border/80 bg-surface/80 px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-surface hover:border-primary/50 hover:text-primary active:scale-95"
           title="Añadir a Outlook Calendar"
        >
          <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100" />
          <span>Outlook</span>
        </a>

        <button
          type="button"
          onClick={handleIcsClick}
          className="group inline-flex items-center gap-2 rounded-lg border border-border/80 bg-surface/80 px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-surface hover:border-primary/50 hover:text-primary active:scale-95"
           title="Descargar archivo .ics (Apple Calendar)"
        >
          <Download className="h-4 w-4 opacity-70 group-hover:opacity-100" />
          <span>Archivo .ics</span>
        </button>
      </div>
    </div>
  );
}
