"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import { updateWeddingContent } from "@/lib/actions/weddings";
import { fetchGeocode } from "@/lib/create-wedding-client";
import { toDatetimeLocalValue, wallTimeToUtcIso } from "@/lib/timezone";
import { Toggle } from "@/components/ui/Toggle";
import { EditorCard, HiddenSectionHint } from "@/components/ui/EditorCard";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { VenueMap } from "@/components/templates/classic/VenueMap";
import { useEditSaveBar, useEditPreview } from "@/components/dashboard/WeddingChrome";
import type { Tables } from "@/lib/supabase/database.types";
import {
  SCHEDULE_PLACEHOLDERS,
  SCHEDULE_PLACEHOLDER_FALLBACK,
  emptySchedule,
  type ClassicTemplateData,
  type ScheduleItem,
} from "@/components/templates/classic/types";

const inputClass = "rounded border border-[var(--brand-line)] bg-white px-3 py-2 text-foreground";
const labelClass = "flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]";

// Smart default for the "關係稱謂" field, applied once when the field is
// first rendered (not kept in sync with later 稱謂 edits): only fills in
// "之子"/"之女" when the couple is still using the standard 新郎/新娘
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
  const action = updateWeddingContent.bind(null, weddingId);
  const [state, formAction, pending] = useActionState(action, undefined);
  useEditSaveBar({ formId: FORM_ID, pending, error: state?.error, success: state?.success });
  const formRef = useRef<HTMLFormElement>(null);
  const savedSchedule = wedding.schedule as ScheduleItem[] | null;
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    savedSchedule && savedSchedule.length > 0 ? savedSchedule : emptySchedule()
  );
  const [manualCoords, setManualCoords] = useState(false);
  const [groomLabel, setGroomLabel] = useState(wedding.groom_label);
  const [brideLabel, setBrideLabel] = useState(wedding.bride_label);
  const groomParentsRelationDefault =
    wedding.groom_parents_relation || defaultParentsRelation(wedding.groom_label, "新郎", "之子");
  const brideParentsRelationDefault =
    wedding.bride_parents_relation || defaultParentsRelation(wedding.bride_label, "新娘", "之女");
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
  const [locationError, setLocationError] = useState("");
  // Tracks the address we last auto-filled, so a re-search can still refresh
  // it - but only while it still matches what we set (i.e. the user hasn't
  // typed their own address over it since).
  const lastAutoFilledAddressRef = useRef<string | null>(null);

  async function locateVenue() {
    setLocating(true);
    setLocationError("");
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
      setLocationError("找不到這個地點，請確認場地名稱或地址，或改用手動輸入座標。");
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
    return {
      weddingId: wedding.id,
      theme: String(fd.get("theme") ?? wedding.theme),
      sealDesign: String(fd.get("seal") ?? wedding.seal),
      momentsStyle: String(fd.get("momentsStyle") ?? wedding.moments_style),
      groomName: String(fd.get("groomName") ?? ""),
      brideName: String(fd.get("brideName") ?? ""),
      groomLabel: groomLabel || "新郎",
      brideLabel: brideLabel || "新娘",
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
    };
  }, [
    wedding,
    previewTimezone,
    locationPreview,
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

      <EditorCard title="基本資訊">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            網址代稱（slug）
            <input name="slug" defaultValue={wedding.slug} required className={inputClass} />
          </label>
          <div />
          {/* Editable role labels (default 新郎/新娘) so the invitation can
              read correctly for same-sex couples too, e.g. "新人一/新人二" -
              they double as the field labels below via live state. */}
          <label className={labelClass}>
            稱謂（例如：新郎、新人一）
            <input
              name="groomLabel"
              value={groomLabel}
              onChange={(e) => setGroomLabel(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            稱謂（例如：新娘、新人二）
            <input
              name="brideLabel"
              value={brideLabel}
              onChange={(e) => setBrideLabel(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            {groomLabel || "新郎"}姓名
            <input name="groomName" defaultValue={wedding.groom_name} className={inputClass} />
          </label>
          <label className={labelClass}>
            {brideLabel || "新娘"}姓名
            <input name="brideName" defaultValue={wedding.bride_name} className={inputClass} />
          </label>
        </div>
      </EditorCard>

      <EditorCard
        title="雙方家庭資訊"
        action={<Toggle checked={showFamily} onChange={setShowFamily} label="顯示" />}
      >
        <input type="hidden" name="showFamily" value={showFamily ? "on" : "off"} />
        {/* Fields stay mounted (just visually hidden) when the toggle is off,
            so saving while hidden doesn't wipe out already-entered content -
            hidden form fields still submit their value normally. */}
        <div className={showFamily ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "hidden"}>
          <label className={labelClass}>
            {groomLabel || "新郎"}雙親
            <div className="flex gap-2">
              <input
                name="groomParents"
                defaultValue={wedding.groom_parents}
                placeholder="林建平・王淑芬"
                className={`${inputClass} min-w-0 flex-1`}
              />
              <input
                name="groomParentsRelation"
                defaultValue={groomParentsRelationDefault}
                placeholder="之子"
                aria-label={`${groomLabel || "新郎"}與雙親的關係稱謂`}
                className={`${inputClass} w-20 shrink-0`}
              />
            </div>
          </label>
          <label className={labelClass}>
            {brideLabel || "新娘"}雙親
            <div className="flex gap-2">
              <input
                name="brideParents"
                defaultValue={wedding.bride_parents}
                placeholder="黃文昌・李美玲"
                className={`${inputClass} min-w-0 flex-1`}
              />
              <input
                name="brideParentsRelation"
                defaultValue={brideParentsRelationDefault}
                placeholder="之女"
                aria-label={`${brideLabel || "新娘"}與雙親的關係稱謂`}
                className={`${inputClass} w-20 shrink-0`}
              />
            </div>
          </label>
        </div>
        {!showFamily && <HiddenSectionHint />}
      </EditorCard>

      <EditorCard title="場地">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            場地名稱
            <input ref={venueNameRef} name="venueName" defaultValue={wedding.venue_name} className={inputClass} />
          </label>
          <label className={labelClass}>
            廳別 / 樓層
            <input name="venueHall" defaultValue={wedding.venue_hall} className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            地址
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
                地圖位置不正確？改成手動輸入座標
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setManualCoords(false)}
                className="text-[var(--brand-gold)] underline"
              >
                改回自動定位
              </button>
            )}
          </p>
          {manualCoords && (
            <>
              <label className={labelClass}>
                緯度
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
                經度
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
              {locating ? "定位中..." : "📍 確認地圖位置"}
            </button>
            {locationError && <p className="mt-2 text-sm text-red-600">{locationError}</p>}
            {locationPreview && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-sm text-[var(--brand-ink-soft)]">
                  已定位，判斷時區為：<span className="font-medium text-foreground">{previewTimezone}</span>
                </p>
                <div className="h-48 overflow-hidden rounded border border-[var(--brand-line)]">
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

      <EditorCard title="婚禮日期時間">
        <label className={labelClass}>
          日期與時間
          <input
            type="datetime-local"
            name="eventDate"
            defaultValue={toDatetimeLocalValue(wedding.event_date, wedding.timezone)}
            className={inputClass}
          />
        </label>
        <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">
          系統會依場地位置自動判斷時區，目前設定：<span className="font-medium text-foreground">{wedding.timezone}</span>
          （儲存後會依最新的場地位置重新確認）
        </p>
      </EditorCard>

      <EditorCard
        title="婚宴流程"
        action={<Toggle checked={showSchedule} onChange={setShowSchedule} label="顯示" />}
      >
        <input type="hidden" name="showSchedule" value={showSchedule ? "on" : "off"} />
        {/* Same "stay mounted, just hidden" reasoning as the family section
            above - the timeline row inputs must keep submitting even while
            hidden, or a save while hidden would erase the schedule. */}
        <div className={showSchedule ? "" : "hidden"}>
          <div className="flex flex-col gap-2">
            {schedule.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  name="scheduleTime"
                  defaultValue={item.time}
                  placeholder={(SCHEDULE_PLACEHOLDERS[i] ?? SCHEDULE_PLACEHOLDER_FALLBACK).time}
                  className={`${inputClass} w-20 shrink-0 sm:w-28`}
                />
                <input
                  name="scheduleEvent"
                  defaultValue={item.event}
                  placeholder={(SCHEDULE_PLACEHOLDERS[i] ?? SCHEDULE_PLACEHOLDER_FALLBACK).event}
                  className={`${inputClass} min-w-0 flex-1`}
                />
                <button
                  type="button"
                  onClick={() => setSchedule((s) => s.filter((_, idx) => idx !== i))}
                  aria-label="刪除"
                  className="flex shrink-0 items-center justify-center rounded border border-[var(--brand-line)] px-2 text-[var(--brand-ink-soft)] hover:border-red-400 hover:text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSchedule((s) => [...s, { time: "", event: "" }])}
            className="mt-2 rounded border border-[var(--brand-line)] px-3 py-1.5 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)]"
          >
            + 新增流程項目
          </button>
        </div>
        {!showSchedule && <HiddenSectionHint />}
      </EditorCard>

      <EditorCard
        title="服裝建議"
        action={<Toggle checked={showDressCode} onChange={setShowDressCode} label="顯示" />}
      >
        <input type="hidden" name="showDressCode" value={showDressCode ? "on" : "off"} />
        <div className={showDressCode ? "" : "hidden"}>
          <textarea
            name="dressCode"
            defaultValue={wedding.dress_code}
            placeholder="建議服裝：香檳金、酒紅色系，避免純白色系"
            rows={2}
            className={`${inputClass} w-full`}
          />
        </div>
        {!showDressCode && <HiddenSectionHint />}
      </EditorCard>

      <EditorCard
        title="RSVP 回覆出席"
        action={<Toggle checked={showRsvp} onChange={setShowRsvp} label="顯示" />}
      >
        <input type="hidden" name="showRsvp" value={showRsvp ? "on" : "off"} />
        {showRsvp ? (
          <p className="text-sm text-[var(--brand-ink-soft)]">
            賓客可以直接在喜帖頁面回覆是否出席，回覆會顯示在「RSVP 回覆」頁面。
          </p>
        ) : (
          <HiddenSectionHint />
        )}
      </EditorCard>

      <EditorCard title="感謝詞">
        <textarea
          name="thanksMessage"
          defaultValue={wedding.thanks_message}
          rows={3}
          className={`${inputClass} w-full`}
        />
      </EditorCard>
    </form>
  );
}
