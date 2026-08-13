"use client";

import { useFormStatus } from "react-dom";

// Must be a child of the <form>, not the component rendering it -
// useFormStatus only sees an ancestor form's pending state.
export function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="text-sm text-[var(--brand-ink-soft)] underline disabled:opacity-60">
      {pending ? "登出中..." : "登出"}
    </button>
  );
}
