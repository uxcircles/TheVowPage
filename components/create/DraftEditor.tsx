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
  thanksMessage: THANKS_MESSAGE_FALLBACK,
  showFamily: true,
  showSchedule: true,
  showDressCode: true,
  showRsvp: true,
};

const inputClass =
  "rounded border border-[var(--brand-line)] bg-white px-3 py-2 text-foreground";
const labelClass = "flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]";

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
            className="rounded border border-[var(--brand-line)] px-3 py-1.5 text-[var(--brand-ink-soft)] hover:border-red-400 hover:text-red-500"
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

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(hydrated);
    setDraftHydrated(true);
  }, []);

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

  function updateSchedule(i: number, patch: Partial<ScheduleItem>) {
    setDraft((d) => ({
      ...d,
      schedule: d.schedule.map((item, idx) =>
        idx === i ? { ...item, ...patch } : item,
      ),
    }));
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
      groomLabel: draft.groomLabel || "新郎",
      brideLabel: draft.brideLabel || "新娘",
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
      const weddingId = await saveDraftAsWedding(draft, photos, user.id);
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
            <EditorCard title={editForm.sections.basicInfo[locale]}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Editable role labels (default 新郎/新娘) so the
                    invitation can read correctly for same-sex couples too,
                    e.g. "新人一/新人二" - they double as the field labels
                    below via live state. */}
                <label className={labelClass}>
                  {editForm.groomLabelField[locale]}
                  <input
                    value={draft.groomLabel}
                    onChange={(e) => update("groomLabel", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  {editForm.brideLabelField[locale]}
                  <input
                    value={draft.brideLabel}
                    onChange={(e) => update("brideLabel", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  {draft.groomLabel || "新郎"}{editForm.nameSuffix[locale]}
                  <input
                    value={draft.groomName}
                    onChange={(e) => update("groomName", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  {draft.brideLabel || "新娘"}{editForm.nameSuffix[locale]}
                  <input
                    value={draft.brideName}
                    onChange={(e) => update("brideName", e.target.value)}
                    className={inputClass}
                  />
                </label>
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
                  <label className={labelClass}>
                    {draft.groomLabel || "新郎"}{editForm.parentsSuffix[locale]}
                    <div className="flex gap-2">
                      <input
                        value={draft.groomParents}
                        onChange={(e) => update("groomParents", e.target.value)}
                        placeholder="林建平・王淑芬"
                        className={`${inputClass} min-w-0 flex-1`}
                      />
                      <input
                        value={draft.groomParentsRelation}
                        onChange={(e) => update("groomParentsRelation", e.target.value)}
                        placeholder="之子"
                        aria-label={`${draft.groomLabel || "新郎"}${editForm.parentsRelationAria[locale]}`}
                        className={`${inputClass} w-20 shrink-0`}
                      />
                    </div>
                  </label>
                  <label className={labelClass}>
                    {draft.brideLabel || "新娘"}{editForm.parentsSuffix[locale]}
                    <div className="flex gap-2">
                      <input
                        value={draft.brideParents}
                        onChange={(e) => update("brideParents", e.target.value)}
                        placeholder="黃文昌・李美玲"
                        className={`${inputClass} min-w-0 flex-1`}
                      />
                      <input
                        value={draft.brideParentsRelation}
                        onChange={(e) => update("brideParentsRelation", e.target.value)}
                        placeholder="之女"
                        aria-label={`${draft.brideLabel || "新娘"}${editForm.parentsRelationAria[locale]}`}
                        className={`${inputClass} w-20 shrink-0`}
                      />
                    </div>
                  </label>
                </div>
              ) : (
                <HiddenSectionHint />
              )}
            </EditorCard>

            <EditorCard title={editForm.sections.venue[locale]}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  {editForm.venueName[locale]}
                  <input
                    value={draft.venueName}
                    onChange={(e) => update("venueName", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  {editForm.venueHall[locale]}
                  <input
                    value={draft.venueHall}
                    onChange={(e) => update("venueHall", e.target.value)}
                    className={inputClass}
                  />
                </label>
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
                      <div className="h-48 overflow-hidden rounded border border-[var(--brand-line)]">
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
                  <div className="flex flex-col gap-2">
                    {draft.schedule.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={item.time}
                          onChange={(e) =>
                            updateSchedule(i, { time: e.target.value })
                          }
                          placeholder={(SCHEDULE_PLACEHOLDERS[i] ?? SCHEDULE_PLACEHOLDER_FALLBACK).time}
                          className={`${inputClass} w-20 shrink-0 sm:w-28`}
                        />
                        <input
                          value={item.event}
                          onChange={(e) =>
                            updateSchedule(i, { event: e.target.value })
                          }
                          placeholder={(SCHEDULE_PLACEHOLDERS[i] ?? SCHEDULE_PLACEHOLDER_FALLBACK).event}
                          className={`${inputClass} min-w-0 flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              schedule: d.schedule.filter(
                                (_, idx) => idx !== i,
                              ),
                            }))
                          }
                          aria-label={editForm.deleteAria[locale]}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[var(--brand-line)] text-[var(--brand-ink-soft)] hover:border-red-400 hover:text-red-500"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        schedule: [...d.schedule, { time: "", event: "" }],
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
                <textarea
                  value={draft.dressCode}
                  onChange={(e) => update("dressCode", e.target.value)}
                  placeholder="建議服裝：香檳金、酒紅色系，避免純白色系"
                  rows={2}
                  className={`${inputClass} w-full`}
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
              <textarea
                value={draft.thanksMessage}
                onChange={(e) => update("thanksMessage", e.target.value)}
                rows={3}
                className={`${inputClass} w-full`}
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
