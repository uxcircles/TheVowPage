"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DIET_OPTIONS = ["素食", "不吃牛肉", "不吃豬肉", "海鮮過敏", "其他"];
const MEAT_DIET_OPTIONS = new Set(["不吃牛肉", "不吃豬肉", "海鮮過敏"]);

export function RsvpSection({ weddingId }: { weddingId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [diet, setDiet] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Vegetarian already rules out beef/pork/seafood, so checking it clears
  // and disables those instead of leaving a contradictory combination
  // (matches v3's rsvp-diet behavior).
  const vegetarian = diet.has("素食");

  function toggleDiet(option: string) {
    setDiet((prev) => {
      const next = new Set(prev);
      if (next.has(option)) {
        next.delete(option);
      } else {
        next.add(option);
        if (option === "素食") {
          for (const meat of MEAT_DIET_OPTIONS) next.delete(meat);
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
    const dietValue = attending === "yes" ? Array.from(diet).join("、") : "";

    if (!name) return;

    if (!weddingId) {
      // Preview mode (no real wedding saved yet) - nothing to submit to.
      setStatus("這是預覽畫面，儲存喜帖後賓客才能真的送出 RSVP。");
      form.reset();
      return;
    }

    setSubmitting(true);
    setStatus("送出中...");
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
      setStatus("送出失敗，請稍後再試。");
      return;
    }

    setStatus("感謝您的回覆！");
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
        <p className="rsvp-intro reveal">敬請回覆，期待與您共度這個重要時刻</p>
        <button type="button" className="rsvp-btn reveal" onClick={openDialog}>
          立即回覆 RSVP
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
          <button type="button" className="rsvp-close" aria-label="關閉" onClick={closeDialog}>
            &times;
          </button>
          <h3>RSVP</h3>
          <label>
            姓名
            <input type="text" name="name" required />
          </label>
          <fieldset className="rsvp-attend">
            <legend>是否出席</legend>
            <label>
              <input
                type="radio"
                name="attending"
                value="yes"
                checked={attending === "yes"}
                onChange={() => setAttending("yes")}
              />{" "}
              準時出席
            </label>
            <label>
              <input
                type="radio"
                name="attending"
                value="no"
                checked={attending === "no"}
                onChange={() => setAttending("no")}
              />{" "}
              無法出席
            </label>
          </fieldset>
          {attending === "yes" && (
            <>
              <div className="rsvp-counts">
                <label>
                  大人人數
                  <input type="number" name="adults" min={0} defaultValue={1} />
                </label>
                <label>
                  小孩人數
                  <input type="number" name="children" min={0} defaultValue={0} />
                </label>
              </div>
              <fieldset className="rsvp-diet">
                <legend>飲食需求（可複選）</legend>
                {DIET_OPTIONS.map((option) => (
                  <label key={option}>
                    <input
                      type="checkbox"
                      checked={diet.has(option)}
                      disabled={vegetarian && MEAT_DIET_OPTIONS.has(option)}
                      onChange={() => toggleDiet(option)}
                    />{" "}
                    {option}
                  </label>
                ))}
                <label className="rsvp-diet-note">
                  飲食需求備註
                  <input type="text" name="dietNote" placeholder="有其他飲食限制或過敏，請補充說明（選填）" />
                </label>
              </fieldset>
            </>
          )}
          <label>
            給新人的話
            <textarea name="message" rows={4} placeholder="想對他們說的話" />
          </label>
          <div className="rsvp-submit-bar">
            <button type="submit" className="rsvp-submit" disabled={submitting}>
              送出
            </button>
            <p className="rsvp-status">{status}</p>
          </div>
        </form>
      </dialog>
    </>
  );
}
