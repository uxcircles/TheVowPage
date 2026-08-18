"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { updateWeddingContent } from "@/lib/actions/weddings";
import { fetchGeocode } from "@/lib/create-wedding-client";
import { toDatetimeLocalValue, wallTimeToUtcIso, formatTimezoneLabel } from "@/lib/timezone";
import { Toggle } from "@/components/ui/Toggle";
import { BilingualField } from "@/components/ui/BilingualField";
import { EditorCard, HiddenSectionHint } from "@/components/ui/EditorCard";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useToast } from "@/components/ui/Toast";
import { VenueMap } from "@/components/templates/classic/VenueMap";
import { useEditSaveBar, useEditPreview, useSetDirty } from "@/components/dashboard/WeddingChrome";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { editForm } from "@/lib/i18n/dictionaries/dashboard";
import type { Locale } from "@/lib/i18n/shared";
import type { Tables } from "@/lib/supabase/database.types";
import {
  SCHEDULE_PLACEHOLDERS,
  SCHEDULE_PLACEHOLDER_FALLBACK,
  THANKS_MESSAGE_FALLBACK,
  emptySchedule,
  type ClassicTemplateData,
  type ContentEn,
  type ScheduleItem,
} from "@/components/templates/classic/types";

const inputClass = "rounded border border-[var(--brand-line)] bg-white px-3 py-2 text-foreground";
const labelClass = "flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]";

// Smart default for the "關係稱謂" field, applied once when the field is
// first rendered (not kept in sync with later 稱謂 edits): only fills in
// a relation word when the couple is still using the standard 新郎/新娘
// labels, since a custom label (e.g. "新人一") has no obvious relation word.
function defaultParentsRelation(label: string, standardLabel: string, relationWord: string) {
  return label === standardLabel ? relationWord : "";
}

// Exported so fields that live outside this form in the DOM (the style/seal
// picker and the Moments-style picker, both rendered in sibling EditorCards
// on the edit page) can still submit into it via the HTML `form` attribute.
export const FORM_ID = "wedding-edit-form";

