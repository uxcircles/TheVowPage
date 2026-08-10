export type ScheduleItem = {
  time: string;
  event: string;
};

// Placeholder hints shown per-row in the schedule editor - indexed (not
// cycled) so each of the default rows shows a distinct example instead of
// an earlier one repeating verbatim.
export const SCHEDULE_PLACEHOLDERS: ScheduleItem[] = [
  { time: "17:30", event: "賓客入席" },
  { time: "18:00", event: "證婚儀式" },
  { time: "18:30", event: "晚宴開始" },
  { time: "19:30", event: "敬酒環節" },
  { time: "20:30", event: "送客" },
];

// Shown once a row runs past the example hints above, so extra rows don't
// start repeating an earlier example verbatim.
export const SCHEDULE_PLACEHOLDER_FALLBACK: ScheduleItem = { time: "時間", event: "活動項目" };

export function emptySchedule(rows = 5): ScheduleItem[] {
  return Array.from({ length: rows }, () => ({ time: "", event: "" }));
}

export type ClassicTemplateData = {
  weddingId: string;
  theme: string;
  sealDesign: string;
  momentsStyle: string;
  groomName: string;
  brideName: string;
  groomLabel: string;
  brideLabel: string;
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
  dressCode: string;
  thanksMessage: string;
  heroPhotoUrl: string | null;
  familyPhotoUrl: string | null;
  footerPhotoUrl: string | null;
  momentPhotoUrls: string[];
  showFamily: boolean;
  showSchedule: boolean;
  showDressCode: boolean;
  showRsvp: boolean;
};
