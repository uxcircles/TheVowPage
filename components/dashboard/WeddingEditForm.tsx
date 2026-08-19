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
  // Same "which language renders on top" rule as BilingualField, for the
  // one place (schedule rows) that hand-rolls its own pill markup instead
  // of going through that shared component - see BilingualField's own
  // comment for the full reasoning.
  const zhFirst = locale !== "en";
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
  const [manualCoords, setManualCoords] = useState(false);
  const [groomLabel, setGroomLabel] = useState(wedding.groom_label);
  const [brideLabel, setBrideLabel] = useState(wedding.bride_label);
  const [bilingual, setBilingual] = useState(wedding.bilingual_enabled);
  const contentEn = (wedding.content_en as ContentEn | null) ?? {};
  // Zipped with contentEn.schedule by index once, at seed time, into a
  // single row per item carrying both languages plus a stable client-only
  // id - not the array *position*. Deleting/adding rows previously kept
  // `key={i}`, which is a well-known trap for a list of *uncontrolled*
  // inputs: React matches by position, so removing row 2 doesn't unmount
  // that DOM node, it reuses it for what's now row 2 (the old row 3) -
  // but an uncontrolled input's `defaultValue` only applies at actual
  // mount, so the reused box kept showing the *old* row's leftover text
  // instead of the new item's. Whatever was on screen (stale) is what got
  // submitted on save, which is exactly the "reverts to what I typed
  // before" bug this fixes. Keying by a stable id per row - and keeping
  // its own EN text bundled with it - means React unmounts the right node
  // on delete and never cross-wires a row's zh text with a *different*
  // row's en text after a reorder either.
  const [schedule, setSchedule] = useState(() => {
    const savedSchedule = wedding.schedule as ScheduleItem[] | null;
    const rows = savedSchedule && savedSchedule.length > 0 ? savedSchedule : emptySchedule();
    return rows.map((item, i) => ({
      id: crypto.randomUUID(),
      time: item.time,
      event: item.event,
      eventEn: contentEn.schedule?.[i]?.event ?? "",
    }));
  });
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
  const venueNameEnRef = useRef<HTMLInputElement>(null);
  const venueAddressRef = useRef<HTMLInputElement>(null);
  const venueLatRef = useRef<HTMLInputElement>(null);
  const venueLngRef = useRef<HTMLInputElement>(null);
  const [locating, setLocating] = useState(false);
  const [locationPreview, setLocationPreview] = useState<{ lat: number; lng: number } | null>(null);
  const [previewTimezone, setPreviewTimezone] = useState<string | null>(null);
  // The map preview's popup label used to read wedding.venue_name - a
  // server prop frozen at page load, not the live input - so re-searching
  // after editing the venue name (e.g. replacing a UK venue with a new
  // Taipei one) moved the pin correctly but left the *label* showing
  // whatever venue name was saved last time. Captured here instead, from
  // whichever field actually got searched.
  const [locatedVenueName, setLocatedVenueName] = useState<string | null>(null);

  async function locateVenue() {
    setLocating(true);
    const venueNameVal = venueNameRef.current?.value ?? "";
    const venueNameEnVal = venueNameEnRef.current?.value ?? "";
    const result = manualCoords
      ? await fetchGeocode({
          lat: Number(venueLatRef.current?.value ?? ""),
          lng: Number(venueLngRef.current?.value ?? ""),
        })
      : await fetchGeocode({
          venueName: venueNameVal,
          venueNameEn: venueNameEnVal,
          address: venueAddressRef.current?.value ?? "",
        });
    setLocating(false);
    // Whichever field renders first (follows admin locale) is the one
    // most likely to be what was actually searched for.
    setLocatedVenueName((zhFirst ? venueNameVal || venueNameEnVal : venueNameEnVal || venueNameVal) || null);
    if (!result) {
      setLocationPreview(null);
      showToast(editForm.locateFailed[locale], "error");
      return;
    }
    setLocationPreview({ lat: result.lat, lng: result.lng });
    setPreviewTimezone(result.timezone);
    // Offer Nominatim's own formatted address for free. locateVenue only
    // ever runs from this button's own onClick (never automatically), so
    // clicking it again is itself the user's explicit request to refresh
    // - always overwrite, rather than only when the field looks empty or
    // untouched. That old guard meant a stale/wrong address (e.g. from
    // before the Accept-Language fix) could never be refreshed by
    // re-searching, since a previously-saved address is indistinguishable
    // from a manually-typed one once the page has reloaded.
    if (result.address && venueAddressRef.current) {
      venueAddressRef.current.value = result.address;
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
    // Same "filter zh and en together, or their indices drift apart" fix
    // as updateWeddingContent - see that function's own comment.
    const times = fd.getAll("scheduleTime") as string[];
    const events = fd.getAll("scheduleEvent") as string[];
    const enEvents = fd.getAll("en_scheduleEvent") as string[];
    const scheduleRows = times
      .map((time, i) => ({ time, event: events[i] ?? "", eventEn: enEvents[i] ?? "" }))
      .filter((row) => row.time || row.event || row.eventEn);
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
      schedule: scheduleRows.map((row) => ({ time: row.time, event: row.event })),
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
        schedule: scheduleRows.map((row) => ({ event: row.eventEn })),
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
            enInput={
              <input ref={venueNameEnRef} name="en_venueName" defaultValue={contentEn.venueName ?? ""} className={inputClass} />
            }
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
                    label={locatedVenueName || wedding.venue_name || "場地"}
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
            {schedule.map((item, i) => {
              const placeholders = SCHEDULE_PLACEHOLDERS[i] ?? SCHEDULE_PLACEHOLDER_FALLBACK;
              // Same primary/secondary swap as BilingualField (top row
              // follows admin locale), applied by hand here since the
              // time field + delete button share the top row with
              // whichever event field is primary.
              const zhEvent = (
                <input
                  key="zh"
                  name="scheduleEvent"
                  defaultValue={item.event}
                  placeholder={placeholders.event.zh}
                  className={`${inputClass} min-w-0 flex-1 rounded-l-none`}
                />
              );
              const enEvent = (
                <input
                  key="en"
                  name="en_scheduleEvent"
                  defaultValue={item.eventEn}
                  placeholder={placeholders.event.en}
                  className={`${inputClass} min-w-0 flex-1 rounded-l-none`}
                />
              );
              const primaryEvent = zhFirst ? zhEvent : enEvent;
              const primaryTag = zhFirst ? "中" : "EN";
              const secondaryEvent = zhFirst ? enEvent : zhEvent;
              const secondaryTag = zhFirst ? "EN" : "中";
              return (
                <div key={item.id} className="flex flex-col gap-1.5">
                  <div className="flex items-stretch gap-2">
                    <input
                      name="scheduleTime"
                      defaultValue={item.time}
                      placeholder={placeholders.time.zh}
                      className={`${inputClass} w-20 shrink-0 sm:w-28`}
                    />
                    <div className="flex min-w-0 flex-1 items-stretch">
                      <span
                        className={
                          bilingual
                            ? "flex w-10 shrink-0 items-center justify-center rounded-l border border-r-0 border-[var(--brand-line)] bg-[var(--background)] text-[10px] font-medium tracking-wide text-[var(--brand-ink-soft)]"
                            : "hidden"
                        }
                      >
                        {primaryTag}
                      </span>
                      {primaryEvent}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSchedule((s) => s.filter((row) => row.id !== item.id))}
                      aria-label={editForm.deleteAria[locale]}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[var(--brand-line)] text-[var(--brand-ink-soft)] hover:border-[var(--brand-error)] hover:text-[var(--brand-error)]"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Indented to align under the event column above - time is
                      universal (no second row for it), so the secondary
                      row's leading spacer only needs to match the time
                      field's own width, not a pill's too. */}
                  <div className={bilingual ? "flex items-stretch gap-2" : "hidden"}>
                    <span className="w-20 shrink-0 sm:w-28" aria-hidden="true" />
                    <div className="flex min-w-0 flex-1 items-stretch">
                      <span className="flex w-10 shrink-0 items-center justify-center rounded-l border border-r-0 border-[var(--brand-line)] bg-[var(--background)] text-[10px] font-medium tracking-wide text-[var(--brand-ink-soft)]">
                        {secondaryTag}
                      </span>
                      {secondaryEvent}
                    </div>
                    <span className="w-10 shrink-0" aria-hidden="true" />
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setSchedule((s) => [...s, { id: crypto.randomUUID(), time: "", event: "", eventEn: "" }])}
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
