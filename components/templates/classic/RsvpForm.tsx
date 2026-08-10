"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function RsvpSection({ weddingId }: { weddingId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
          )}
          <label>
            給新人的話
            <textarea name="message" rows={4} placeholder="想對他們說的話" />
          </label>
          <button type="submit" className="rsvp-submit" disabled={submitting}>
            送出
          </button>
          <p className="rsvp-status">{status}</p>
        </form>
      </dialog>
    </>
  );
}
