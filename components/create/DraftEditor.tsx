"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthModal } from "./AuthModal";
import { createClient } from "@/lib/supabase/client";
import {
  saveDraftAsWedding,
  fetchGeocode,
  type DraftContent,
  type DraftPhotos,
} from "@/lib/create-wedding-client";
import { wallTimeToUtcIso, formatTimezoneLabel } from "@/lib/timezone";
import { ClassicTemplate } from "@/components/templates/classic/ClassicTemplate";
import { VenueMap } from "@/components/templates/classic/VenueMap";
import { Toggle } from "@/components/ui/Toggle";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { SealPicker } from "@/components/ui/SealPicker";
import { MomentsStylePicker } from "@/components/ui/MomentsStylePicker";
import { CLASSIC_THEMES } from "@/components/templates/classic/themes";
import { SEAL_DESIGNS } from "@/components/templates/classic/seals";
import { MOMENTS_STYLES } from "@/components/templates/classic/momentsStyles";
import { EditorCard, HiddenSectionHint } from "@/components/ui/EditorCard";
import { BilingualField } from "@/components/ui/BilingualField";
import { MomentsPhotoGrid } from "@/components/ui/MomentsPhotoGrid";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useToast } from "@/components/ui/Toast";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { editForm, chromeCopy, momentsCopy, photoSlotCopy, draftEditorCopy } from "@/lib/i18n/dictionaries/dashboard";
import { headingFont } from "@/lib/fonts";
import { validatePhotoType, validatePhotoSize, MAX_MOMENT_PHOTOS } from "@/lib/photoLimits";
import { compressImage } from "@/lib/compressImage";
import {
  emptySchedule,
  SCHEDULE_PLACEHOLDERS,
  SCHEDULE_PLACEHOLDER_FALLBACK,
  THANKS_MESSAGE_FALLBACK,
  type ClassicTemplateData,
  type ContentEn,
  type ScheduleItem,
} from "@/components/templates/classic/types";
import type { User } from "@supabase/supabase-js";

const STORAGE_KEY = "wedding-draft-content";
const DEFAULT_TIMEZONE = "Asia/Taipei";

const EMPTY_DRAFT: DraftContent = {
  theme: "gold",
  sealDesign: "calla",
  momentsStyle: "stack",
  groomName: "",
  brideName: "",
  // Chinese baseline - a fresh visitor's actual locale isn't known at
  // module load time (this runs on the server too), so these are
  // overridden to English right after mount, in the hydration effect
  // below, when the site locale is en.
  groomLabel: "新郎",
  brideLabel: "新娘",
  groomParents: "",
  groomParentsRelation: "之子",
  brideParents: "",
  brideParentsRelation: "之女",
  eventDate: "",
  venueName: "",
  venueHall: "",
  venueAddress: "",
  manualCoords: false,
  venueLat: "",
  venueLng: "",
  schedule: emptySchedule(),
  dressCode: "",
  thanksMessage: "",
  showFamily: true,
  showSchedule: true,
  showDressCode: true,
  showRsvp: true,
  bilingualEnabled: false,
  contentEn: {},
};

const inputClass =
  "rounded border border-[var(--brand-line)] bg-white px-3 py-2 text-foreground";
const labelClass = "flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]";

// Fields whose *starting* value is a system default rather than the
// couple's own content, and whose correct-looking value depends on which
// language they're viewing the editor in (新郎/新娘 vs Groom/Bride).
// Listing both locales' text per field lets applyLocaleDefaults recognise
// "still at a default" from *either* language - not just the one
// EMPTY_DRAFT happened to start in - so switching site language
// mid-session (no reload) can still correct a value that was set by an
// earlier locale, while never touching anything the couple actually typed
// themselves.
//
// groomParentsRelation/brideParentsRelation/thanksMessage are
// deliberately NOT here - once bilingual content exists, each of those
// fields' ZH-HANT row is always Chinese and its EN row (see
// BilingualField below) is always English, regardless of which locale
// the editor itself is being viewed in - two different pieces of
// content, not one field whose language follows the admin's own UI.
// thanksMessage in particular now starts empty and shows its fallback as
// a *placeholder* (same pattern as dressCode), not a pre-filled value -
// so there's nothing left to swap between locales here either.
const LOCALE_DEFAULT_FIELDS = [
  { key: "groomLabel", zh: "新郎", en: "Groom" },
  { key: "brideLabel", zh: "新娘", en: "Bride" },
] as const satisfies readonly { key: keyof DraftContent; zh: string; en: string }[];

function applyLocaleDefaults(content: DraftContent, locale: "zh" | "en"): DraftContent {
  let next = content;
  for (const field of LOCALE_DEFAULT_FIELDS) {
    const current = next[field.key];
    const target = field[locale];
    if (current !== target && (current === field.zh || current === field.en)) {
      next = { ...next, [field.key]: target };
    }
  }
  return next;
}

/** Creating the object URL in useMemo and revoking it in a separate
 * useEffect looks reasonable, but breaks under React Strict Mode's
 * dev-only double-invoke: the effect's cleanup fires once for the "throw
 * away" pass, revoking the one and only URL useMemo ever produced (memo
 * doesn't re-run just because Strict Mode re-ran the effect), so the img
 * ends up pointing at an already-revoked blob - a broken image. Creating
 * and revoking inside the *same* effect keeps each pass self-contained. */
