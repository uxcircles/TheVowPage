import type { ScheduleItem } from "./types";

function toUTCStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function buildGoogleCalendarUrl(params: {
  title: string;
  location: string;
  details: string;
  start: Date;
  end: Date;
}) {
  const { title, location, details, start, end } = params;
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${toUTCStamp(start)}/${toUTCStamp(end)}` +
    `&details=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(location)}`
  );
}

export function buildIcsDataUrl(params: {
  title: string;
  location: string;
  details: string;
  start: Date;
  end: Date;
  uid: string;
}) {
  const { title, location, details, start, end, uid } = params;
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//ZH//",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toUTCStamp(start)}`,
    `DTSTART:${toUTCStamp(start)}`,
    `DTEND:${toUTCStamp(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details.replace(/\n/g, "\\n")}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}

export function scheduleDetails(schedule: ScheduleItem[]) {
  return schedule.map((item) => `${item.time} ${item.event}`).join("\n");
}
