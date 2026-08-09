export type ScheduleItem = {
  time: string;
  event: string;
};

export type ClassicTemplateData = {
  weddingId: string;
  theme: string;
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
