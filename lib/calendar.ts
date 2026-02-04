type CalendarEvent = {
  title: string;
  description: string;
  location: string;
  start: Date; // ISO string or Date object
  end: Date;
};

export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const startStr = formatDateForGoogle(event.start);
  const endStr = formatDateForGoogle(event.end);
  const details = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.location);
  const title = encodeURIComponent(event.title);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}&sf=true&output=xml`;
}

export function getOutlookCalendarUrl(event: CalendarEvent): string {
  const startStr = event.start.toISOString();
  const endStr = event.end.toISOString();
  const details = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.location);
  const title = encodeURIComponent(event.title);

  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${startStr}&enddt=${endStr}&subject=${title}&body=${details}&location=${location}`;
}

export function getIcsFileUrl(event: CalendarEvent): string {
  const startStr = formatDateForIcs(event.start);
  const endStr = formatDateForIcs(event.end);
  const now = formatDateForIcs(new Date());

  // Use CRLF for line breaks as per iCalendar spec
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Web Boda//Guille y Alba//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${now}-${startStr}@webboda.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}

// Helpers

function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
}

function formatDateForIcs(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
}
