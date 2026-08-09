export type ScheduleItem = {
  time: string;
  event: string;
};

// Placeholder hints shown per-row in the schedule editor - cycled by index so
// a freshly-started schedule shows three distinct example rows instead of
// the same "18:00 / Dinner & Ceremony" repeated three times.
export const SCHEDULE_PLACEHOLDERS: ScheduleItem[] = [
  { time: "17:30", event: "賓客入席" },
  { time: "18:00", event: "證婚儀式" },
  { time: "18:30", event: "晚宴開始" },
];

export function emptySchedule(rows = 3): ScheduleItem[] {
  return Array.from({ length: rows }, () => ({ time: "", event: "" }));
}

export type ClassicTemplateData = {
  weddingId: string;
  theme: string;
  sealDesign: string;
  groomName: string;
  brideName: string;
  groomParents: string;
  brideParents: string;
  eventDate: string | null; // ISO timestamp
  timezone: string; // IANA zone the eventDate should be displayed in
  venueName: string;
  venueHall: string;
  venueAddress: string;
  venueLat: number | null;
  venueLng: number | null;
  schedule: ScheduleItem[];
  thanksMessage: string;
  heroPhotoUrl: string | null;
  familyPhotoUrl: string | null;
  footerPhotoUrl: string | null;
  momentPhotoUrls: string[];
  showFamily: boolean;
  showSchedule: boolean;
  showRsvp: boolean;
};
