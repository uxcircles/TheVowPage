"use client";

import { useFormStatus } from "react-dom";

// Must be a child of the <form> (not the component that renders the
// <form> itself) - useFormStatus only sees the pending state of an
// ancestor form. createWedding always redirects on success and has no
// error path, so there's nothing to lift up here besides pending/idle.
export function CreateWeddingButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-[var(--brand-gold)] px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "建立中..." : "+ 建立新喜帖"}
    </button>
  );
}
