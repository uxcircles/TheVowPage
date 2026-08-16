"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { rsvpCopy, dietOptions } from "@/lib/i18n/dictionaries/template";

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="rsvp-diet-warning-icon"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 2.5 20h19L12 3.5Z" />
      <path strokeLinecap="round" d="M12 9.5v4.5" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Vegetarian/vegan already rule out beef/pork/seafood, so checking either
// clears and disables those instead of leaving a contradictory combination
// (matches v3's rsvp-diet behavior). Nut allergy and gluten-free are left
// alone - those are independent of diet philosophy, not moot by it.
const MEAT_DIET_IDS = new Set(["no-beef", "no-pork", "seafood-allergy"]);

export function RsvpSection({ weddingId }: { weddingId: string }) {
  const locale = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [diet, setDiet] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const vegetarianOrVegan = diet.has("vegetarian") || diet.has("vegan");

  function toggleDiet(id: string) {
    setDiet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (id === "vegetarian" || id === "vegan") {
          for (const meat of MEAT_DIET_IDS) next.delete(meat);
        }
      }
      return next;
    });
  }

  function openDialog() {
    setStatus("");
    dialogRef.current?.showModal();
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }

  function closeDialog() {
    setVisible(false);
    setTimeout(() => dialogRef.current?.close(), 250);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const adults = attending === "yes" ? Number(formData.get("adults") ?? 1) : 0;
    const children = attending === "yes" ? Number(formData.get("children") ?? 0) : 0;
    const dietNote = attending === "yes" ? String(formData.get("dietNote") ?? "").trim() : "";
    const dietValue =
      attending === "yes"
        ? dietOptions
            .filter((option) => diet.has(option.id))
            .map((option) => option[locale])
            .join(locale === "en" ? ", " : "、")
        : "";

    if (!name) return;

    if (!weddingId) {
      // Preview mode (no real wedding saved yet) - nothing to submit to.
      setStatus(rsvpCopy.previewNotice[locale]);
      form.reset();
      return;
    }

    setSubmitting(true);
    setStatus(rsvpCopy.submitting[locale]);
    const supabase = createClient();
    const { error } = await supabase.from("rsvps").insert({
      wedding_id: weddingId,
      name,
      attending: attending === "yes",
      adults,
      children,
      diet: dietValue,
      diet_note: dietNote,
      message,
    });
    setSubmitting(false);

    if (error) {
      setStatus(rsvpCopy.submitFailed[locale]);
      return;
    }

    setStatus(rsvpCopy.submitSuccess[locale]);
    form.reset();
    setAttending("yes");
    setDiet(new Set());
    setTimeout(closeDialog, 1400);
  }

  return (
    <>
      <section className="rsvp">
        <img className="bg-illus" src="/templates/classic/illus-rose.png" alt="" aria-hidden="true" />
        <p className="eyebrow reveal">rsvp</p>
        <p className="rsvp-intro reveal">{rsvpCopy.intro[locale]}</p>
        <button type="button" className="rsvp-btn reveal" onClick={openDialog}>
          {rsvpCopy.openButton[locale]}
        </button>
      </section>

      <dialog
        ref={dialogRef}
        className={`rsvp-dialog${visible ? " is-visible" : ""}`}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog();
        }}
      >
        <form className="rsvp-form" onSubmit={handleSubmit}>
          <button type="button" className="rsvp-close" aria-label={rsvpCopy.close[locale]} onClick={closeDialog}>
            &times;
          </button>
          <h3>RSVP</h3>
          <label>
            {rsvpCopy.name[locale]}
            <input type="text" name="name" required />
          </label>
          <fieldset className="rsvp-attend">
            <legend>{rsvpCopy.attendingLegend[locale]}</legend>
            <label>
              <input
                type="radio"
                name="attending"
                value="yes"
                checked={attending === "yes"}
                onChange={() => setAttending("yes")}
              />{" "}
              {rsvpCopy.attendingYes[locale]}
            </label>
            <label>
              <input
                type="radio"
                name="attending"
                value="no"
                checked={attending === "no"}
                onChange={() => setAttending("no")}
              />{" "}
              {rsvpCopy.attendingNo[locale]}
            </label>
          </fieldset>
          {attending === "yes" && (
            <>
              <div className="rsvp-counts">
                <label>
                  {rsvpCopy.adultsCount[locale]}
                  <input type="number" name="adults" min={0} defaultValue={1} />
                </label>
                <label>
                  {rsvpCopy.childrenCount[locale]}
                  <input type="number" name="children" min={0} defaultValue={0} />
                </label>
              </div>
              <fieldset className="rsvp-diet">
                <legend>
                  <WarningIcon />
                  {rsvpCopy.dietLegend[locale]}
                </legend>
                <p className="rsvp-diet-hint">{rsvpCopy.dietHint[locale]}</p>
                {dietOptions.map((option) => (
                  <label key={option.id}>
                    <input
                      type="checkbox"
                      checked={diet.has(option.id)}
                      disabled={vegetarianOrVegan && MEAT_DIET_IDS.has(option.id)}
                      onChange={() => toggleDiet(option.id)}
                    />{" "}
                    {option[locale]}
                  </label>
                ))}
                <label className="rsvp-diet-note">
                  {rsvpCopy.dietNote[locale]}
                  <input type="text" name="dietNote" placeholder={rsvpCopy.dietNotePlaceholder[locale]} />
                </label>
              </fieldset>
            </>
          )}
          <label>
            {rsvpCopy.messageLabel[locale]}
            <textarea name="message" rows={4} placeholder={rsvpCopy.messagePlaceholder[locale]} />
          </label>
          <div className="rsvp-submit-bar">
            <button type="submit" className="rsvp-submit" disabled={submitting}>
              {rsvpCopy.submit[locale]}
            </button>
            <p className="rsvp-status">{status}</p>
          </div>
        </form>
      </dialog>
    </>
  );
}