export function WeddingEditForm({
  weddingId,
  wedding,
  heroPhotoUrl,
  familyPhotoUrl,
  footerPhotoUrl,
  momentPhotoUrls,
}: {
  weddingId: string;
  wedding: Tables<"weddings">;
  heroPhotoUrl: string | null;
  familyPhotoUrl: string | null;
  footerPhotoUrl: string | null;
  momentPhotoUrls: string[];
}) {
  const locale = useLocale();
  // Standard-label defaults follow site locale so a wedding started from
  // the English UI doesn't end up with Chinese-only labels/content - see
  // the matching defaultGroomLabel/defaultBrideLabel in lib/actions/weddings.ts,
  // which is what actually determined `wedding.groom_label`/`bride_label`
  // at creation time. These are just the same defaults for display/fallback
  // purposes here in the client.
  const defaultGroomLabelText = locale === "en" ? "Groom" : "新郎";
  const defaultBrideLabelText = locale === "en" ? "Bride" : "新娘";
  const showToast = useToast();
  const action = updateWeddingContent.bind(null, weddingId);
  const [state, formAction, pending] = useActionState(action, undefined);
  useEditSaveBar({ formId: FORM_ID, pending, error: state?.error, success: state?.success });
  const formRef = useRef<HTMLFormElement>(null);
  const setDirty = useSetDirty();

  // A single delegated listener catches typing/selecting in any native
  // form control (input/textarea/select) without needing to track every
  // field's value individually - covers virtually everything in this form
  // except the theme/seal/moments pickers, which mark dirty themselves
  // (see useSetDirty's doc comment for why those can't be caught here).
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    function markDirty() {
      setDirty(true);
    }
    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
    };
  }, [setDirty]);

  // Edge-detected on the pending->!pending transition (not just whenever
  // state.success is truthy) for the same reason WeddingChrome's own
  // toast-trigger effect does this: state.success stays the same `true`
  // across renders once set, so a plain `state?.success` dependency
  // wouldn't re-fire on a second consecutive successful save.
  const wasPendingRef = useRef(false);
  useEffect(() => {
    const justFinished = wasPendingRef.current && !pending;
    wasPendingRef.current = pending;
    if (justFinished && state?.success) setDirty(false);
  }, [pending, state?.success, setDirty]);

  // Leaving 內容編輯 entirely (unmount) - nothing left to lose from here.
  useEffect(() => {
    return () => setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const savedSchedule = wedding.schedule as ScheduleItem[] | null;
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    savedSchedule && savedSchedule.length > 0 ? savedSchedule : emptySchedule()
  );
  const [manualCoords, setManualCoords] = useState(false);
  const [groomLabel, setGroomLabel] = useState(wedding.groom_label);
  const [brideLabel, setBrideLabel] = useState(wedding.bride_label);
  const [bilingual, setBilingual] = useState(wedding.bilingual_enabled);
  const contentEn = (wedding.content_en as ContentEn | null) ?? {};
  // Each pill row's default relation word is now fixed to that row's own
  // language (ZH-HANT always "之子"/"之女", EN always "Son of"/"Daughter
  // of") rather than following whichever locale the admin dashboard itself
  // happens to be viewed in - the two rows are different languages by
  // definition, independent of the editor's own UI language.
  const groomParentsRelationDefaultZh =
    wedding.groom_parents_relation || defaultParentsRelation(wedding.groom_label, "新郎", editForm.sonOfDefault.zh);
  const brideParentsRelationDefaultZh =
    wedding.bride_parents_relation || defaultParentsRelation(wedding.bride_label, "新娘", editForm.daughterOfDefault.zh);
  const groomParentsRelationDefaultEn = contentEn.groomParentsRelation || editForm.sonOfDefault.en;
  const brideParentsRelationDefaultEn = contentEn.brideParentsRelation || editForm.daughterOfDefault.en;
  const [showFamily, setShowFamily] = useState(wedding.show_family);
  const [showSchedule, setShowSchedule] = useState(wedding.show_schedule);
  const [showDressCode, setShowDressCode] = useState(wedding.show_dress_code);
  const [showRsvp, setShowRsvp] = useState(wedding.show_rsvp);

  const venueNameRef = useRef<HTMLInputElement>(null);
  const venueAddressRef = useRef<HTMLInputElement>(null);
  const venueLatRef = useRef<HTMLInputElement>(null);
  const venueLngRef = useRef<HTMLInputElement>(null);
  const [locating, setLocating] = useState(false);
  const [locationPreview, setLocationPreview] = useState<{ lat: number; lng: number } | null>(null);
  const [previewTimezone, setPreviewTimezone] = useState<string | null>(null);
  // Tracks the address we last auto-filled, so a re-search can still refresh
  // it - but only while it still matches what we set (i.e. the user hasn't
  // typed their own address over it since).
  const lastAutoFilledAddressRef = useRef<string | null>(null);

  async function locateVenue() {
    setLocating(true);
    const result = manualCoords
      ? await fetchGeocode({
          lat: Number(venueLatRef.current?.value ?? ""),
          lng: Number(venueLngRef.current?.value ?? ""),
        })
      : await fetchGeocode({
          venueName: venueNameRef.current?.value ?? "",
          address: venueAddressRef.current?.value ?? "",
        });
    setLocating(false);
    if (!result) {
      setLocationPreview(null);
      showToast(editForm.locateFailed[locale], "error");
      return;
    }
    setLocationPreview({ lat: result.lat, lng: result.lng });
    setPreviewTimezone(result.timezone);
    // Offer Nominatim's own formatted address for free, but never overwrite
    // an address the user typed themselves - only refresh it if it's still
    // empty or still exactly what we auto-filled last time.
    if (result.address && venueAddressRef.current) {
      const current = venueAddressRef.current.value.trim();
      if (!current || current === lastAutoFilledAddressRef.current) {
        venueAddressRef.current.value = result.address;
        lastAutoFilledAddressRef.current = result.address;
      }
    }
  }

  // Snapshots the form's *current* (possibly unsaved) values into
  // ClassicTemplateData for the live preview. Most fields here are
  // uncontrolled inputs (defaultValue only), so their live-typed values
  // have to be read via FormData at snapshot time - React state alone
  // (schedule additions/toggles) doesn't capture them. theme/seal/
  // momentsStyle are rendered by sibling components outside this <form>,
  // wired in via the HTML `form` attribute, so FormData still picks them up.
  const getPreviewSnapshot = useCallback((): ClassicTemplateData => {
    const fd = new FormData(formRef.current ?? undefined);
    const timezone = previewTimezone ?? wedding.timezone;
    const times = fd.getAll("scheduleTime") as string[];
    const events = fd.getAll("scheduleEvent") as string[];
    const enEvents = fd.getAll("en_scheduleEvent") as string[];
    return {
      weddingId: wedding.id,
      theme: String(fd.get("theme") ?? wedding.theme),
      sealDesign: String(fd.get("seal") ?? wedding.seal),
      momentsStyle: String(fd.get("momentsStyle") ?? wedding.moments_style),
      groomName: String(fd.get("groomName") ?? ""),
      brideName: String(fd.get("brideName") ?? ""),
      groomLabel: groomLabel || defaultGroomLabelText,
      brideLabel: brideLabel || defaultBrideLabelText,
      groomParents: String(fd.get("groomParents") ?? ""),
      groomParentsRelation: String(fd.get("groomParentsRelation") ?? ""),
      brideParents: String(fd.get("brideParents") ?? ""),
      brideParentsRelation: String(fd.get("brideParentsRelation") ?? ""),
      eventDate: wallTimeToUtcIso(String(fd.get("eventDate") ?? ""), timezone),
      timezone,
      venueName: String(fd.get("venueName") ?? ""),
      venueHall: String(fd.get("venueHall") ?? ""),
      venueAddress: String(fd.get("venueAddress") ?? ""),
      venueLat: locationPreview?.lat ?? wedding.venue_lat,
      venueLng: locationPreview?.lng ?? wedding.venue_lng,
      schedule: times
        .map((time, i) => ({ time, event: events[i] ?? "" }))
        .filter((item) => item.time || item.event),
      dressCode: String(fd.get("dressCode") ?? ""),
      thanksMessage: String(fd.get("thanksMessage") ?? ""),
      heroPhotoUrl,
      familyPhotoUrl,
      footerPhotoUrl,
      momentPhotoUrls,
      showFamily,
      showSchedule,
      showDressCode,
      showRsvp,
      bilingualEnabled: bilingual,
      contentEn: {
        groomName: String(fd.get("en_groomName") ?? ""),
        brideName: String(fd.get("en_brideName") ?? ""),
        groomLabel: String(fd.get("en_groomLabel") ?? ""),
        brideLabel: String(fd.get("en_brideLabel") ?? ""),
        groomParents: String(fd.get("en_groomParents") ?? ""),
        groomParentsRelation: String(fd.get("en_groomParentsRelation") ?? ""),
        brideParents: String(fd.get("en_brideParents") ?? ""),
        brideParentsRelation: String(fd.get("en_brideParentsRelation") ?? ""),
        venueName: String(fd.get("en_venueName") ?? ""),
        venueHall: String(fd.get("en_venueHall") ?? ""),
        dressCode: String(fd.get("en_dressCode") ?? ""),
        thanksMessage: String(fd.get("en_thanksMessage") ?? ""),
        schedule: enEvents.map((event) => ({ event })),
      },
    };
  }, [
    wedding,
    previewTimezone,
    locationPreview,
    bilingual,
    heroPhotoUrl,
    familyPhotoUrl,
    footerPhotoUrl,
    momentPhotoUrls,
    groomLabel,
    brideLabel,
    showFamily,
    showSchedule,
    showDressCode,
    showRsvp,
  ]);
  useEditPreview(getPreviewSnapshot);

  return (
    <form ref={formRef} id={FORM_ID} action={formAction} className="flex flex-col gap-6">

      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--brand-line)] bg-white p-4 shadow-sm">
        <input type="hidden" name="bilingualEnabled" value={bilingual ? "on" : "off"} />
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {editForm.bilingualToggle[locale]}
          <InfoTooltip text={editForm.bilingualToggleTooltip[locale]} />
        </span>
        <Toggle
          checked={bilingual}
          onChange={(v) => {
            setBilingual(v);
            setDirty(true);
          }}
        />
      </div>

      <EditorCard title={editForm.sections.basicInfo[locale]}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Editable role labels (default 新郎/新娘) so the invitation can
              read correctly for same-sex couples too, e.g. "新人一/新人二" -
              they double as the field labels below via live state. */}
          <BilingualField
            label={editForm.groomLabelField[locale]}
            bilingual={bilingual}
            zhInput={
              <input
                name="groomLabel"
                value={groomLabel}
                onChange={(e) => setGroomLabel(e.target.value)}
                className={inputClass}
              />
            }
            enInput={<input name="en_groomLabel" defaultValue={contentEn.groomLabel ?? ""} className={inputClass} />}
          />
          <BilingualField
            label={editForm.brideLabelField[locale]}
            bilingual={bilingual}
            zhInput={
              <input
                name="brideLabel"
                value={brideLabel}
                onChange={(e) => setBrideLabel(e.target.value)}
                className={inputClass}
              />
            }
            enInput={<input name="en_brideLabel" defaultValue={contentEn.brideLabel ?? ""} className={inputClass} />}
          />
          <BilingualField
            label={`${groomLabel || defaultGroomLabelText}${editForm.nameSuffix[locale]}`}
            bilingual={bilingual}
            zhInput={<input name="groomName" defaultValue={wedding.groom_name} className={inputClass} />}
            enInput={<input name="en_groomName" defaultValue={contentEn.groomName ?? ""} className={inputClass} />}
          />
          <BilingualField
            label={`${brideLabel || defaultBrideLabelText}${editForm.nameSuffix[locale]}`}
            bilingual={bilingual}
            zhInput={<input name="brideName" defaultValue={wedding.bride_name} className={inputClass} />}
            enInput={<input name="en_brideName" defaultValue={contentEn.brideName ?? ""} className={inputClass} />}
          />
        </div>
      </EditorCard>

      <EditorCard
        title={editForm.sections.family[locale]}
        action={<Toggle checked={showFamily} onChange={setShowFamily} label={editForm.show[locale]} />}
      >
        <input type="hidden" name="showFamily" value={showFamily ? "on" : "off"} />
        {/* Fields stay mounted (just visually hidden) when the toggle is off,
            so saving while hidden doesn't wipe out already-entered content -
            hidden form fields still submit their value normally. */}
        <div className={showFamily ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "hidden"}>
          <BilingualField
            label={`${groomLabel || defaultGroomLabelText}${editForm.parentsSuffix[locale]}`}
            bilingual={bilingual}
            zhInput={
              <div className="flex gap-2">
                <input
                  name="groomParents"
                  defaultValue={wedding.groom_parents}
                  placeholder={editForm.groomParentsPlaceholder.zh}
                  className={`${inputClass} min-w-0 flex-1`}
                />
                <input
                  name="groomParentsRelation"
                  defaultValue={groomParentsRelationDefaultZh}
                  placeholder={editForm.sonOfDefault.zh}
                  aria-label={`${groomLabel || defaultGroomLabelText}${editForm.parentsRelationAria[locale]}`}
                  className={`${inputClass} w-20 shrink-0`}
                />
              </div>
            }
            enInput={
              <div className="flex gap-2">
                <input
                  name="en_groomParentsRelation"
                  defaultValue={groomParentsRelationDefaultEn}
                  placeholder={editForm.sonOfDefault.en}
                  aria-label={`${groomLabel || defaultGroomLabelText}${editForm.parentsRelationAria[locale]}`}
                  className={`${inputClass} w-28 shrink-0`}
                />
                <input
                  name="en_groomParents"
                  defaultValue={contentEn.groomParents ?? ""}
                  placeholder={editForm.groomParentsPlaceholder.en}
                  className={`${inputClass} min-w-0 flex-1`}
                />
              </div>
            }
          />
          <BilingualField
            label={`${brideLabel || defaultBrideLabelText}${editForm.parentsSuffix[locale]}`}
            bilingual={bilingual}
            zhInput={
              <div className="flex gap-2">
                <input
                  name="brideParents"
                  defaultValue={wedding.bride_parents}
                  placeholder={editForm.brideParentsPlaceholder.zh}
                  className={`${inputClass} min-w-0 flex-1`}
                />
                <input
                  name="brideParentsRelation"
                  defaultValue={brideParentsRelationDefaultZh}
                  placeholder={editForm.daughterOfDefault.zh}
                  aria-label={`${brideLabel || defaultBrideLabelText}${editForm.parentsRelationAria[locale]}`}
                  className={`${inputClass} w-20 shrink-0`}
                />
              </div>
            }
            enInput={
              <div className="flex gap-2">
                <input
                  name="en_brideParentsRelation"
                  defaultValue={brideParentsRelationDefaultEn}
                  placeholder={editForm.daughterOfDefault.en}
                  aria-label={`${brideLabel || defaultBrideLabelText}${editForm.parentsRelationAria[locale]}`}
                  className={`${inputClass} w-32 shrink-0`}
                />
                <input
                  name="en_brideParents"
                  defaultValue={contentEn.brideParents ?? ""}
                  placeholder={editForm.brideParentsPlaceholder.en}
                  className={`${inputClass} min-w-0 flex-1`}
                />
              </div>
            }
          />
        </div>
        {!showFamily && <HiddenSectionHint />}
      </EditorCard>

      <EditorCard title={editForm.sections.venue[locale]}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BilingualField
            label={editForm.venueName[locale]}
            bilingual={bilingual}
            zhInput={<input ref={venueNameRef} name="venueName" defaultValue={wedding.venue_name} className={inputClass} />}
            enInput={<input name="en_venueName" defaultValue={contentEn.venueName ?? ""} className={inputClass} />}
          />
          <BilingualField
            label={editForm.venueHall[locale]}
            bilingual={bilingual}
            zhInput={<input name="venueHall" defaultValue={wedding.venue_hall} className={inputClass} />}
            enInput={<input name="en_venueHall" defaultValue={contentEn.venueHall ?? ""} className={inputClass} />}
          />
          <label className={`${labelClass} sm:col-span-2`}>
            {editForm.venueAddress[locale]}
            <input
              ref={venueAddressRef}
              name="venueAddress"
              defaultValue={wedding.venue_address}
              className={inputClass}
            />
          </label>
          <input type="hidden" name="manualCoords" value={manualCoords ? "on" : "off"} />
          <p className="text-sm text-[var(--brand-ink-soft)] sm:col-span-2">
            {!manualCoords ? (
              <button
                type="button"
                onClick={() => setManualCoords(true)}
                className="text-[var(--brand-gold)] underline"
              >
                {editForm.switchToManualCoords[locale]}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setManualCoords(false)}
                className="text-[var(--brand-gold)] underline"
              >
                {editForm.switchToAutoLocate[locale]}
              </button>
            )}
          </p>
          {manualCoords && (
            <>
              <label className={labelClass}>
                {editForm.latitude[locale]}
                <input
                  ref={venueLatRef}
                  name="venueLat"
                  type="number"
                  step="any"
                  defaultValue={wedding.venue_lat ?? ""}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                {editForm.longitude[locale]}
                <input
                  ref={venueLngRef}
                  name="venueLng"
                  type="number"
                  step="any"
                  defaultValue={wedding.venue_lng ?? ""}
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
                  <span className="font-medium text-foreground">{previewTimezone && formatTimezoneLabel(previewTimezone, locale)}</span>
                </p>
                <div className="relative z-0 h-48 overflow-hidden rounded border border-[var(--brand-line)]">
                  <VenueMap
                    lat={locationPreview.lat}
                    lng={locationPreview.lng}
                    label={wedding.venue_name || "場地"}
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
            name="eventDate"
            defaultValue={toDatetimeLocalValue(wedding.event_date, wedding.timezone)}
            className={inputClass}
          />
        </label>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--brand-ink-soft)]">
          {editForm.timezonePrefix[locale]}<span className="font-medium text-foreground">{formatTimezoneLabel(wedding.timezone, locale)}</span>
          <InfoTooltip text={editForm.timezoneTooltip[locale]} />
        </p>
      </EditorCard>

      <EditorCard
        title={editForm.sections.schedule[locale]}
        action={<Toggle checked={showSchedule} onChange={setShowSchedule} label={editForm.show[locale]} />}
      >
        <input type="hidden" name="showSchedule" value={showSchedule ? "on" : "off"} />
        {/* Same "stay mounted, just hidden" reasoning as the family section
            above - the timeline row inputs must keep submitting even while
            hidden, or a save while hidden would erase the schedule. */}
        <div className={showSchedule ? "" : "hidden"}>
          <div className="flex flex-col gap-3">
            {schedule.map((item, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex items-stretch gap-2">
                  <input
                    name="scheduleTime"
                    defaultValue={item.time}
                    placeholder={(SCHEDULE_PLACEHOLDERS[i] ?? SCHEDULE_PLACEHOLDER_FALLBACK).time.zh}
                    className={`${inputClass} w-20 shrink-0 sm:w-28`}
                  />
                  <div className="flex min-w-0 flex-1 items-stretch">
                    <span
                      className={
                        bilingual
                          ? "flex w-16 shrink-0 items-center justify-center rounded-l border border-r-0 border-[var(--brand-line)] bg-[var(--background)] text-[10px] font-medium tracking-wide text-[var(--brand-ink-soft)]"
                          : "hidden"
                      }
                    >
                      ZH-HANT
                    </span>
                    <input
                      name="scheduleEvent"
                      defaultValue={item.event}
                      placeholder={(SCHEDULE_PLACEHOLDERS[i] ?? SCHEDULE_PLACEHOLDER_FALLBACK).event.zh}
                      className={`${inputClass} min-w-0 flex-1 ${bilingual ? "rounded-l-none" : ""}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSchedule((s) => s.filter((_, idx) => idx !== i))}
                    aria-label={editForm.deleteAria[locale]}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[var(--brand-line)] text-[var(--brand-ink-soft)] hover:border-red-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                {/* Indented to align under the event column above - time is
                    universal (no EN row for it), so the EN row's leading
                    spacer only needs to match the time field's own width,
                    not a pill's too, since the pill now marks "event" (the
                    actual translatable text) on both rows instead of
                    "time" (which has no language). */}
                <div className={bilingual ? "flex items-stretch gap-2" : "hidden"}>
                  <span className="w-20 shrink-0 sm:w-28" aria-hidden="true" />
                  <div className="flex min-w-0 flex-1 items-stretch">
                    <span className="flex w-16 shrink-0 items-center justify-center rounded-l border border-r-0 border-[var(--brand-line)] bg-[var(--background)] text-[10px] font-medium tracking-wide text-[var(--brand-ink-soft)]">
                      EN
                    </span>
                    <input
                      name="en_scheduleEvent"
                      defaultValue={contentEn.schedule?.[i]?.event ?? ""}
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
            onClick={() => setSchedule((s) => [...s, { time: "", event: "" }])}
            className="mt-2 rounded border border-[var(--brand-line)] px-3 py-1.5 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)]"
          >
            {editForm.addScheduleItem[locale]}
          </button>
        </div>
        {!showSchedule && <HiddenSectionHint />}
      </EditorCard>

      <EditorCard
        title={editForm.sections.dressCode[locale]}
        action={<Toggle checked={showDressCode} onChange={setShowDressCode} label={editForm.show[locale]} />}
      >
        <input type="hidden" name="showDressCode" value={showDressCode ? "on" : "off"} />
        <div className={showDressCode ? "" : "hidden"}>
          <BilingualField
            bilingual={bilingual}
            zhInput={
              <textarea
                name="dressCode"
                defaultValue={wedding.dress_code}
                placeholder={editForm.dressCodePlaceholder.zh}
                rows={2}
                className={`${inputClass} min-w-0 flex-1`}
              />
            }
            enInput={
              <textarea
                name="en_dressCode"
                defaultValue={contentEn.dressCode ?? ""}
                placeholder={editForm.dressCodePlaceholder.en}
                rows={2}
                className={`${inputClass} min-w-0 flex-1`}
              />
            }
          />
        </div>
        {!showDressCode && <HiddenSectionHint />}
      </EditorCard>

      <EditorCard
        title={editForm.sections.rsvp[locale]}
        action={<Toggle checked={showRsvp} onChange={setShowRsvp} label={editForm.show[locale]} />}
      >
        <input type="hidden" name="showRsvp" value={showRsvp ? "on" : "off"} />
        {showRsvp ? (
          <p className="text-sm text-[var(--brand-ink-soft)]">{editForm.rsvpEnabledHint[locale]}</p>
        ) : (
          <HiddenSectionHint />
        )}
      </EditorCard>

      <EditorCard title={editForm.sections.thanks[locale]}>
        <BilingualField
          bilingual={bilingual}
          zhInput={
            <textarea
              name="thanksMessage"
              defaultValue={wedding.thanks_message}
              placeholder={THANKS_MESSAGE_FALLBACK.zh}
              rows={3}
              className={`${inputClass} min-w-0 flex-1`}
            />
          }
          enInput={
            <textarea
              name="en_thanksMessage"
              defaultValue={contentEn.thanksMessage ?? ""}
              placeholder={THANKS_MESSAGE_FALLBACK.en}
              rows={3}
              className={`${inputClass} min-w-0 flex-1`}
            />
          }
        />
      </EditorCard>
    </form>
  );
}
