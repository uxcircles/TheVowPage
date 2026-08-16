export type ScheduleItem = {
  time: string;
  event: string;
};

type Bilingual = { zh: string; en: string };

// Placeholder hints shown per-row in the schedule editor - indexed (not
// cycled) so each of the default rows shows a distinct example instead of
// an earlier one repeating verbatim. These are editor-only example content
// (unlike THANKS_MESSAGE_FALLBACK below, they're never saved as real data),
// so they follow the site's locale like any other editor placeholder.
export const SCHEDULE_PLACEHOLDERS: { time: Bilingual; event: Bilingual }[] = [
  { time: { zh: "17:30", en: "17:30" }, event: { zh: "賓客入席", en: "Guest arrival" } },
  { time: { zh: "18:00", en: "18:00" }, event: { zh: "證婚儀式", en: "Ceremony" } },
  { time: { zh: "18:30", en: "18:30" }, event: { zh: "晚宴開始", en: "Reception begins" } },
  { time: { zh: "19:30", en: "19:30" }, event: { zh: "敬酒環節", en: "Toasts" } },
  { time: { zh: "20:30", en: "20:30" }, event: { zh: "送客", en: "Farewell" } },
];

// Shown once a row runs past the example hints above, so extra rows don't
// start repeating an earlier example verbatim.
export const SCHEDULE_PLACEHOLDER_FALLBACK: { time: Bilingual; event: Bilingual } = {
  time: { zh: "時間", en: "Time" },
  event: { zh: "活動項目", en: "Activity" },
};

export function emptySchedule(rows = 5): ScheduleItem[] {
  return Array.from({ length: rows }, () => ({ time: "", event: "" }));
}

// Shown on the public page when thanksMessage is empty, and used as the
// editors' placeholder text so what a couple sees while editing matches
// what actually renders if they leave the field blank.
export const THANKS_MESSAGE_FALLBACK: Bilingual = {
  zh: "感謝您撥冗參與，見證我們人生中最重要的時刻",
  en: "Thank you for taking the time to join us and witness the most important moment of our lives",
};

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
  groomParentsRelation: string;
  brideParents: string;
  brideParentsRelation: string;
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