function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url;
}

function PhotoPicker({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const locale = useLocale();
  const url = useObjectUrl(file);
  const showToast = useToast();
  const [compressing, setCompressing] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[var(--brand-ink-soft)]">{label}</p>
      <div className="aspect-[4/5] overflow-hidden rounded border border-[var(--brand-line)] bg-[var(--cream-deep,#f1e9da)]">
        {url && (
          <img src={url} alt={label} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex gap-2">
        <label className="flex-1 cursor-pointer rounded border border-[var(--brand-line)] px-3 py-1.5 text-center text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)]">
          {compressing ? photoSlotCopy.compressing[locale] : file ? photoSlotCopy.change[locale] : photoSlotCopy.upload[locale]}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={compressing}
            onChange={async (e) => {
              const picked = e.target.files?.[0] ?? null;
              if (!picked) return;
              const typeError = validatePhotoType(picked);
              if (typeError) {
                showToast(typeError, "error");
                e.target.value = "";
                return;
              }

              setCompressing(true);
              const compressed = await compressImage(picked);
              setCompressing(false);

              const sizeError = validatePhotoSize(compressed);
              if (sizeError) {
                showToast(sizeError, "error");
                e.target.value = "";
                return;
              }
              e.target.value = "";
              onChange(compressed);
            }}
          />
        </label>
        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={photoSlotCopy.removeAria[locale]}
            className="rounded border border-[var(--brand-line)] px-3 py-1.5 text-[var(--brand-ink-soft)] hover:border-[var(--brand-error)] hover:text-[var(--brand-error)]"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Same create-and-revoke-in-one-effect reasoning as useObjectUrl above,
 * just for the whole Moments array at once instead of one file at a time -
 * MomentsPhotoGrid needs every item's url resolved upfront rather than
 * having each grid cell call its own hook (the list's length changes as
 * photos are added/removed, which useObjectUrl-per-item can't do safely). */
function useObjectUrls(files: File[]): string[] {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const created = files.map((f) => URL.createObjectURL(f));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrls(created);
    return () => {
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);
  return urls;
}

export function DraftEditor() {
  const router = useRouter();
  const locale = useLocale();
  // Matches the same defaults applied in the hydration effect below and in
  // lib/actions/weddings.ts's defaultGroomLabel/defaultBrideLabel - used
  // here purely as a display fallback for whatever render happens before
  // that effect has run.
  const defaultGroomLabelText = locale === "en" ? "Groom" : "新郎";
  const defaultBrideLabelText = locale === "en" ? "Bride" : "新娘";
  const showToast = useToast();
  const [draft, setDraft] = useState<DraftContent>(EMPTY_DRAFT);
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [photos, setPhotos] = useState<DraftPhotos>({
    hero: null,
    family: null,
    footer: null,
    moments: [],
  });
  const [showAuth, setShowAuth] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumeUser, setResumeUser] = useState<User | null>(null);
  const momentsInputRef = useRef<HTMLInputElement>(null);
  const [momentsCompressing, setMomentsCompressing] = useState(false);
  const momentFiles = useMemo(() => photos.moments.map((m) => m.file), [photos.moments]);
  const momentUrls = useObjectUrls(momentFiles);
  const momentItems = photos.moments.map((m, i) => ({ id: m.id, url: momentUrls[i] ?? "" }));

  const [locating, setLocating] = useState(false);
  const [locationPreview, setLocationPreview] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  // Tracks the address we last auto-filled, so a re-search can still refresh
  // it - but only while it still matches what we set (i.e. the user hasn't
  // typed their own address over it since).
  const lastAutoFilledAddressRef = useRef<string | null>(null);

  const [draftHydrated, setDraftHydrated] = useState(false);

  useEffect(() => {
    // Hydrating from sessionStorage (browser-only, absent during SSR) has to
    // happen post-mount - doing it in the initial useState would either miss
    // window entirely on the server or cause a hydration mismatch when a
    // draft exists.
    const saved = sessionStorage.getItem(STORAGE_KEY);
    let hydrated = EMPTY_DRAFT;
    if (saved) {
      try {
        hydrated = { ...EMPTY_DRAFT, ...JSON.parse(saved) };
      } catch {
        // ignore malformed saved draft
      }
    }

    // Arriving from a demo wedding's "套用此設計，開始編輯" link
    // (/create?theme=...&seal=...&moments=...) carries that look over,
    // taking priority over whatever a resumed session had - clicking that
    // link is an explicit, fresh choice of style, even if the visitor also
    // has an older in-progress draft sitting in this browser. Only the
    // three style fields are touched; the rest of a resumed draft (photos,
    // text content) is left alone. Values are validated against the known
    // id lists rather than trusted blindly, since they arrive via URL.
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get("theme");
    const sealParam = params.get("seal");
    const momentsParam = params.get("moments");
    if (themeParam && CLASSIC_THEMES.some((t) => t.id === themeParam)) {
      hydrated = { ...hydrated, theme: themeParam };
    }
    if (sealParam && SEAL_DESIGNS.some((s) => s.id === sealParam)) {
      hydrated = { ...hydrated, sealDesign: sealParam };
    }
    if (momentsParam && MOMENTS_STYLES.some((m) => m.id === momentsParam)) {
      hydrated = { ...hydrated, momentsStyle: momentsParam };
    }

    hydrated = applyLocaleDefaults(hydrated, locale);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(hydrated);
    setDraftHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the visitor switches site language mid-session (footer switcher,
  // no full reload) after the mount effect above already ran once, that
  // one-time hydration never re-fires - without this, any of the
  // LOCALE_DEFAULT_FIELDS still sitting at their *previous* locale's
  // default would stay stuck in that language even though the rest of the
  // editor chrome has switched, and could get saved that way. Only fires
  // after the initial hydration (guarded on draftHydrated) so it can't
  // race the mount effect's own setDraft above.
  useEffect(() => {
    if (!draftHydrated) return;
    setDraft((d) => applyLocaleDefaults(d, locale));
  }, [locale, draftHydrated]);

  // Google sign-in from the AuthModal is a full-page redirect (unlike the
  // email/password form in that same modal, which authenticates in place
  // and calls onAuthenticated() directly) - it lands back here via
  // /auth/callback?next=/create?resume=1. Detect that signal, confirm a
  // session actually exists, then finish the save the same way the
  // in-modal form does. Gated on draftHydrated (rather than also using an
  // empty-deps effect) so this can't call getUser() - and from there
  // finalizeSave() - before the sessionStorage draft above has actually
  // made it into `draft`; that race did happen and silently saved an
  // empty draft.
  useEffect(() => {
    if (!draftHydrated) return;
    if (new URLSearchParams(window.location.search).get("resume") !== "1") return;
    window.history.replaceState(null, "", "/create");
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) setResumeUser(data.user);
      });
  }, [draftHydrated]);

  useEffect(() => {
    if (resumeUser) finalizeSave(resumeUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeUser]);

  useEffect(() => {
    // Guard on draftHydrated: without it, this fires with the initial
    // EMPTY_DRAFT before the hydration effect's read has been applied to
    // state, and (under React Strict Mode's double-invoke in dev, which
    // interleaves both effects twice within the same mount) can overwrite
    // - and the hydration effect can then re-read - a real saved draft
    // with that empty one before either settles.
    if (!draftHydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, draftHydrated]);

  // Text content survives a refresh via sessionStorage above, but selected
  // photos are plain File objects only held in memory - a refresh silently
  // loses them. Warn before that happens, but only when there's actually
  // something to lose (a lone text-only visitor gets no interruption).
  useEffect(() => {
    const hasPhotos = Boolean(photos.hero || photos.family || photos.footer) || photos.moments.length > 0;
    if (!hasPhotos) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [photos]);

  function update<K extends keyof DraftContent>(
    key: K,
    value: DraftContent[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function updateEn<K extends keyof ContentEn>(key: K, value: ContentEn[K]) {
    setDraft((d) => ({ ...d, contentEn: { ...d.contentEn, [key]: value } }));
  }

  function updateSchedule(i: number, patch: Partial<ScheduleItem>) {
    setDraft((d) => ({
      ...d,
      schedule: d.schedule.map((item, idx) =>
        idx === i ? { ...item, ...patch } : item,
      ),
    }));
  }

  function updateScheduleEn(i: number, event: string) {
    setDraft((d) => {
      const schedule = [...(d.contentEn.schedule ?? [])];
      while (schedule.length <= i) schedule.push({});
      schedule[i] = { event };
      return { ...d, contentEn: { ...d.contentEn, schedule } };
    });
  }

  async function locateVenue() {
    setLocating(true);
    const result = draft.manualCoords
      ? await fetchGeocode({
          lat: Number(draft.venueLat),
          lng: Number(draft.venueLng),
        })
      : await fetchGeocode({
          venueName: draft.venueName,
          address: draft.venueAddress,
        });
    setLocating(false);
    if (!result) {
      setLocationPreview(null);
      showToast(editForm.locateFailed[locale], "error");
      return;
    }
    setLocationPreview({ lat: result.lat, lng: result.lng });
    setTimezone(result.timezone);
    // Offer Nominatim's own formatted address for free, but never overwrite
    // an address the user typed themselves - only refresh it if it's still
    // empty or still exactly what we auto-filled last time.
    if (result.address) {
      const current = draft.venueAddress.trim();
      if (!current || current === lastAutoFilledAddressRef.current) {
        update("venueAddress", result.address);
        lastAutoFilledAddressRef.current = result.address;
      }
    }
  }

  // Object URLs for the preview - created and revoked within the same
  // effect invocation (see useObjectUrl above for why that matters under
  // Strict Mode), only while the preview is actually open.
  const [previewData, setPreviewData] = useState<ClassicTemplateData | null>(
    null,
  );
  useEffect(() => {
    if (!showPreview) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewData(null);
      return;
    }
    const heroPhotoUrl = photos.hero ? URL.createObjectURL(photos.hero) : null;
    const familyPhotoUrl = photos.family
      ? URL.createObjectURL(photos.family)
      : null;
    const footerPhotoUrl = photos.footer
      ? URL.createObjectURL(photos.footer)
      : null;
    const momentPhotoUrls = photos.moments.map((m) => URL.createObjectURL(m.file));

    setPreviewData({
      weddingId: "",
      theme: draft.theme,
      sealDesign: draft.sealDesign,
      momentsStyle: draft.momentsStyle,
      groomName: draft.groomName,
      brideName: draft.brideName,
      groomLabel: draft.groomLabel || defaultGroomLabelText,
      brideLabel: draft.brideLabel || defaultBrideLabelText,
      groomParents: draft.groomParents,
      groomParentsRelation: draft.groomParentsRelation,
      brideParents: draft.brideParents,
      brideParentsRelation: draft.brideParentsRelation,
      eventDate: wallTimeToUtcIso(draft.eventDate, timezone),
      timezone,
      venueName: draft.venueName,
      venueHall: draft.venueHall,
      venueAddress: draft.venueAddress,
      venueLat:
        locationPreview?.lat ??
        (draft.venueLat ? Number(draft.venueLat) : null),
      venueLng:
        locationPreview?.lng ??
        (draft.venueLng ? Number(draft.venueLng) : null),
      schedule: draft.schedule.filter((item) => item.time || item.event),
      dressCode: draft.dressCode,
      thanksMessage: draft.thanksMessage,
      heroPhotoUrl,
      familyPhotoUrl,
      footerPhotoUrl,
      momentPhotoUrls,
      showFamily: draft.showFamily,
      showSchedule: draft.showSchedule,
      showDressCode: draft.showDressCode,
      showRsvp: draft.showRsvp,
      bilingualEnabled: draft.bilingualEnabled,
      contentEn: draft.contentEn,
    });

    return () => {
      [heroPhotoUrl, familyPhotoUrl, footerPhotoUrl, ...momentPhotoUrls]
        .filter((u): u is string => Boolean(u))
        .forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview]);

  // The Classic template's scroll-driven animations (moments photo stack,
  // schedule reveal) all read window.scrollY / document scroll height -
  // they only work with real page/window scrolling, not scrolling inside a
  // fixed-position overlay with its own overflow. So instead of layering
  // the preview in a modal on top of the editor, swap it in as the page's
  // only content while it's open, same as the real public page.
  if (showPreview && previewData) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className="fixed right-4 top-4 z-[1001] rounded-full bg-white px-4 py-2 text-sm shadow-lg hover:opacity-90"
        >
          {chromeCopy.backToEditing[locale]}
        </button>
        <ClassicTemplate data={previewData} />
      </>
    );
  }

  async function finalizeSave(user: User) {
    setSaving(true);
    try {
      const weddingId = await saveDraftAsWedding(draft, photos, user.id, locale);
      sessionStorage.removeItem(STORAGE_KEY);
      router.push(`/dashboard/${weddingId}/edit`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : draftEditorCopy.saveFailed[locale], "error");
      setSaving(false);
    }
  }

  return (
    <>
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className={`${headingFont.className} text-lg text-[var(--brand-gold)]`}>
          The Vow Page 摯頁
        </Link>
        <Link
          href="/login"
          className="text-sm text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]"
        >
          {draftEditorCopy.alreadyHaveAccount[locale]}
        </Link>
      </header>
      <div className="mx-auto w-full max-w-4xl px-6 pt-10 pb-28">
        <h1 className="text-2xl font-medium">{draftEditorCopy.tryTitle[locale]}</h1>
        <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">
          {draftEditorCopy.tryHint[locale]}
        </p>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-medium">{draftEditorCopy.templateSection[locale]}</h2>
          <EditorCard>
            <p className="mb-2 text-sm font-medium text-foreground">{draftEditorCopy.colorLabel[locale]}</p>
            <ThemePicker value={draft.theme} onChange={(id) => update("theme", id)} />
            <p className="mb-2 mt-6 text-sm font-medium text-foreground">{draftEditorCopy.sealLabel[locale]}</p>
            <SealPicker
              value={draft.sealDesign}
              onChange={(id) => update("sealDesign", id)}
            />
          </EditorCard>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-medium">{draftEditorCopy.photosSection[locale]}</h2>
          <div className="flex flex-col gap-6">
            <EditorCard title={draftEditorCopy.heroFamilyFooterTitle[locale]}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <PhotoPicker
                  label={draftEditorCopy.heroPhotoLabel[locale]}
                  file={photos.hero}
                  onChange={(f) => setPhotos((p) => ({ ...p, hero: f }))}
                />
                <PhotoPicker
                  label={draftEditorCopy.familyPhotoLabel[locale]}
                  file={photos.family}
                  onChange={(f) => setPhotos((p) => ({ ...p, family: f }))}
                />
                <PhotoPicker
                  label={draftEditorCopy.footerPhotoLabel[locale]}
                  file={photos.footer}
                  onChange={(f) => setPhotos((p) => ({ ...p, footer: f }))}
                />
              </div>
            </EditorCard>
            <EditorCard title={draftEditorCopy.momentsTitle[locale]}>
              <MomentsPhotoGrid
                items={momentItems}
                onReorder={(orderedIds) =>
                  setPhotos((p) => ({
                    ...p,
                    moments: orderedIds.map(
                      (id) => p.moments.find((m) => m.id === id)!,
                    ),
                  }))
                }
                onMove={(id, direction) =>
                  setPhotos((p) => {
                    const index = p.moments.findIndex((m) => m.id === id);
                    const swapIndex = direction === "up" ? index - 1 : index + 1;
                    if (index < 0 || swapIndex < 0 || swapIndex >= p.moments.length) return p;
                    const moments = [...p.moments];
                    [moments[index], moments[swapIndex]] = [moments[swapIndex], moments[index]];
                    return { ...p, moments };
                  })
                }
                onRemove={(id) =>
                  setPhotos((p) => ({
                    ...p,
                    moments: p.moments.filter((m) => m.id !== id),
                  }))
                }
              />
              <label
                className={`inline-block cursor-pointer rounded border border-[var(--brand-line)] px-4 py-2 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)] ${
                  photos.moments.length > 0 ? "mt-4" : ""
                }`}
              >
                {momentsCompressing ? photoSlotCopy.compressing[locale] : momentsCopy.addPhotos[locale]}
                <input
                  ref={momentsInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={momentsCompressing}
                  onChange={async (e) => {
                    const selected = Array.from(e.target.files ?? []);
                    if (momentsInputRef.current) momentsInputRef.current.value = "";
                    if (selected.length === 0) return;

                    const remainingSlots = MAX_MOMENT_PHOTOS - photos.moments.length;
                    const overLimitCount = Math.max(0, selected.length - remainingSlots);
                    const withinLimit = selected.slice(0, Math.max(0, remainingSlots));

                    const typeValidFiles: File[] = [];
                    let invalidCount = 0;
                    for (const file of withinLimit) {
                      if (validatePhotoType(file)) invalidCount++;
                      else typeValidFiles.push(file);
                    }

                    if (overLimitCount > 0) {
                      showToast(momentsCopy.overLimit[locale](MAX_MOMENT_PHOTOS, overLimitCount), "error");
                    }
                    if (typeValidFiles.length === 0) {
                      if (invalidCount > 0) {
                        showToast(momentsCopy.typeInvalid[locale](invalidCount), "error");
                      }
                      return;
                    }

                    setMomentsCompressing(true);
                    const validFiles: File[] = [];
                    for (const file of typeValidFiles) {
                      const compressed = await compressImage(file);
                      if (validatePhotoSize(compressed)) invalidCount++;
                      else validFiles.push(compressed);
                    }
                    setMomentsCompressing(false);

                    if (invalidCount > 0) {
                      showToast(draftEditorCopy.sizeOrTypeInvalid[locale](invalidCount), "error");
                    }
                    if (validFiles.length === 0) return;

                    setPhotos((p) => ({
                      ...p,
                      moments: [
                        ...p.moments,
                        ...validFiles.map((file) => ({ id: crypto.randomUUID(), file })),
                      ],
                    }));
                  }}
                />
              </label>
              <p className="mb-2 mt-6 text-sm font-medium text-foreground">{draftEditorCopy.momentsStyleLabel[locale]}</p>
              <MomentsStylePicker
                value={draft.momentsStyle}
                onChange={(id) => update("momentsStyle", id)}
              />
            </EditorCard>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-medium">{draftEditorCopy.contentSection[locale]}</h2>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--brand-line)] bg-white p-4 shadow-sm">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {editForm.bilingualToggle[locale]}
                <InfoTooltip text={editForm.bilingualToggleTooltip[locale]} />
              </span>
              <Toggle checked={draft.bilingualEnabled} onChange={(v) => update("bilingualEnabled", v)} />
            </div>

            <EditorCard title={editForm.sections.basicInfo[locale]}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Editable role labels (default 新郎/新娘) so the
                    invitation can read correctly for same-sex couples too,
                    e.g. "新人一/新人二" - they double as the field labels
                    below via live state. */}
                <BilingualField
                  label={editForm.groomLabelField[locale]}
                  bilingual={draft.bilingualEnabled}
                  zhInput={
                    <input
                      value={draft.groomLabel}
                      onChange={(e) => update("groomLabel", e.target.value)}
                      className={inputClass}
                    />
                  }
                  enInput={
                    <input
                      value={draft.contentEn.groomLabel ?? ""}
                      onChange={(e) => updateEn("groomLabel", e.target.value)}
                      className={inputClass}
                    />
                  }
                />
                <BilingualField
                  label={editForm.brideLabelField[locale]}
                  bilingual={draft.bilingualEnabled}
                  zhInput={
                    <input
                      value={draft.brideLabel}
                      onChange={(e) => update("brideLabel", e.target.value)}
                      className={inputClass}
                    />
                  }
                  enInput={
                    <input
                      value={draft.contentEn.brideLabel ?? ""}
                      onChange={(e) => updateEn("brideLabel", e.target.value)}
                      className={inputClass}
                    />
                  }
                />
                <BilingualField
                  label={`${draft.groomLabel || defaultGroomLabelText}${editForm.nameSuffix[locale]}`}
                  bilingual={draft.bilingualEnabled}
                  zhInput={
                    <input
                      value={draft.groomName}
                      onChange={(e) => update("groomName", e.target.value)}
                      className={inputClass}
                    />
                  }
                  enInput={
                    <input
                      value={draft.contentEn.groomName ?? ""}
                      onChange={(e) => updateEn("groomName", e.target.value)}
                      className={inputClass}
                    />
                  }
                />
                <BilingualField
                  label={`${draft.brideLabel || defaultBrideLabelText}${editForm.nameSuffix[locale]}`}
                  bilingual={draft.bilingualEnabled}
                  zhInput={
                    <input
                      value={draft.brideName}
                      onChange={(e) => update("brideName", e.target.value)}
                      className={inputClass}
                    />
                  }
                  enInput={
                    <input
                      value={draft.contentEn.brideName ?? ""}
                      onChange={(e) => updateEn("brideName", e.target.value)}
                      className={inputClass}
                    />
                  }
                />
              </div>
            </EditorCard>

            <EditorCard
              title={editForm.sections.family[locale]}
              action={
                <Toggle
                  checked={draft.showFamily}
                  onChange={(v) => update("showFamily", v)}
                  label={editForm.show[locale]}
                />
              }
            >
              {draft.showFamily ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <BilingualField
                    label={`${draft.groomLabel || defaultGroomLabelText}${editForm.parentsSuffix[locale]}`}
                    bilingual={draft.bilingualEnabled}
                    zhInput={
                      <div className="flex gap-2">
                        <input
                          value={draft.groomParents}
                          onChange={(e) => update("groomParents", e.target.value)}
                          placeholder={editForm.groomParentsPlaceholder.zh}
                          className={`${inputClass} min-w-0 flex-1`}
                        />
                        <input
                          value={draft.groomParentsRelation}
                          onChange={(e) => update("groomParentsRelation", e.target.value)}
                          placeholder={editForm.sonOfDefault.zh}
                          aria-label={`${draft.groomLabel || defaultGroomLabelText}${editForm.parentsRelationAria[locale]}`}
                          className={`${inputClass} w-20 shrink-0`}
                        />
                      </div>
                    }
                    enInput={
                      <div className="flex gap-2">
                        <input
                          value={draft.contentEn.groomParentsRelation ?? ""}
                          onChange={(e) => updateEn("groomParentsRelation", e.target.value)}
                          placeholder={editForm.sonOfDefault.en}
                          aria-label={`${draft.groomLabel || defaultGroomLabelText}${editForm.parentsRelationAria[locale]}`}
                          className={`${inputClass} w-28 shrink-0`}
                        />
                        <input
                          value={draft.contentEn.groomParents ?? ""}
                          onChange={(e) => updateEn("groomParents", e.target.value)}
                          placeholder={editForm.groomParentsPlaceholder.en}
                          className={`${inputClass} min-w-0 flex-1`}
                        />
                      </div>
                    }
                  />
                  <BilingualField
                    label={`${draft.brideLabel || defaultBrideLabelText}${editForm.parentsSuffix[locale]}`}
                    bilingual={draft.bilingualEnabled}
                    zhInput={
                      <div className="flex gap-2">
                        <input
                          value={draft.brideParents}
                          onChange={(e) => update("brideParents", e.target.value)}
                          placeholder={editForm.brideParentsPlaceholder.zh}
                          className={`${inputClass} min-w-0 flex-1`}
                        />
                        <input
                          value={draft.brideParentsRelation}
                          onChange={(e) => update("brideParentsRelation", e.target.value)}
                          placeholder={editForm.daughterOfDefault.zh}
                          aria-label={`${draft.brideLabel || defaultBrideLabelText}${editForm.parentsRelationAria[locale]}`}
                          className={`${inputClass} w-20 shrink-0`}
                        />
                      </div>
                    }
                    enInput={
                      <div className="flex gap-2">
                        <input
                          value={draft.contentEn.brideParentsRelation ?? ""}
                          onChange={(e) => updateEn("brideParentsRelation", e.target.value)}
                          placeholder={editForm.daughterOfDefault.en}
                          aria-label={`${draft.brideLabel || defaultBrideLabelText}${editForm.parentsRelationAria[locale]}`}
                          className={`${inputClass} w-32 shrink-0`}
                        />
                        <input
                          value={draft.contentEn.brideParents ?? ""}
                          onChange={(e) => updateEn("brideParents", e.target.value)}
                          placeholder={editForm.brideParentsPlaceholder.en}
                          className={`${inputClass} min-w-0 flex-1`}
                        />
                      </div>
                    }
                  />
                </div>
              ) : (
                <HiddenSectionHint />
              )}
            </EditorCard>

            <EditorCard title={editForm.sections.venue[locale]}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BilingualField
                  label={editForm.venueName[locale]}
                  bilingual={draft.bilingualEnabled}
                  zhInput={
                    <input
                      value={draft.venueName}
                      onChange={(e) => update("venueName", e.target.value)}
                      className={inputClass}
                    />
                  }
                  enInput={
                    <input
                      value={draft.contentEn.venueName ?? ""}
                      onChange={(e) => updateEn("venueName", e.target.value)}
                      className={inputClass}
                    />
                  }
                />
                <BilingualField
                  label={editForm.venueHall[locale]}
                  bilingual={draft.bilingualEnabled}
                  zhInput={
                    <input
                      value={draft.venueHall}
                      onChange={(e) => update("venueHall", e.target.value)}
                      className={inputClass}
                    />
                  }
                  enInput={
                    <input
                      value={draft.contentEn.venueHall ?? ""}
                      onChange={(e) => updateEn("venueHall", e.target.value)}
                      className={inputClass}
                    />
                  }
                />
                <label className={`${labelClass} sm:col-span-2`}>
                  {editForm.venueAddress[locale]}
                  <input
                    value={draft.venueAddress}
                    onChange={(e) => update("venueAddress", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <p className="text-sm text-[var(--brand-ink-soft)] sm:col-span-2">
                  {!draft.manualCoords ? (
                    <button
                      type="button"
                      onClick={() => update("manualCoords", true)}
                      className="text-[var(--brand-gold)] underline"
                    >
                      {editForm.switchToManualCoords[locale]}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => update("manualCoords", false)}
                      className="text-[var(--brand-gold)] underline"
                    >
                      {editForm.switchToAutoLocate[locale]}
                    </button>
                  )}
                </p>
                {draft.manualCoords && (
                  <>
                    <label className={labelClass}>
                      {editForm.latitude[locale]}
                      <input
                        type="number"
                        step="any"
                        value={draft.venueLat}
                        onChange={(e) => update("venueLat", e.target.value)}
                        className={inputClass}
                      />
                    </label>
                    <label className={labelClass}>
                      {editForm.longitude[locale]}
                      <input
                        type="number"
                        step="any"
                        value={draft.venueLng}
                        onChange={(e) => update("venueLng", e.target.value)}
                        className={inputClass}
                      />
                    </label>
                  </>
                )}
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={locateVenue}
                    disabled={locating}
                    className="rounded border border-[var(--brand-line)] px-4 py-2 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)] disabled:opacity-60"
                  >
                    {locating ? editForm.locating[locale] : editForm.confirmMapLocation[locale]}
                  </button>
                  {locationPreview && (
                    <div className="mt-3 flex flex-col gap-2">
                      <p className="text-sm text-[var(--brand-ink-soft)]">
                        {editForm.locatedTimezonePrefix[locale]}
                        <span className="font-medium text-foreground">
                          {formatTimezoneLabel(timezone, locale)}
                        </span>
                      </p>
                      <div className="relative z-0 h-48 overflow-hidden rounded border border-[var(--brand-line)]">
                        <VenueMap
                          lat={locationPreview.lat}
                          lng={locationPreview.lng}
                          label={draft.venueName || "場地"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </EditorCard>

            <EditorCard title={editForm.sections.dateTime[locale]}>
              <label className={labelClass}>
                {editForm.dateTimeLabel[locale]}
                <input
                  type="datetime-local"
                  value={draft.eventDate}
                  onChange={(e) => update("eventDate", e.target.value)}
                  className={inputClass}
                />
              </label>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--brand-ink-soft)]">
                {editForm.timezonePrefix[locale]}<span className="font-medium text-foreground">{formatTimezoneLabel(timezone, locale)}</span>
                <InfoTooltip
                  text={
                    timezone === DEFAULT_TIMEZONE
                      ? draftEditorCopy.tooltipDefault[locale]
                      : draftEditorCopy.tooltipLocated[locale]
                  }
                />
              </p>
            </EditorCard>

            <EditorCard
              title={editForm.sections.schedule[locale]}
              action={
                <Toggle
                  checked={draft.showSchedule}
                  onChange={(v) => update("showSchedule", v)}
                  label={editForm.show[locale]}
                />
              }
            >
              {draft.showSchedule ? (
                <>
                  <div className="flex flex-col gap-3">
                    {draft.schedule.map((item, i) => (
                      <div key={i} className="flex flex-col gap-1.5">
                        <div className="flex items-stretch gap-2">
                          <input
                            value={item.time}
                            onChange={(e) =>
                              updateSchedule(i, { time: e.target.value })
                            }
                            placeholder={(SCHEDULE_PLACEHOLDERS[i] ?? SCHEDULE_PLACEHOLDER_FALLBACK).time.zh}
                            className={`${inputClass} w-20 shrink-0 sm:w-28`}
                          />
                          <div className="flex min-w-0 flex-1 items-stretch">
                            <span
                              className={
                                draft.bilingualEnabled
                                  ? "flex w-10 shrink-0 items-center justify-center rounded-l border border-r-0 border-[var(--brand-line)] bg-[var(--background)] text-[10px] font-medium tracking-wide text-[var(--brand-ink-soft)]"
                                  : "hidden"
                              }
                            >
                              中
                            </span>
                            <input
                              value={item.event}
                              onChange={(e) =>
                                updateSchedule(i, { event: e.target.value })
                              }
                              placeholder={(SCHEDULE_PLACEHOLDERS[i] ?? SCHEDULE_PLACEHOLDER_FALLBACK).event.zh}
                              className={`${inputClass} min-w-0 flex-1 ${draft.bilingualEnabled ? "rounded-l-none" : ""}`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                schedule: d.schedule.filter(
                                  (_, idx) => idx !== i,
                                ),
                                contentEn: {
                                  ...d.contentEn,
                                  schedule: (d.contentEn.schedule ?? []).filter((_, idx) => idx !== i),
                                },
                              }))
                            }
                            aria-label={editForm.deleteAria[locale]}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[var(--brand-line)] text-[var(--brand-ink-soft)] hover:border-[var(--brand-error)] hover:text-[var(--brand-error)]"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Indented to align under the event column above -
                            time is universal (no EN row for it), so the EN
                            row's leading spacer only needs to match the
                            time field's own width, not a pill's too, since
                            the pill now marks "event" (the actual
                            translatable text) on both rows. */}
                        <div className={draft.bilingualEnabled ? "flex items-stretch gap-2" : "hidden"}>
                          <span className="w-20 shrink-0 sm:w-28" aria-hidden="true" />
                          <div className="flex min-w-0 flex-1 items-stretch">
                            <span className="flex w-10 shrink-0 items-center justify-center rounded-l border border-r-0 border-[var(--brand-line)] bg-[var(--background)] text-[10px] font-medium tracking-wide text-[var(--brand-ink-soft)]">
                              EN
                            </span>
                            <input
                              value={draft.contentEn.schedule?.[i]?.event ?? ""}
                              onChange={(e) => updateScheduleEn(i, e.target.value)}
                              placeholder={(SCHEDULE_PLACEHOLDERS[i] ?? SCHEDULE_PLACEHOLDER_FALLBACK).event.en}
                              className={`${inputClass} min-w-0 flex-1 rounded-l-none`}
                            />
                          </div>
                          <span className="w-10 shrink-0" aria-hidden="true" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        schedule: [...d.schedule, { time: "", event: "" }],
                        contentEn: { ...d.contentEn, schedule: [...(d.contentEn.schedule ?? []), {}] },
                      }))
                    }
                    className="mt-2 rounded border border-[var(--brand-line)] px-3 py-1.5 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)]"
                  >
                    {editForm.addScheduleItem[locale]}
                  </button>
                </>
              ) : (
                <HiddenSectionHint />
              )}
            </EditorCard>

            <EditorCard
              title={editForm.sections.dressCode[locale]}
              action={
                <Toggle
                  checked={draft.showDressCode}
                  onChange={(v) => update("showDressCode", v)}
                  label={editForm.show[locale]}
                />
              }
            >
              {draft.showDressCode ? (
                <BilingualField
                  bilingual={draft.bilingualEnabled}
                  zhInput={
                    <textarea
                      value={draft.dressCode}
                      onChange={(e) => update("dressCode", e.target.value)}
                      placeholder={editForm.dressCodePlaceholder.zh}
                      rows={2}
                      className={`${inputClass} min-w-0 flex-1`}
                    />
                  }
                  enInput={
                    <textarea
                      value={draft.contentEn.dressCode ?? ""}
                      onChange={(e) => updateEn("dressCode", e.target.value)}
                      placeholder={editForm.dressCodePlaceholder.en}
                      rows={2}
                      className={`${inputClass} min-w-0 flex-1`}
                    />
                  }
                />
              ) : (
                <HiddenSectionHint />
              )}
            </EditorCard>

            <EditorCard
              title={editForm.sections.rsvp[locale]}
              action={
                <Toggle
                  checked={draft.showRsvp}
                  onChange={(v) => update("showRsvp", v)}
                  label={editForm.show[locale]}
                />
              }
            >
              {draft.showRsvp ? (
                <p className="text-sm text-[var(--brand-ink-soft)]">
                  {draftEditorCopy.rsvpHint[locale]}
                </p>
              ) : (
                <HiddenSectionHint />
              )}
            </EditorCard>

            <EditorCard title={editForm.sections.thanks[locale]}>
              <BilingualField
                bilingual={draft.bilingualEnabled}
                zhInput={
                  <textarea
                    value={draft.thanksMessage}
                    onChange={(e) => update("thanksMessage", e.target.value)}
                    placeholder={THANKS_MESSAGE_FALLBACK.zh}
                    rows={3}
                    className={`${inputClass} min-w-0 flex-1`}
                  />
                }
                enInput={
                  <textarea
                    value={draft.contentEn.thanksMessage ?? ""}
                    onChange={(e) => updateEn("thanksMessage", e.target.value)}
                    placeholder={THANKS_MESSAGE_FALLBACK.en}
                    rows={3}
                    className={`${inputClass} min-w-0 flex-1`}
                  />
                }
              />
            </EditorCard>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--brand-line)] bg-[var(--background)]/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-col items-end gap-1 px-6 py-3">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowAuth(true)}
                className="rounded border border-[var(--brand-gold)] px-6 py-2.5 text-[var(--brand-gold)] transition-colors hover:bg-[var(--brand-gold)] hover:text-white disabled:opacity-60"
              >
                {saving ? chromeCopy.saving[locale] : draftEditorCopy.saveInvitation[locale]}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPreview(true);
                  // The preview swaps in fresh content under the same
                  // window scroll position, so without this it can open
                  // wherever the editor form happened to be scrolled to
                  // instead of the envelope at the top.
                  window.scrollTo({ top: 0, behavior: "instant" });
                }}
                className="rounded bg-[var(--brand-gold)] px-6 py-2.5 text-white transition-opacity hover:opacity-90"
              >
                {draftEditorCopy.previewInvitation[locale]}
              </button>
            </div>
          </div>
        </div>

        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuthenticated={(user) => {
              setShowAuth(false);
              finalizeSave(user);
            }}
          />
        )}
      </div>
    </>
  );
}
